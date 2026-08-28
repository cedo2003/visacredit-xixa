<?php

namespace App\Repository;

use App\Entity\Produit;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Produit> */
class ProduitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Produit::class);
    }

    /** @return Produit[] */
    public function findForUser(User $user, ?string $recherche = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.categorie', 'cat')->addSelect('cat')
            ->andWhere('p.user = :user')
            ->setParameter('user', $user)
            ->orderBy('p.nom', 'ASC');

        if ($recherche) {
            $qb->andWhere('p.nom LIKE :q')->setParameter('q', '%'.$recherche.'%');
        }

        return $qb->getQuery()->getResult();
    }

    /** Retrouve un produit d'un utilisateur par son nom exact (rapprochement de stock B2B). */
    public function findOneByUserAndNom(User $user, string $nom): ?Produit
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.user = :user')
            ->andWhere('p.nom = :nom')
            ->setParameter('user', $user)
            ->setParameter('nom', $nom)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Recherche inter-boutiques : produits en stock chez les grossistes.
     * Reprend la requête de pages/commandes/rechercher_produits.php.
     *
     * @return Produit[]
     */
    public function rechercherChezGrossistes(string $terme): array
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.user', 'u')->addSelect('u')
            ->andWhere('u.etatEts = 1')
            ->andWhere('p.nom LIKE :q')
            ->andWhere('p.stock > 0')
            ->setParameter('q', '%'.$terme.'%')
            ->orderBy('p.nom', 'ASC')
            ->addOrderBy('p.prixAchat', 'ASC')
            ->setMaxResults(50)
            ->getQuery()
            ->getResult();
    }

    /** Produits sous le seuil d'alerte mais pas encore en rupture. */
    public function countEnAlerte(User $user): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->andWhere('p.user = :user')
            ->andWhere('p.stock <= p.seuilAlerte')
            ->andWhere('p.stock > 0')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
