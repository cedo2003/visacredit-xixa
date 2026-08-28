<?php

namespace App\Service;

use App\Exception\BusinessException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;

/**
 * Authentification des webhooks des passerelles de paiement.
 *
 * `/api/paiements/webhook/{passerelle}` est la seule route de l'API ouverte sans
 * jeton — il le faut bien, c'est la passerelle qui l'appelle. Jusqu'ici elle
 * acceptait donc n'importe quel appel : l'imputation restait sûre, parce que
 * PaiementService revérifie chaque transaction auprès de la passerelle avant
 * d'écrire quoi que ce soit, mais rien n'empêchait un tiers de faire tourner le
 * serveur dans le vide.
 *
 * La signature ferme cette porte. Elle est vérifiée sur le **corps brut** de la
 * requête : re-sérialiser le JSON décodé changerait un espace ou l'ordre des
 * clés, et le condensat ne tomberait plus juste.
 *
 * Le secret manquant fait **échouer** la vérification plutôt que de la
 * contourner. Un webhook non authentifié qu'on accepte « en attendant » est une
 * porte qu'on oublie de refermer ; et rien n'est perdu entre-temps, le retour
 * navigateur restant le chemin principal — le webhook n'est que le filet.
 */
class SignatureWebhookService
{
    /**
     * Écart maximal entre l'horodatage signé et l'heure du serveur.
     *
     * Sans cette borne, une requête signée interceptée resterait rejouable
     * indéfiniment. Cinq minutes laissent de la marge à une horloge mal réglée
     * sans ouvrir une fenêtre exploitable.
     */
    private const TOLERANCE_SECONDES = 300;

    public function __construct(
        private readonly LoggerInterface $logger,
        #[Autowire('%env(FEDAPAY_WEBHOOK_SECRET)%')] private readonly string $fedapaySecret,
        #[Autowire('%env(KKIAPAY_WEBHOOK_SECRET)%')] private readonly string $kkiapaySecret,
    ) {
    }

    /**
     * @throws BusinessException 401 si la requête n'est pas authentifiée
     */
    public function verifier(string $passerelle, Request $request): void
    {
        match ($passerelle) {
            'fedapay' => $this->verifierFedapay($request),
            'kkiapay' => $this->verifierKkiapay($request),
            default => throw new BusinessException('Passerelle inconnue.', 400),
        };
    }

    /**
     * FedaPay signe ses webhooks à la manière de Stripe : un en-tête
     * `X-FEDAPAY-SIGNATURE` de la forme `t=<horodatage>,s=<condensat>`, où le
     * condensat est un HMAC-SHA256 de « horodatage.corps » avec le secret du
     * point de terminaison (visible dans le tableau de bord FedaPay, à la
     * création du webhook).
     *
     * Certaines configurations n'envoient que le condensat, calculé sur le seul
     * corps de la requête : les deux formes sont acceptées, la première étant
     * la seule à protéger du rejeu.
     */
    private function verifierFedapay(Request $request): void
    {
        $entete = (string) ($request->headers->get('X-FEDAPAY-SIGNATURE')
            ?? $request->headers->get('X-Fedapay-Signature')
            ?? '');

        $this->exigerSecret('fedapay', $this->fedapaySecret);

        if ('' === $entete) {
            $this->refuser('fedapay', 'en-tête de signature absent');
        }

        $corps = $request->getContent();
        [$horodatage, $signature] = $this->decouperEntete($entete);

        if (null === $horodatage) {
            // Forme simple : le condensat porte sur le corps seul.
            $this->comparer('fedapay', hash_hmac('sha256', $corps, $this->fedapaySecret), $signature);

            return;
        }

        if (abs(time() - $horodatage) > self::TOLERANCE_SECONDES) {
            $this->refuser('fedapay', 'horodatage hors tolérance (rejeu probable)');
        }

        $this->comparer(
            'fedapay',
            hash_hmac('sha256', $horodatage.'.'.$corps, $this->fedapaySecret),
            $signature
        );
    }

    /**
     * KkiaPay ne signe pas le corps : il renvoie le secret convenu dans un
     * en-tête. La comparaison reste à temps constant, et le secret n'est jamais
     * journalisé.
     *
     * À confirmer avec le tableau de bord KkiaPay au moment de déclarer le
     * webhook : l'en-tête y est configurable, `X-KKIAPAY-SECRET` est la valeur
     * par défaut retenue ici.
     */
    private function verifierKkiapay(Request $request): void
    {
        $this->exigerSecret('kkiapay', $this->kkiapaySecret);

        $recu = (string) ($request->headers->get('X-KKIAPAY-SECRET')
            ?? $request->headers->get('X-Kkiapay-Secret')
            ?? '');

        if ('' === $recu) {
            $this->refuser('kkiapay', 'en-tête de secret absent');
        }

        if (!hash_equals($this->kkiapaySecret, $recu)) {
            $this->refuser('kkiapay', 'secret invalide');
        }
    }

    /**
     * Découpe `t=1699999999,s=abc123` en horodatage et condensat.
     *
     * @return array{0: int|null, 1: string} horodatage nul quand l'en-tête ne
     *                                       porte que le condensat
     */
    private function decouperEntete(string $entete): array
    {
        if (!str_contains($entete, '=')) {
            return [null, trim($entete)];
        }

        $horodatage = null;
        $signature = '';

        foreach (explode(',', $entete) as $morceau) {
            $paire = explode('=', trim($morceau), 2);

            if (2 !== \count($paire)) {
                continue;
            }

            match ($paire[0]) {
                't' => $horodatage = (int) $paire[1],
                's', 'v1' => $signature = $paire[1],
                default => null,
            };
        }

        return [$horodatage, $signature];
    }

    private function exigerSecret(string $passerelle, string $secret): void
    {
        if ('' === trim($secret)) {
            $this->logger->error('Webhook refusé : secret non configuré', [
                'passerelle' => $passerelle,
                'variable' => strtoupper($passerelle).'_WEBHOOK_SECRET',
            ]);

            throw new BusinessException(
                'Webhooks non configurés sur ce serveur.',
                503
            );
        }
    }

    private function comparer(string $passerelle, string $attendu, string $recu): void
    {
        if ('' === $recu || !hash_equals($attendu, $recu)) {
            $this->refuser($passerelle, 'signature invalide');
        }
    }

    /**
     * @throws BusinessException
     */
    private function refuser(string $passerelle, string $raison): never
    {
        // Le motif est journalisé mais pas renvoyé : détailler ce qui cloche
        // aiderait surtout celui qui cherche à forger une requête.
        $this->logger->warning('Webhook rejeté', [
            'passerelle' => $passerelle,
            'raison' => $raison,
        ]);

        throw new BusinessException('Signature du webhook invalide.', 401);
    }
}
