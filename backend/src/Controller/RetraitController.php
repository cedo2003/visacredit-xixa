<?php

namespace App\Controller;

use App\Entity\Retrait;
use App\Entity\User;
use App\Entity\UserParam;
use App\Exception\BusinessException;
use App\Repository\RetraitRepository;
use App\Service\ApiPresenter;
use App\Service\SoldeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/retraits')]
class RetraitController extends AbstractApiController
{
    /** Rythmes de retrait proposés, du plus court au plus long. */
    public const FREQUENCES = ['1 jour', '7 jours', '15 jours', '30 jours'];

    /**
     * Seule fréquence ouverte tant que le registre du commerce n'est pas déclaré.
     *
     * Une boutique non enregistrée ne peut pas accumuler ses encaissements sur
     * une quinzaine ou un mois : elle retire au jour le jour. Renseigner son
     * RCCM dans Paramètres débloque les autres rythmes.
     */
    public const FREQUENCE_SANS_REGISTRE = '1 jour';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly RetraitRepository $retraits,
        private readonly SoldeService $solde,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();
        $sansRegistre = $user->registreCommerceManquant();

        return new JsonResponse([
            'retraits' => array_map($this->presenter->retrait(...), $this->retraits->findForUser($user)),
            'total' => $this->retraits->sommeTotale($user),
            'solde' => $this->solde->calculer($user),
            'frequence' => $this->frequenceCourante($user),
            'frequences_autorisees' => $this->frequencesAutorisees($user),
            'registre_commerce_manquant' => $sansRegistre,
            'frequence_imposee' => $sansRegistre ? self::FREQUENCE_SANS_REGISTRE : null,
        ]);
    }

    /**
     * Le contrôle de solde s'appuie sur SoldeService, donc sur la même formule
     * que le tableau de bord — l'ancien save_retrait.php en utilisait une
     * version tronquée qui ignorait les retraits déjà effectués.
     */
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->utilisateur();
        $data = $this->payload($request);
        $montant = (float) ($data['montant'] ?? 0);

        if ($montant <= 0) {
            throw new BusinessException('Le montant doit être supérieur à 0 FCFA.');
        }

        $soldeActuel = $this->solde->calculer($user);
        if ($montant > $soldeActuel) {
            throw new BusinessException(sprintf(
                'Solde insuffisant. Solde actuel : %s FCFA',
                number_format($soldeActuel, 0, ',', ' ')
            ));
        }

        $frequence = $this->frequenceRetenue($user, $data['frequence'] ?? null);

        $retrait = (new Retrait())
            ->setUser($user)
            ->setMontant(number_format($montant, 2, '.', ''))
            ->setFrequence($frequence);

        $this->em->persist($retrait);
        $this->em->flush();

        return new JsonResponse([
            'retrait' => $this->presenter->retrait($retrait),
            'solde' => $this->solde->calculer($user),
        ], 201);
    }

    /** @return string[] */
    private function frequencesAutorisees(User $user): array
    {
        return $user->registreCommerceManquant()
            ? [self::FREQUENCE_SANS_REGISTRE]
            : self::FREQUENCES;
    }

    private function frequenceCourante(User $user): string
    {
        if ($user->registreCommerceManquant()) {
            return self::FREQUENCE_SANS_REGISTRE;
        }

        $params = $this->em->getRepository(UserParam::class)->findOneBy(['user' => $user]);

        return $params?->getFrequenceRetrait() ?? '7 jours';
    }

    /**
     * Fréquence effectivement enregistrée sur le retrait.
     *
     * Le contrôle est fait ici et pas seulement à l'affichage : un appel direct
     * à l'API contournerait sinon la règle du registre du commerce.
     */
    private function frequenceRetenue(User $user, mixed $demandee): string
    {
        $valeur = trim((string) ($demandee ?? ''));

        if ($user->registreCommerceManquant()) {
            if ('' !== $valeur && self::FREQUENCE_SANS_REGISTRE !== $valeur) {
                throw new BusinessException(sprintf(
                    'Sans registre du commerce enregistré, seuls les retraits « %s » sont possibles. Renseignez votre RCCM dans Paramètres pour débloquer les autres rythmes.',
                    self::FREQUENCE_SANS_REGISTRE
                ));
            }

            return self::FREQUENCE_SANS_REGISTRE;
        }

        if ('' === $valeur) {
            return $this->frequenceCourante($user);
        }

        if (!\in_array($valeur, self::FREQUENCES, true)) {
            throw new BusinessException('Fréquence de retrait inconnue.');
        }

        return $valeur;
    }
}
