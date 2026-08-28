<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Creance;
use App\Entity\FedapayPending;
use App\Entity\User;
use App\Entity\Vente;
use App\Entity\VenteDetail;
use App\Exception\BusinessException;
use App\Repository\ClientRepository;
use App\Repository\ProduitRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Enregistrement d'une vente.
 *
 * Porte pages/ventes/save_vente.php + pages/ventes/save_creances.php.
 *
 * Changement d'architecture : les deux étapes qui transitaient par
 * $_SESSION['pending_creance'] sont fusionnées en une seule transaction.
 * Le client Next.js envoie la vente ET ses échéances d'un coup ; si la
 * transaction échoue, rien n'est écrit — l'ancien flux pouvait laisser une
 * vente sans ses créances quand l'utilisateur abandonnait entre deux pages.
 */
class VenteService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProduitRepository $produits,
        private readonly ClientRepository $clients,
        private readonly NumerotationService $numerotation,
        private readonly FraisPaiementService $frais,
    ) {
    }

    /**
     * @param array{
     *     client_id?: int|null,
     *     montant_paye?: float,
     *     mode_paiement?: string,
     *     telephone_client?: string|null,
     *     repartition_frais?: string,
     *     part_vendeur_frais?: int,
     *     fedapay_identifiant?: string|null,
     *     lignes: array<int, array{produit_id: int, quantite: int}>,
     *     echeances?: array<int, array{montant: float, date_limite: string}>
     * } $data
     *
     * @return array{vente: Vente, paiement: array<string, mixed>|null}
     */
    public function creer(User $user, array $data): array
    {
        $montantPaye = max(0.0, (float) ($data['montant_paye'] ?? 0));
        $modePaiement = $data['mode_paiement'] ?? 'especes';
        // Le partage des frais est paramétrable : les trois raccourcis habituels,
        // ou un pourcentage libre à la charge du vendeur.
        $repartition = FraisPaiementService::normaliser(
            $data['repartition_frais'] ?? 'client',
            $data['part_vendeur_frais'] ?? null
        );
        $telephoneClient = preg_replace('/[^0-9]/', '', (string) ($data['telephone_client'] ?? ''));
        $fedapayIdentifiant = trim((string) ($data['fedapay_identifiant'] ?? ''));
        $lignes = $data['lignes'] ?? [];

        if (!$lignes) {
            throw new BusinessException('Aucun produit valide ajouté.');
        }

        // ── Validation des moyens de paiement ─────────────────────────────
        if ('mobile_money' === $modePaiement && $montantPaye > 0 && strlen($telephoneClient) < 8) {
            throw new BusinessException('Numéro Mobile Money invalide.');
        }
        if ('fedapay' === $modePaiement && $montantPaye > 0 && '' === $fedapayIdentifiant) {
            throw new BusinessException("Identifiant de l'agrégateur (téléphone/email) invalide.");
        }

        $this->em->beginTransaction();

        try {
            // ── Contrôle du stock et calcul du total ──────────────────────
            $total = 0.0;
            $prepared = [];

            foreach ($lignes as $ligne) {
                $produitId = (int) ($ligne['produit_id'] ?? 0);
                $quantite = max(1, (int) ($ligne['quantite'] ?? 1));

                if ($produitId <= 0) {
                    continue;
                }

                $produit = $this->produits->findOneBy(['id' => $produitId, 'user' => $user]);
                if (!$produit) {
                    throw new BusinessException('Produit introuvable.');
                }
                if ($produit->getStock() < $quantite) {
                    throw new BusinessException(sprintf(
                        'Stock insuffisant pour « %s » (stock disponible : %d).',
                        $produit->getNom(),
                        $produit->getStock()
                    ));
                }

                $total += $quantite * (float) $produit->getPrixVente();
                $prepared[] = ['produit' => $produit, 'quantite' => $quantite];
            }

            if (!$prepared) {
                throw new BusinessException('Aucun produit valide ajouté.');
            }

            if ($montantPaye > $total) {
                throw new BusinessException('Le montant payé dépasse le total de la vente.');
            }

            $reste = round($total - $montantPaye, 2);

            // ── Frais de passerelle ───────────────────────────────────────
            $fraisClient = 0;
            $fraisVendeur = 0;
            $fedapayFraisClient = 0;
            $fedapayFraisVendeur = 0;
            $montantEnvoye = $montantPaye;

            if ('mobile_money' === $modePaiement && $montantPaye > 0) {
                $calc = $this->frais->calculerKkiapay($montantPaye, $repartition);
                $fraisClient = $calc['frais_client'];
                $fraisVendeur = $calc['frais_vendeur'];
                $montantEnvoye = $calc['montant_envoye'];
            } elseif ('fedapay' === $modePaiement && $montantPaye > 0) {
                $calc = $this->frais->calculerFedapay($montantPaye, $repartition);
                $fedapayFraisClient = $calc['frais_client'];
                $fedapayFraisVendeur = $calc['frais_vendeur'];
                $montantEnvoye = $calc['montant_envoye'];
            }

            // ── Création de la vente ──────────────────────────────────────
            $enAttentePasserelle = \in_array($modePaiement, ['mobile_money', 'fedapay'], true) && $montantPaye > 0;

            $client = null;
            if (!empty($data['client_id'])) {
                $client = $this->clients->findOneBy(['id' => (int) $data['client_id'], 'user' => $user]);
                if (!$client instanceof Client) {
                    throw new BusinessException('Client introuvable.');
                }
            }

            $vente = (new Vente())
                ->setUser($user)
                ->setClient($client)
                ->setNumeroFacture($this->numerotation->numeroFacture($user))
                ->setMontantTotal(number_format($total, 2, '.', ''))
                ->setMontantPaye(number_format($montantPaye, 2, '.', ''))
                ->setStatut($reste <= 0 ? 'solde' : 'creance')
                ->setModePaiement($modePaiement)
                ->setTelephoneClient($telephoneClient ?: null)
                ->setStatutPaiement($enAttentePasserelle ? 'en_attente' : 'paye')
                ->setFraisClient(number_format($fraisClient, 2, '.', ''))
                ->setFraisVendeur(number_format($fraisVendeur, 2, '.', ''))
                ->setFedapayIdentifiant($fedapayIdentifiant ?: null)
                ->setFedapayFraisClient($fedapayFraisClient)
                ->setFedapayFraisVendeur($fedapayFraisVendeur);

            $this->em->persist($vente);

            // ── Lignes de vente + décrément du stock ──────────────────────
            foreach ($prepared as $p) {
                $detail = (new VenteDetail())
                    ->setVente($vente)
                    ->setProduit($p['produit'])
                    ->setQuantite($p['quantite'])
                    ->setPrixUnitaire($p['produit']->getPrixVente());

                $this->em->persist($detail);
                $p['produit']->setStock($p['produit']->getStock() - $p['quantite']);
            }

            // ── Échéances de créance si un reste subsiste ─────────────────
            if ($reste > 0) {
                $this->creerEcheances($vente, $user, $client, $data['echeances'] ?? [], $reste);
            }

            $this->em->flush();

            // ── Intention de paiement (remplace $_SESSION['pending_payment']) ──
            $paiement = null;
            if ($enAttentePasserelle) {
                $paiement = $this->creerIntentionPaiement(
                    $user,
                    $vente,
                    $modePaiement,
                    $montantPaye,
                    $montantEnvoye,
                    $repartition,
                    $telephoneClient,
                    $fedapayIdentifiant
                );
                $this->em->flush();
            }

            $this->em->commit();

            return ['vente' => $vente, 'paiement' => $paiement];
        } catch (\Throwable $e) {
            $this->em->rollback();
            throw $e;
        }
    }

    /**
     * Reprend la validation de save_creances.php : au moins une échéance valide,
     * et somme des échéances = reste à payer (tolérance de 1 FCFA sur l'arrondi).
     *
     * S'y ajoute le contrôle des dates : une échéance planifie un paiement à
     * venir, donc sa date limite ne peut pas être déjà passée. Sans ce contrôle,
     * une vente pouvait naître avec une créance en retard le jour même.
     *
     * @param array<int, array{montant: float, date_limite: string}> $echeances
     */
    private function creerEcheances(Vente $vente, User $user, ?Client $client, array $echeances, float $reste): void
    {
        $somme = 0.0;
        $valides = [];
        $aujourdHui = new \DateTimeImmutable('today');

        foreach ($echeances as $e) {
            $montant = (float) ($e['montant'] ?? 0);
            $date = trim((string) ($e['date_limite'] ?? ''));

            if ($montant <= 0 || '' === $date) {
                continue;
            }

            $echeance = \DateTimeImmutable::createFromFormat('!Y-m-d', $date);
            if (!$echeance) {
                throw new BusinessException(sprintf('Date d\'échéance invalide : « %s ».', $date));
            }
            if ($echeance < $aujourdHui) {
                throw new BusinessException(sprintf(
                    'La date d\'échéance du %s est déjà passée : planifiez un paiement à venir.',
                    $echeance->format('d/m/Y')
                ));
            }

            $valides[] = ['montant' => $montant, 'date' => $echeance];
            $somme += $montant;
        }

        if (!$valides) {
            throw new BusinessException("Aucune échéance valide n'a été fournie pour le reste à payer.");
        }

        if (abs($somme - $reste) > 1) {
            throw new BusinessException(sprintf(
                'La somme des échéances (%s FCFA) ne correspond pas au reste à payer (%s FCFA).',
                number_format($somme, 0, ',', ' '),
                number_format($reste, 0, ',', ' ')
            ));
        }

        $total = \count($valides);
        foreach ($valides as $i => $e) {
            $creance = (new Creance())
                ->setVente($vente)
                ->setUser($user)
                ->setClient($client)
                ->setMontantRestant(number_format($e['montant'], 2, '.', ''))
                ->setDateLimite($e['date'])
                ->setNumeroEcheance($i + 1)
                ->setNbEcheancesTotal($total)
                ->setStatut('en_cours');

            $this->em->persist($creance);
        }
    }

    /** @return array<string, mixed> */
    private function creerIntentionPaiement(
        User $user,
        Vente $vente,
        string $modePaiement,
        float $montant,
        float $montantEnvoye,
        string $repartition,
        string $telephone,
        string $identifiant,
    ): array {
        $reference = sprintf('VENTE-%d-%s', $vente->getId(), bin2hex(random_bytes(6)));

        $pending = (new FedapayPending())
            ->setTransactionId($reference)
            ->setModule('vente')
            ->setReferenceId((int) $vente->getId())
            ->setUser($user)
            ->setMontant(number_format($montant, 2, '.', ''))
            ->setMontantWidget(number_format($montantEnvoye, 2, '.', ''))
            ->setRepartitionFrais($repartition)
            ->setSource('mobile_money' === $modePaiement ? 'kkiapay' : 'oncomplete')
            ->setMetaArray([
                'numero_facture' => $vente->getNumeroFacture(),
                'telephone' => $telephone,
                'identifiant' => $identifiant,
            ]);

        $this->em->persist($pending);

        return [
            'reference' => $reference,
            'passerelle' => 'mobile_money' === $modePaiement ? 'kkiapay' : 'fedapay',
            'montant_widget' => $montantEnvoye,
            'telephone' => $telephone,
            'identifiant' => $identifiant,
            'description' => 'Facture '.$vente->getNumeroFacture(),
        ];
    }
}
