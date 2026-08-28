<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Catégorie de produit.
 *
 * Le catalogue est désormais **défini par la plateforme** : les catégories
 * livrées ont `user_id = NULL` et sont communes à toutes les boutiques. La
 * colonne reste nullable plutôt que supprimée pour ne pas perdre les catégories
 * créées à la main avant ce changement — la migration les rattache au catalogue
 * commun quand le nom correspond.
 */
#[ORM\Entity]
#[ORM\Table(name: 'categories')]
class Categorie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true)]
    private ?User $user = null;

    #[ORM\Column(length: 100)]
    private string $nom = '';

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    /** Vrai pour les catégories du catalogue commun (non rattachées à une boutique). */
    public function estGlobale(): bool
    {
        return null === $this->user;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
