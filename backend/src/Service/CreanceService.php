<?php

namespace App\Service;

use App\Entity\Creance;
use App\Entity\CreancePaiement;
use App\Entity\FedapayPending;
use App\Entity\User;
use App\Exception\BusinessException;
use App\Repository\CreanceRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Encaissement des créances clients.
 * Porte pages/creances/save_paiement_creance.php et les callbacks
 * confirm_kkiapay_creance.php / confirm_fedapay_creance.php.
 */
class CreanceService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly CreanceRepository $creances,
        private readonly FraisPaiementService $frais,
    ) {
    }

    /**
     * Paiement en espèces : imputé immédiatement.
     * Paiement mobile money / FedaPay : renvoie une intention à confirmer
     * après retour de la passerelle.
     *
     * @param array{montant: float, mode_paiement?: string, telephone?: string,
     *              fedapay_identifiant?: string, repartition_frais?: string} $data
     *
     * @return array{creance: Creance, paiement: array<string, mixed>|null}
     */
    public function payer(User $user, int $creanceId, array $data): array
    {
        $creance = $this->creances->findOneBy(['id' => $creanceId, 'user' => $user]);
        if (!$creance) {
            throw new BusinessException('Créance introuvable.', 404);
        }

        $montant = (float) ($data['montant'] ?? 0);
        $mode = $data['mode_paiement'] ?? 'espece';
        $repartition = FraisPaiementService::normaliser(
            $data['repartition_frais'] ?? 'client',
            $data['part_vendeur_frais'] ?? null
        );

        if ($montant <= 0) {
            throw new BusinessException('Le montant doit être supérieur à 0.');
        }
        if ($montant > (float) $creance->getMontantRestant() + 0.01) {
            throw new BusinessException(sprintf(
                'Le montant ne peut pas dépasser le reste à payer (%s FCFA).',
                number_format((float) $creance->getMontantRestant(), 0, ',', ' ')
            ));
        }

        // ── Passerelles : on prépare l'intention, on n'impute rien encore ──
        if (\in_array($mode, ['mobile_money', 'fedapay'], true)) {
            $telephone = preg_replace('/[^0-9]/', '', (string) ($data['telephone'] ?? ''));
            $identifiant = trim((string) ($data['fedapay_identifiant'] ?? ''));

            if ('mobile_money' === $mode && strlen($telephone) < 8) {
                throw new BusinessException('Numéro Mobile Money invalide.');
            }
            if ('fedapay' === $mode && '' === $identifiant) {
                throw new BusinessException('Veuillez saisir un numéro de téléphone ou un email.');
            }

            $calc = 'mobile_money' === $mode
                ? $this->frais->calculerKkiapay($montant, $repartition)
                : $this->frais->calculerFedapay($montant, $repartition);

            $reference = sprintf('CREANCE-%d-%s', $creance->getId(), bin2hex(random_bytes(6)));

            $pending = (new FedapayPending())
                ->setTransactionId($reference)
                ->setModule('creance')
                ->setReferenceId((int) $creance->getId())
                ->setUser($user)
                ->setMontant(number_format($montant, 2, '.', ''))
                ->setMontantWidget(number_format($calc['montant_envoye'], 2, '.', ''))
                ->setRepartitionFrais($repartition)
                ->setSource('mobile_money' === $mode ? 'kkiapay' : 'oncomplete')
                ->setMetaArray([
                    'telephone' => $telephone,
                    'identifiant' => $identifiant,
                    'numero_facture' => $creance->getVente()?->getNumeroFacture(),
                ]);

            $this->em->persist($pending);
            $this->em->flush();

            return [
                'creance' => $creance,
                'paiement' => [
                    'reference' => $reference,
                    'passerelle' => 'mobile_money' === $mode ? 'kkiapay' : 'fedapay',
                    'montant_widget' => $calc['montant_envoye'],
                    'telephone' => $telephone,
                    'identifiant' => $identifiant,
                    'description' => 'Créance '.($creance->getVente()?->getNumeroFacture() ?? ''),
                ],
            ];
        }

        // ── Espèces : imputation directe ──────────────────────────────────
        $this->em->wrapInTransaction(function () use ($creance, $montant): void {
            $this->imputer($creance, $montant, 'espece', null, null);
        });

        return ['creance' => $creance, 'paiement' => null];
    }

    /**
     * Impute un règlement sur une créance et répercute sur la vente.
     * Appelé aussi bien pour les espèces que depuis la confirmation d'un
     * paiement mobile money.
     */
    public function imputer(Creance $creance, float $montant, string $mode, ?string $repartition, ?string $transactionId): void
    {
        $paiement = (new CreancePaiement())
            ->setCreance($creance)
            ->setMontant(number_format($montant, 2, '.', ''))
            ->setModePaiement($mode)
            ->setRepartitionFrais($repartition)
            ->setTransactionId($transactionId);

        $this->em->persist($paiement);

        $restant = round((float) $creance->getMontantRestant() - $montant, 2);

        if ($restant <= 0) {
            $creance->setMontantRestant('0.00')->setStatut('payee');
        } else {
            $creance->setMontantRestant(number_format($restant, 2, '.', ''));
        }

        $vente = $creance->getVente();
        if ($vente) {
            $vente->setMontantPaye(number_format((float) $vente->getMontantPaye() + $montant, 2, '.', ''));

            $this->em->flush();

            // La vente n'est soldée que lorsque plus aucune échéance ne reste ouverte.
            if (0 === $this->creances->countNonSoldeesPourVente($vente)) {
                $vente->setStatut('solde');
            }
        }

        $this->em->flush();
    }
}
