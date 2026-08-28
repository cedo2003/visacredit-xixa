<?php

namespace App\Repository;

use App\Entity\CommandeVersement;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<CommandeVersement> */
class CommandeVersementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CommandeVersement::class);
    }

    public function sommeTotale(User $user): float
    {
        return (float) $this->createQueryBuilder('cv')
            ->select('COALESCE(SUM(cv.montant), 0)')
            ->andWhere('cv.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
