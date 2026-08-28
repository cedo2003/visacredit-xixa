<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\CommandeRepository;
use App\Repository\VenteRepository;

/**
 * Génération des identifiants métier lisibles.
 * Reprend genererNumeroFacture() (config.php) et generer_numero_commande()
 * (includes/helpers_commandes.php).
 */
class NumerotationService
{
    public function __construct(
        private readonly VenteRepository $ventes,
        private readonly CommandeRepository $commandes,
    ) {
    }

    /** Format : BOU-YYYYMMDD-NNN, compteur remis à zéro chaque jour et par utilisateur. */
    public function numeroFacture(User $user): string
    {
        $rang = $this->ventes->countAujourdhui($user) + 1;

        return sprintf('BOU-%s-%s', date('Ymd'), str_pad((string) $rang, 3, '0', \STR_PAD_LEFT));
    }

    /** Format : CMD-YYMMDD-NNNNN, compteur global journalier. */
    public function numeroCommande(): string
    {
        $prefixe = 'CMD-'.date('ymd').'-';
        $dernier = $this->commandes->findDernierNumeroDuJour($prefixe);

        $sequence = 1;
        if ($dernier && preg_match('/CMD-\d{6}-(\d+)/', $dernier, $m)) {
            $sequence = ((int) $m[1]) + 1;
        }

        return $prefixe.str_pad((string) $sequence, 5, '0', \STR_PAD_LEFT);
    }
}
