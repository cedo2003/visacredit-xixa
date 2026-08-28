<?php

namespace App\Controller;

use App\Entity\Vente;
use App\Exception\BusinessException;
use App\Repository\CreanceRepository;
use App\Repository\VenteRepository;
use App\Service\ApiPresenter;
use App\Service\VenteService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/ventes')]
class VenteController extends AbstractApiController
{
    public function __construct(
        private readonly VenteRepository $ventes,
        private readonly CreanceRepository $creances,
        private readonly VenteService $service,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $liste = $this->ventes->findForUser($this->utilisateur());

        return new JsonResponse(array_map(fn ($v) => $this->presenter->vente($v), $liste));
    }

    /**
     * Crée la vente, ses lignes, décrémente le stock et enregistre les
     * échéances éventuelles — le tout en une seule transaction.
     */
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $resultat = $this->service->creer($this->utilisateur(), $this->payload($request));

        return new JsonResponse([
            'vente' => $this->presenter->vente($resultat['vente'], true),
            'paiement' => $resultat['paiement'],
        ], 201);
    }

    /** Données du reçu (ancien pages/ventes/recu.php). */
    #[Route('/{id<\d+>}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $vente = $this->charger($id);

        return new JsonResponse([
            'vente' => $this->presenter->vente($vente, true),
            'echeances' => array_map(
                $this->presenter->creance(...),
                $this->creances->findByVente($vente)
            ),
            'vendeur' => $this->presenter->user($this->utilisateur()),
        ]);
    }

    private function charger(int $id): Vente
    {
        $vente = $this->ventes->findOneBy(['id' => $id, 'user' => $this->utilisateur()]);

        if (!$vente) {
            throw new BusinessException('Vente introuvable.', 404);
        }

        return $vente;
    }
}
