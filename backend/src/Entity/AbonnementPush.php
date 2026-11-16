<?php

namespace App\Entity;

use App\Repository\AbonnementPushRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Un appareil qui reçoit les notifications d'une boutique en push.
 *
 * Deux canaux :
 *  - `web` : un navigateur, abonné par l'API Push du W3C. Le point de
 *    terminaison est l'URL du service push du navigateur (FCM pour Chrome,
 *    Mozilla pour Firefox, Apple pour Safari), et les deux clés servent à
 *    chiffrer le message pour ce seul navigateur ;
 *  - `expo` : l'application mobile, identifiée par son jeton Expo
 *    (`ExponentPushToken[…]`). Expo relaie vers FCM ou APNs.
 *
 * Le point de terminaison est unique : un navigateur partagé par deux
 * boutiques successives appartient à la dernière qui s'y est connectée — c'est
 * elle qui doit recevoir les notifications, pas la précédente.
 */
#[ORM\Entity(repositoryClass: AbonnementPushRepository::class)]
#[ORM\Table(name: 'abonnements_push')]
#[ORM\UniqueConstraint(name: 'uniq_abonnement_empreinte', columns: ['empreinte'])]
#[ORM\Index(name: 'idx_abonnement_user', columns: ['user_id'])]
class AbonnementPush
{
    public const CANAL_WEB = 'web';
    public const CANAL_EXPO = 'expo';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(length: 10)]
    private string $canal;

    /** URL du service push (web) ou jeton Expo (mobile). */
    #[ORM\Column(name: 'point_terminaison', type: 'text')]
    private string $pointTerminaison;

    /**
     * SHA-256 du point de terminaison, pour l'index unique : une URL de
     * service push peut dépasser ce qu'un index MySQL accepte.
     */
    #[ORM\Column(length: 64)]
    private string $empreinte;

    #[ORM\Column(name: 'cle_p256dh', length: 255, nullable: true)]
    private ?string $cleP256dh = null;

    #[ORM\Column(name: 'cle_auth', length: 255, nullable: true)]
    private ?string $cleAuth = null;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct(User $user, string $canal, string $pointTerminaison)
    {
        $this->user = $user;
        $this->canal = $canal;
        $this->pointTerminaison = $pointTerminaison;
        $this->empreinte = self::empreinte($pointTerminaison);
        $this->createdAt = new \DateTimeImmutable();
    }

    public static function empreinte(string $pointTerminaison): string
    {
        return hash('sha256', $pointTerminaison);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getCanal(): string
    {
        return $this->canal;
    }

    public function getPointTerminaison(): string
    {
        return $this->pointTerminaison;
    }

    public function getCleP256dh(): ?string
    {
        return $this->cleP256dh;
    }

    public function getCleAuth(): ?string
    {
        return $this->cleAuth;
    }

    public function definirCles(?string $p256dh, ?string $auth): self
    {
        $this->cleP256dh = $p256dh;
        $this->cleAuth = $auth;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
