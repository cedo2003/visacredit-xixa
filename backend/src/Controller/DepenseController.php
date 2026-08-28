<?php

namespace App\Controller;

use App\Entity\Depense;
use App\Exception\BusinessException;
use App\Repository\DepenseRepository;
use App\Service\ApiPresenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/depenses')]
class DepenseController extends AbstractApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly DepenseRepository $depenses,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();

        return new JsonResponse([
            'depenses' => array_map($this->presenter->depense(...), $this->depenses->findForUser($user)),
            'total' => $this->depenses->sommeTotale($user),
            'categories' => Depense::CATEGORIES,
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = $this->payload($request);

        $categorie = (string) ($data['categorie'] ?? 'autres');
        if (!\in_array($categorie, Depense::CATEGORIES, true)) {
            throw new BusinessException('Catégorie de dépense invalide.');
        }

        $montant = (float) ($data['montant'] ?? 0);
        if ($montant <= 0) {
            throw new BusinessException('Le montant doit être supérieur à 0 FCFA.');
        }

        $depense = (new Depense())
            ->setUser($this->utilisateur())
            ->setCategorie($categorie)
            ->setAutreCategorie('autres' === $categorie ? (trim((string) ($data['autre_categorie'] ?? '')) ?: null) : null)
            ->setMontant(number_format($montant, 2, '.', ''))
            ->setDescription(trim((string) ($data['description'] ?? '')) ?: null);

        if (!empty($data['date_depense'])) {
            $depense->setDateDepense(new \DateTimeImmutable((string) $data['date_depense']));
        }

        $this->em->persist($depense);
        $this->em->flush();

        return new JsonResponse($this->presenter->depense($depense), 201);
    }

    #[Route('/{id<\d+>}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $depense = $this->depenses->findOneBy(['id' => $id, 'user' => $this->utilisateur()]);

        if (!$depense) {
            throw new BusinessException('Dépense introuvable.', 404);
        }

        $this->em->remove($depense);
        $this->em->flush();

        return new JsonResponse(null, 204);
    }
}
