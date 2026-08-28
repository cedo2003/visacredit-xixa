<?php

namespace App\Entity;

use App\Repository\CommandeVersementRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Encaissement reçu par le grossiste sur une commande.
 * Compte en positif dans le calcul du solde (voir SoldeService).
 */
#[ORM\Entity(repositoryClass: CommandeVersementRepository::class)]
#[ORM\Table(name: 'commandes_versements')]
class CommandeVersement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Commande::class)]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    /** Le grossiste qui reçoit le versement. */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    private string $montant = '0.00';

    #[ORM\Column(name: 'mode_paiement', length: 50, options: ['default' => 'especes'])]
    private string $modePaiement = 'especes';

    #[ORM\Column(name: 'transaction_id', length: 255, nullable: true)]
    private ?string $transactionId = null;

    #[ORM\Column(name: 'date_versement', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $dateVersement = null;

    public function __construct()
    {
        $this->dateVersement = new \DateTimeImmutable();
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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $u): self
    {
        $this->user = $u;

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

    public function getModePaiement(): string
    {
        return $this->modePaiement;
    }

    public function setModePaiement(string $m): self
    {
        $this->modePaiement = $m;

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

    public function getDateVersement(): ?\DateTimeImmutable
    {
        return $this->dateVersement;
    }
}
