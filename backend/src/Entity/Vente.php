<?php

namespace App\Entity;

use App\Repository\VenteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VenteRepository::class)]
#[ORM\Table(name: 'ventes')]
class Vente
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(name: 'client_id', referencedColumnName: 'id', nullable: true)]
    private ?Client $client = null;

    #[ORM\Column(name: 'numero_facture', length: 50)]
    private string $numeroFacture = '';

    #[ORM\Column(name: 'montant_total', type: 'decimal', precision: 15, scale: 2)]
    private string $montantTotal = '0.00';

    #[ORM\Column(name: 'montant_paye', type: 'decimal', precision: 15, scale: 2, options: ['default' => '0.00'])]
    private string $montantPaye = '0.00';

    /** 'solde' | 'creance' | 'en_attente' */
    #[ORM\Column(length: 50, options: ['default' => 'en_attente'])]
    private string $statut = 'en_attente';

    #[ORM\Column(name: 'date_vente', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $dateVente = null;

    /** 'especes' | 'mobile_money' (KkiaPay) | 'fedapay' */
    #[ORM\Column(name: 'mode_paiement', length: 50, options: ['default' => 'especes'])]
    private string $modePaiement = 'especes';

    #[ORM\Column(name: 'telephone_client', length: 20, nullable: true)]
    private ?string $telephoneClient = null;

    #[ORM\Column(name: 'transaction_id', length: 100, nullable: true)]
    private ?string $transactionId = null;

    /** 'paye' | 'en_attente' | 'echoue' */
    #[ORM\Column(name: 'statut_paiement', length: 20, options: ['default' => 'paye'])]
    private string $statutPaiement = 'paye';

    #[ORM\Column(name: 'frais_client', type: 'decimal', precision: 10, scale: 2, options: ['default' => '0.00'])]
    private string $fraisClient = '0.00';

    #[ORM\Column(name: 'frais_vendeur', type: 'decimal', precision: 10, scale: 2, options: ['default' => '0.00'])]
    private string $fraisVendeur = '0.00';

    #[ORM\Column(name: 'fedapay_identifiant', length: 100, nullable: true)]
    private ?string $fedapayIdentifiant = null;

    #[ORM\Column(name: 'fedapay_frais_client', type: 'integer', nullable: true, options: ['default' => 0])]
    private ?int $fedapayFraisClient = 0;

    #[ORM\Column(name: 'fedapay_frais_vendeur', type: 'integer', nullable: true, options: ['default' => 0])]
    private ?int $fedapayFraisVendeur = 0;

    /** @var Collection<int, VenteDetail> */
    #[ORM\OneToMany(mappedBy: 'vente', targetEntity: VenteDetail::class, cascade: ['persist'])]
    private Collection $details;

    public function __construct()
    {
        $this->dateVente = new \DateTimeImmutable();
        $this->details = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getNumeroFacture(): string
    {
        return $this->numeroFacture;
    }

    public function setNumeroFacture(string $numeroFacture): self
    {
        $this->numeroFacture = $numeroFacture;

        return $this;
    }

    public function getMontantTotal(): string
    {
        return $this->montantTotal;
    }

    public function setMontantTotal(string $montantTotal): self
    {
        $this->montantTotal = $montantTotal;

        return $this;
    }

    public function getMontantPaye(): string
    {
        return $this->montantPaye;
    }

    public function setMontantPaye(string $montantPaye): self
    {
        $this->montantPaye = $montantPaye;

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

    public function getDateVente(): ?\DateTimeImmutable
    {
        return $this->dateVente;
    }

    public function getModePaiement(): string
    {
        return $this->modePaiement;
    }

    public function setModePaiement(string $modePaiement): self
    {
        $this->modePaiement = $modePaiement;

        return $this;
    }

    public function getTelephoneClient(): ?string
    {
        return $this->telephoneClient;
    }

    public function setTelephoneClient(?string $telephoneClient): self
    {
        $this->telephoneClient = $telephoneClient;

        return $this;
    }

    public function getTransactionId(): ?string
    {
        return $this->transactionId;
    }

    public function setTransactionId(?string $transactionId): self
    {
        $this->transactionId = $transactionId;

        return $this;
    }

    public function getStatutPaiement(): string
    {
        return $this->statutPaiement;
    }

    public function setStatutPaiement(string $statutPaiement): self
    {
        $this->statutPaiement = $statutPaiement;

        return $this;
    }

    public function getFraisClient(): string
    {
        return $this->fraisClient;
    }

    public function setFraisClient(string $fraisClient): self
    {
        $this->fraisClient = $fraisClient;

        return $this;
    }

    public function getFraisVendeur(): string
    {
        return $this->fraisVendeur;
    }

    public function setFraisVendeur(string $fraisVendeur): self
    {
        $this->fraisVendeur = $fraisVendeur;

        return $this;
    }

    public function getFedapayIdentifiant(): ?string
    {
        return $this->fedapayIdentifiant;
    }

    public function setFedapayIdentifiant(?string $fedapayIdentifiant): self
    {
        $this->fedapayIdentifiant = $fedapayIdentifiant;

        return $this;
    }

    public function getFedapayFraisClient(): ?int
    {
        return $this->fedapayFraisClient;
    }

    public function setFedapayFraisClient(?int $v): self
    {
        $this->fedapayFraisClient = $v;

        return $this;
    }

    public function getFedapayFraisVendeur(): ?int
    {
        return $this->fedapayFraisVendeur;
    }

    public function setFedapayFraisVendeur(?int $v): self
    {
        $this->fedapayFraisVendeur = $v;

        return $this;
    }

    /** @return Collection<int, VenteDetail> */
    public function getDetails(): Collection
    {
        return $this->details;
    }

    public function addDetail(VenteDetail $detail): self
    {
        if (!$this->details->contains($detail)) {
            $this->details->add($detail);
            $detail->setVente($this);
        }

        return $this;
    }

    public function getReste(): float
    {
        return (float) $this->montantTotal - (float) $this->montantPaye;
    }
}
