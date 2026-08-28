<?php

namespace App\Controller;

use App\Repository\ClientRepository;
use App\Repository\CommandeRepository;
use App\Repository\CreanceRepository;
use App\Repository\ProduitRepository;
use App\Repository\VenteRepository;
use App\Service\SoldeService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Statistiques du tableau de bord.
 * Reprend une à une les requêtes de dashboard.php.
 */
#[Route('/api/dashboard')]
class DashboardController extends AbstractApiController
{
    #[Route('', methods: ['GET'])]
    public function index(
        SoldeService $solde,
        ClientRepository $clients,
        VenteRepository $ventes,
        CreanceRepository $creances,
        ProduitRepository $produits,
        CommandeRepository $commandes,
    ): JsonResponse {
        $user = $this->utilisateur();

        $debutJour = new \DateTimeImmutable('today');
        $finJour = new \DateTimeImmutable('tomorrow');
        $debutMois = new \DateTimeImmutable('first day of this month 00:00:00');
        $finMois = $debutMois->modify('+1 month');

        $statsCreances = $creances->statsEnCours($user);

        return new JsonResponse([
            'solde' => $solde->calculer($user),
            'total_clients' => $clients->countForUser($user),
            'ventes_jour' => $ventes->sommeMontantPaye($user, $debutJour, $finJour),
            'ventes_mois' => $ventes->sommeMontantPaye($user, $debutMois, $finMois),
            'creances_en_cours' => $statsCreances['nombre'],
            'montant_creances' => $statsCreances['montant'],
            'produits_alerte' => $produits->countEnAlerte($user),
            'commandes_attente_paiement' => $user->isGrossiste()
                ? $commandes->countEnAttentePaiement($user)
                : 0,
            'stats_commandes' => $commandes->stats($user),
            'role' => $user->isGrossiste() ? 'grossiste' : 'detaillant',
            'nom_boutique' => $user->getNomBoutique(),
            'prenom' => $user->getPrenom(),
        ]);
    }
}
