<?php

namespace App\Repository;

use App\Entity\Creance;
use App\Entity\User;
use App\Entity\Vente;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Creance> */
class CreanceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Creance::class);
    }

    /** @return Creance[] */
    public function findForUser(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.client', 'cl')->addSelect('cl')
            ->leftJoin('c.vente', 'v')->addSelect('v')
            ->andWhere('c.user = :user')
            ->setParameter('user', $user)
            ->orderBy('c.statut', 'ASC')
            ->addOrderBy('c.dateLimite', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** @return Creance[] */
    public function findByVente(Vente $vente): array
    {
        return $this->findBy(['vente' => $vente], ['numeroEcheance' => 'ASC']);
    }

    /** @return array{nombre: int, montant: float} */
    public function statsEnCours(User $user): array
    {
        $row = $this->createQueryBuilder('c')
            ->select('COUNT(c.id) AS nombre', 'COALESCE(SUM(c.montantRestant), 0) AS montant')
            ->andWhere('c.user = :user')
            ->andWhere("c.statut != 'payee'")
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleResult();

        return ['nombre' => (int) $row['nombre'], 'montant' => (float) $row['montant']];
    }

    /** Nombre d'échéances non soldées restant sur une vente. */
    public function countNonSoldeesPourVente(Vente $vente): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.vente = :vente')
            ->andWhere("c.statut != 'payee'")
            ->setParameter('vente', $vente)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
