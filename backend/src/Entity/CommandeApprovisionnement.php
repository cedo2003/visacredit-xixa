<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/** Table de liaison : quel crédit fournisseur a été généré par quelle commande. */
#[ORM\Entity]
#[ORM\Table(name: 'commande_approvisionnements')]
class CommandeApprovisionnement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Commande::class)]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    #[ORM\ManyToOne(targetEntity: Approvisionnement::class)]
    #[ORM\JoinColumn(name: 'approvisionnement_id', referencedColumnName: 'id', nullable: true)]
    private ?Approvisionnement $approvisionnement = null;

    /** 'en_attente' | 'credit_cree' | 'credit_solde' */
    #[ORM\Column(length: 20, options: ['default' => 'en_attente'])]
    private string $statut = 'en_attente';

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getApprovisionnement(): ?Approvisionnement
    {
        return $this->approvisionnement;
    }

    public function setApprovisionnement(?Approvisionnement $a): self
    {
        $this->approvisionnement = $a;

        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $s): self
    {
        $this->statut = $s;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
