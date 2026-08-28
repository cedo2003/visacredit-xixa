<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'creance_paiements')]
class CreancePaiement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Creance::class)]
    #[ORM\JoinColumn(name: 'creance_id', referencedColumnName: 'id', nullable: false)]
    private ?Creance $creance = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    private string $montant = '0.00';

    #[ORM\Column(name: 'date_paiement', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $datePaiement = null;

    #[ORM\Column(name: 'mode_paiement', length: 20, nullable: true, options: ['default' => 'espece'])]
    private ?string $modePaiement = 'espece';

    #[ORM\Column(name: 'repartition_frais', length: 20, nullable: true, options: ['default' => 'client'])]
    private ?string $repartitionFrais = null;

    #[ORM\Column(name: 'transaction_id', length: 255, nullable: true)]
    private ?string $transactionId = null;

    public function __construct()
    {
        $this->datePaiement = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCreance(): ?Creance
    {
        return $this->creance;
    }

    public function setCreance(Creance $creance): self
    {
        $this->creance = $creance;

        return $this;
    }

    public function getMontant(): string
    {
        return $this->montant;
    }

    public function setMontant(string $montant): self
    {
        $this->montant = $montant;

        return $this;
    }

    public function getDatePaiement(): ?\DateTimeImmutable
    {
        return $this->datePaiement;
    }

    public function getModePaiement(): ?string
    {
        return $this->modePaiement;
    }

    public function setModePaiement(?string $modePaiement): self
    {
        $this->modePaiement = $modePaiement;

        return $this;
    }

    public function getRepartitionFrais(): ?string
    {
        return $this->repartitionFrais;
    }

    public function setRepartitionFrais(?string $r): self
    {
        $this->repartitionFrais = $r;

        return $this;
    }

    public function getTransactionId(): ?string
    {
        return $this->transactionId;
    }

    public function setTransactionId(?string $t): self
    {
        $this->transactionId = $t;

        return $this;
    }
}
