<?php

namespace App\Entity;

use App\Repository\ApprovisionnementRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Un approvisionnement à crédit = une dette envers un fournisseur.
 * C'est ce que l'ancienne page credits_fournisseurs.php affichait des deux côtés :
 *  - côté détaillant  : `user_id` = moi, dettes que je dois payer
 *  - côté grossiste   : `fournisseur_telephone` = mon numéro, créances à encaisser
 */
#[ORM\Entity(repositoryClass: ApprovisionnementRepository::class)]
#[ORM\Table(name: 'approvisionnements')]
class Approvisionnement
{
    public const STATUT_PAYE = 'payé';
    public const STATUT_EN_ATTENTE = 'en_attente';

    public const REGLEMENT_ESPECES = 'especes';
    public const REGLEMENT_MOBILE_MONEY = 'mobile_money';
    /** Prélèvement sur le solde de caisse du détaillant. */
    public const REGLEMENT_SOLDE = 'solde';

    public const MOYENS_REGLEMENT = [
        self::REGLEMENT_ESPECES,
        self::REGLEMENT_MOBILE_MONEY,
        self::REGLEMENT_SOLDE,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Produit::class)]
    #[ORM\JoinColumn(name: 'produit_id', referencedColumnName: 'id', nullable: true)]
    private ?Produit $produit = null;

    #[ORM\Column(type: 'integer')]
    private int $quantite = 0;

    #[ORM\Column(name: 'prix_achat', type: 'decimal', precision: 10, scale: 2)]
    private string $prixAchat = '0.00';

    #[ORM\Column(name: 'montant_total', type: 'decimal', precision: 10, scale: 2)]
    private string $montantTotal = '0.00';

    /** 'comptant' | 'credit' */
    #[ORM\Column(name: 'mode_paiement', length: 20, options: ['default' => 'comptant'])]
    private string $modePaiement = 'comptant';

    /** 'payé' | 'en_attente' */
    #[ORM\Column(length: 20, options: ['default' => 'payé'])]
    private string $statut = self::STATUT_PAYE;

    /**
     * Comment la dette a effectivement été réglée.
     *
     * À distinguer de `modePaiement`, qui dit comment la marchandise a été
     * *acquise* (comptant ou à crédit). Celui-ci n'a de sens qu'une fois le
     * statut passé à « payé ».
     *
     * Nullable, et il le restera pour l'historique : les règlements antérieurs
     * à ce champ n'ont pas été tracés, et leur attribuer « espèces » par défaut
     * inventerait une information. L'interface affiche alors « Payé » sans
     * précision.
     */
    #[ORM\Column(name: 'moyen_reglement', length: 20, nullable: true)]
    private ?string $moyenReglement = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(name: 'fournisseur_nom', length: 100, nullable: true)]
    private ?string $fournisseurNom = null;

    #[ORM\Column(name: 'fournisseur_telephone', length: 20, nullable: true)]
    private ?string $fournisseurTelephone = null;

    #[ORM\Column(name: 'date_appro', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateAppro = null;

    public function __construct()
    {
        $this->dateAppro = new \DateTimeImmutable();
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

    public function getProduit(): ?Produit
    {
        return $this->produit;
    }

    public function setProduit(?Produit $produit): self
    {
        $this->produit = $produit;

        return $this;
    }

    public function getQuantite(): int
    {
        return $this->quantite;
    }

    public function setQuantite(int $quantite): self
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getPrixAchat(): string
    {
        return $this->prixAchat;
    }

    public function setPrixAchat(string $prixAchat): self
    {
        $this->prixAchat = $prixAchat;

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

    public function getModePaiement(): string
    {
        return $this->modePaiement;
    }

    public function setModePaiement(string $m): self
    {
        $this->modePaiement = $m;

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

    public function getMoyenReglement(): ?string
    {
        return $this->moyenReglement;
    }

    public function setMoyenReglement(?string $moyenReglement): self
    {
        if (null !== $moyenReglement && !\in_array($moyenReglement, self::MOYENS_REGLEMENT, true)) {
            throw new \InvalidArgumentException("Moyen de règlement inconnu : $moyenReglement");
        }

        $this->moyenReglement = $moyenReglement;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): self
    {
        $this->notes = $notes;

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

    public function getFournisseurTelephone(): ?string
    {
        return $this->fournisseurTelephone;
    }

    public function setFournisseurTelephone(?string $t): self
    {
        $this->fournisseurTelephone = $t;

        return $this;
    }

    public function getDateAppro(): ?\DateTimeImmutable
    {
        return $this->dateAppro;
    }

    public function setDateAppro(?\DateTimeImmutable $d): self
    {
        $this->dateAppro = $d;

        return $this;
    }
}
