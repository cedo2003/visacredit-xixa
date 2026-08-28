<?php

namespace App\Controller;

use App\Repository\CreanceRepository;
use App\Service\ApiPresenter;
use App\Service\CreanceService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/creances')]
class CreanceController extends AbstractApiController
{
    public function __construct(
        private readonly CreanceRepository $creances,
        private readonly CreanceService $service,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();
        $liste = $this->creances->findForUser($user);
        $stats = $this->creances->statsEnCours($user);

        return new JsonResponse([
            'creances' => array_map($this->presenter->creance(...), $liste),
            'total_en_cours' => $stats['nombre'],
            'montant_en_cours' => $stats['montant'],
        ]);
    }

    /**
     * Encaisse une créance.
     * En espèces l'imputation est immédiate ; en mobile money la réponse
     * contient une intention de paiement à confirmer via /api/paiements/confirmer.
     */
    #[Route('/{id<\d+>}/paiement', methods: ['POST'])]
    public function payer(int $id, Request $request): JsonResponse
    {
        $resultat = $this->service->payer($this->utilisateur(), $id, $this->payload($request));

        return new JsonResponse([
            'creance' => $this->presenter->creance($resultat['creance']),
            'paiement' => $resultat['paiement'],
        ]);
    }
}
