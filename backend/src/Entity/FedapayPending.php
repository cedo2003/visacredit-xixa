<?php

namespace App\Entity;

use App\Repository\FedapayPendingRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Transaction FedaPay en attente de confirmation.
 *
 * En PHP natif, l'intention de paiement vivait dans $_SESSION['pending_payment'].
 * L'API étant sans état, elle est désormais persistée ici : le webhook et le
 * retour navigateur peuvent tous deux la retrouver, et un paiement n'est plus
 * perdu si l'utilisateur ferme son onglet. Sert aussi bien à FedaPay qu'à
 * KkiaPay (colonne `source`).
 */
#[ORM\Entity(repositoryClass: FedapayPendingRepository::class)]
#[ORM\Table(name: 'fedapay_pending')]
class FedapayPending
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(name: 'transaction_id', length: 100)]
    private string $transactionId = '';

    /** 'vente' | 'creance' | 'commande' | 'credit' */
    #[ORM\Column(length: 20)]
    private string $module = '';

    #[ORM\Column(name: 'reference_id', type: 'integer')]
    private int $referenceId = 0;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    private string $montant = '0.00';

    #[ORM\Column(name: 'montant_widget', type: 'decimal', precision: 15, scale: 2)]
    private string $montantWidget = '0.00';

    #[ORM\Column(name: 'repartition_frais', length: 20, options: ['default' => 'client'])]
    private string $repartitionFrais = 'client';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $meta = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $traite = false;

    #[ORM\Column(name: 'traite_at', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $traiteAt = null;

    /** 'oncomplete' | 'webhook' | 'kkiapay' */
    #[ORM\Column(length: 20, options: ['default' => 'oncomplete'])]
    private string $source = 'oncomplete';

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

    public function getTransactionId(): string
    {
        return $this->transactionId;
    }

    public function setTransactionId(string $t): self
    {
        $this->transactionId = $t;

        return $this;
    }

    public function getModule(): string
    {
        return $this->module;
    }

    public function setModule(string $m): self
    {
        $this->module = $m;

        return $this;
    }

    public function getReferenceId(): int
    {
        return $this->referenceId;
    }

    public function setReferenceId(int $r): self
    {
        $this->referenceId = $r;

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

    public function getMontantWidget(): string
    {
        return $this->montantWidget;
    }

    public function setMontantWidget(string $m): self
    {
        $this->montantWidget = $m;

        return $this;
    }

    public function getRepartitionFrais(): string
    {
        return $this->repartitionFrais;
    }

    public function setRepartitionFrais(string $r): self
    {
        $this->repartitionFrais = $r;

        return $this;
    }

    /** @return array<string, mixed> */
    public function getMetaArray(): array
    {
        return $this->meta ? (json_decode($this->meta, true) ?? []) : [];
    }

    /** @param array<string, mixed> $meta */
    public function setMetaArray(array $meta): self
    {
        $this->meta = json_encode($meta, \JSON_UNESCAPED_UNICODE);

        return $this;
    }

    public function isTraite(): bool
    {
        return $this->traite;
    }

    public function setTraite(bool $t): self
    {
        $this->traite = $t;
        if ($t) {
            $this->traiteAt = new \DateTimeImmutable();
        }

        return $this;
    }

    public function getTraiteAt(): ?\DateTimeImmutable
    {
        return $this->traiteAt;
    }

    public function getSource(): string
    {
        return $this->source;
    }

    public function setSource(string $s): self
    {
        $this->source = $s;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
