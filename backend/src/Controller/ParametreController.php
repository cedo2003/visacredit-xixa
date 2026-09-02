<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserParam;
use App\Exception\BusinessException;
use App\Service\ApiPresenter;
use App\Service\ChampsProfil;
use App\Service\SoldeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/** Profil et préférences — porte pages/parametres/{index,update}.php. */
#[Route('/api/parametres')]
class ParametreController extends AbstractApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiPresenter $presenter,
        private readonly SoldeService $solde,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();
        $params = $this->em->getRepository(UserParam::class)->findOneBy(['user' => $user]);

        $sansRegistre = $user->registreCommerceManquant();

        return new JsonResponse([
            'profil' => $this->presenter->user($user),
            'frequence_retrait' => $sansRegistre
                ? RetraitController::FREQUENCE_SANS_REGISTRE
                : ($params?->getFrequenceRetrait() ?? '7 jours'),
            'frequences_autorisees' => $sansRegistre
                ? [RetraitController::FREQUENCE_SANS_REGISTRE]
                : RetraitController::FREQUENCES,
            'solde' => $this->solde->calculer($user),
            'assujetti_tva' => (bool) $params?->isAssujettiTva(),
            'taux_tva' => (float) ($params?->getTauxTva() ?? '18.00'),
        ]);
    }

    #[Route('', methods: ['PUT', 'PATCH'])]
    public function update(Request $request): JsonResponse
    {
        $user = $this->utilisateur();
        $data = $this->payload($request);

        if (\array_key_exists('nom', $data)) {
            $user->setNom(trim((string) $data['nom']));
        }
        if (\array_key_exists('prenom', $data)) {
            $user->setPrenom(trim((string) $data['prenom']));
        }
        if (\array_key_exists('nom_boutique', $data)) {
            $nom = trim((string) $data['nom_boutique']);
            if ('' === $nom) {
                throw new BusinessException('Le nom de la boutique est obligatoire.');
            }
            $user->setNomBoutique($nom);
        }
        if (\array_key_exists('email', $data)) {
            $user->setEmail(trim((string) $data['email']) ?: null);
        }

        // L'IFU devient obligatoire dès qu'on touche au profil : un compte
        // antérieur peut continuer à travailler sans, mais il ne peut pas
        // enregistrer une modification en le laissant vide.
        if (\array_key_exists('ifu', $data) || $user->ifuManquant()) {
            $user->setIfu(ChampsProfil::ifu($data['ifu'] ?? $user->getIfu(), obligatoire: true));
        }

        // Le registre du commerce reste facultatif, mais le renseigner débloque
        // les fréquences de retrait autres que « 1 jour ».
        if (\array_key_exists('registre_commerce', $data)) {
            $user->setRegistreCommerce(ChampsProfil::registreCommerce($data['registre_commerce']));
        }

        if (\array_key_exists('date_naissance', $data)) {
            $user->setDateNaissance(ChampsProfil::dateNaissance($data['date_naissance']));
        }

        if (\array_key_exists('adresse', $data)) {
            $user->setAdresse(ChampsProfil::adresse($data['adresse']));
        }

        if (\array_key_exists('frequence_retrait', $data)) {
            $frequence = trim((string) $data['frequence_retrait']);

            // Contrôlé après la mise à jour du RCCM : renseigner son registre et
            // choisir une fréquence longue dans le même envoi doit fonctionner.
            if ($user->registreCommerceManquant()) {
                if ('' !== $frequence && RetraitController::FREQUENCE_SANS_REGISTRE !== $frequence) {
                    throw new BusinessException(sprintf(
                        'Renseignez votre registre du commerce pour choisir une autre fréquence que « %s ».',
                        RetraitController::FREQUENCE_SANS_REGISTRE
                    ));
                }

                $frequence = RetraitController::FREQUENCE_SANS_REGISTRE;
            } elseif (!\in_array($frequence, RetraitController::FREQUENCES, true)) {
                throw new BusinessException('Fréquence de retrait inconnue.');
            }

            $params = $this->parametres($user);

            $params->setFrequenceRetrait($frequence);
        }

        // Régime de TVA — il décide du contenu légal de la facture PDF.
        if (\array_key_exists('assujetti_tva', $data) || \array_key_exists('taux_tva', $data)) {
            $params = $this->parametres($user);

            if (\array_key_exists('assujetti_tva', $data)) {
                $params->setAssujettiTva((bool) $data['assujetti_tva']);
            }

            if (\array_key_exists('taux_tva', $data)) {
                $taux = (float) $data['taux_tva'];
                // Borne haute large à dessein : le taux varie d'un pays à
                // l'autre, et le brider au 18 % béninois interdirait tout
                // déploiement ailleurs. Elle n'écarte que l'absurde.
                if ($taux < 0 || $taux > 100) {
                    throw new BusinessException('Le taux de TVA doit être compris entre 0 et 100 %.');
                }
                $params->setTauxTva(number_format($taux, 2, '.', ''));
            }
        }

        $this->em->flush();

        return new JsonResponse($this->presenter->user($user));
    }

    /**
     * Ligne `user_params` de l'utilisateur, créée à la volée.
     *
     * Les comptes antérieurs à cette table n'en ont pas, et l'inscription ne
     * l'écrit pas systématiquement : la chercher sans la créer ferait échouer
     * silencieusement le premier enregistrement d'une préférence.
     */
    private function parametres(User $user): UserParam
    {
        $params = $this->em->getRepository(UserParam::class)->findOneBy(['user' => $user]);

        if (!$params) {
            $params = (new UserParam())->setUser($user);
            $this->em->persist($params);
        }

        return $params;
    }

    #[Route('/mot-de-passe', methods: ['POST'])]
    public function changerMotDePasse(Request $request, UserPasswordHasherInterface $hasher): JsonResponse
    {
        $user = $this->utilisateur();
        $data = $this->payload($request);

        $actuel = (string) ($data['mot_de_passe_actuel'] ?? '');
        $nouveau = (string) ($data['nouveau_mot_de_passe'] ?? '');

        if (!$hasher->isPasswordValid($user, $actuel)) {
            throw new BusinessException('Mot de passe actuel incorrect.');
        }
        if (strlen($nouveau) < 6) {
            throw new BusinessException('Le nouveau mot de passe doit contenir au moins 6 caractères.');
        }

        $user->setPassword($hasher->hashPassword($user, $nouveau));
        $this->em->flush();

        return new JsonResponse(['message' => 'Mot de passe mis à jour.']);
    }
}
