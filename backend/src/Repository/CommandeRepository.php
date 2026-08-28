<?php

namespace App\Repository;

use App\Entity\Commande;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Commande> */
class CommandeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Commande::class);
    }

    /**
     * Liste des commandes vues depuis le rôle de l'utilisateur :
     * le grossiste voit ce qu'il reçoit, le détaillant ce qu'il a commandé.
     *
     * @return Commande[]
     */
    public function findForUser(User $user): array
    {
        $qb = $this->createQueryBuilder('c')
            ->leftJoin('c.detaillant', 'd')->addSelect('d')
            ->leftJoin('c.grossiste', 'g')->addSelect('g')
            ->orderBy('c.dateCommande', 'DESC');

        if ($user->isGrossiste()) {
            $qb->andWhere('c.grossiste = :user');
        } else {
            $qb->andWhere('c.detaillant = :user');
        }

        return $qb->setParameter('user', $user)->getQuery()->getResult();
    }

    /**
     * Statistiques du tableau de bord — reprend get_stats_commandes()
     * de includes/helpers_commandes.php.
     *
     * @return array<string, float|int>
     */
    public function stats(User $user): array
    {
        $qb = $this->createQueryBuilder('c')
            ->select(
                'COUNT(c.id) AS total',
                "SUM(CASE WHEN c.statut = 'en_attente' THEN 1 ELSE 0 END) AS en_attente",
                "SUM(CASE WHEN c.statut IN ('validee', 'livree') THEN 1 ELSE 0 END) AS en_cours",
            );

        if ($user->isGrossiste()) {
            $qb->addSelect(
                "SUM(CASE WHEN c.statut = 'payee' THEN 1 ELSE 0 END) AS payees",
                "COALESCE(SUM(CASE WHEN c.statut = 'payee' THEN c.montantTotal ELSE 0 END), 0) AS revenu_total",
            )->andWhere('c.grossiste = :user');
        } else {
            $qb->addSelect(
                'SUM(CASE WHEN c.recuParDetaillant = true THEN 1 ELSE 0 END) AS recues',
                'COALESCE(SUM(c.montantTotal), 0) AS depenses_total',
            )->andWhere('c.detaillant = :user');
        }

        $row = $qb->setParameter('user', $user)->getQuery()->getSingleResult();

        return array_map(static fn ($v) => is_numeric($v) ? $v + 0 : 0, $row);
    }

    /** Commandes en attente de paiement chez un grossiste (encart du tableau de bord). */
    public function countEnAttentePaiement(User $grossiste): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.grossiste = :user')
            ->andWhere("c.statut = 'en_attente_paiement'")
            ->setParameter('user', $grossiste)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findDernierNumeroDuJour(string $prefixe): ?string
    {
        return $this->createQueryBuilder('c')
            ->select('c.numeroCommande')
            ->andWhere('c.numeroCommande LIKE :p')
            ->setParameter('p', $prefixe.'%')
            ->orderBy('c.id', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()['numeroCommande'] ?? null;
    }
}
