<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Un tour de marchandage sur une commande.
 *
 * Le détaillant propose un montant, le grossiste tranche : c'est lui qui a le
 * dernier mot, comme au marché. Chaque proposition est conservée — l'historique
 * sert de preuve du prix convenu, et permet aux deux parties de voir d'où vient
 * le montant final.
 *
 * Une seule proposition est « en_attente » à la fois : en émettre une nouvelle
 * ferme la précédente en `contre_proposee`.
 */
#[ORM\Entity]
#[ORM\Table(name: 'commande_negociations')]
class CommandeNegociation
{
    public const EN_ATTENTE = 'en_attente';
    public const ACCEPTEE = 'acceptee';
    public const REFUSEE = 'refusee';
    public const CONTRE_PROPOSEE = 'contre_proposee';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Commande::class, inversedBy: 'negociations')]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $auteur = null;

    /** 'detaillant' | 'grossiste' — figé à la création, l'auteur peut changer de rôle. */
    #[ORM\Column(name: 'role_auteur', length: 20)]
    private string $roleAuteur = 'detaillant';

    /** Montant total proposé pour la commande entière. */
    #[ORM\Column(name: 'montant_propose', type: 'decimal', precision: 15, scale: 2)]
    private string $montantPropose = '0.00';

    /** Montant de la commande au moment de la proposition — sert à afficher l'écart. */
    #[ORM\Column(name: 'montant_initial', type: 'decimal', precision: 15, scale: 2)]
    private string $montantInitial = '0.00';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $message = null;

    #[ORM\Column(length: 20, options: ['default' => self::EN_ATTENTE])]
    private string $statut = self::EN_ATTENTE;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'repondu_at', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $reponduAt = null;

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

    public function setCommande(Commande $commande): self
    {
        $this->commande = $commande;

        return $this;
    }

    public function getAuteur(): ?User
    {
        return $this->auteur;
    }

    public function setAuteur(User $auteur): self
    {
        $this->auteur = $auteur;

        return $this;
    }

    public function getRoleAuteur(): string
    {
        return $this->roleAuteur;
    }

    public function setRoleAuteur(string $roleAuteur): self
    {
        $this->roleAuteur = $roleAuteur;

        return $this;
    }

    public function getMontantPropose(): string
    {
        return $this->montantPropose;
    }

    public function setMontantPropose(string $montantPropose): self
    {
        $this->montantPropose = $montantPropose;

        return $this;
    }

    public function getMontantInitial(): string
    {
        return $this->montantInitial;
    }

    public function setMontantInitial(string $montantInitial): self
    {
        $this->montantInitial = $montantInitial;

        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): self
    {
        $this->message = $message;

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

    public function getReponduAt(): ?\DateTimeImmutable
    {
        return $this->reponduAt;
    }

    public function setReponduAt(?\DateTimeImmutable $date): self
    {
        $this->reponduAt = $date;

        return $this;
    }

    public function estEnAttente(): bool
    {
        return self::EN_ATTENTE === $this->statut;
    }
}
