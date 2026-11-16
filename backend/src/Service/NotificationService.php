<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Service\ResetInterface;

/**
 * Création des notifications — et, par ricochet, de leur push.
 *
 * Toutes les notifications de la plateforme passent par `creer()`. Elles sont
 * aussi retenues ici, le temps de la requête : EnvoiPushListener les expédie en
 * push une fois la réponse partie. Pas avant, pour deux raisons :
 *  - c'est l'appelant qui décide du `flush()`, souvent dans une transaction ;
 *    tant qu'elle n'est pas validée, la notification peut encore disparaître,
 *    et un push ne se rattrape pas ;
 *  - un service push lent ne doit pas faire attendre le commerçant qui vient
 *    de valider une commande.
 */
class NotificationService implements ResetInterface
{
    /** @var Notification[] */
    private array $enAttente = [];

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
        $this->enAttente[] = $notification;

        return $notification;
    }

    /**
     * Les notifications créées depuis le dernier appel, et vide la file.
     *
     * @return Notification[]
     */
    public function extraireEnAttente(): array
    {
        $notifications = $this->enAttente;
        $this->enAttente = [];

        return $notifications;
    }

    /** Remise à zéro entre deux requêtes d'un même processus (FrankenPHP en mode worker). */
    public function reset(): void
    {
        $this->enAttente = [];
    }
}
