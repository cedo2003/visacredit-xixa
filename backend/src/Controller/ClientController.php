<?php

namespace App\Controller;

use App\Entity\Client;
use App\Exception\BusinessException;
use App\Repository\ClientRepository;
use App\Service\ApiPresenter;
use App\Service\ChampsProfil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/clients')]
class ClientController extends AbstractApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ClientRepository $clients,
        private readonly ApiPresenter $presenter,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $liste = $this->clients->findForUser($this->utilisateur(), $request->query->get('q'));

        return new JsonResponse(array_map($this->presenter->client(...), $liste));
    }

    #[Route('/{id<\d+>}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        return new JsonResponse($this->presenter->client($this->charger($id)));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = $this->payload($request);
        $client = (new Client())->setUser($this->utilisateur());

        $this->hydrater($client, $data, true);

        $this->em->persist($client);
        $this->em->flush();

        return new JsonResponse($this->presenter->client($client), 201);
    }

    #[Route('/{id<\d+>}', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $client = $this->charger($id);
        $this->hydrater($client, $this->payload($request), false);
        $this->em->flush();

        return new JsonResponse($this->presenter->client($client));
    }

    #[Route('/{id<\d+>}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->em->remove($this->charger($id));
        $this->em->flush();

        return new JsonResponse(null, 204);
    }

    private function charger(int $id): Client
    {
        $client = $this->clients->findOneBy(['id' => $id, 'user' => $this->utilisateur()]);

        if (!$client) {
            throw new BusinessException('Client introuvable.', 404);
        }

        return $client;
    }

    /** @param array<string, mixed> $data */
    private function hydrater(Client $client, array $data, bool $creation): void
    {
        if ($creation || \array_key_exists('nom_complet', $data)) {
            $nom = trim((string) ($data['nom_complet'] ?? ''));
            if ('' === $nom) {
                throw new BusinessException('Le nom du client est obligatoire.');
            }
            $client->setNomComplet($nom);
        }

        if ($creation || \array_key_exists('telephone', $data)) {
            $tel = trim((string) ($data['telephone'] ?? ''));
            if ('' === $tel) {
                throw new BusinessException('Le téléphone du client est obligatoire.');
            }
            $client->setTelephone($tel);
        }

        // Second numéro : facultatif, mais on refuse qu'il double le premier —
        // le saisir deux fois n'apporte rien et fait croire à une ligne de secours.
        if (\array_key_exists('telephone2', $data)) {
            $tel2 = trim((string) $data['telephone2']);

            if ('' !== $tel2 && preg_replace('/\D/', '', $tel2) === preg_replace('/\D/', '', $client->getTelephone())) {
                throw new BusinessException('Le second numéro doit être différent du premier.');
            }

            $client->setTelephone2($tel2 ?: null);
        }

        // Aucun âge minimum ici, à la différence du profil de la boutique :
        // rien n'empêche de vendre à un mineur.
        if (\array_key_exists('date_naissance', $data)) {
            $client->setDateNaissance(ChampsProfil::dateNaissance($data['date_naissance'], ageMinimum: 0));
        }

        if (\array_key_exists('email', $data)) {
            $client->setEmail(trim((string) $data['email']) ?: null);
        }
        if (\array_key_exists('adresse', $data)) {
            $client->setAdresse(trim((string) $data['adresse']) ?: null);
        }
        if (\array_key_exists('notes', $data)) {
            $client->setNotes(trim((string) $data['notes']) ?: null);
        }
    }
}
