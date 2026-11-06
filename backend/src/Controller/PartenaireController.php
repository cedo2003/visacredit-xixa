<?php

namespace App\Controller;

use App\Entity\ApplicationPartenaire;
use App\Entity\LiaisonPartenaire;
use App\Entity\User;
use App\Exception\BusinessException;
use App\Repository\LiaisonPartenaireRepository;
use App\Repository\UserRepository;
use App\Service\AccesPartenaireService;
use App\Service\ApiPresenter;
use App\Service\InscriptionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Point d'entrée des applications partenaires.
 *
 * Ces routes s'appellent **de serveur à serveur** : elles exigent le secret de
 * l'application, qui ne doit jamais se retrouver dans un navigateur ni dans une
 * application mobile. Le jeton qu'elles renvoient, lui, peut être transmis à
 * l'application du commerçant, qui appelle ensuite le reste de l'API comme le
 * font nos propres applications.
 *
 * Le pare-feu `partenaires` (security.yaml) les laisse passer sans JWT ;
 * l'authentification se fait ici, par AccesPartenaireService.
 */
#[Route('/api/partenaires')]
class PartenaireController extends AbstractApiController
{
    public function __construct(
        private readonly AccesPartenaireService $acces,
        private readonly LiaisonPartenaireRepository $liaisons,
        private readonly EntityManagerInterface $em,
        private readonly ApiPresenter $presenter,
    ) {
    }

    /** Vérifie les identifiants de l'application — utile à la mise en place. */
    #[Route('/moi', methods: ['GET'])]
    public function moi(Request $request): JsonResponse
    {
        $application = $this->acces->authentifier($request);
        $this->em->flush();

        return new JsonResponse([
            'nom' => $application->getNom(),
            'client_id' => $application->getClientId(),
        ]);
    }

    /**
     * Ouvre une boutique XIXA pour un client du partenaire, et la lui lie.
     *
     * Mêmes champs et mêmes règles que `/api/auth/register`, plus
     * `reference_externe`. Le mot de passe devient facultatif : le commerçant
     * passe par l'application du partenaire.
     */
    #[Route('/comptes', methods: ['POST'])]
    public function creerCompte(Request $request, InscriptionService $inscription): JsonResponse
    {
        $application = $this->acces->authentifier($request);
        $data = $this->payload($request);
        $reference = $this->reference($data);

        // Vérifiée avant l'inscription : sinon une référence en double
        // laisserait derrière elle une boutique ouverte et liée à personne.
        $this->exigerReferenceLibre($application, $reference);

        $user = $inscription->inscrire($data, motDePasseExige: false);

        $this->em->persist(new LiaisonPartenaire($application, $user, $reference));
        $this->em->flush();

        return $this->reponseJeton($application, $user, $reference, Response::HTTP_CREATED);
    }

    /**
     * Lie au partenaire une boutique qui existe déjà.
     *
     * Le titulaire saisit une seule fois son téléphone et son mot de passe XIXA
     * dans l'application du partenaire : c'est son consentement. Ensuite, le
     * partenaire obtient ses jetons par `/jetons`, sans mot de passe.
     */
    #[Route('/liaisons', methods: ['POST'])]
    public function lier(
        Request $request,
        UserRepository $users,
        UserPasswordHasherInterface $hasher,
        RateLimiterFactory $partenaireLiaisonLimiter,
    ): JsonResponse {
        $application = $this->acces->authentifier($request);
        $data = $this->payload($request);
        $reference = $this->reference($data);
        $telephone = preg_replace('/[^0-9]/', '', (string) ($data['telephone'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        $this->acces->limiter($partenaireLiaisonLimiter, $application->getClientId().'|'.$telephone);

        $user = '' !== $telephone ? $users->findByTelephone($telephone) : null;

        // Même réponse pour un numéro inconnu et un mot de passe faux : ne pas
        // révéler au partenaire quels numéros ont un compte chez nous.
        if (!$user || !$hasher->isPasswordValid($user, $password)) {
            throw new BusinessException('Téléphone ou mot de passe incorrect.', 401);
        }

        $existante = $this->liaisons->findByUser($application, $user);

        if ($existante) {
            if ($existante->getReferenceExterne() !== $reference) {
                throw new BusinessException('Cette boutique est déjà liée à un autre compte de votre application.', 409);
            }

            // Même compte, même référence : on rejoue sans erreur.
            $this->em->flush();

            return $this->reponseJeton($application, $user, $reference, Response::HTTP_OK);
        }

        $this->exigerReferenceLibre($application, $reference);

        $this->em->persist(new LiaisonPartenaire($application, $user, $reference));
        $this->em->flush();

        return $this->reponseJeton($application, $user, $reference, Response::HTTP_CREATED);
    }

    /** Jeton pour une boutique déjà liée, d'après la référence du partenaire. */
    #[Route('/jetons', methods: ['POST'])]
    public function jeton(Request $request): JsonResponse
    {
        $application = $this->acces->authentifier($request);
        $reference = $this->reference($this->payload($request));

        $liaison = $this->liaisons->findByReference($application, $reference);

        if (!$liaison) {
            throw new BusinessException('Aucune boutique liée à cette référence.', 404);
        }

        $this->em->flush();

        return $this->reponseJeton($application, $liaison->getUser(), $reference, Response::HTTP_OK);
    }

    /** Le partenaire renonce à l'accès : ses jetons pour cette boutique tombent. */
    #[Route('/liaisons/{reference}', methods: ['DELETE'])]
    public function delier(Request $request, string $reference): JsonResponse
    {
        $application = $this->acces->authentifier($request);
        $liaison = $this->liaisons->findByReference($application, $reference);

        if (!$liaison) {
            throw new BusinessException('Aucune boutique liée à cette référence.', 404);
        }

        $this->em->remove($liaison);
        $this->em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /** @param array<string, mixed> $data */
    private function reference(array $data): string
    {
        $reference = trim((string) ($data['reference_externe'] ?? ''));

        if ('' === $reference || mb_strlen($reference) > 191) {
            throw new BusinessException('reference_externe est obligatoire (191 caractères au plus).');
        }

        return $reference;
    }

    private function exigerReferenceLibre(ApplicationPartenaire $application, string $reference): void
    {
        if ($this->liaisons->findByReference($application, $reference)) {
            throw new BusinessException('Cette référence est déjà liée à une boutique.', 409);
        }
    }

    private function reponseJeton(
        ApplicationPartenaire $application,
        User $user,
        string $reference,
        int $status,
    ): JsonResponse {
        return new JsonResponse($this->acces->jeton($application, $user) + [
            'reference_externe' => $reference,
            'user' => $this->presenter->user($user),
        ], $status);
    }
}
