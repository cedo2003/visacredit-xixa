<?php

namespace App\Entity;

use App\Repository\NotationClientRepository;
use Doctrine\ORM\Mapping as ORM;

/** Un grossiste note le détaillant (son client) après une commande. */
#[ORM\Entity(repositoryClass: NotationClientRepository::class)]
#[ORM\Table(name: 'notations_clients')]
class NotationClient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id_grossiste', referencedColumnName: 'id', nullable: false)]
    private ?User $grossiste = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id_detaillant', referencedColumnName: 'id', nullable: false)]
    private ?User $detaillant = null;

    #[ORM\ManyToOne(targetEntity: Commande::class)]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    #[ORM\Column(type: 'smallint')]
    private int $note = 5;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGrossiste(): ?User
    {
        return $this->grossiste;
    }

    public function setGrossiste(User $u): self
    {
        $this->grossiste = $u;

        return $this;
    }

    public function getDetaillant(): ?User
    {
        return $this->detaillant;
    }

    public function setDetaillant(User $u): self
    {
        $this->detaillant = $u;

        return $this;
    }

    public function getCommande(): ?Commande
    {
        return $this->commande;
    }

    public function setCommande(Commande $c): self
    {
        $this->commande = $c;

        return $this;
    }

    public function getNote(): int
    {
        return $this->note;
    }

    public function setNote(int $n): self
    {
        $this->note = $n;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $c): self
    {
        $this->commentaire = $c;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $d): self
    {
        $this->updatedAt = $d;

        return $this;
    }
}
