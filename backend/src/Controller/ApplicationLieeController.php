<?php

namespace App\Controller;

use App\Exception\BusinessException;
use App\Repository\LiaisonPartenaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Côté commerçant : les applications partenaires qui ont accès à sa boutique.
 *
 * Le titulaire garde la main. Il voit qui agit sur son compte et peut retirer
 * l'accès à tout moment ; les jetons de l'application tombent aussitôt (voir
 * JwtPartenaireListener).
 */
#[Route('/api/parametres/applications')]
class ApplicationLieeController extends AbstractApiController
{
    public function __construct(
        private readonly LiaisonPartenaireRepository $liaisons,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $liaisons = $this->liaisons->findByUserAvecApplication($this->utilisateur());

        return new JsonResponse(array_map(static fn ($l) => [
            'id' => $l->getId(),
            'application' => $l->getApplication()->getNom(),
            'active' => $l->getApplication()->isActif(),
            'liee_le' => $l->getCreatedAt()->format(\DATE_ATOM),
        ], $liaisons));
    }

    #[Route('/{id}', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function revoquer(int $id): JsonResponse
    {
        $liaison = $this->liaisons->find($id);

        // 404 aussi pour la liaison d'une autre boutique : ne rien révéler.
        if (!$liaison || $liaison->getUser()->getId() !== $this->utilisateur()->getId()) {
            throw new BusinessException('Application introuvable.', 404);
        }

        $this->em->remove($liaison);
        $this->em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
