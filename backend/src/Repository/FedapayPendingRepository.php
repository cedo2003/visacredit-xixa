<?php

namespace App\Repository;

use App\Entity\FedapayPending;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<FedapayPending> */
class FedapayPendingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FedapayPending::class);
    }

    public function findNonTraiteParTransaction(string $transactionId): ?FedapayPending
    {
        return $this->findOneBy(['transactionId' => $transactionId, 'traite' => false]);
    }
}
