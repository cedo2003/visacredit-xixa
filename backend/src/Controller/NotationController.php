<?php

namespace App\Controller;

use App\Entity\Commande;
use App\Entity\NotationClient;
use App\Entity\NotationFournisseur;
use App\Entity\User;
use App\Exception\BusinessException;
use App\Repository\CommandeRepository;
use App\Repository\NotationClientRepository;
use App\Repository\NotationFournisseurRepository;
use App\Service\ApiPresenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Notations croisées après une commande reçue.
 * Porte pages/notations/{noter_fournisseur,noter_client,mes_notations}.php.
 */
#[Route('/api/notations')]
class NotationController extends AbstractApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly CommandeRepository $commandes,
        private readonly NotationFournisseurRepository $notationsFournisseurs,
        private readonly NotationClientRepository $notationsClients,
        private readonly ApiPresenter $presenter,
    ) {
    }

    /** Notations émises et reçues par l'utilisateur courant. */
    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->utilisateur();

        if ($user->isGrossiste()) {
            return new JsonResponse([
                'role' => 'grossiste',
                'emises' => array_map($this->presenter->notationClient(...), $this->notationsClients->findEmisesPar($user)),
                'recues' => array_map($this->presenter->notationFournisseur(...), $this->notationsFournisseurs->findRecuesPar($user)),
                'moyenne_recue' => $this->notationsFournisseurs->moyennePour($user),
            ]);
        }

        return new JsonResponse([
            'role' => 'detaillant',
            'emises' => array_map($this->presenter->notationFournisseur(...), $this->notationsFournisseurs->findEmisesPar($user)),
            'recues' => array_map($this->presenter->notationClient(...), $this->notationsClients->findRecuesPar($user)),
            'moyenne_recue' => $this->notationsClients->moyennePour($user),
        ]);
    }

    /** Un détaillant note son fournisseur (commande déjà réceptionnée). */
    #[Route('/fournisseur/{commandeId<\d+>}', methods: ['POST'])]
    public function noterFournisseur(int $commandeId, Request $request): JsonResponse
    {
        $user = $this->exigerDetaillant();
        $commande = $this->chargerCommandeNotable($commandeId, $user->getId(), true);

        $data = $this->payload($request);
        $note = (int) ($data['note'] ?? 0);
        $this->validerNote($note);

        $notation = $this->notationsFournisseurs->findPourCommande($commande, $user);

        if ($notation) {
            $notation->setNote($note)
                ->setCommentaire(trim((string) ($data['commentaire'] ?? '')) ?: null)
                ->setCreatedAt(new \DateTimeImmutable());
        } else {
            $notation = (new NotationFournisseur())
                ->setDetaillant($user)
                ->setGrossiste($commande->getGrossiste())
                ->setCommande($commande)
                ->setNote($note)
                ->setCommentaire(trim((string) ($data['commentaire'] ?? '')) ?: null);

            $this->em->persist($notation);
        }

        $this->em->flush();

        return new JsonResponse($this->presenter->notationFournisseur($notation));
    }

    /** Un grossiste note son client détaillant. */
    #[Route('/client/{commandeId<\d+>}', methods: ['POST'])]
    public function noterClient(int $commandeId, Request $request): JsonResponse
    {
        $user = $this->exigerGrossiste();
        $commande = $this->chargerCommandeNotable($commandeId, $user->getId(), false);

        $data = $this->payload($request);
        $note = (int) ($data['note'] ?? 0);
        $this->validerNote($note);

        $notation = $this->notationsClients->findPourCommande($commande, $user);

        if ($notation) {
            $notation->setNote($note)
                ->setCommentaire(trim((string) ($data['commentaire'] ?? '')) ?: null)
                ->setUpdatedAt(new \DateTimeImmutable());
        } else {
            $notation = (new NotationClient())
                ->setGrossiste($user)
                ->setDetaillant($commande->getDetaillant())
                ->setCommande($commande)
                ->setNote($note)
                ->setCommentaire(trim((string) ($data['commentaire'] ?? '')) ?: null);

            $this->em->persist($notation);
        }

        $this->em->flush();

        return new JsonResponse($this->presenter->notationClient($notation));
    }

    /**
     * Fiche publique de notation d'un partenaire.
     * Port de pages/notations/afficher_notation.php : `type` indique si l'on
     * consulte les avis reçus en tant que fournisseur ou en tant que client.
     */
    #[Route('/profil/{type}/{id<\d+>}', methods: ['GET'])]
    public function profil(string $type, int $id): JsonResponse
    {
        if (!\in_array($type, ['fournisseur', 'client'], true)) {
            throw new BusinessException('Type de profil inconnu.', 404);
        }

        $cible = $this->em->getRepository(User::class)->find($id);
        if (!$cible) {
            throw new BusinessException('Utilisateur introuvable.', 404);
        }

        if ('fournisseur' === $type) {
            $avis = $this->notationsFournisseurs->findRecuesPar($cible);
            $moyenne = $this->notationsFournisseurs->moyennePour($cible);
            $liste = array_map($this->presenter->notationFournisseur(...), $avis);
        } else {
            $avis = $this->notationsClients->findRecuesPar($cible);
            $moyenne = $this->notationsClients->moyennePour($cible);
            $liste = array_map($this->presenter->notationClient(...), $avis);
        }

        return new JsonResponse([
            'type' => $type,
            'profil' => $this->presenter->userResume($cible),
            'moyenne' => $moyenne['moyenne'],
            'total' => $moyenne['total'],
            'avis' => \array_slice($liste, 0, 20),
        ]);
    }

    /** Raccourci : moyenne d'un grossiste, pour l'écran de recherche de produits. */
    #[Route('/grossiste/{id<\d+>}', methods: ['GET'])]
    public function moyenneGrossiste(int $id): JsonResponse
    {
        $grossiste = $this->em->getRepository(User::class)->find($id);

        if (!$grossiste || !$grossiste->isGrossiste()) {
            throw new BusinessException('Grossiste introuvable.', 404);
        }

        return new JsonResponse($this->notationsFournisseurs->moyennePour($grossiste));
    }

    private function chargerCommandeNotable(int $commandeId, int $userId, bool $cotDetaillant): Commande
    {
        $commande = $this->commandes->find($commandeId);

        if (!$commande) {
            throw new BusinessException('Commande introuvable.', 404);
        }

        $proprietaire = $cotDetaillant
            ? $commande->getDetaillant()?->getId()
            : $commande->getGrossiste()?->getId();

        if ($proprietaire !== $userId) {
            throw new BusinessException('Cette commande ne vous concerne pas.', 403);
        }

        // Comme dans l'application PHP, la notation n'ouvre qu'après réception.
        if (!$commande->isRecuParDetaillant()) {
            throw new BusinessException("La commande doit d'abord être réceptionnée.");
        }

        return $commande;
    }

    private function validerNote(int $note): void
    {
        if ($note < 1 || $note > 5) {
            throw new BusinessException('La note doit être comprise entre 1 et 5.');
        }
    }
}
