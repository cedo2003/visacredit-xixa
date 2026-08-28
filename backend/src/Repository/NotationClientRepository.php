<?php

namespace App\Repository;

use App\Entity\Commande;
use App\Entity\NotationClient;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<NotationClient> */
class NotationClientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NotationClient::class);
    }

    public function findPourCommande(Commande $commande, User $grossiste): ?NotationClient
    {
        return $this->findOneBy(['commande' => $commande, 'grossiste' => $grossiste]);
    }

    /** @return NotationClient[] Notations laissées par un grossiste. */
    public function findEmisesPar(User $grossiste): array
    {
        return $this->createQueryBuilder('n')
            ->leftJoin('n.detaillant', 'd')->addSelect('d')
            ->leftJoin('n.commande', 'c')->addSelect('c')
            ->andWhere('n.grossiste = :u')
            ->setParameter('u', $grossiste)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return NotationClient[] Notations reçues par un détaillant. */
    public function findRecuesPar(User $detaillant): array
    {
        return $this->createQueryBuilder('n')
            ->leftJoin('n.grossiste', 'g')->addSelect('g')
            ->leftJoin('n.commande', 'c')->addSelect('c')
            ->andWhere('n.detaillant = :u')
            ->setParameter('u', $detaillant)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return array{moyenne: float, total: int} */
    public function moyennePour(User $detaillant): array
    {
        $row = $this->createQueryBuilder('n')
            ->select('COALESCE(AVG(n.note), 0) AS moyenne', 'COUNT(n.id) AS total')
            ->andWhere('n.detaillant = :u')
            ->setParameter('u', $detaillant)
            ->getQuery()
            ->getSingleResult();

        return ['moyenne' => round((float) $row['moyenne'], 2), 'total' => (int) $row['total']];
    }
}
