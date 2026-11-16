<?php

namespace App\Controller;

use App\Entity\AbonnementPush;
use App\Exception\BusinessException;
use App\Repository\AbonnementPushRepository;
use App\Service\EnvoiPushService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Abonnement des appareils aux notifications push.
 *
 * Le navigateur (Web Push) ou l'application mobile (jeton Expo) s'inscrit ici
 * une fois la permission accordée ; EnvoiPushService s'en sert ensuite pour
 * chaque notification de la boutique.
 */
#[Route('/api/push')]
class PushController extends AbstractApiController
{
    public function __construct(
        private readonly AbonnementPushRepository $abonnements,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /** Clé publique VAPID dont le navigateur a besoin pour s'abonner. */
    #[Route('/config', methods: ['GET'])]
    public function config(EnvoiPushService $push): JsonResponse
    {
        return new JsonResponse(['cle_publique_web' => $push->clePubliqueWeb()]);
    }

    /**
     * Web : `{canal: "web", endpoint, keys: {p256dh, auth}}` — l'objet que rend
     * `PushSubscription.toJSON()`.
     * Mobile : `{canal: "expo", token: "ExponentPushToken[…]"}`.
     *
     * Rejouable : réenvoyer le même abonnement ne crée pas de doublon.
     */
    #[Route('/abonnements', methods: ['POST'])]
    public function abonner(Request $request): JsonResponse
    {
        $user = $this->utilisateur();
        $data = $this->payload($request);
        $canal = (string) ($data['canal'] ?? '');

        [$point, $p256dh, $auth] = match ($canal) {
            AbonnementPush::CANAL_WEB => $this->lireWeb($data),
            AbonnementPush::CANAL_EXPO => [$this->lireExpo($data), null, null],
            default => throw new BusinessException('Canal de notification inconnu.', 400),
        };

        $abonnement = $this->abonnements->findByPointTerminaison($point);

        if ($abonnement) {
            // Même appareil, peut-être une autre boutique : il suit la dernière connectée.
            $abonnement->setUser($user);
        } else {
            $abonnement = new AbonnementPush($user, $canal, $point);
            $this->em->persist($abonnement);
        }

        // Un navigateur peut renouveler ses clés en gardant le même point de terminaison.
        $abonnement->definirCles($p256dh, $auth);
        $this->em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /** À la déconnexion, ou quand l'utilisateur coupe les notifications de cet appareil. */
    #[Route('/desabonnement', methods: ['POST'])]
    public function desabonner(Request $request): JsonResponse
    {
        $data = $this->payload($request);
        $point = trim((string) ($data['endpoint'] ?? $data['token'] ?? ''));

        if ('' !== $point) {
            $this->abonnements->supprimerPourUser($this->utilisateur(), $point);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return array{0: string, 1: string, 2: string}
     */
    private function lireWeb(array $data): array
    {
        $endpoint = trim((string) ($data['endpoint'] ?? ''));
        $p256dh = trim((string) ($data['keys']['p256dh'] ?? ''));
        $auth = trim((string) ($data['keys']['auth'] ?? ''));

        // Un service push s'adresse toujours en HTTPS : refuser le reste évite
        // de faire envoyer au serveur des requêtes vers une adresse arbitraire.
        if (!str_starts_with($endpoint, 'https://') || \strlen($endpoint) > 2000) {
            throw new BusinessException('Abonnement push invalide.', 400);
        }
        if ('' === $p256dh || '' === $auth || \strlen($p256dh) > 255 || \strlen($auth) > 255) {
            throw new BusinessException('Abonnement push invalide.', 400);
        }

        return [$endpoint, $p256dh, $auth];
    }

    /** @param array<string, mixed> $data */
    private function lireExpo(array $data): string
    {
        $token = trim((string) ($data['token'] ?? ''));

        if (!preg_match('/^Expo(nent)?PushToken\[[^\]]{1,200}\]$/', $token)) {
            throw new BusinessException('Jeton de notification invalide.', 400);
        }

        return $token;
    }
}
