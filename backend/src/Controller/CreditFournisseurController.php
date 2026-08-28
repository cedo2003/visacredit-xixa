<?php

namespace App\Controller;

use App\Repository\ApprovisionnementRepository;
use App\Service\ApiPresenter;
use App\Service\CreditFournisseurService;
use App\Service\SoldeService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Crédits fournisseurs — deux lectures d'une même table selon le rôle,
 * comme dans pages/credits/credits_fournisseurs.php :
 *   - grossiste  : créances à encaisser auprès des détaillants
 *   - détaillant : crédits à payer, réglables en espèces ou sur le solde
 */
#[Route('/api/credits')]
class CreditFournisseurController extends AbstractApiController
{
    public function __construct(
        private readonly ApprovisionnementRepository $approvisionnements,
        private readonly CreditFournisseurService $service,
        private readonly SoldeService $solde,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();

        if ($user->isGrossiste()) {
            $tous = $this->approvisionnements->findCreancesPourFournisseur($user->getTelephone());

            $enAttente = array_values(array_filter($tous, fn ($a) => 'en_attente' === $a->getStatut()));
            $payees = array_values(array_filter($tous, fn ($a) => 'payé' === $a->getStatut()));

            return new JsonResponse([
                'role' => 'grossiste',
                'en_attente' => array_map(fn ($a) => $this->presenter->approvisionnement($a), $enAttente),
                'payees' => array_map(fn ($a) => $this->presenter->approvisionnement($a), $payees),
                'total_a_encaisser' => array_sum(array_map(fn ($a) => (float) $a->getMontantTotal(), $enAttente)),
            ]);
        }

        $enAttente = $this->approvisionnements->findCreditsEnAttente($user);
        $payes = $this->approvisionnements->findCreditsPayes($user);

        // Une seule requête pour retrouver les commandes d'origine (évite le N+1
        // de l'ancienne page qui interrogeait la base dans la boucle d'affichage).
        $origines = $this->approvisionnements->findOriginesCommandes(
            array_map(fn ($a) => (int) $a->getId(), $enAttente)
        );

        $totalDu = array_sum(array_map(fn ($a) => (float) $a->getMontantTotal(), $enAttente));
        $soldeActuel = $this->solde->calculer($user);

        return new JsonResponse([
            'role' => 'detaillant',
            'en_attente' => array_map(
                fn ($a) => $this->presenter->approvisionnement($a, $origines[$a->getId()] ?? null),
                $enAttente
            ),
            'payes' => array_map(fn ($a) => $this->presenter->approvisionnement($a), $payes),
            'total_du' => $totalDu,
            'solde' => $soldeActuel,
            'solde_suffisant' => $soldeActuel >= $totalDu,
        ]);
    }

    /**
     * Le grossiste réclame le règlement d'une créance : le widget cible le
     * téléphone du détaillant, qui confirme depuis son mobile.
     */
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
            $id,
            $passerelle,
            (string) ($data['repartition_frais'] ?? 'client')
        );

        return new JsonResponse(['paiement' => $paiement]);
    }

    #[Route('/{id<\d+>}/payer-especes', methods: ['POST'])]
    public function payerEspeces(int $id): JsonResponse
    {
        $user = $this->exigerDetaillant();
        $appro = $this->service->payerEspeces($user, $id);

        return new JsonResponse([
            'credit' => $this->presenter->approvisionnement($appro),
            'solde' => $this->solde->calculer($user),
        ]);
    }

    #[Route('/{id<\d+>}/payer-solde', methods: ['POST'])]
    public function payerSolde(int $id): JsonResponse
    {
        $user = $this->exigerDetaillant();
        $appro = $this->service->payerParSolde($user, $id);

        return new JsonResponse([
            'credit' => $this->presenter->approvisionnement($appro),
            'solde' => $this->solde->calculer($user),
        ]);
    }
}
