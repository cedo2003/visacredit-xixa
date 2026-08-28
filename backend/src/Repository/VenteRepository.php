<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Vente;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Vente> */
class VenteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vente::class);
    }

    /** @return Vente[] */
    public function findForUser(User $user, int $limit = 100): array
    {
        return $this->createQueryBuilder('v')
            ->leftJoin('v.client', 'c')->addSelect('c')
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->orderBy('v.dateVente', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /** Nombre de ventes du jour — base du numéro de facture BOU-YYYYMMDD-NNN. */
    public function countAujourdhui(User $user): int
    {
        return (int) $this->createQueryBuilder('v')
            ->select('COUNT(v.id)')
            ->andWhere('v.user = :user')
            ->andWhere('v.dateVente >= :debut')
            ->andWhere('v.dateVente < :fin')
            ->setParameter('user', $user)
            ->setParameter('debut', new \DateTimeImmutable('today'))
            ->setParameter('fin', new \DateTimeImmutable('tomorrow'))
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function sommeMontantPaye(User $user, ?\DateTimeImmutable $debut = null, ?\DateTimeImmutable $fin = null): float
    {
        $qb = $this->createQueryBuilder('v')
            ->select('COALESCE(SUM(v.montantPaye), 0)')
            ->andWhere('v.user = :user')
            ->setParameter('user', $user);

        if ($debut) {
            $qb->andWhere('v.dateVente >= :debut')->setParameter('debut', $debut);
        }
        if ($fin) {
            $qb->andWhere('v.dateVente < :fin')->setParameter('fin', $fin);
        }

        return (float) $qb->getQuery()->getSingleScalarResult();
    }
}
