<?php

namespace App\Controller;

use App\Exception\BusinessException;
use App\Service\PaiementService;
use App\Service\SignatureWebhookService;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Confirmation des paiements mobile money.
 *
 * Le widget (KkiaPay ou FedaPay) s'ouvre côté Next.js avec la clé PUBLIQUE ;
 * à sa fermeture, le frontend appelle /confirmer avec l'identifiant de
 * transaction. Le serveur revérifie auprès de la passerelle avec la clé privée
 * avant d'imputer quoi que ce soit — le montant n'est jamais tiré du client.
 */
#[Route('/api/paiements')]
class PaiementController extends AbstractApiController
{
    public function __construct(
        private readonly PaiementService $paiements,
        private readonly SignatureWebhookService $signatures,
        private readonly LoggerInterface $logger,
    ) {
    }

    /** Clés publiques nécessaires à l'initialisation des widgets. */
    #[Route('/config', methods: ['GET'])]
    public function config(
        #[Autowire('%env(KKIAPAY_PUBLIC_KEY)%')] string $kkiapayPublic,
        #[Autowire('%env(bool:KKIAPAY_SANDBOX)%')] bool $kkiapaySandbox,
        #[Autowire('%env(FEDAPAY_PUBLIC_KEY)%')] string $fedapayPublic,
        #[Autowire('%env(bool:FEDAPAY_SANDBOX)%')] bool $fedapaySandbox,
    ): JsonResponse {
        return new JsonResponse([
            'kkiapay' => ['cle_publique' => $kkiapayPublic, 'sandbox' => $kkiapaySandbox],
            'fedapay' => ['cle_publique' => $fedapayPublic, 'sandbox' => $fedapaySandbox],
        ]);
    }

    #[Route('/confirmer', methods: ['POST'])]
    public function confirmer(Request $request): JsonResponse
    {
        $data = $this->payload($request);

        $reference = trim((string) ($data['reference'] ?? ''));
        $transactionId = trim((string) ($data['transaction_id'] ?? ''));
        $passerelle = (string) ($data['passerelle'] ?? 'kkiapay');
        if (!\in_array($passerelle, ['kkiapay', 'fedapay'], true)) {
            $passerelle = 'kkiapay';
        }

        if ('' === $reference || '' === $transactionId) {
            throw new BusinessException('Référence et identifiant de transaction requis.');
        }

        return new JsonResponse($this->paiements->confirmer($reference, $transactionId, $passerelle));
    }

    /**
     * Point d'entrée des webhooks des passerelles (route publique).
     *
     * Elle double le retour navigateur : si l'utilisateur ferme son onglet
     * pendant le paiement, l'imputation a quand même lieu. PaiementService
     * étant idempotent, un double appel reste sans effet.
     *
     * La signature est vérifiée avant toute lecture du corps : c'est la seule
     * route de l'API ouverte sans jeton, elle doit prouver d'où elle vient.
     */
    #[Route('/webhook/{passerelle}', methods: ['POST'])]
    public function webhook(string $passerelle, Request $request): JsonResponse
    {
        if (!\in_array($passerelle, ['kkiapay', 'fedapay'], true)) {
            return new JsonResponse(['recu' => false], 400);
        }

        $this->signatures->verifier($passerelle, $request);

        $data = $this->payload($request);

        // Les deux passerelles n'utilisent pas les mêmes noms de champs.
        $reference = $data['reference']
            ?? $data['data']['reference']
            ?? $data['entity']['reference']
            ?? null;

        $transactionId = $data['transactionId']
            ?? $data['transaction_id']
            ?? $data['id']
            ?? $data['entity']['id']
            ?? null;

        if (!$reference || !$transactionId) {
            $this->logger->warning('Webhook paiement incomplet', ['passerelle' => $passerelle, 'payload' => $data]);

            return new JsonResponse(['recu' => false], 202);
        }

        try {
            $this->paiements->confirmer((string) $reference, (string) $transactionId, $passerelle);
        } catch (\Throwable $e) {
            $this->logger->error('Traitement du webhook impossible', [
                'passerelle' => $passerelle,
                'reference' => $reference,
                'erreur' => $e->getMessage(),
            ]);
        }

        // On accuse toujours réception : la passerelle ne doit pas rejouer
        // indéfiniment un webhook qu'on ne saurait pas traiter.
        return new JsonResponse(['recu' => true]);
    }
}
