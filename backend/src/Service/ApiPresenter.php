<?php

namespace App\Service;

use App\Entity\Approvisionnement;
use App\Entity\Client;
use App\Entity\Commande;
use App\Entity\CommandeEcheance;
use App\Entity\CommandeNegociation;
use App\Entity\Creance;
use App\Entity\Depense;
use App\Entity\NotationClient;
use App\Entity\NotationFournisseur;
use App\Entity\Notification;
use App\Entity\Produit;
use App\Entity\Retrait;
use App\Entity\User;
use App\Entity\Vente;

/**
 * Conversion des entités en tableaux JSON.
 *
 * Écrit à la main plutôt qu'avec les groupes de sérialisation : les entités ont
 * beaucoup de relations croisées (Commande → User → …) et un contrôle explicite
 * évite autant les références circulaires que la fuite de champs sensibles
 * (password_hash notamment).
 *
 * Les montants sont renvoyés en `float` : le frontend les formate lui-même
 * (l'ancien formatMontant() produisait du HTML côté serveur).
 */
class ApiPresenter
{
    public function user(User $user): array
    {
        return [
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'telephone' => $user->getTelephone(),
            'email' => $user->getEmail(),
            'ifu' => $user->getIfu(),
            'ifu_manquant' => $user->ifuManquant(),
            'registre_commerce' => $user->getRegistreCommerce(),
            // Sert au bandeau de rappel et au verrou de fréquence des retraits.
            'registre_commerce_manquant' => $user->registreCommerceManquant(),
            'date_naissance' => $user->getDateNaissance()?->format('Y-m-d'),
            'adresse' => $user->getAdresse(),
            'nom_boutique' => $user->getNomBoutique(),
            'etatEts' => $user->getEtatEts(),
            'role' => $user->isGrossiste() ? 'grossiste' : 'detaillant',
            'created_at' => $user->getCreatedAt()?->format(\DATE_ATOM),
        ];
    }

    /** Version réduite, pour les objets imbriqués (fournisseur d'une commande…). */
    public function userResume(?User $user): ?array
    {
        if (!$user) {
            return null;
        }

        return [
            'id' => $user->getId(),
            'nom_complet' => trim($user->getPrenom().' '.$user->getNom()),
            'nom_boutique' => $user->getNomBoutique(),
            'telephone' => $user->getTelephone(),
            'role' => $user->isGrossiste() ? 'grossiste' : 'detaillant',
        ];
    }

    public function client(Client $c): array
    {
        return [
            'id' => $c->getId(),
            'nom_complet' => $c->getNomComplet(),
            'telephone' => $c->getTelephone(),
            'telephone2' => $c->getTelephone2(),
            'date_naissance' => $c->getDateNaissance()?->format('Y-m-d'),
            'email' => $c->getEmail(),
            'adresse' => $c->getAdresse(),
            'notes' => $c->getNotes(),
            'created_at' => $c->getCreatedAt()?->format(\DATE_ATOM),
        ];
    }

    public function produit(Produit $p, bool $avecProprietaire = false): array
    {
        $data = [
            'id' => $p->getId(),
            'nom' => $p->getNom(),
            'prix_achat' => (float) $p->getPrixAchat(),
            'prix_vente' => (float) $p->getPrixVente(),
            'stock' => $p->getStock(),
            'seuil_alerte' => $p->getSeuilAlerte(),
            'stock_faible' => $p->isStockFaible(),
            'description' => $p->getDescription(),
            'categorie' => $p->getCategorie() ? [
                'id' => $p->getCategorie()->getId(),
                'nom' => $p->getCategorie()->getNom(),
            ] : null,
            'created_at' => $p->getCreatedAt()?->format(\DATE_ATOM),
        ];

        if ($avecProprietaire) {
            $data['fournisseur'] = $this->userResume($p->getUser());
        }

        return $data;
    }

    public function vente(Vente $v, bool $avecDetails = false): array
    {
        $data = [
            'id' => $v->getId(),
            'numero_facture' => $v->getNumeroFacture(),
            'montant_total' => (float) $v->getMontantTotal(),
            'montant_paye' => (float) $v->getMontantPaye(),
            'reste' => $v->getReste(),
            'statut' => $v->getStatut(),
            'statut_paiement' => $v->getStatutPaiement(),
            'mode_paiement' => $v->getModePaiement(),
            'telephone_client' => $v->getTelephoneClient(),
            'frais_client' => (float) $v->getFraisClient(),
            'frais_vendeur' => (float) $v->getFraisVendeur(),
            'date_vente' => $v->getDateVente()?->format(\DATE_ATOM),
            'client' => $v->getClient() ? $this->client($v->getClient()) : null,
        ];

        if ($avecDetails) {
            $data['lignes'] = array_map(fn ($d) => [
                'id' => $d->getId(),
                'produit_id' => $d->getProduit()?->getId(),
                'produit_nom' => $d->getProduit()?->getNom() ?? 'Produit supprimé',
                'quantite' => $d->getQuantite(),
                'prix_unitaire' => (float) $d->getPrixUnitaire(),
                'sous_total' => $d->getSousTotal(),
            ], $v->getDetails()->toArray());
        }

        return $data;
    }

