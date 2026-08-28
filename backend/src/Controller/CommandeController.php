<?php

namespace App\Controller;

use App\Entity\Commande;
use App\Exception\BusinessException;
use App\Repository\CommandeRepository;
use App\Service\ApiPresenter;
use App\Service\CommandeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Commandes B2B.
 *
 * Les actions correspondent aux boutons de l'ancien show.php ; chacune vérifie
 * le rôle et le statut avant d'agir, comme le faisait peut_acceder_commande().
 */
#[Route('/api/commandes')]
class CommandeController extends AbstractApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly CommandeRepository $commandes,
        private readonly CommandeService $service,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();
        $liste = $this->commandes->findForUser($user);

        return new JsonResponse([
            'commandes' => array_map(fn ($c) => $this->presenter->commande($c), $liste),
            'stats' => $this->commandes->stats($user),
            'role' => $user->isGrossiste() ? 'grossiste' : 'detaillant',
        ]);
    }

    /** Vérifie si un numéro correspond à un grossiste inscrit (ancien check_grossiste.php). */
    #[Route('/verifier-fournisseur', methods: ['POST'])]
    public function verifierFournisseur(Request $request): JsonResponse
    {
        $telephone = (string) ($this->payload($request)['telephone'] ?? '');

        return new JsonResponse($this->service->verifierFournisseur($telephone));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $commande = $this->service->creer($this->exigerDetaillant(), $this->payload($request));

        return new JsonResponse($this->presenter->commande($commande, true), 201);
    }

    #[Route('/{id<\d+>}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        return new JsonResponse($this->detail($this->charger($id)));
    }

    /**
     * Fiche complète telle que la consomment le web et le mobile : la commande,
     * ce que l'utilisateur courant peut en faire, et de quel côté il se trouve.
     *
     * @return array<string, mixed>
     */
    private function detail(Commande $commande): array
    {
        $user = $this->utilisateur();

        $data = $this->presenter->commande($commande, true);
        $data['actions_possibles'] = $this->actionsPossibles($commande);
        $data['mon_role'] = $commande->getGrossiste()?->getId() === $user->getId() ? 'grossiste' : 'detaillant';

        return $data;
    }

    /**
     * Marchandage : proposition d'un nouveau prix pour la commande.
     * Le détaillant ouvre la discussion, le grossiste tranche — ou contre-propose.
     */
    #[Route('/{id<\d+>}/marchandage', methods: ['POST'])]
    public function marchander(int $id, Request $request): JsonResponse
    {
        $data = $this->payload($request);
        $commande = $this->charger($id);

        $this->service->proposerPrix(
            $this->utilisateur(),
            $commande,
            (float) ($data['montant'] ?? 0),
            trim((string) ($data['message'] ?? '')) ?: null
        );

        return new JsonResponse($this->detail($commande), 201);
    }

    #[Route('/{id<\d+>}/marchandage/accepter', methods: ['POST'])]
    public function accepterMarchandage(int $id): JsonResponse
    {
        $commande = $this->service->repondrePrix($this->utilisateur(), $this->charger($id), true);

        return new JsonResponse($this->detail($commande));
    }

    #[Route('/{id<\d+>}/marchandage/refuser', methods: ['POST'])]
    public function refuserMarchandage(int $id): JsonResponse
    {
        $commande = $this->service->repondrePrix($this->utilisateur(), $this->charger($id), false);

        return new JsonResponse($this->detail($commande));
    }

    #[Route('/{id<\d+>}/valider', methods: ['POST'])]
    public function valider(int $id): JsonResponse
    {
        $commande = $this->service->valider($this->exigerGrossiste(), $this->charger($id));

        return new JsonResponse($this->presenter->commande($commande, true));
    }

    #[Route('/{id<\d+>}/livrer', methods: ['POST'])]
    public function livrer(int $id): JsonResponse
    {
        $commande = $this->service->marquerLivree($this->exigerGrossiste(), $this->charger($id));

        return new JsonResponse($this->presenter->commande($commande, true));
    }

    #[Route('/{id<\d+>}/reception', methods: ['POST'])]
    public function reception(int $id): JsonResponse
    {
        $commande = $this->service->marquerRecu($this->exigerDetaillant(), $this->charger($id));

        return new JsonResponse($this->presenter->commande($commande, true));
    }

    /** Encaissement en espèces par le grossiste. */
    #[Route('/{id<\d+>}/encaisser-especes', methods: ['POST'])]
    public function encaisserEspeces(int $id): JsonResponse
    {
        $commande = $this->service->encaisserEspeces($this->exigerGrossiste(), $this->charger($id));

        return new JsonResponse($this->presenter->commande($commande, true));
    }

    /** Paiement en espèces par le détaillant à un fournisseur hors plateforme. */
    #[Route('/{id<\d+>}/payer-especes', methods: ['POST'])]
    public function payerEspeces(int $id): JsonResponse
    {
        $commande = $this->service->payerFournisseurExterneEspeces($this->exigerDetaillant(), $this->charger($id));

        return new JsonResponse($this->presenter->commande($commande, true));
    }

    #[Route('/{id<\d+>}/demander-paiement', methods: ['POST'])]
    public function demanderPaiement(int $id, Request $request): JsonResponse
    {
        $data = $this->payload($request);
        $passerelle = (string) ($data['passerelle'] ?? 'kkiapay');
        if (!\in_array($passerelle, ['kkiapay', 'fedapay'], true)) {
            $passerelle = 'kkiapay';
        }

        $paiement = $this->service->demanderPaiement(
            $this->exigerGrossiste(),
            $this->charger($id),
            $passerelle,
            (string) ($data['repartition_frais'] ?? 'client')
        );

        return new JsonResponse(['paiement' => $paiement]);
    }

    #[Route('/{id<\d+>}/echeances', methods: ['PUT'])]
    public function echeances(int $id, Request $request): JsonResponse
    {
        $commande = $this->charger($id);
        $user = $this->utilisateur();

        // Chacun des deux partenaires peut ajuster l'échéancier tant que la
        // commande n'est pas validée (cas definir_creances_detaillant.php /
        // save_creances_grossiste.php).
        if ($commande->getDetaillant()?->getId() !== $user->getId()
            && $commande->getGrossiste()?->getId() !== $user->getId()) {
            throw new BusinessException('Cette commande ne vous concerne pas.', 403);
        }
        if ('credit' !== $commande->getModePaiement()) {
            throw new BusinessException("Cette commande n'est pas à crédit.");
        }

        $this->service->remplacerEcheances($commande, $this->payload($request)['echeances'] ?? []);
        $this->em->flush();

        return new JsonResponse($this->presenter->commande($commande, true));
    }

    #[Route('/{id<\d+>}/annuler', methods: ['POST'])]
    public function annuler(int $id): JsonResponse
    {
        $commande = $this->service->annuler($this->utilisateur(), $this->charger($id));

        return new JsonResponse($this->presenter->commande($commande, true));
    }

    private function charger(int $id): Commande
    {
        $commande = $this->commandes->find($id);
        $user = $this->utilisateur();

        if (!$commande) {
            throw new BusinessException('Commande introuvable.', 404);
        }

        $autorise = $commande->getDetaillant()?->getId() === $user->getId()
            || $commande->getGrossiste()?->getId() === $user->getId();

        if (!$autorise) {
            throw new BusinessException('Cette commande ne vous concerne pas.', 403);
        }

        return $commande;
    }

    /**
     * Ce que l'utilisateur courant peut faire maintenant — permet au frontend
     * de n'afficher que les boutons pertinents, sans rejouer la logique de rôle.
     *
     * @return string[]
     */
    private function actionsPossibles(Commande $commande): array
    {
        $user = $this->utilisateur();
        $estGrossiste = $commande->getGrossiste()?->getId() === $user->getId();
        $estDetaillant = $commande->getDetaillant()?->getId() === $user->getId();
        $surPlateforme = $commande->isFournisseurSurPlateforme();
        $statut = $commande->getStatut();
        $actions = [];

        // ── Marchandage ───────────────────────────────────────────────────
        // Tant que la commande est en attente et que les deux parties sont sur
        // la plateforme, le prix se discute. Celui qui a la main est toujours
        // celui qui n'a pas émis la proposition ouverte.
        if ($surPlateforme && 'en_attente' === $statut) {
            $enAttente = $commande->getNegociationEnAttente();

            if (!$enAttente) {
                $actions[] = 'marchander';
            } elseif ($enAttente->getAuteur()?->getId() !== $user->getId()) {
                $actions[] = 'accepter_prix';
                $actions[] = 'refuser_prix';
                $actions[] = 'contre_proposer';
            }
        }

        if ($estGrossiste) {
            if ('en_attente' === $statut) {
                // Une proposition ouverte bloque la validation : le grossiste
                // doit d'abord se prononcer sur le prix.
                if (!$commande->getNegociationEnAttente()) {
                    $actions[] = 'valider';
                }
                $actions[] = 'annuler';
            }
            if ('validee' === $statut) {
                $actions[] = 'livrer';
            }
            if (\in_array($statut, ['validee', 'livree'], true) && $commande->getReste() > 0) {
                $actions[] = 'demander_paiement';
            }
            if ('en_attente_paiement' === $statut && $commande->getReste() > 0) {
                $actions[] = 'encaisser_especes';
            }
        }

        if ($estDetaillant) {
            if ('en_attente' === $statut) {
                $actions[] = 'annuler';
                if (!$surPlateforme) {
                    $actions[] = 'modifier_echeances';
                }
            }
            if (!$commande->isRecuParDetaillant()
                && (!$surPlateforme || 'livree' === $statut)) {
                $actions[] = 'confirmer_reception';
            }
            if (!$surPlateforme && $commande->isRecuParDetaillant() && $commande->getReste() > 0) {
                $actions[] = 'payer_especes';
            }
            if ($commande->isRecuParDetaillant()) {
                $actions[] = 'noter_fournisseur';
            }
        }

        if ($estGrossiste && $commande->isRecuParDetaillant()) {
            $actions[] = 'noter_client';
        }

        return $actions;
    }
}
