<?php

namespace App\Repository;

use App\Entity\AbonnementPush;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<AbonnementPush> */
class AbonnementPushRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AbonnementPush::class);
    }

    public function findByPointTerminaison(string $pointTerminaison): ?AbonnementPush
    {
        return $this->findOneBy(['empreinte' => AbonnementPush::empreinte($pointTerminaison)]);
    }

    /**
     * @param int[] $userIds
     *
     * @return AbonnementPush[]
     */
    public function findByUserIds(array $userIds): array
    {
        if (!$userIds) {
            return [];
        }

        return $this->createQueryBuilder('a')
            ->where('IDENTITY(a.user) IN (:ids)')
            ->setParameter('ids', $userIds)
            ->getQuery()
            ->getResult();
    }

    /** @return int nombre d'abonnements supprimés */
    public function supprimerPourUser(User $user, string $pointTerminaison): int
    {
        return $this->createQueryBuilder('a')
            ->delete()
            ->where('a.user = :user')
            ->andWhere('a.empreinte = :empreinte')
            ->setParameter('user', $user)
            ->setParameter('empreinte', AbonnementPush::empreinte($pointTerminaison))
            ->getQuery()
            ->execute();
    }

    /** Abonnements que le service push a déclarés morts (appareil désinstallé, permission retirée…). */
    public function supprimerParPointsTerminaison(array $pointsTerminaison): void
    {
        if (!$pointsTerminaison) {
            return;
        }

        $this->createQueryBuilder('a')
            ->delete()
            ->where('a.empreinte IN (:empreintes)')
            ->setParameter('empreintes', array_map(AbonnementPush::empreinte(...), $pointsTerminaison))
            ->getQuery()
            ->execute();
    }
}
