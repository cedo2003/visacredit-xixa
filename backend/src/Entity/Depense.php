<?php

namespace App\Entity;

use App\Repository\DepenseRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DepenseRepository::class)]
#[ORM\Table(name: 'depenses')]
class Depense
{
    public const CATEGORIES = [
        'salaires',
        'achat_marchandises',
        'loyer',
        'transport',
        'electricite',
        'autres',
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 30)]
    private string $categorie = 'autres';

    #[ORM\Column(name: 'autre_categorie', length: 100, nullable: true)]
    private ?string $autreCategorie = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    private string $montant = '0.00';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(name: 'justificatif_path', length: 255, nullable: true)]
    private ?string $justificatifPath = null;

    #[ORM\Column(name: 'date_depense', type: 'date_immutable')]
    private ?\DateTimeImmutable $dateDepense = null;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->dateDepense = new \DateTimeImmutable('today');
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

    public function getCategorie(): string
    {
        return $this->categorie;
    }

    public function setCategorie(string $categorie): self
    {
        $this->categorie = $categorie;

        return $this;
    }

    public function getAutreCategorie(): ?string
    {
        return $this->autreCategorie;
    }

    public function setAutreCategorie(?string $autreCategorie): self
    {
        $this->autreCategorie = $autreCategorie;

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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getJustificatifPath(): ?string
    {
        return $this->justificatifPath;
    }

    public function setJustificatifPath(?string $p): self
    {
        $this->justificatifPath = $p;

        return $this;
    }

    public function getDateDepense(): ?\DateTimeImmutable
    {
        return $this->dateDepense;
    }

    public function setDateDepense(\DateTimeImmutable $d): self
    {
        $this->dateDepense = $d;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
