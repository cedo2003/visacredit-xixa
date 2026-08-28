<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Ligne de commande. Le nom du produit est figé au moment de la commande
 * (`produit_nom`) : la commande B2B n'est pas liée au catalogue du grossiste,
 * ce qui permet de commander à un fournisseur hors plateforme.
 */
#[ORM\Entity]
#[ORM\Table(name: 'commande_details')]
class CommandeDetail
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Commande::class, inversedBy: 'details')]
    #[ORM\JoinColumn(name: 'commande_id', referencedColumnName: 'id', nullable: false)]
    private ?Commande $commande = null;

    #[ORM\Column(name: 'produit_nom', length: 150)]
    private string $produitNom = '';

    #[ORM\Column(type: 'integer')]
    private int $quantite = 0;

    #[ORM\Column(name: 'prix_unitaire', type: 'decimal', precision: 15, scale: 2)]
    private string $prixUnitaire = '0.00';

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

    public function getProduitNom(): string
    {
        return $this->produitNom;
    }

    public function setProduitNom(string $n): self
    {
        $this->produitNom = $n;

        return $this;
    }

    public function getQuantite(): int
    {
        return $this->quantite;
    }

    public function setQuantite(int $q): self
    {
        $this->quantite = $q;

        return $this;
    }

    public function getPrixUnitaire(): string
    {
        return $this->prixUnitaire;
    }

    public function setPrixUnitaire(string $p): self
    {
        $this->prixUnitaire = $p;

        return $this;
    }

    public function getMontant(): float
    {
        return $this->quantite * (float) $this->prixUnitaire;
    }
}
