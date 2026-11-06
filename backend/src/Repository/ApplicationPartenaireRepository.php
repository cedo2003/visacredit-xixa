<?php

namespace App\Repository;

use App\Entity\ApplicationPartenaire;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<ApplicationPartenaire> */
class ApplicationPartenaireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ApplicationPartenaire::class);
    }

    public function findByClientId(string $clientId): ?ApplicationPartenaire
    {
        return $this->findOneBy(['clientId' => $clientId]);
    }
}
