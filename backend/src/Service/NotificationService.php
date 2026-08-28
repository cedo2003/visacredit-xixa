<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /**
     * Crée une notification. Le lien pointe vers une route du frontend Next.js
     * (ex. /commandes/12), plus vers un fichier .php.
     */
    public function creer(User $destinataire, string $type, string $titre, string $message, ?string $lien = null): Notification
    {
        $notification = (new Notification())
            ->setUser($destinataire)
            ->setType($type)
            ->setTitre($titre)
            ->setMessage($message)
            ->setLien($lien);

        $this->em->persist($notification);

        return $notification;
    }
}
