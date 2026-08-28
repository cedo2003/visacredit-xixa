<?php

namespace App\Repository;

use App\Entity\Approvisionnement;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Approvisionnement> */
class ApprovisionnementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Approvisionnement::class);
    }

    /**
     * Crédits que le détaillant doit encore payer.
     *
     * @return Approvisionnement[]
     */
    public function findCreditsEnAttente(User $user): array
    {
        return $this->createQueryBuilder('a')
            ->leftJoin('a.produit', 'p')->addSelect('p')
            ->andWhere('a.user = :user')
            ->andWhere("a.statut = 'en_attente'")
            ->setParameter('user', $user)
            ->orderBy('a.dateAppro', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Créances que le grossiste doit encaisser : les approvisionnements dont
     * il est le fournisseur, identifié par son numéro de téléphone.
     *
     * @return Approvisionnement[]
     */
    public function findCreancesPourFournisseur(string $telephone): array
    {
        return $this->createQueryBuilder('a')
            ->leftJoin('a.produit', 'p')->addSelect('p')
            ->innerJoin('a.user', 'u')->addSelect('u')
            ->andWhere('a.fournisseurTelephone = :tel')
            ->setParameter('tel', $telephone)
            ->orderBy('a.statut', 'ASC')
            ->addOrderBy('a.dateAppro', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return Approvisionnement[] */
    public function findCreditsPayes(User $user, int $limit = 20): array
    {
        return $this->createQueryBuilder('a')
            ->leftJoin('a.produit', 'p')->addSelect('p')
            ->andWhere('a.user = :user')
            ->andWhere("a.statut = 'payé'")
            ->andWhere("a.modePaiement = 'credit'")
            ->setParameter('user', $user)
            ->orderBy('a.dateAppro', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Identifiants de commande associés aux crédits (via commande_approvisionnements),
     * pour afficher « Depuis commande #… » sans requête N+1.
     *
     * @param int[] $approIds
     *
     * @return array<int, array{numero_commande: string, fournisseur_nom: ?string}>
     */
    public function findOriginesCommandes(array $approIds): array
    {
        if (!$approIds) {
            return [];
        }

        $rows = $this->getEntityManager()->createQuery(
            'SELECT IDENTITY(ca.approvisionnement) AS appro_id, c.numeroCommande, c.fournisseurNom
             FROM App\Entity\CommandeApprovisionnement ca
             JOIN ca.commande c
             WHERE ca.approvisionnement IN (:ids)'
        )->setParameter('ids', $approIds)->getArrayResult();

        $map = [];
        foreach ($rows as $r) {
            $map[(int) $r['appro_id']] = [
                'numero_commande' => $r['numeroCommande'],
                'fournisseur_nom' => $r['fournisseurNom'],
            ];
        }

        return $map;
    }
}
