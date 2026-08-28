<?php

namespace App\Controller;

use App\Entity\User;
use App\Exception\BusinessException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

abstract class AbstractApiController extends AbstractController
{
    /** Utilisateur authentifié, typé — remplace $_SESSION['user_id']. */
    protected function utilisateur(): User
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw new BusinessException('Authentification requise.', 401);
        }

        return $user;
    }

    /** @return array<string, mixed> */
    protected function payload(Request $request): array
    {
        $data = json_decode($request->getContent() ?: '{}', true);

        if (!\is_array($data)) {
            throw new BusinessException('Corps de requête JSON invalide.', 400);
        }

        return $data;
    }

    protected function exigerGrossiste(): User
    {
        $user = $this->utilisateur();

        if (!$user->isGrossiste()) {
            throw new BusinessException('Action réservée aux grossistes.', 403);
        }

        return $user;
    }

    protected function exigerDetaillant(): User
    {
        $user = $this->utilisateur();

        if (!$user->isDetaillant()) {
            throw new BusinessException('Action réservée aux détaillants.', 403);
        }

        return $user;
    }
}
