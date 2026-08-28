<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Vérification serveur des transactions mobile money.
 *
 * Porte verifierPaiementKkiaPay() de config.php et ajoute l'équivalent FedaPay.
 * La clé privée reste côté serveur : elle n'est jamais transmise au frontend
 * Next.js, seule la clé publique l'est (voir /api/paiements/config).
 */
class PasserellePaiementService
{
    public function __construct(
        private readonly HttpClientInterface $http,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(KKIAPAY_PRIVATE_KEY)%')] private readonly string $kkiapayPrivateKey,
        #[Autowire('%env(KKIAPAY_API_URL)%')] private readonly string $kkiapayApiUrl,
        #[Autowire('%env(bool:KKIAPAY_SANDBOX)%')] private readonly bool $kkiapaySandbox,
        #[Autowire('%env(FEDAPAY_SECRET_KEY)%')] private readonly string $fedapaySecretKey,
        #[Autowire('%env(bool:FEDAPAY_SANDBOX)%')] private readonly bool $fedapaySandbox,
    ) {
    }

    /** @return array{success: bool, montant: float, message: string} */
    public function verifier(string $passerelle, string $transactionId): array
    {
        return 'kkiapay' === $passerelle
            ? $this->verifierKkiapay($transactionId)
            : $this->verifierFedapay($transactionId);
    }

    /** @return array{success: bool, montant: float, message: string} */
    public function verifierKkiapay(string $transactionId): array
    {
        try {
            $response = $this->http->request('GET', rtrim($this->kkiapayApiUrl, '/').'/transaction/status/'.$transactionId, [
                'headers' => ['X-API-KEY' => $this->kkiapayPrivateKey],
                'timeout' => 15,
                'verify_peer' => !$this->kkiapaySandbox,
            ]);

            $data = $response->toArray(false);
            $statut = strtoupper($data['status'] ?? $data['data']['status'] ?? '');

            if (200 === $response->getStatusCode() && \in_array($statut, ['SUCCESS', 'SUCCEEDED', 'COMPLETED'], true)) {
                return [
                    'success' => true,
                    'montant' => (float) ($data['amount'] ?? $data['data']['amount'] ?? 0),
                    'message' => 'Confirmé',
                ];
            }

            return [
                'success' => false,
                'montant' => 0.0,
                'message' => match ($statut) {
                    'PENDING' => 'En attente de confirmation',
                    'FAILED', 'CANCELLED' => 'Paiement échoué ou annulé',
                    default => $data['message'] ?? 'Statut inconnu',
                },
            ];
        } catch (\Throwable $e) {
            $this->logger->error('Vérification KkiaPay impossible', [
                'transaction' => $transactionId,
                'erreur' => $e->getMessage(),
            ]);

            return ['success' => false, 'montant' => 0.0, 'message' => 'Erreur réseau lors de la vérification.'];
        }
    }

    /** @return array{success: bool, montant: float, message: string} */
    public function verifierFedapay(string $transactionId): array
    {
        $base = $this->fedapaySandbox
            ? 'https://sandbox-api.fedapay.com/v1'
            : 'https://api.fedapay.com/v1';

        try {
            $response = $this->http->request('GET', $base.'/transactions/'.$transactionId, [
                'headers' => [
                    'Authorization' => 'Bearer '.$this->fedapaySecretKey,
                    'Accept' => 'application/json',
                ],
                'timeout' => 15,
            ]);

            $data = $response->toArray(false);
            $transaction = $data['v1/transaction'] ?? $data['transaction'] ?? $data;
            $statut = strtolower($transaction['status'] ?? '');

            if (200 === $response->getStatusCode() && \in_array($statut, ['approved', 'transferred'], true)) {
                return [
                    'success' => true,
                    'montant' => (float) ($transaction['amount'] ?? 0),
                    'message' => 'Confirmé',
                ];
            }

            return [
                'success' => false,
                'montant' => 0.0,
                'message' => match ($statut) {
                    'pending' => 'En attente de confirmation',
                    'canceled', 'declined', 'failed' => 'Paiement échoué ou annulé',
                    default => 'Statut inconnu',
                },
            ];
        } catch (\Throwable $e) {
            $this->logger->error('Vérification FedaPay impossible', [
                'transaction' => $transactionId,
                'erreur' => $e->getMessage(),
            ]);

            return ['success' => false, 'montant' => 0.0, 'message' => 'Erreur réseau lors de la vérification.'];
        }
    }
}
