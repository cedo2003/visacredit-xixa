<?php

namespace App\Service;

use App\Entity\AbonnementPush;
use App\Entity\Notification;
use App\Repository\AbonnementPushRepository;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Expédition des notifications en push, vers les navigateurs et les téléphones.
 *
 * Le push double la notification enregistrée en base, il ne la remplace pas :
 * la liste de /notifications reste la référence, et un push perdu (téléphone
 * éteint, permission refusée, service indisponible) ne fait rien manquer — la
 * notification attend dans l'application. C'est pourquoi aucune erreur d'envoi
 * ne remonte à l'appelant : elle est journalisée, et c'est tout.
 *
 * Deux canaux :
 *  - Web Push (navigateurs), chiffré de bout en bout et signé par notre paire
 *    de clés VAPID (variables VAPID_*, voir `xixa:push:generer-cles`) ;
 *  - le service push d'Expo (application mobile), qui relaie vers FCM / APNs.
 *    Les identifiants Firebase sont chez Expo (EAS), pas ici.
 */
class EnvoiPushService
{
    private const URL_EXPO = 'https://exp.host/--/api/v2/push/send';

    /** Expo n'accepte pas plus de 100 messages par requête. */
    private const LOT_EXPO = 100;

    /** Un push non distribué au bout d'un jour n'a plus d'intérêt : la notification l'aura remplacé. */
    private const DUREE_VIE = 86400;

    public function __construct(
        private readonly AbonnementPushRepository $abonnements,
        private readonly ApiPresenter $presenter,
        private readonly HttpClientInterface $http,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(default::VAPID_PUBLIC_KEY)%')] private readonly ?string $clePubliqueVapid,
        #[Autowire('%env(default::VAPID_PRIVATE_KEY)%')] private readonly ?string $clePriveeVapid,
        #[Autowire('%env(default::VAPID_SUBJECT)%')] private readonly ?string $sujetVapid,
    ) {
    }

    /** Clé à remettre au navigateur pour qu'il s'abonne ; nulle tant que le serveur n'est pas configuré. */
    public function clePubliqueWeb(): ?string
    {
        return $this->webConfigure() ? $this->clePubliqueVapid : null;
    }

    /** @param Notification[] $notifications */
    public function envoyer(array $notifications): void
    {
        $parUser = [];
        foreach ($notifications as $notification) {
            $parUser[$notification->getUser()->getId()][] = $notification;
        }

        $web = [];
        $expo = [];

        foreach ($this->abonnements->findByUserIds(array_keys($parUser)) as $abonnement) {
            foreach ($parUser[$abonnement->getUser()->getId()] as $notification) {
                if (AbonnementPush::CANAL_WEB === $abonnement->getCanal()) {
                    $web[] = [$abonnement, $notification];
                } else {
                    $expo[] = [$abonnement, $notification];
                }
            }
        }

        $morts = [...$this->envoyerWeb($web), ...$this->envoyerExpo($expo)];

        // Un appareil désinstallé ou une permission retirée ne reviendra pas :
        // inutile de lui réécrire à chaque notification.
        $this->abonnements->supprimerParPointsTerminaison(array_values(array_unique($morts)));
    }

    /**
     * Contenu commun aux deux canaux. Le lien est celui qu'affiche la liste des
     * notifications (ApiPresenter) : un chemin de l'application, /commandes/12,
     * que le web comme le mobile savent ouvrir.
     *
     * @return array{titre: string, message: string, lien: ?string, id: ?int, type: string}
     */
    public function contenu(Notification $notification): array
    {
        return [
            'titre' => $notification->getTitre(),
            // Le chiffrement Web Push limite le message à 4 Ko : on tronque
            // largement en deçà, le détail reste dans l'application.
            'message' => mb_strimwidth($notification->getMessage(), 0, 400, '…'),
            'lien' => $this->presenter->notification($notification)['lien'],
            'id' => $notification->getId(),
            'type' => $notification->getType(),
        ];
    }

