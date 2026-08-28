<?php

namespace App\Repository;

use App\Entity\Client;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Client> */
class ClientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Client::class);
    }

    /** @return Client[] */
    public function findForUser(User $user, ?string $recherche = null): array
    {
        $qb = $this->createQueryBuilder('c')
            ->andWhere('c.user = :user')
            ->setParameter('user', $user)
            ->orderBy('c.nomComplet', 'ASC');

        if ($recherche) {
            $qb->andWhere('c.nomComplet LIKE :q OR c.telephone LIKE :q')
                ->setParameter('q', '%'.$recherche.'%');
        }

        return $qb->getQuery()->getResult();
    }

    public function countForUser(User $user): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
