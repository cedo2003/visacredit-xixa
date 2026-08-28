<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'commande_paiements')]
class CommandePaiement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Commande::class)]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    private string $montant = '0.00';

    #[ORM\Column(name: 'date_limite', type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateLimite = null;

    #[ORM\Column(name: 'date_paiement', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $datePaiement = null;

    /** 'en_attente' | 'paye' | 'retard' */
    #[ORM\Column(length: 20, options: ['default' => 'en_attente'])]
    private string $statut = 'en_attente';

    #[ORM\Column(name: 'mode_paiement', length: 20, nullable: true, options: ['default' => 'especes'])]
    private ?string $modePaiement = 'especes';

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

    public function getMontant(): string
    {
        return $this->montant;
    }

    public function setMontant(string $m): self
    {
        $this->montant = $m;

        return $this;
    }

    public function getDateLimite(): ?\DateTimeImmutable
    {
        return $this->dateLimite;
    }

    public function setDateLimite(?\DateTimeImmutable $d): self
    {
        $this->dateLimite = $d;

        return $this;
    }

    public function getDatePaiement(): ?\DateTimeImmutable
    {
        return $this->datePaiement;
    }

    public function setDatePaiement(?\DateTimeImmutable $d): self
    {
        $this->datePaiement = $d;

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

    public function getModePaiement(): ?string
    {
        return $this->modePaiement;
    }

    public function setModePaiement(?string $m): self
    {
        $this->modePaiement = $m;

        return $this;
    }
}
