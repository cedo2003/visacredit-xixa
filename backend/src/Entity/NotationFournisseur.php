<?php

namespace App\Entity;

use App\Repository\NotationFournisseurRepository;
use Doctrine\ORM\Mapping as ORM;

/** Un détaillant note le grossiste après réception d'une commande. */
#[ORM\Entity(repositoryClass: NotationFournisseurRepository::class)]
#[ORM\Table(name: 'notations_fournisseurs')]
class NotationFournisseur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id_detaillant', referencedColumnName: 'id', nullable: false)]
    private ?User $detaillant = null;

    /** NULL si le fournisseur n'est pas inscrit sur la plateforme. */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id_grossiste', referencedColumnName: 'id', nullable: true)]
    private ?User $grossiste = null;

    #[ORM\ManyToOne(targetEntity: Commande::class)]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    /** 1 à 5 */
    #[ORM\Column(type: 'smallint')]
    private int $note = 5;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $commentaire = null;

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

    public function getDetaillant(): ?User
    {
        return $this->detaillant;
    }

    public function setDetaillant(User $u): self
    {
        $this->detaillant = $u;

        return $this;
    }

    public function getGrossiste(): ?User
    {
        return $this->grossiste;
    }

    public function setGrossiste(?User $u): self
    {
        $this->grossiste = $u;

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

    public function setCreatedAt(\DateTimeImmutable $d): self
    {
        $this->createdAt = $d;

        return $this;
    }
}
