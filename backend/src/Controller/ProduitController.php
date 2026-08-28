<?php

namespace App\Controller;

use App\Entity\Categorie;
use App\Entity\Produit;
use App\Exception\BusinessException;
use App\Repository\ProduitRepository;
use App\Service\ApiPresenter;
use App\Service\ProduitService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/produits')]
class ProduitController extends AbstractApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProduitRepository $produits,
        private readonly ProduitService $service,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $liste = $this->produits->findForUser($this->utilisateur(), $request->query->get('q'));

        return new JsonResponse(array_map(fn ($p) => $this->presenter->produit($p), $liste));
    }

    /**
     * Recherche inter-boutiques chez les grossistes.
     * Remplace pages/commandes/rechercher_produits.php.
     */
    #[Route('/recherche-grossistes', methods: ['GET'])]
    public function rechercheGrossistes(Request $request): JsonResponse
    {
        $this->exigerDetaillant();
        $terme = trim((string) $request->query->get('q', ''));

        if (strlen($terme) < 2) {
            return new JsonResponse([]);
        }

        $resultats = $this->produits->rechercherChezGrossistes($terme);

        return new JsonResponse(array_map(fn ($p) => $this->presenter->produit($p, true), $resultats));
    }

    /**
     * Catalogue commun des catégories de produits.
     *
     * La liste est définie par la plateforme (`user_id IS NULL`) : elle est la
     * même pour toutes les boutiques, ce qui rend la recherche inter-boutiques
     * comparable — deux grossistes ne peuvent plus ranger le même article sous
     * deux libellés inventés. Les catégories propres à une boutique, héritées
     * d'avant, restent listées tant qu'elles existent.
     */
    #[Route('/categories', methods: ['GET'])]
    public function categories(): JsonResponse
    {
        $repo = $this->em->getRepository(Categorie::class);

        $liste = array_merge(
            $repo->findBy(['user' => null], ['nom' => 'ASC']),
            $repo->findBy(['user' => $this->utilisateur()], ['nom' => 'ASC']),
        );

        return new JsonResponse(array_map(fn (Categorie $c) => [
            'id' => $c->getId(),
            'nom' => $c->getNom(),
            'globale' => $c->estGlobale(),
        ], $liste));
    }

    #[Route('/{id<\d+>}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        return new JsonResponse($this->presenter->produit($this->charger($id)));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $produit = $this->service->creer($this->utilisateur(), $this->payload($request));

        return new JsonResponse($this->presenter->produit($produit), 201);
    }

    #[Route('/{id<\d+>}', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $produit = $this->charger($id);
        $data = $this->payload($request);

        if (\array_key_exists('nom', $data)) {
            $nom = trim((string) $data['nom']);
            if ('' === $nom) {
                throw new BusinessException('Le nom du produit est obligatoire.');
            }
            $produit->setNom($nom);
        }
        if (\array_key_exists('prix_achat', $data)) {
            $produit->setPrixAchat(number_format((float) $data['prix_achat'], 2, '.', ''));
        }
        if (\array_key_exists('prix_vente', $data)) {
            $produit->setPrixVente(number_format((float) $data['prix_vente'], 2, '.', ''));
        }
        if (\array_key_exists('stock', $data)) {
            $produit->setStock(max(0, (int) $data['stock']));
        }
        if (\array_key_exists('seuil_alerte', $data)) {
            $produit->setSeuilAlerte((int) $data['seuil_alerte']);
        }
        if (\array_key_exists('description', $data)) {
            $produit->setDescription(trim((string) $data['description']) ?: null);
        }
        if (\array_key_exists('categorie_id', $data)) {
            $produit->setCategorie($this->service->categorie($this->utilisateur(), $data['categorie_id']));
        }

        $this->em->flush();

        return new JsonResponse($this->presenter->produit($produit));
    }

    #[Route('/{id<\d+>}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->em->remove($this->charger($id));
        $this->em->flush();

        return new JsonResponse(null, 204);
    }

    private function charger(int $id): Produit
    {
        $produit = $this->produits->findOneBy(['id' => $id, 'user' => $this->utilisateur()]);

        if (!$produit) {
            throw new BusinessException('Produit introuvable.', 404);
        }

        return $produit;
    }
}
