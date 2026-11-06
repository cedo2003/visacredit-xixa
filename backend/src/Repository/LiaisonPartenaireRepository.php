<?php

namespace App\Repository;

use App\Entity\ApplicationPartenaire;
use App\Entity\LiaisonPartenaire;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<LiaisonPartenaire> */
class LiaisonPartenaireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LiaisonPartenaire::class);
    }

    public function findByReference(ApplicationPartenaire $application, string $reference): ?LiaisonPartenaire
    {
        return $this->findOneBy(['application' => $application, 'referenceExterne' => $reference]);
    }

    public function findByUser(ApplicationPartenaire $application, User $user): ?LiaisonPartenaire
    {
        return $this->findOneBy(['application' => $application, 'user' => $user]);
    }

    /** @return LiaisonPartenaire[] les applications auxquelles la boutique a accordé l'accès */
    public function findByUserAvecApplication(User $user): array
    {
        return $this->createQueryBuilder('l')
            ->addSelect('a')
            ->join('l.application', 'a')
            ->where('l.user = :user')
            ->setParameter('user', $user)
            ->orderBy('l.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Le jeton d'un partenaire vaut-il encore ? Il faut que l'application soit
     * active et que la boutique ne lui ait pas retiré l'accès.
     *
     * Interrogé à chaque requête authentifiée par un tel jeton : une seule
     * requête SQL, sur deux index uniques.
     */
    public function accesEnVigueur(string $clientId, string $telephone): bool
    {
        return null !== $this->createQueryBuilder('l')
            ->select('l.id')
            ->join('l.application', 'a')
            ->join('l.user', 'u')
            ->where('a.clientId = :clientId')
            ->andWhere('a.actif = true')
            ->andWhere('u.telephone = :telephone')
            ->setParameter('clientId', $clientId)
            ->setParameter('telephone', $telephone)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
