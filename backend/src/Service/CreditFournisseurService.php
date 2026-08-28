<?php

namespace App\Service;

use App\Entity\Approvisionnement;
use App\Entity\Depense;
use App\Entity\FedapayPending;
use App\Entity\User;
use App\Exception\BusinessException;
use App\Repository\ApprovisionnementRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Règlement des crédits fournisseurs par le détaillant.
 * Porte pages/credits/credits_fournisseurs.php (actions « Espèces » et « Solde »).
 *
 * Dans les deux cas le crédit passe à « payé » et une dépense est générée :
 * c'est elle qui fait baisser le solde de caisse (voir SoldeService).
 */
class CreditFournisseurService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApprovisionnementRepository $approvisionnements,
        private readonly SoldeService $solde,
        private readonly FraisPaiementService $frais,
        private readonly NotificationService $notifications,
    ) {
    }

    /**
     * Demande de paiement adressée par le GROSSISTE au détaillant sur un crédit
     * fournisseur. Port de pages/credits/payer_credit_kkiapay.php : le widget
     * cible le téléphone du détaillant, qui confirme depuis son mobile.
     *
     * L'ancien flux stockait appro_id en session avec un délai de 10 minutes,
     * parce que KkiaPay supprime les query strings du callback. La référence est
     * désormais persistée en base : plus de fenêtre d'expiration.
     *
     * @return array<string, mixed>
     */
    public function demanderPaiement(
        User $grossiste,
        int $approId,
        string $passerelle = 'kkiapay',
        string $repartition = 'client',
    ): array {
        $appro = $this->approvisionnements->findOneBy([
            'id' => $approId,
            'fournisseurTelephone' => $grossiste->getTelephone(),
            'statut' => Approvisionnement::STATUT_EN_ATTENTE,
        ]);

        if (!$appro) {
            throw new BusinessException('Créance introuvable ou déjà encaissée.', 404);
        }

        $detaillant = $appro->getUser();
        $montant = (float) $appro->getMontantTotal();
        $repartition = FraisPaiementService::normaliser($repartition);

        $calc = 'kkiapay' === $passerelle
            ? $this->frais->calculerKkiapay($montant, $repartition)
            : $this->frais->calculerFedapay($montant, $repartition);

        $reference = sprintf('CREDIT-%d-%s', $appro->getId(), bin2hex(random_bytes(6)));

        $pending = (new FedapayPending())
            ->setTransactionId($reference)
            ->setModule('credit')
            ->setReferenceId((int) $appro->getId())
            ->setUser($grossiste)
            ->setMontant(number_format($montant, 2, '.', ''))
            ->setMontantWidget(number_format($calc['montant_envoye'], 2, '.', ''))
            ->setRepartitionFrais($repartition)
            ->setSource('kkiapay' === $passerelle ? 'kkiapay' : 'oncomplete')
            ->setMetaArray([
                'produit' => $appro->getProduit()?->getNom(),
                'telephone_detaillant' => $detaillant?->getTelephone(),
            ]);

        $this->em->persist($pending);

        if ($detaillant) {
            $this->notifications->creer(
                $detaillant,
                'demande_paiement',
                'Demande de paiement',
                sprintf(
                    '%s vous demande le règlement de %s FCFA pour « %s »',
                    $grossiste->getNomBoutique(),
                    number_format($montant, 0, ',', ' '),
                    $appro->getProduit()?->getNom() ?? 'un crédit fournisseur'
                ),
                '/credits'
            );
        }

        $this->em->flush();

        return [
            'reference' => $reference,
            'passerelle' => $passerelle,
            'montant_widget' => $calc['montant_envoye'],
            // C'est le détaillant qui confirme sur son mobile.
            'telephone' => $detaillant?->getTelephone(),
            'description' => 'Crédit fournisseur — '.($appro->getProduit()?->getNom() ?? 'marchandise'),
        ];
    }

    public function payerEspeces(User $user, int $approId): Approvisionnement
    {
        $appro = $this->charger($user, $approId);

        return $this->em->wrapInTransaction(function () use ($user, $appro): Approvisionnement {
            $appro->setStatut(Approvisionnement::STATUT_PAYE)
                ->setMoyenReglement(Approvisionnement::REGLEMENT_ESPECES);
            $this->genererDepense($user, $appro, 'espèces');
            $this->em->flush();

            return $appro;
        });
    }

    public function payerParSolde(User $user, int $approId): Approvisionnement
    {
        $appro = $this->charger($user, $approId);
        $soldeActuel = $this->solde->calculer($user);
        $montant = (float) $appro->getMontantTotal();

        if ($soldeActuel < $montant) {
            throw new BusinessException(sprintf(
                'Solde insuffisant ! Vous avez %s FCFA, mais ce crédit coûte %s FCFA.',
                number_format($soldeActuel, 0, ',', ' '),
                number_format($montant, 0, ',', ' ')
            ));
        }

        return $this->em->wrapInTransaction(function () use ($user, $appro): Approvisionnement {
            $appro->setStatut(Approvisionnement::STATUT_PAYE)
                ->setMoyenReglement(Approvisionnement::REGLEMENT_SOLDE);
            $this->genererDepense($user, $appro, 'solde');
            $this->em->flush();

            return $appro;
        });
    }

    private function charger(User $user, int $approId): Approvisionnement
    {
        $appro = $this->approvisionnements->findOneBy([
            'id' => $approId,
            'user' => $user,
            'statut' => Approvisionnement::STATUT_EN_ATTENTE,
        ]);

        if (!$appro) {
            throw new BusinessException('Crédit introuvable ou déjà soldé.', 404);
        }

        return $appro;
    }

    private function genererDepense(User $user, Approvisionnement $appro, string $moyen): void
    {
        $produitDesc = $appro->getProduit()?->getNom() ?? 'Crédit groupé';
        $quantiteDesc = $appro->getQuantite() > 0
            ? sprintf(' (%d unités × %s FCFA)', $appro->getQuantite(), number_format((float) $appro->getPrixAchat(), 0, ',', ' '))
            : '';

        $depense = (new Depense())
            ->setUser($user)
            ->setCategorie('achat_marchandises')
            ->setMontant($appro->getMontantTotal())
            ->setDescription(sprintf('Paiement crédit fournisseur (%s) : %s%s', $moyen, $produitDesc, $quantiteDesc));

        $this->em->persist($depense);
    }
}
