<?php

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Notification> */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    /** @return Notification[] */
    public function findForUser(User $user, int $limit = 50): array
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.user = :user')
            ->setParameter('user', $user)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countNonLues(User $user): int
    {
        return (int) $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->andWhere('n.user = :user')
            ->andWhere('n.lu = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function marquerToutesLues(User $user): void
    {
        $this->createQueryBuilder('n')
            ->update()
            ->set('n.lu', 'true')
            ->andWhere('n.user = :user')
            ->andWhere('n.lu = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    /**
     * Supprime les notifications déjà lues d'un utilisateur.
     * Le filtre sur `user` est porté par la requête elle-même : impossible de
     * toucher les notifications d'un autre compte.
     *
     * @return int nombre de lignes supprimées
     */
    public function supprimerLues(User $user): int
    {
        return (int) $this->createQueryBuilder('n')
            ->delete()
            ->andWhere('n.user = :user')
            ->andWhere('n.lu = true')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    /** @return int nombre de lignes supprimées */
    public function supprimerToutes(User $user): int
    {
        return (int) $this->createQueryBuilder('n')
            ->delete()
            ->andWhere('n.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}
