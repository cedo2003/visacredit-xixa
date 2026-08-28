<?php

namespace App\Entity;

use App\Repository\CreanceRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Échéance de créance rattachée à une vente.
 * Une vente à crédit produit N lignes `creances` (numero_echeance 1..N).
 */
#[ORM\Entity(repositoryClass: CreanceRepository::class)]
#[ORM\Table(name: 'creances')]
class Creance
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Vente::class)]
    #[ORM\JoinColumn(name: 'vente_id', referencedColumnName: 'id', nullable: false)]
    private ?Vente $vente = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(name: 'client_id', referencedColumnName: 'id', nullable: true)]
    private ?Client $client = null;

    #[ORM\Column(name: 'montant_restant', type: 'decimal', precision: 15, scale: 2)]
    private string $montantRestant = '0.00';

    #[ORM\Column(name: 'date_limite', type: 'date_immutable')]
    private ?\DateTimeImmutable $dateLimite = null;

    /** 'en_cours' | 'payee' | 'retard' */
    #[ORM\Column(length: 20, options: ['default' => 'en_cours'])]
    private string $statut = 'en_cours';

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'numero_echeance', type: 'integer', options: ['default' => 1])]
    private int $numeroEcheance = 1;

    #[ORM\Column(name: 'nb_echeances_total', type: 'integer', options: ['default' => 1])]
    private int $nbEcheancesTotal = 1;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getVente(): ?Vente
    {
        return $this->vente;
    }

    public function setVente(Vente $vente): self
    {
        $this->vente = $vente;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): self
    {
        $this->client = $client;

        return $this;
    }

    public function getMontantRestant(): string
    {
        return $this->montantRestant;
    }

    public function setMontantRestant(string $montantRestant): self
    {
        $this->montantRestant = $montantRestant;

        return $this;
    }

    public function getDateLimite(): ?\DateTimeImmutable
    {
        return $this->dateLimite;
    }

    public function setDateLimite(\DateTimeImmutable $dateLimite): self
    {
        $this->dateLimite = $dateLimite;

        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): self
    {
        $this->statut = $statut;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
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

    public function isEnRetard(): bool
    {
        return 'payee' !== $this->statut
            && null !== $this->dateLimite
            && $this->dateLimite < new \DateTimeImmutable('today');
    }
}
