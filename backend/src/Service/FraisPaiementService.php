<?php

namespace App\Service;

use App\Exception\BusinessException;

/**
 * Calcul des frais des passerelles mobile money.
 *
 * Taux repris tels quels de l'application PHP :
 *   - KkiaPay : 1,9 % (pages/ventes/save_vente.php, pages/creances/save_paiement_creance.php)
 *   - FedaPay : 1,8 %
 * sans part fixe, arrondi au FCFA supérieur.
 *
 * Note : config.php exposait aussi calculerFraisKkiaPay() (1,5 % + 50 XOF), mais
 * cette fonction n'était appelée nulle part. Le comportement réellement observé
 * en production est celui reproduit ici.
 *
 * Répartition :
 *   - 'client'          : le client supporte les frais, le vendeur encaisse le montant plein
 *   - 'vendeur'         : le vendeur supporte les frais, ils sont déduits de son encaissement
 *   - '50_50'           : moitié-moitié, la part impaire allant au client
 *   - 'personnalise:NN' : NN % des frais pour le vendeur, le reste pour le client
 *
 * La part personnalisée voyage dans la chaîne elle-même (`personnalise:40`)
 * plutôt que dans une colonne supplémentaire : `repartition_frais` est relue
 * telle quelle par PaiementService au retour de la passerelle, et une seule
 * valeur à transporter garantit que le partage confirmé est celui qui a été
 * annoncé au moment de la vente.
 */
class FraisPaiementService
{
    public const TAUX_KKIAPAY = 0.019;
    public const TAUX_FEDAPAY = 0.018;

    public const REPARTITIONS = ['client', 'vendeur', '50_50', 'personnalise'];

    /**
     * Compose la valeur stockée pour un partage personnalisé.
     *
     * Ramène les cas dégénérés (0 % et 100 %) aux libellés simples : inutile de
     * stocker « personnalise:0 » là où « client » dit la même chose.
     */
    public static function repartitionPersonnalisee(int $partVendeurPourcent): string
    {
        $part = max(0, min(100, $partVendeurPourcent));

        return match ($part) {
            0 => 'client',
            100 => 'vendeur',
            50 => '50_50',
            default => 'personnalise:'.$part,
        };
    }

    /**
     * Normalise une répartition reçue du client HTTP.
     *
     * @param mixed $partVendeur part du vendeur, utilisée seulement quand la
     *                           répartition vaut « personnalise » sans suffixe
     */
    public static function normaliser(mixed $repartition, mixed $partVendeur = null): string
    {
        $valeur = trim((string) ($repartition ?? 'client'));

        if (str_starts_with($valeur, 'personnalise')) {
            $suffixe = substr($valeur, \strlen('personnalise'));
            $part = '' !== ltrim($suffixe, ':')
                ? (int) ltrim($suffixe, ':')
                : (int) $partVendeur;

            if ($part < 0 || $part > 100) {
                throw new BusinessException('La part des frais doit être comprise entre 0 et 100 %.');
            }

            return self::repartitionPersonnalisee($part);
        }

        return \in_array($valeur, ['client', 'vendeur', '50_50'], true) ? $valeur : 'client';
    }

    /** Part du vendeur, en pourcentage, quelle que soit la forme de la répartition. */
    public static function partVendeurPourcent(string $repartition): int
    {
        if (str_starts_with($repartition, 'personnalise:')) {
            return max(0, min(100, (int) substr($repartition, \strlen('personnalise:'))));
        }

        return match ($repartition) {
            'vendeur' => 100,
            '50_50' => 50,
            default => 0,
        };
    }

    /**
     * @return array{frais_total: int, frais_client: int, frais_vendeur: int, montant_envoye: float, part_vendeur: int}
     */
    public function calculer(float $montant, string $repartition = 'client', float $taux = self::TAUX_KKIAPAY): array
    {
        $partVendeur = self::partVendeurPourcent($repartition);

        if ($montant <= 0) {
            return [
                'frais_total' => 0,
                'frais_client' => 0,
                'frais_vendeur' => 0,
                'montant_envoye' => 0.0,
                'part_vendeur' => $partVendeur,
            ];
        }

        $fraisTotal = (int) ceil($montant * $taux);

        // La part du client est arrondie au supérieur : sur un franc indivisible,
        // c'est lui qui le porte — c'est déjà la règle historique du « 50_50 ».
        $fraisClient = (int) ceil($fraisTotal * (100 - $partVendeur) / 100);
        $fraisVendeur = $fraisTotal - $fraisClient;

        return [
            'frais_total' => $fraisTotal,
            'frais_client' => $fraisClient,
            'frais_vendeur' => $fraisVendeur,
            // Le widget encaisse le montant dû plus la part du client.
            'montant_envoye' => $montant - $fraisVendeur,
            'part_vendeur' => $partVendeur,
        ];
    }

    /** @return array{frais_total: int, frais_client: int, frais_vendeur: int, montant_envoye: float, part_vendeur: int} */
    public function calculerKkiapay(float $montant, string $repartition = 'client'): array
    {
        return $this->calculer($montant, $repartition, self::TAUX_KKIAPAY);
    }

    /** @return array{frais_total: int, frais_client: int, frais_vendeur: int, montant_envoye: float, part_vendeur: int} */
    public function calculerFedapay(float $montant, string $repartition = 'client'): array
    {
        return $this->calculer($montant, $repartition, self::TAUX_FEDAPAY);
    }
}
