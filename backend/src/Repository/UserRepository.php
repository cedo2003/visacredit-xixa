<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<User> */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function findByTelephone(string $telephone): ?User
    {
        return $this->findOneBy(['telephone' => $telephone]);
    }

    /**
     * Reprend trouver_fournisseur() de includes/helpers_commandes.php :
     * un fournisseur valide est un utilisateur avec etatEts = 1.
     */
    public function findGrossisteByTelephone(string $telephone): ?User
    {
        return $this->findOneBy(['telephone' => $telephone, 'etatEts' => 1]);
    }
}
