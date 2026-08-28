<?php

namespace App\Controller;

use App\Exception\BusinessException;
use App\Repository\NotificationRepository;
use App\Service\ApiPresenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/notifications')]
class NotificationController extends AbstractApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly NotificationRepository $notifications,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();

        return new JsonResponse([
            'notifications' => array_map($this->presenter->notification(...), $this->notifications->findForUser($user)),
            'non_lues' => $this->notifications->countNonLues($user),
        ]);
    }

    #[Route('/non-lues', methods: ['GET'])]
    public function compteur(): JsonResponse
    {
        return new JsonResponse(['non_lues' => $this->notifications->countNonLues($this->utilisateur())]);
    }

    #[Route('/{id<\d+>}/lue', methods: ['POST'])]
    public function marquerLue(int $id): JsonResponse
    {
        $notification = $this->notifications->findOneBy(['id' => $id, 'user' => $this->utilisateur()]);

        if (!$notification) {
            throw new BusinessException('Notification introuvable.', 404);
        }

        $notification->setLu(true);
        $this->em->flush();

        return new JsonResponse($this->presenter->notification($notification));
    }

    #[Route('/tout-lu', methods: ['POST'])]
    public function toutMarquerLu(): JsonResponse
    {
        $this->notifications->marquerToutesLues($this->utilisateur());

        return new JsonResponse(['non_lues' => 0]);
    }

    /**
     * Suppression groupée.
     *
     * Déclarée avant la route paramétrée pour que « lues » et « toutes » ne
     * soient pas capturés comme un identifiant. Le motif {id<\d+>} l'empêche
     * déjà, mais l'ordre garde l'intention lisible.
     */
    #[Route('/lues', methods: ['DELETE'])]
    public function supprimerLues(): JsonResponse
    {
        $supprimees = $this->notifications->supprimerLues($this->utilisateur());

        return new JsonResponse([
            'supprimees' => $supprimees,
            'non_lues' => $this->notifications->countNonLues($this->utilisateur()),
        ]);
    }

    #[Route('/toutes', methods: ['DELETE'])]
    public function supprimerToutes(): JsonResponse
    {
        $supprimees = $this->notifications->supprimerToutes($this->utilisateur());

        return new JsonResponse(['supprimees' => $supprimees, 'non_lues' => 0]);
    }

    #[Route('/{id<\d+>}', methods: ['DELETE'])]
    public function supprimer(int $id): JsonResponse
    {
        $notification = $this->notifications->findOneBy(['id' => $id, 'user' => $this->utilisateur()]);

        if (!$notification) {
            throw new BusinessException('Notification introuvable.', 404);
        }

        $this->em->remove($notification);
        $this->em->flush();

        return new JsonResponse(null, 204);
    }
}