    public function creance(Creance $c): array
    {
        return [
            'id' => $c->getId(),
            'montant_restant' => (float) $c->getMontantRestant(),
            'date_limite' => $c->getDateLimite()?->format('Y-m-d'),
            'statut' => $c->getStatut(),
            'en_retard' => $c->isEnRetard(),
            'numero_echeance' => $c->getNumeroEcheance(),
            'nb_echeances_total' => $c->getNbEcheancesTotal(),
            'created_at' => $c->getCreatedAt()?->format(\DATE_ATOM),
            'client' => $c->getClient() ? $this->client($c->getClient()) : null,
            'vente' => $c->getVente() ? [
                'id' => $c->getVente()->getId(),
                'numero_facture' => $c->getVente()->getNumeroFacture(),
                'montant_total' => (float) $c->getVente()->getMontantTotal(),
            ] : null,
        ];
    }

    public function depense(Depense $d): array
    {
        return [
            'id' => $d->getId(),
            'categorie' => $d->getCategorie(),
            'autre_categorie' => $d->getAutreCategorie(),
            'montant' => (float) $d->getMontant(),
            'description' => $d->getDescription(),
            'date_depense' => $d->getDateDepense()?->format('Y-m-d'),
            'created_at' => $d->getCreatedAt()?->format(\DATE_ATOM),
        ];
    }

    public function retrait(Retrait $r): array
    {
        return [
            'id' => $r->getId(),
            'montant' => (float) $r->getMontant(),
            'frequence' => $r->getFrequence(),
            'date_retrait' => $r->getDateRetrait()?->format(\DATE_ATOM),
        ];
    }

    public function commande(Commande $c, bool $avecDetails = false): array
    {
        $data = [
            'id' => $c->getId(),
            'numero_commande' => $c->getNumeroCommande(),
            'montant_total' => (float) $c->getMontantTotal(),
            'montant_paye' => (float) $c->getMontantPaye(),
            'reste' => $c->getReste(),
            'statut' => $c->getStatut(),
            'mode_paiement' => $c->getModePaiement(),
            'recu_par_detaillant' => $c->isRecuParDetaillant(),
            'fournisseur_nom' => $c->getFournisseurNom(),
            'fournisseur_telephone' => $c->getFournisseurTelephone(),
            'fournisseur_sur_plateforme' => $c->isFournisseurSurPlateforme(),
            'detaillant' => $this->userResume($c->getDetaillant()),
            'grossiste' => $this->userResume($c->getGrossiste()),
            'date_commande' => $c->getDateCommande()?->format(\DATE_ATOM),
            'date_validation' => $c->getDateValidation()?->format(\DATE_ATOM),
            'date_livraison' => $c->getDateLivraison()?->format(\DATE_ATOM),
            'date_reception' => $c->getDateReception()?->format(\DATE_ATOM),
            'date_paiement' => $c->getDatePaiement()?->format(\DATE_ATOM),
            'notes' => $c->getNotes(),
        ];

        if ($avecDetails) {
            $data['lignes'] = array_map(fn ($d) => [
                'id' => $d->getId(),
                'produit_nom' => $d->getProduitNom(),
                'quantite' => $d->getQuantite(),
                'prix_unitaire' => (float) $d->getPrixUnitaire(),
                'montant' => $d->getMontant(),
            ], $c->getDetails()->toArray());

            $data['echeances'] = array_map($this->echeance(...), $c->getEcheances()->toArray());
            $data['negociations'] = array_map($this->negociation(...), $c->getNegociations()->toArray());

            $enAttente = $c->getNegociationEnAttente();
            $data['negociation_en_attente'] = $enAttente ? $this->negociation($enAttente) : null;
        }

        return $data;
    }

    public function negociation(CommandeNegociation $n): array
    {
        $initial = (float) $n->getMontantInitial();
        $propose = (float) $n->getMontantPropose();

        return [
            'id' => $n->getId(),
            'montant_propose' => $propose,
            'montant_initial' => $initial,
            'ecart' => round($propose - $initial, 2),
            // Négatif = remise demandée. Calculé ici pour que le web et le mobile
            // affichent exactement le même pourcentage.
            'ecart_pourcent' => $initial > 0 ? round(($propose - $initial) / $initial * 100, 1) : 0.0,
            'message' => $n->getMessage(),
            'statut' => $n->getStatut(),
            'role_auteur' => $n->getRoleAuteur(),
            'auteur' => $this->userResume($n->getAuteur()),
            'created_at' => $n->getCreatedAt()?->format(\DATE_ATOM),
            'repondu_at' => $n->getReponduAt()?->format(\DATE_ATOM),
        ];
    }

    public function echeance(CommandeEcheance $e): array
    {
        return [
            'id' => $e->getId(),
            'montant' => (float) $e->getMontant(),
            'date_limite' => $e->getDateLimite()?->format('Y-m-d'),
            'numero_echeance' => $e->getNumeroEcheance(),
            'nb_echeances_total' => $e->getNbEcheancesTotal(),
            'statut' => $e->getStatut(),
            'date_paiement' => $e->getDatePaiement()?->format(\DATE_ATOM),
        ];
    }

