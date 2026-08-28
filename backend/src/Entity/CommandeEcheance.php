<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'commande_echeances')]
class CommandeEcheance
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Commande::class, inversedBy: 'echeances')]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id_detaillant', referencedColumnName: 'id', nullable: false)]
    private ?User $detaillant = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    private string $montant = '0.00';

    #[ORM\Column(name: 'date_limite', type: 'date_immutable')]
    private ?\DateTimeImmutable $dateLimite = null;

    #[ORM\Column(name: 'numero_echeance', type: 'integer')]
    private int $numeroEcheance = 1;

    #[ORM\Column(name: 'nb_echeances_total', type: 'integer')]
    private int $nbEcheancesTotal = 1;

    /**
     * 'en_cours' | 'payee' | 'en_retard' — valeurs de l'ENUM en base.
     * L'ancien helpers_commandes.php insérait 'en_attente', valeur absente de
     * l'ENUM : MySQL la stockait en chaîne vide et l'échéance devenait
     * invisible du UPDATE ... WHERE statut = 'en_cours'. On aligne sur l'ENUM.
     */
    #[ORM\Column(length: 20, options: ['default' => 'en_cours'])]
    private string $statut = 'en_cours';

    #[ORM\Column(name: 'date_paiement', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $datePaiement = null;

    #[ORM\Column(name: 'transaction_id', length: 255, nullable: true)]
    private ?string $transactionId = null;

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

    public function getCommande(): ?Commande
    {
        return $this->commande;
    }

    public function setCommande(Commande $c): self
    {
        $this->commande = $c;

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

    public function setDateLimite(\DateTimeImmutable $d): self
    {
        $this->dateLimite = $d;

        return $this;
    }

    public function getNumeroEcheance(): int
    {
        return $this->numeroEcheance;
    }

    public function setNumeroEcheance(int $n): self
    {
        $this->numeroEcheance = $n;

        return $this;
    }

    public function getNbEcheancesTotal(): int
    {
        return $this->nbEcheancesTotal;
    }

    public function setNbEcheancesTotal(int $n): self
    {
        $this->nbEcheancesTotal = $n;

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

    public function getDatePaiement(): ?\DateTimeImmutable
    {
        return $this->datePaiement;
    }

    public function setDatePaiement(?\DateTimeImmutable $d): self
    {
        $this->datePaiement = $d;

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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