    /**
     * @param array<array{0: AbonnementPush, 1: Notification}> $envois
     *
     * @return string[] points de terminaison à oublier
     */
    private function envoyerWeb(array $envois): array
    {
        if (!$envois) {
            return [];
        }

        if (!$this->webConfigure()) {
            $this->logger->warning('Push web non envoyé : clés VAPID absentes (xixa:push:generer-cles).');

            return [];
        }

        $morts = [];

        try {
            $webPush = new WebPush(
                ['VAPID' => [
                    'subject' => $this->sujetVapid ?: 'mailto:contact@visacredit.com',
                    'publicKey' => $this->clePubliqueVapid,
                    'privateKey' => $this->clePriveeVapid,
                ]],
                ['TTL' => self::DUREE_VIE, 'urgency' => 'high'],
                timeout: 10,
            );

            foreach ($envois as [$abonnement, $notification]) {
                $webPush->queueNotification(
                    new Subscription(
                        $abonnement->getPointTerminaison(),
                        $abonnement->getCleP256dh(),
                        $abonnement->getCleAuth(),
                        'aes128gcm',
                    ),
                    json_encode($this->contenu($notification), \JSON_UNESCAPED_UNICODE | \JSON_UNESCAPED_SLASHES),
                );
            }

            foreach ($webPush->flush() as $rapport) {
                if ($rapport->isSuccess()) {
                    continue;
                }

                if ($rapport->isSubscriptionExpired()) {
                    $morts[] = $rapport->getEndpoint();
                    continue;
                }

                $this->logger->warning('Push web refusé', [
                    'service' => parse_url($rapport->getEndpoint(), \PHP_URL_HOST),
                    'raison' => $rapport->getReason(),
                ]);
            }
        } catch (\Throwable $e) {
            $this->logger->error('Échec de l\'envoi des push web', ['exception' => $e]);
        }

        return $morts;
    }

    /**
     * @param array<array{0: AbonnementPush, 1: Notification}> $envois
     *
     * @return string[] jetons à oublier
     */
    private function envoyerExpo(array $envois): array
    {
        $morts = [];

        foreach (array_chunk($envois, self::LOT_EXPO) as $lot) {
            $messages = array_map(function (array $envoi): array {
                [$abonnement, $notification] = $envoi;
                $contenu = $this->contenu($notification);

                return [
                    'to' => $abonnement->getPointTerminaison(),
                    'title' => $contenu['titre'],
                    'body' => $contenu['message'],
                    'data' => ['lien' => $contenu['lien'], 'id' => $contenu['id'], 'type' => $contenu['type']],
                    'sound' => 'default',
                    'priority' => 'high',
                    'ttl' => self::DUREE_VIE,
                    // Canal Android créé par l'application (src/lib/push.ts).
                    'channelId' => 'notifications',
                ];
            }, $lot);

            try {
                $reponse = $this->http->request('POST', self::URL_EXPO, [
                    'json' => $messages,
                    'headers' => ['Accept' => 'application/json'],
                    'timeout' => 10,
                ])->toArray(false);
            } catch (\Throwable $e) {
                $this->logger->error('Échec de l\'envoi des push Expo', ['exception' => $e]);
                continue;
            }

            // Un ticket par message, dans l'ordre de l'envoi.
            foreach ($reponse['data'] ?? [] as $i => $ticket) {
                if ('error' !== ($ticket['status'] ?? null)) {
                    continue;
                }

                if ('DeviceNotRegistered' === ($ticket['details']['error'] ?? null)) {
                    $morts[] = $messages[$i]['to'];
                    continue;
                }

                $this->logger->warning('Push Expo refusé', [
                    'raison' => $ticket['message'] ?? 'inconnue',
                    'erreur' => $ticket['details']['error'] ?? null,
                ]);
            }
        }

        return $morts;
    }

    private function webConfigure(): bool
    {
        return '' !== trim((string) $this->clePubliqueVapid) && '' !== trim((string) $this->clePriveeVapid);
    }
}