    /** @param array{numero_commande: string, fournisseur_nom: ?string}|null $origine */
    public function approvisionnement(Approvisionnement $a, ?array $origine = null): array
    {
        return [
            'id' => $a->getId(),
            'produit_nom' => $a->getProduit()?->getNom() ?? 'Crédit groupé',
            'produit_id' => $a->getProduit()?->getId(),
            'quantite' => $a->getQuantite(),
            'prix_achat' => (float) $a->getPrixAchat(),
            'montant_total' => (float) $a->getMontantTotal(),
            'mode_paiement' => $a->getModePaiement(),
            'statut' => $a->getStatut(),
            // Nul pour les règlements antérieurs à ce suivi : le frontend
            // affiche alors « Payé » sans préciser par quel moyen.
            'moyen_reglement' => $a->getMoyenReglement(),
            'notes' => $a->getNotes(),
            'fournisseur_nom' => $a->getFournisseurNom(),
            'fournisseur_telephone' => $a->getFournisseurTelephone(),
            'date_appro' => $a->getDateAppro()?->format(\DATE_ATOM),
            'acheteur' => $this->userResume($a->getUser()),
            'origine_commande' => $origine['numero_commande'] ?? null,
        ];
    }

    public function notationFournisseur(NotationFournisseur $n): array
    {
        return [
            'id' => $n->getId(),
            'note' => $n->getNote(),
            'commentaire' => $n->getCommentaire(),
            'created_at' => $n->getCreatedAt()?->format(\DATE_ATOM),
            'type' => 'fournisseur',
            'auteur' => $this->userResume($n->getDetaillant()),
            'cible' => $this->userResume($n->getGrossiste()),
            'commande' => $n->getCommande() ? [
                'id' => $n->getCommande()->getId(),
                'numero_commande' => $n->getCommande()->getNumeroCommande(),
            ] : null,
        ];
    }

    public function notationClient(NotationClient $n): array
    {
        return [
            'id' => $n->getId(),
            'note' => $n->getNote(),
            'commentaire' => $n->getCommentaire(),
            'created_at' => $n->getCreatedAt()?->format(\DATE_ATOM),
            'type' => 'client',
            'auteur' => $this->userResume($n->getGrossiste()),
            'cible' => $this->userResume($n->getDetaillant()),
            'commande' => $n->getCommande() ? [
                'id' => $n->getCommande()->getId(),
                'numero_commande' => $n->getCommande()->getNumeroCommande(),
            ] : null,
        ];
    }

    public function notification(Notification $n): array
    {
        return [
            'id' => $n->getId(),
            'type' => $n->getType(),
            'titre' => $n->getTitre(),
            'message' => $n->getMessage(),
            'lien' => $this->lienFrontend($n->getLien()),
            'lu' => $n->isLu(),
            'created_at' => $n->getCreatedAt()?->format(\DATE_ATOM),
        ];
    }

    /**
     * Traduit un lien de notification vers une route du frontend Next.js.
     *
     * Les notifications créées par l'application PHP pointent vers des fichiers
     * (`/pages/commandes/show.php?id=18`) qui n'existent plus. Plutôt que de
     * réécrire la table — ce qui laisserait passer toute ligne oubliée — la
     * conversion se fait à la lecture, à l'unique endroit où les notifications
     * sont exposées.
     *
     * Un lien non reconnu renvoie `null` : le frontend affiche alors une carte
     * non cliquable, ce qui vaut mieux qu'un renvoi vers une page 404.
     */
    private function lienFrontend(?string $lien): ?string
    {
        if (null === $lien || '' === trim($lien)) {
            return null;
        }

        // Les liens déjà au format Next.js (générés depuis la migration) passent tels quels.
        if (!str_contains($lien, '.php')) {
            return $lien;
        }

        $chemin = parse_url($lien, \PHP_URL_PATH) ?: $lien;
        parse_str((string) parse_url($lien, \PHP_URL_QUERY), $parametres);
        $id = isset($parametres['id']) ? (int) $parametres['id'] : null;

        $fichier = basename($chemin);
        $dossier = basename(\dirname($chemin));

        return match (true) {
            'show.php' === $fichier && 'commandes' === $dossier && $id > 0 => '/commandes/'.$id,
            'recu_commande.php' === $fichier && $id > 0 => '/commandes/'.$id.'/recu',
            'recu.php' === $fichier && 'ventes' === $dossier && $id > 0 => '/ventes/'.$id,
            'index.php' === $fichier && 'commandes' === $dossier => '/commandes',
            'index.php' === $fichier && 'creances' === $dossier => '/creances',
            'liste_vente.php' === $fichier => '/ventes',
            'credits_fournisseurs.php' === $fichier => '/credits',
            'mes_notations.php' === $fichier => '/notations',
            'dashboard.php' === $fichier => '/tableau-de-bord',
            default => null,
        };
    }
}
