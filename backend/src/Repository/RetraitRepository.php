<?php

namespace App\Repository;

use App\Entity\Retrait;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Retrait> */
class RetraitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Retrait::class);
    }

    /** @return Retrait[] */
    public function findForUser(User $user, int $limit = 200): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.user = :user')
            ->setParameter('user', $user)
            ->orderBy('r.dateRetrait', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function sommeTotale(User $user): float
    {
        return (float) $this->createQueryBuilder('r')
            ->select('COALESCE(SUM(r.montant), 0)')
            ->andWhere('r.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
