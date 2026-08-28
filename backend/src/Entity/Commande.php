<?php

namespace App\Entity;

use App\Repository\CommandeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Commande B2B : un détaillant commande chez un grossiste.
 * Le grossiste peut être hors plateforme — dans ce cas user_id_grossiste est NULL
 * et seul fournisseur_telephone / fournisseur_nom est renseigné.
 */
#[ORM\Entity(repositoryClass: CommandeRepository::class)]
#[ORM\Table(name: 'commandes')]
class Commande
{
    public const STATUTS = [
        'en_attente',
        'validee',
        'livree',
        'recu_par_detaillant',
        'en_attente_paiement',
        'payee',
        'annulee',
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id_detaillant', referencedColumnName: 'id', nullable: false)]
    private ?User $detaillant = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id_grossiste', referencedColumnName: 'id', nullable: true)]
    private ?User $grossiste = null;

    #[ORM\Column(name: 'fournisseur_nom', length: 150, nullable: true)]
    private ?string $fournisseurNom = null;

    #[ORM\Column(name: 'fournisseur_telephone', length: 20)]
    private string $fournisseurTelephone = '';

    #[ORM\Column(name: 'numero_commande', length: 50)]
    private string $numeroCommande = '';

    #[ORM\Column(name: 'montant_total', type: 'decimal', precision: 15, scale: 2)]
    private string $montantTotal = '0.00';

    #[ORM\Column(name: 'montant_paye', type: 'decimal', precision: 15, scale: 2, options: ['default' => '0.00'])]
    private string $montantPaye = '0.00';

    #[ORM\Column(length: 30, options: ['default' => 'en_attente'])]
    private string $statut = 'en_attente';

    #[ORM\Column(name: 'recu_par_detaillant', type: 'boolean', options: ['default' => false])]
    private bool $recuParDetaillant = false;

    #[ORM\Column(name: 'date_reception', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateReception = null;

    /** 'plateforme' | 'manuel' */
    #[ORM\Column(name: 'mode_reception', length: 20, nullable: true, options: ['default' => 'plateforme'])]
    private ?string $modeReception = 'plateforme';

    /** 'comptant' | 'credit' */
    #[ORM\Column(name: 'mode_paiement', length: 20, options: ['default' => 'comptant'])]
    private string $modePaiement = 'comptant';

    #[ORM\Column(name: 'date_commande', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $dateCommande = null;

    #[ORM\Column(name: 'date_validation', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateValidation = null;

    #[ORM\Column(name: 'date_livraison', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateLivraison = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(name: 'date_echeance', type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateEcheance = null;

    #[ORM\Column(name: 'date_paiement', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $datePaiement = null;

    /** @var Collection<int, CommandeDetail> */
    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: CommandeDetail::class, cascade: ['persist'])]
    private Collection $details;

    /** @var Collection<int, CommandeEcheance> */
    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: CommandeEcheance::class, cascade: ['persist'])]
    private Collection $echeances;

    /** @var Collection<int, CommandeNegociation> */
    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: CommandeNegociation::class, cascade: ['persist'])]
    #[ORM\OrderBy(['id' => 'ASC'])]
    private Collection $negociations;

    public function __construct()
    {
        $this->dateCommande = new \DateTimeImmutable();
        $this->details = new ArrayCollection();
        $this->echeances = new ArrayCollection();
        $this->negociations = new ArrayCollection();
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

    public function getFournisseurNom(): ?string
    {
        return $this->fournisseurNom;
    }

    public function setFournisseurNom(?string $n): self
    {
        $this->fournisseurNom = $n;

        return $this;
    }

    public function getFournisseurTelephone(): string
    {
        return $this->fournisseurTelephone;
    }

    public function setFournisseurTelephone(string $t): self
    {
        $this->fournisseurTelephone = $t;

        return $this;
    }

    public function getNumeroCommande(): string
    {
        return $this->numeroCommande;
    }

    public function setNumeroCommande(string $n): self
    {
        $this->numeroCommande = $n;

        return $this;
    }

    public function getMontantTotal(): string
    {
        return $this->montantTotal;
    }

    public function setMontantTotal(string $m): self
    {
        $this->montantTotal = $m;

        return $this;
    }

    public function getMontantPaye(): string
    {
        return $this->montantPaye;
    }

    public function setMontantPaye(string $m): self
    {
        $this->montantPaye = $m;

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

    public function isRecuParDetaillant(): bool
    {
        return $this->recuParDetaillant;
    }

    public function setRecuParDetaillant(bool $b): self
    {
        $this->recuParDetaillant = $b;

        return $this;
    }

    public function getDateReception(): ?\DateTimeImmutable
    {
        return $this->dateReception;
    }

    public function setDateReception(?\DateTimeImmutable $d): self
    {
        $this->dateReception = $d;

        return $this;
    }

    public function getModeReception(): ?string
    {
        return $this->modeReception;
    }

    public function setModeReception(?string $m): self
    {
        $this->modeReception = $m;

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

    public function getDateCommande(): ?\DateTimeImmutable
    {
        return $this->dateCommande;
    }

    public function getDateValidation(): ?\DateTimeImmutable
    {
        return $this->dateValidation;
    }

    public function setDateValidation(?\DateTimeImmutable $d): self
    {
        $this->dateValidation = $d;

        return $this;
    }

    public function getDateLivraison(): ?\DateTimeImmutable
    {
        return $this->dateLivraison;
    }

    public function setDateLivraison(?\DateTimeImmutable $d): self
    {
        $this->dateLivraison = $d;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $n): self
    {
        $this->notes = $n;

        return $this;
    }

    public function getDateEcheance(): ?\DateTimeImmutable
    {
        return $this->dateEcheance;
    }

    public function setDateEcheance(?\DateTimeImmutable $d): self
    {
        $this->dateEcheance = $d;

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

    /** @return Collection<int, CommandeDetail> */
    public function getDetails(): Collection
    {
        return $this->details;
    }

    public function addDetail(CommandeDetail $d): self
    {
        if (!$this->details->contains($d)) {
            $this->details->add($d);
            $d->setCommande($this);
        }

        return $this;
    }

    /** @return Collection<int, CommandeEcheance> */
    public function getEcheances(): Collection
    {
        return $this->echeances;
    }

    public function addEcheance(CommandeEcheance $e): self
    {
        if (!$this->echeances->contains($e)) {
            $this->echeances->add($e);
            $e->setCommande($this);
        }

        return $this;
    }

    /** @return Collection<int, CommandeNegociation> */
    public function getNegociations(): Collection
    {
        return $this->negociations;
    }

    public function addNegociation(CommandeNegociation $n): self
    {
        if (!$this->negociations->contains($n)) {
            $this->negociations->add($n);
            $n->setCommande($this);
        }

        return $this;
    }

    /**
     * La proposition de prix encore ouverte, s'il y en a une.
     *
     * Une seule peut l'être à la fois — c'est CommandeService qui le garantit en
     * fermant la précédente dès qu'une contre-proposition arrive.
     */
    public function getNegociationEnAttente(): ?CommandeNegociation
    {
        foreach ($this->negociations as $negociation) {
            if ($negociation->estEnAttente()) {
                return $negociation;
            }
        }

        return null;
    }

    public function getReste(): float
    {
        return (float) $this->montantTotal - (float) $this->montantPaye;
    }

    /** Le fournisseur est-il un grossiste inscrit sur Visacredit XIXA ? */
    public function isFournisseurSurPlateforme(): bool
    {
        return null !== $this->grossiste && $this->grossiste->isGrossiste();
    }
}
