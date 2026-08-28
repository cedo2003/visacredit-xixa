<?php

namespace App\Service;

use App\Entity\Approvisionnement;
use App\Entity\Commande;
use App\Entity\CommandePaiement;
use App\Entity\CommandeVersement;
use App\Entity\Creance;
use App\Entity\Depense;
use App\Entity\FedapayPending;
use App\Entity\Vente;
use App\Exception\BusinessException;
use App\Repository\FedapayPendingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Confirmation d'un paiement mobile money et imputation métier.
 *
 * Remplace les callbacks kkiapay_callback.php / fedapay_callback.php /
 * confirm_*_creance.php, qui dépendaient tous de $_SESSION. Ici l'intention est
 * relue en base (table fedapay_pending), ce qui rend l'opération idempotente :
 * un double appel (retour navigateur + webhook) n'impute le montant qu'une fois.
 */
class PaiementService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FedapayPendingRepository $pendings,
        private readonly PasserellePaiementService $passerelle,
        private readonly CreanceService $creances,
        private readonly CommandeService $commandes,
        private readonly NumerotationService $numerotation,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * @return array{statut: string, message: string, module: string, reference_id: int}
     */
    public function confirmer(string $reference, string $transactionId, string $passerelle = 'kkiapay'): array
    {
        $pending = $this->pendings->findOneBy(['transactionId' => $reference]);

        if (!$pending) {
            throw new BusinessException('Référence de paiement inconnue.', 404);
        }

        // Idempotence : déjà imputé, on renvoie simplement l'état final.
        if ($pending->isTraite()) {
            return [
                'statut' => 'deja_traite',
                'message' => 'Ce paiement a déjà été enregistré.',
                'module' => $pending->getModule(),
                'reference_id' => $pending->getReferenceId(),
            ];
        }

        $verification = $this->passerelle->verifier($passerelle, $transactionId);

        if (!$verification['success']) {
            $this->logger->warning('Paiement non confirmé par la passerelle', [
                'reference' => $reference,
                'transaction' => $transactionId,
                'message' => $verification['message'],
            ]);

            return [
                'statut' => 'echec',
                'message' => $verification['message'],
                'module' => $pending->getModule(),
                'reference_id' => $pending->getReferenceId(),
            ];
        }

        $this->em->wrapInTransaction(function () use ($pending, $transactionId): void {
            match ($pending->getModule()) {
                'vente' => $this->imputerVente($pending, $transactionId),
                'creance' => $this->imputerCreance($pending, $transactionId),
                'commande' => $this->imputerCommande($pending, $transactionId),
                'credit' => $this->imputerCreditFournisseur($pending, $transactionId),
                default => throw new BusinessException('Module de paiement inconnu : '.$pending->getModule()),
            };

            $pending->setTraite(true);
            $this->em->flush();
        });

        return [
            'statut' => 'confirme',
            'message' => 'Paiement confirmé.',
            'module' => $pending->getModule(),
            'reference_id' => $pending->getReferenceId(),
        ];
    }

    private function imputerVente(FedapayPending $pending, string $transactionId): void
    {
        $vente = $this->em->getRepository(Vente::class)->find($pending->getReferenceId());
        if (!$vente) {
            throw new BusinessException('Vente introuvable pour ce paiement.', 404);
        }

        $vente->setStatutPaiement('paye')->setTransactionId($transactionId);
    }

    private function imputerCreance(FedapayPending $pending, string $transactionId): void
    {
        $creance = $this->em->getRepository(Creance::class)->find($pending->getReferenceId());
        if (!$creance) {
            throw new BusinessException('Créance introuvable pour ce paiement.', 404);
        }

        $this->creances->imputer(
            $creance,
            (float) $pending->getMontant(),
            'kkiapay' === $pending->getSource() ? 'mobile_money' : 'fedapay',
            $pending->getRepartitionFrais(),
            $transactionId
        );
    }

    /**
     * Règlement d'un crédit fournisseur par mobile money.
     * Port de pages/credits/callback_credit_kkiapay.php : le crédit passe à
     * « payé », une dépense apparaît chez le détaillant (son solde baisse) et
     * un encaissement est enregistré chez le grossiste (son solde monte).
     */
    private function imputerCreditFournisseur(FedapayPending $pending, string $transactionId): void
    {
        $appro = $this->em->getRepository(Approvisionnement::class)->find($pending->getReferenceId());

        if (!$appro) {
            throw new BusinessException('Crédit fournisseur introuvable pour ce paiement.', 404);
        }
        if (Approvisionnement::STATUT_PAYE === $appro->getStatut()) {
            return; // Déjà réglé : rien à imputer.
        }

        $detaillant = $appro->getUser();
        $grossiste = $pending->getUser();
        $produit = $appro->getProduit()?->getNom() ?? 'Crédit groupé';

        // Ce chemin n'est atteint qu'après confirmation d'une transaction par
        // la passerelle : le règlement est donc du mobile money par définition.
        $appro->setStatut(Approvisionnement::STATUT_PAYE)
            ->setMoyenReglement(Approvisionnement::REGLEMENT_MOBILE_MONEY);

        // Côté détaillant : sortie de caisse.
        if ($detaillant) {
            $depense = (new Depense())
                ->setUser($detaillant)
                ->setCategorie('achat_marchandises')
                ->setMontant($appro->getMontantTotal())
                ->setDescription(sprintf(
                    'Règlement crédit fournisseur (Mobile Money) : %s (%d unités × %s FCFA)',
                    $produit,
                    $appro->getQuantite(),
                    number_format((float) $appro->getPrixAchat(), 0, ',', ' ')
                ));

            $this->em->persist($depense);
        }

        // Côté grossiste : entrée de caisse, enregistrée comme une vente soldée,
        // seul mécanisme qui alimente le solde dans le modèle existant.
        if ($grossiste) {
            $encaissement = (new Vente())
                ->setUser($grossiste)
                ->setNumeroFacture($this->numerotation->numeroFacture($grossiste))
                ->setMontantTotal($appro->getMontantTotal())
                ->setMontantPaye($appro->getMontantTotal())
                ->setStatut('solde')
                ->setModePaiement('kkiapay' === $pending->getSource() ? 'mobile_money' : 'fedapay')
                ->setTelephoneClient($detaillant?->getTelephone())
                ->setStatutPaiement('paye')
                ->setTransactionId($transactionId);

            $this->em->persist($encaissement);
        }
    }

    private function imputerCommande(FedapayPending $pending, string $transactionId): void
    {
        $commande = $this->em->getRepository(Commande::class)->find($pending->getReferenceId());
        if (!$commande) {
            throw new BusinessException('Commande introuvable pour ce paiement.', 404);
        }

        $montant = (float) $pending->getMontant();
        $mode = 'kkiapay' === $pending->getSource() ? 'mobile_money' : 'fedapay';

        // Le grossiste encaisse : le versement alimente son solde de caisse.
        if ($commande->getGrossiste()) {
            $versement = (new CommandeVersement())
                ->setCommande($commande)
                ->setUser($commande->getGrossiste())
                ->setMontant($pending->getMontant())
                ->setModePaiement($mode)
                ->setTransactionId($transactionId);

            $this->em->persist($versement);
        }

        $paiement = (new CommandePaiement())
            ->setCommande($commande)
            ->setMontant($pending->getMontant())
            ->setDatePaiement(new \DateTimeImmutable())
            ->setStatut('paye')
            ->setModePaiement($mode);

        $this->em->persist($paiement);

        $this->commandes->appliquerPaiement($commande, $montant);
    }
}
