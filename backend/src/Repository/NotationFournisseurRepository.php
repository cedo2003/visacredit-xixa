<?php

namespace App\Repository;

use App\Entity\Commande;
use App\Entity\NotationFournisseur;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<NotationFournisseur> */
class NotationFournisseurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NotationFournisseur::class);
    }

    public function findPourCommande(Commande $commande, User $detaillant): ?NotationFournisseur
    {
        return $this->findOneBy(['commande' => $commande, 'detaillant' => $detaillant]);
    }

    /** @return NotationFournisseur[] Notations laissées par un détaillant. */
    public function findEmisesPar(User $detaillant): array
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

    /** @return NotationFournisseur[] Notations reçues par un grossiste. */
    public function findRecuesPar(User $grossiste): array
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

    /** @return array{moyenne: float, total: int} */
    public function moyennePour(User $grossiste): array
    {
        $row = $this->createQueryBuilder('n')
            ->select('COALESCE(AVG(n.note), 0) AS moyenne', 'COUNT(n.id) AS total')
            ->andWhere('n.grossiste = :u')
            ->setParameter('u', $grossiste)
            ->getQuery()
            ->getSingleResult();

        return ['moyenne' => round((float) $row['moyenne'], 2), 'total' => (int) $row['total']];
    }
}
