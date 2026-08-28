<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\CommandeVersementRepository;
use App\Repository\DepenseRepository;
use App\Repository\RetraitRepository;
use App\Repository\VenteRepository;

/**
 * Solde de caisse.
 *
 * Formule identique à celle de dashboard.php / credits_fournisseurs.php :
 *     ventes.montant_paye − dépenses − retraits + versements de commandes
 *
 * Attention : save_retrait.php utilisait une formule tronquée (ventes − dépenses,
 * sans retirer les retraits déjà effectués ni ajouter les versements), ce qui
 * autorisait des retraits au-delà du solde réel. Le contrôle de retrait s'appuie
 * désormais sur ce calcul unique.
 */
class SoldeService
{
    public function __construct(
        private readonly VenteRepository $ventes,
        private readonly DepenseRepository $depenses,
        private readonly RetraitRepository $retraits,
        private readonly CommandeVersementRepository $versements,
    ) {
    }

    public function calculer(User $user): float
    {
        return $this->ventes->sommeMontantPaye($user)
            - $this->depenses->sommeTotale($user)
            - $this->retraits->sommeTotale($user)
            + $this->versements->sommeTotale($user);
    }
}
