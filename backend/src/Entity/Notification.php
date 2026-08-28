<?php

namespace App\Entity;

use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationRepository::class)]
#[ORM\Table(name: 'notifications')]
class Notification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    /** nouvelle_commande | commande_validee | commande_rejetee | demande_paiement | echeance_proche */
    #[ORM\Column(length: 50)]
    private string $type = '';

    #[ORM\Column(length: 150)]
    private string $titre = '';

    #[ORM\Column(type: 'text')]
    private string $message = '';

    /** Chemin côté frontend Next.js, ex : /commandes/12 */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $lien = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $lu = false;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $u): self
    {
        $this->user = $u;

        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $t): self
    {
        $this->type = $t;

        return $this;
    }

    public function getTitre(): string
    {
        return $this->titre;
    }

    public function setTitre(string $t): self
    {
        $this->titre = $t;

        return $this;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function setMessage(string $m): self
    {
        $this->message = $m;

        return $this;
    }

    public function getLien(): ?string
    {
        return $this->lien;
    }

    public function setLien(?string $l): self
    {
        $this->lien = $l;

        return $this;
    }

    public function isLu(): bool
    {
        return $this->lu;
    }

    public function setLu(bool $l): self
    {
        $this->lu = $l;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
