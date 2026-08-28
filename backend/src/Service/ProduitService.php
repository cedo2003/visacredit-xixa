<?php

namespace App\Service;

use App\Entity\Approvisionnement;
use App\Entity\Categorie;
use App\Entity\Depense;
use App\Entity\Produit;
use App\Entity\User;
use App\Exception\BusinessException;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Création d'un produit avec son approvisionnement initial.
 * Porte pages/produits/create.php :
 *   - comptant → une dépense est générée automatiquement ;
 *   - crédit   → l'approvisionnement reste « en attente » et apparaît dans
 *                les crédits fournisseurs.
 */
class ProduitService
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /**
     * Résout la catégorie d'un produit.
     *
     * Elle est obligatoire depuis que le catalogue est défini par la plateforme :
     * un stock sans catégorie ne remontait dans aucun regroupement et rendait la
     * recherche inter-boutiques bancale. Sont acceptées les catégories du
     * catalogue commun et celles de la boutique — pas celles d'une autre.
     */
    public function categorie(User $user, mixed $categorieId): Categorie
    {
        $id = (int) $categorieId;

        if ($id <= 0) {
            throw new BusinessException('La catégorie du produit est obligatoire.');
        }

        $categorie = $this->em->getRepository(Categorie::class)->find($id);

        if (!$categorie || (null !== $categorie->getUser() && $categorie->getUser()->getId() !== $user->getId())) {
            throw new BusinessException('Catégorie inconnue.');
        }

        return $categorie;
    }

    /**
     * @param array{
     *     nom: string, prix_achat: float, prix_vente: float, stock?: int,
     *     seuil_alerte?: int, description?: string|null, categorie_id: int,
     *     mode_paiement?: string, notes?: string|null,
     *     fournisseur_nom?: string|null, fournisseur_telephone?: string|null
     * } $data
     */
    public function creer(User $user, array $data): Produit
    {
        $nom = trim((string) ($data['nom'] ?? ''));
        if ('' === $nom) {
            throw new BusinessException('Le nom du produit est obligatoire.');
        }

        $prixAchat = (float) ($data['prix_achat'] ?? 0);
        $prixVente = (float) ($data['prix_vente'] ?? 0);
        $stock = max(0, (int) ($data['stock'] ?? 0));
        $modePaiement = (string) ($data['mode_paiement'] ?? 'comptant');
        if (!\in_array($modePaiement, ['comptant', 'credit'], true)) {
            $modePaiement = 'comptant';
        }

        if ($prixAchat < 0 || $prixVente < 0) {
            throw new BusinessException('Les prix ne peuvent pas être négatifs.');
        }

        $categorie = $this->categorie($user, $data['categorie_id'] ?? null);

        return $this->em->wrapInTransaction(function () use ($user, $data, $nom, $prixAchat, $prixVente, $stock, $modePaiement, $categorie): Produit {
            $produit = (new Produit())
                ->setUser($user)
                ->setCategorie($categorie)
                ->setNom($nom)
                ->setPrixAchat(number_format($prixAchat, 2, '.', ''))
                ->setPrixVente(number_format($prixVente, 2, '.', ''))
                ->setStock($stock)
                ->setSeuilAlerte((int) ($data['seuil_alerte'] ?? 10))
                ->setDescription($data['description'] ?? null);

            $this->em->persist($produit);

            $montantTotal = $prixAchat * $stock;
            $estCredit = 'credit' === $modePaiement;

            $appro = (new Approvisionnement())
                ->setUser($user)
                ->setProduit($produit)
                ->setQuantite($stock)
                ->setPrixAchat(number_format($prixAchat, 2, '.', ''))
                ->setMontantTotal(number_format($montantTotal, 2, '.', ''))
                ->setModePaiement($modePaiement)
                ->setStatut($estCredit ? Approvisionnement::STATUT_EN_ATTENTE : Approvisionnement::STATUT_PAYE)
                ->setNotes($data['notes'] ?? null)
                ->setFournisseurNom($estCredit ? ($data['fournisseur_nom'] ?? null) : null)
                ->setFournisseurTelephone($estCredit
                    ? (preg_replace('/[^0-9]/', '', (string) ($data['fournisseur_telephone'] ?? '')) ?: null)
                    : null);

            $this->em->persist($appro);

            // Achat comptant : la sortie de caisse est enregistrée tout de suite.
            if (!$estCredit && $stock > 0) {
                $depense = (new Depense())
                    ->setUser($user)
                    ->setCategorie('achat_marchandises')
                    ->setMontant(number_format($montantTotal, 2, '.', ''))
                    ->setDescription(sprintf(
                        'Achat produit : %s (%d unités × %s FCFA)',
                        $nom,
                        $stock,
                        number_format($prixAchat, 0, ',', ' ')
                    ));

                $this->em->persist($depense);
            }

            $this->em->flush();

            return $produit;
        });
    }
}
