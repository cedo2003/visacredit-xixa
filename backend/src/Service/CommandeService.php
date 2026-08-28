<?php

namespace App\Service;

use App\Entity\Approvisionnement;
use App\Entity\Commande;
use App\Entity\CommandeApprovisionnement;
use App\Entity\CommandeDetail;
use App\Entity\CommandeEcheance;
use App\Entity\CommandeNegociation;
use App\Entity\CommandePaiement;
use App\Entity\CommandeVersement;
use App\Entity\Depense;
use App\Entity\FedapayPending;
use App\Entity\Produit;
use App\Entity\User;
use App\Exception\BusinessException;
use App\Repository\ProduitRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Cycle de vie d'une commande B2B.
 *
 * Regroupe pages/commandes/{create,valider,marquer_recu,paiement_especes,
 * demander_paiement_grossiste,show}.php.
 *
 * Le tunnel de création, qui s'étalait auparavant sur quatre écrans reliés par
 * $_SESSION['temp_commande'], devient un seul appel : le panier est construit
 * côté Next.js et envoyé en une fois. Plus de commande à moitié créée quand la
 * session expire.
 */
class CommandeService
{
    /** Marge appliquée au prix d'achat quand un produit entre pour la première fois en stock. */
    private const MARGE_PAR_DEFAUT = 1.2;

    /** Seuil d'alerte des produits créés automatiquement à la réception. */
    private const SEUIL_ALERTE_AUTO = 5;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $users,
        private readonly ProduitRepository $produits,
        private readonly NumerotationService $numerotation,
        private readonly NotificationService $notifications,
        private readonly FraisPaiementService $frais,
    ) {
    }

    /**
     * Le fournisseur est-il inscrit comme grossiste ?
     * Reprend trouver_fournisseur() de includes/helpers_commandes.php.
     *
     * @return array{trouve: bool, id: int|null, nom_boutique: string, telephone: string}
     */
    public function verifierFournisseur(string $telephone): array
    {
        $telephone = preg_replace('/[^0-9]/', '', $telephone);

        if (strlen($telephone) < 8) {
            throw new BusinessException('Numéro de téléphone invalide (minimum 8 chiffres).');
        }

        $grossiste = $this->users->findGrossisteByTelephone($telephone);

        return [
            'trouve' => null !== $grossiste,
            'id' => $grossiste?->getId(),
            'nom_boutique' => $grossiste?->getNomBoutique() ?? 'Fournisseur externe',
            'telephone' => $telephone,
        ];
    }

    /**
     * @param array{
     *     fournisseur_telephone: string,
     *     mode_paiement?: string,
     *     notes?: string|null,
     *     produits: array<int, array{nom: string, quantite: int, prix_unitaire: float}>,
     *     echeances?: array<int, array{montant: float, date_limite: string}>
     * } $data
     */
    public function creer(User $detaillant, array $data): Commande
    {
        if (!$detaillant->isDetaillant()) {
            throw new BusinessException('Seul un détaillant peut passer une commande.', 403);
        }

        $fournisseur = $this->verifierFournisseur($data['fournisseur_telephone'] ?? '');
        $modePaiement = (string) ($data['mode_paiement'] ?? 'comptant');
        if (!\in_array($modePaiement, ['comptant', 'credit'], true)) {
            $modePaiement = 'comptant';
        }

        $lignes = $data['produits'] ?? [];
        if (!$lignes) {
            throw new BusinessException('Ajoutez au moins un produit à la commande.');
        }

        $echeances = $data['echeances'] ?? [];
        if ('credit' === $modePaiement && !$echeances) {
            throw new BusinessException('Vous devez définir les échéances pour un paiement au crédit.');
        }

        return $this->em->wrapInTransaction(function () use ($detaillant, $fournisseur, $modePaiement, $lignes, $echeances, $data): Commande {
            $grossiste = $fournisseur['id'] ? $this->users->find($fournisseur['id']) : null;

            $commande = (new Commande())
                ->setDetaillant($detaillant)
                ->setGrossiste($grossiste)
                ->setFournisseurNom($fournisseur['nom_boutique'])
                ->setFournisseurTelephone($fournisseur['telephone'])
                ->setNumeroCommande($this->numerotation->numeroCommande())
                ->setModePaiement($modePaiement)
                ->setStatut('en_attente')
                ->setMontantPaye('0.00')
                ->setNotes($data['notes'] ?? null);

            $total = 0.0;
            foreach ($lignes as $l) {
                $nom = trim((string) ($l['nom'] ?? ''));
                $quantite = (int) ($l['quantite'] ?? 0);
                $prix = (float) ($l['prix_unitaire'] ?? 0);

                if ('' === $nom || $quantite <= 0 || $prix <= 0) {
                    throw new BusinessException('Chaque ligne doit avoir un produit, une quantité et un prix valides.');
                }

                $detail = (new CommandeDetail())
                    ->setCommande($commande)
                    ->setProduitNom($nom)
                    ->setQuantite($quantite)
                    ->setPrixUnitaire(number_format($prix, 2, '.', ''));

                $commande->addDetail($detail);
                $this->em->persist($detail);

                $total += $quantite * $prix;
            }

            $commande->setMontantTotal(number_format($total, 2, '.', ''));
            $this->em->persist($commande);

            if ('credit' === $modePaiement) {
                $this->remplacerEcheances($commande, $echeances, $total);
            }

            $this->em->flush();

            // Le grossiste est prévenu dès la création, comme le faisait l'ancien
            // écran d'accueil des commandes reçues.
            if ($grossiste) {
                $this->notifications->creer(
                    $grossiste,
                    'nouvelle_commande',
                    'Nouvelle commande',
                    sprintf(
                        'Commande n° %s de %s — %s FCFA',
                        $commande->getNumeroCommande(),
                        $detaillant->getNomBoutique(),
                        number_format($total, 0, ',', ' ')
                    ),
                    '/commandes/'.$commande->getId()
                );
                $this->em->flush();
            }

            return $commande;
        });
    }

    /* ─────────────────────────────── Marchandage ──────────────────────────── */

    /**
     * Nouvelle proposition de prix sur une commande.
     *
     * Le marchandage n'a de sens qu'entre deux comptes de la plateforme, et
     * seulement avant validation : une fois le stock transféré, le prix est
     * arrêté. Le détaillant propose, le grossiste tranche — mais rien n'empêche
     * ce dernier de faire une contre-offre, comme au marché.
     *
     * Émettre une proposition ferme la précédente : il n'y a jamais deux prix
     * ouverts en même temps, donc jamais d'ambiguïté sur ce qui est accepté.
     */
    public function proposerPrix(User $auteur, Commande $commande, float $montant, ?string $message): CommandeNegociation
    {
        $estDetaillant = $commande->getDetaillant()?->getId() === $auteur->getId();
        $estGrossiste = $commande->getGrossiste()?->getId() === $auteur->getId();

        if (!$estDetaillant && !$estGrossiste) {
            throw new BusinessException('Cette commande ne vous concerne pas.', 403);
        }
        if (!$commande->isFournisseurSurPlateforme()) {
            throw new BusinessException(
                "Ce fournisseur n'est pas sur Visacredit XIXA : négociez le prix directement avec lui, puis saisissez le montant convenu."
            );
        }
        if ('en_attente' !== $commande->getStatut()) {
            throw new BusinessException('Le prix ne peut plus être négocié une fois la commande traitée.');
        }
        if ($montant <= 0) {
            throw new BusinessException('Le montant proposé doit être supérieur à 0 FCFA.');
        }

        $actuel = (float) $commande->getMontantTotal();
        if (abs($montant - $actuel) < 0.01) {
            throw new BusinessException('Le montant proposé est identique au montant actuel de la commande.');
        }

        $enAttente = $commande->getNegociationEnAttente();
        if ($enAttente && $enAttente->getAuteur()?->getId() === $auteur->getId()) {
            throw new BusinessException("Votre proposition précédente n'a pas encore reçu de réponse.");
        }

        return $this->em->wrapInTransaction(function () use ($commande, $auteur, $montant, $message, $actuel, $estGrossiste, $enAttente): CommandeNegociation {
            $enAttente?->setStatut(CommandeNegociation::CONTRE_PROPOSEE)
                ->setReponduAt(new \DateTimeImmutable());

            $negociation = (new CommandeNegociation())
                ->setCommande($commande)
                ->setAuteur($auteur)
                ->setRoleAuteur($estGrossiste ? 'grossiste' : 'detaillant')
                ->setMontantPropose(number_format($montant, 2, '.', ''))
                ->setMontantInitial(number_format($actuel, 2, '.', ''))
                ->setMessage($message);

            $commande->addNegociation($negociation);
            $this->em->persist($negociation);
            $this->em->flush();

            $destinataire = $estGrossiste ? $commande->getDetaillant() : $commande->getGrossiste();

            if ($destinataire) {
                $this->notifications->creer(
                    $destinataire,
                    'marchandage',
                    'Proposition de prix',
                    sprintf(
                        '%s propose %s FCFA pour la commande n° %s (au lieu de %s FCFA).',
                        $auteur->getNomBoutique(),
                        number_format($montant, 0, ',', ' '),
                        $commande->getNumeroCommande(),
                        number_format($actuel, 0, ',', ' ')
                    ),
                    '/commandes/'.$commande->getId()
                );
                $this->em->flush();
            }

            return $negociation;
        });
    }

    /**
     * Réponse à la proposition ouverte.
     *
     * Seul celui à qui elle est adressée peut répondre : accepter sa propre
     * offre reviendrait à fixer le prix unilatéralement.
     */
    public function repondrePrix(User $repondant, Commande $commande, bool $accepte): Commande
    {
        $negociation = $commande->getNegociationEnAttente();

        if (!$negociation) {
            throw new BusinessException('Aucune proposition de prix en attente sur cette commande.');
        }

        $concerne = $commande->getDetaillant()?->getId() === $repondant->getId()
            || $commande->getGrossiste()?->getId() === $repondant->getId();

        if (!$concerne) {
            throw new BusinessException('Cette commande ne vous concerne pas.', 403);
        }
        if ($negociation->getAuteur()?->getId() === $repondant->getId()) {
            throw new BusinessException("C'est à votre interlocuteur de répondre à votre proposition.");
        }
        if ('en_attente' !== $commande->getStatut()) {
            throw new BusinessException('Le prix ne peut plus être négocié une fois la commande traitée.');
        }

        return $this->em->wrapInTransaction(function () use ($commande, $negociation, $repondant, $accepte): Commande {
            $negociation
                ->setStatut($accepte ? CommandeNegociation::ACCEPTEE : CommandeNegociation::REFUSEE)
                ->setReponduAt(new \DateTimeImmutable());

            if ($accepte) {
                $this->appliquerPrixNegocie($commande, (float) $negociation->getMontantPropose());
            }

            $destinataire = $negociation->getAuteur();

            if ($destinataire) {
                $this->notifications->creer(
                    $destinataire,
                    'marchandage',
                    $accepte ? 'Prix accepté' : 'Prix refusé',
                    sprintf(
                        '%s a %s votre proposition de %s FCFA pour la commande n° %s.',
                        $repondant->getNomBoutique(),
                        $accepte ? 'accepté' : 'refusé',
                        number_format((float) $negociation->getMontantPropose(), 0, ',', ' '),
                        $commande->getNumeroCommande()
                    ),
                    '/commandes/'.$commande->getId()
                );
            }

            $this->em->flush();

            return $commande;
        });
    }

    /**
     * Reporte le prix convenu sur la commande.
     *
     * Les lignes sont ajustées au prorata : le montant négocié porte sur le
     * total, mais le reçu et les crédits fournisseurs travaillent ligne par
     * ligne — laisser les prix unitaires d'origine ferait un reçu dont la somme
     * ne tombe pas juste. Le total est ensuite recalculé depuis les lignes
     * arrondies, et l'échéancier suit la même proportion.
     */
    private function appliquerPrixNegocie(Commande $commande, float $montantNegocie): void
    {
        $ancienTotal = (float) $commande->getMontantTotal();

        if ($ancienTotal <= 0) {
            $commande->setMontantTotal(number_format($montantNegocie, 2, '.', ''));

            return;
        }

        $ratio = $montantNegocie / $ancienTotal;
        $nouveauTotal = 0.0;

        foreach ($commande->getDetails() as $detail) {
            $prix = round((float) $detail->getPrixUnitaire() * $ratio, 2);
            $detail->setPrixUnitaire(number_format($prix, 2, '.', ''));
            $nouveauTotal += $detail->getQuantite() * $prix;
        }

        $nouveauTotal = round($nouveauTotal, 2);
        $commande->setMontantTotal(number_format($nouveauTotal, 2, '.', ''));

        $echeances = $commande->getEcheances();
        $nombre = $echeances->count();

        if (0 === $nombre) {
            return;
        }

        // L'écart d'arrondi est absorbé par la dernière échéance : la somme doit
        // retomber exactement sur le total, sinon la validation la refusera.
        $cumul = 0.0;
        $index = 0;

        foreach ($echeances as $echeance) {
            ++$index;

            $montant = $index === $nombre
                ? round($nouveauTotal - $cumul, 2)
                : round((float) $echeance->getMontant() * $ratio, 2);

            $echeance->setMontant(number_format(max(0, $montant), 2, '.', ''));
            $cumul += $montant;
        }
    }

    /**
     * Validation par le grossiste : le stock bascule de sa boutique vers celle
     * du détaillant, et les crédits fournisseurs sont générés si besoin.
     */
    public function valider(User $grossiste, Commande $commande): Commande
    {
        if ($commande->getGrossiste()?->getId() !== $grossiste->getId()) {
            throw new BusinessException("Cette commande ne vous est pas destinée.", 403);
        }
        if ('en_attente' !== $commande->getStatut()) {
            throw new BusinessException('Seule une commande en attente peut être validée.');
        }
        if ($commande->getNegociationEnAttente()) {
            throw new BusinessException(
                'Une proposition de prix est en attente : acceptez-la ou refusez-la avant de valider la commande.'
            );
        }
        if ('credit' === $commande->getModePaiement() && 0 === $commande->getEcheances()->count()) {
            throw new BusinessException('Les échéances doivent être définies pour un paiement au crédit.');
        }

        return $this->em->wrapInTransaction(function () use ($grossiste, $commande): Commande {
            $detaillant = $commande->getDetaillant();

            // 1. Décrémenter le stock du grossiste
            foreach ($commande->getDetails() as $detail) {
                $produit = $this->produits->findOneByUserAndNom($grossiste, $detail->getProduitNom());

                if (!$produit) {
                    throw new BusinessException(sprintf(
                        "Produit « %s » introuvable dans votre stock.",
                        $detail->getProduitNom()
                    ));
                }
                if ($produit->getStock() < $detail->getQuantite()) {
                    throw new BusinessException(sprintf(
                        'Stock insuffisant pour « %s ». Disponible : %d, demandé : %d.',
                        $detail->getProduitNom(),
                        $produit->getStock(),
                        $detail->getQuantite()
                    ));
                }

                $produit->setStock($produit->getStock() - $detail->getQuantite());
            }

            // 2. Créditer le stock du détaillant
            $recus = $this->entrerEnStock($detaillant, $commande);

            // 3. Statut
            $commande->setStatut('validee')->setDateValidation(new \DateTimeImmutable());

            // 4. Crédits fournisseurs si la commande est à crédit
            if ('credit' === $commande->getModePaiement()) {
                $this->creerCreditsFournisseurs($detaillant, $commande, $recus);
            }

            // 5. Notifier le détaillant
            $this->notifications->creer(
                $detaillant,
                'commande_validee',
                'Commande validée',
                sprintf(
                    'Votre commande n° %s a été validée par %s',
                    $commande->getNumeroCommande(),
                    $grossiste->getNomBoutique()
                ),
                '/commandes/'.$commande->getId()
            );

            $this->em->flush();

            return $commande;
        });
    }

    public function marquerLivree(User $grossiste, Commande $commande): Commande
    {
        if ($commande->getGrossiste()?->getId() !== $grossiste->getId()) {
            throw new BusinessException("Cette commande ne vous est pas destinée.", 403);
        }
        if ('validee' !== $commande->getStatut()) {
            throw new BusinessException('Seule une commande validée peut être marquée comme livrée.');
        }

        $commande->setStatut('livree')->setDateLivraison(new \DateTimeImmutable());
        $this->em->flush();

        $this->notifications->creer(
            $commande->getDetaillant(),
            'commande_livree',
            'Commande livrée',
            sprintf('Votre commande n° %s a été expédiée.', $commande->getNumeroCommande()),
            '/commandes/'.$commande->getId()
        );
        $this->em->flush();

        return $commande;
    }

    /**
     * Confirmation de réception par le détaillant.
     *
     * Deux chemins, repris tels quels de l'application PHP :
     *  - fournisseur sur la plateforme : le stock a déjà été transféré à la
     *    validation, on ne fait qu'acter la réception ;
     *  - fournisseur externe : c'est ici que le stock entre et que les crédits
     *    fournisseurs sont créés.
     */
    public function marquerRecu(User $detaillant, Commande $commande): Commande
    {
        if ($commande->getDetaillant()?->getId() !== $detaillant->getId()) {
            throw new BusinessException("Cette commande ne vous appartient pas.", 403);
        }
        if ($commande->isRecuParDetaillant()) {
            throw new BusinessException('Vous avez déjà confirmé la réception de cette commande.');
        }

        $surPlateforme = $commande->isFournisseurSurPlateforme();

        if ($surPlateforme && 'livree' !== $commande->getStatut()) {
            throw new BusinessException("Cette commande n'a pas encore été marquée comme livrée par le fournisseur.");
        }

        return $this->em->wrapInTransaction(function () use ($detaillant, $commande, $surPlateforme): Commande {
            $commande->setRecuParDetaillant(true)->setDateReception(new \DateTimeImmutable());

            if (!$surPlateforme) {
                $recus = $this->entrerEnStock($detaillant, $commande);

                if ('credit' === $commande->getModePaiement()) {
                    $this->creerCreditsFournisseurs($detaillant, $commande, $recus);
                }
            }

            $this->em->flush();

            return $commande;
        });
    }

    /**
     * Encaissement en espèces par le grossiste (ancien paiement_especes.php).
     * Crée un versement, qui alimente le solde du grossiste.
     */
    public function encaisserEspeces(User $grossiste, Commande $commande): Commande
    {
        if ($commande->getGrossiste()?->getId() !== $grossiste->getId()) {
            throw new BusinessException("Cette commande ne vous est pas destinée.", 403);
        }

        $reste = $commande->getReste();
        if ($reste <= 0) {
            throw new BusinessException('Cette commande est déjà entièrement payée.');
        }

        return $this->em->wrapInTransaction(function () use ($grossiste, $commande, $reste): Commande {
            $versement = (new CommandeVersement())
                ->setCommande($commande)
                ->setUser($grossiste)
                ->setMontant(number_format($reste, 2, '.', ''))
                ->setModePaiement('especes');
            $this->em->persist($versement);

            $paiement = (new CommandePaiement())
                ->setCommande($commande)
                ->setMontant(number_format($reste, 2, '.', ''))
                ->setDatePaiement(new \DateTimeImmutable())
                ->setStatut('paye')
                ->setModePaiement('especes');
            $this->em->persist($paiement);

            $this->appliquerPaiement($commande, $reste);
            $this->em->flush();

            return $commande;
        });
    }

    /**
     * Paiement en espèces par le détaillant à un fournisseur externe
     * (ancien bouton « payer_especes_externe » de show.php).
     * Génère une dépense côté détaillant.
     */
    public function payerFournisseurExterneEspeces(User $detaillant, Commande $commande): Commande
    {
        if ($commande->getDetaillant()?->getId() !== $detaillant->getId()) {
            throw new BusinessException("Cette commande ne vous appartient pas.", 403);
        }
        if ($commande->isFournisseurSurPlateforme()) {
            throw new BusinessException("Ce fournisseur est sur Visacredit XIXA : c'est lui qui déclenche la demande de paiement.");
        }
        if (!$commande->isRecuParDetaillant()) {
            throw new BusinessException("Vous devez d'abord confirmer la réception des produits.");
        }

        $reste = $commande->getReste();
        if ($reste <= 0) {
            throw new BusinessException('Cette commande est déjà entièrement payée.');
        }

        return $this->em->wrapInTransaction(function () use ($detaillant, $commande, $reste): Commande {
            $paiement = (new CommandePaiement())
                ->setCommande($commande)
                ->setMontant(number_format($reste, 2, '.', ''))
                ->setDatePaiement(new \DateTimeImmutable())
                ->setStatut('paye')
                ->setModePaiement('especes');
            $this->em->persist($paiement);

            $depense = (new Depense())
                ->setUser($detaillant)
                ->setCategorie('achat_marchandises')
                ->setMontant(number_format($reste, 2, '.', ''))
                ->setDescription(sprintf(
                    'Paiement espèces commande #%s - %s',
                    $commande->getNumeroCommande(),
                    $commande->getFournisseurNom() ?? ''
                ));
            $this->em->persist($depense);

            $this->appliquerPaiement($commande, $reste);
            $this->em->flush();

            return $commande;
        });
    }

    /**
     * Demande de paiement mobile money adressée par le grossiste au détaillant.
     * Remplace demander_paiement_grossiste.php + les $_SESSION['pending_*'].
     *
     * @return array<string, mixed>
     */
    public function demanderPaiement(User $grossiste, Commande $commande, string $passerelle, string $repartition = 'client'): array
    {
        if ($commande->getGrossiste()?->getId() !== $grossiste->getId()) {
            throw new BusinessException("Cette commande ne vous est pas destinée.", 403);
        }
        if (!\in_array($commande->getStatut(), ['validee', 'livree'], true)) {
            throw new BusinessException("Cette commande n'est pas encore prête pour la demande de paiement.");
        }

        $reste = $commande->getReste();
        if ($reste <= 0) {
            throw new BusinessException('Cette commande est déjà entièrement payée.');
        }

        $repartition = FraisPaiementService::normaliser($repartition);

        $calc = 'kkiapay' === $passerelle
            ? $this->frais->calculerKkiapay($reste, $repartition)
            : $this->frais->calculerFedapay($reste, $repartition);

        $reference = sprintf('COMMANDE-%d-%s', $commande->getId(), bin2hex(random_bytes(6)));

        $pending = (new FedapayPending())
            ->setTransactionId($reference)
            ->setModule('commande')
            ->setReferenceId((int) $commande->getId())
            ->setUser($grossiste)
            ->setMontant(number_format($reste, 2, '.', ''))
            ->setMontantWidget(number_format($calc['montant_envoye'], 2, '.', ''))
            ->setRepartitionFrais($repartition)
            ->setSource('kkiapay' === $passerelle ? 'kkiapay' : 'oncomplete')
            ->setMetaArray([
                'numero_commande' => $commande->getNumeroCommande(),
                'telephone' => $commande->getDetaillant()?->getTelephone(),
            ]);

        $this->em->persist($pending);

        $commande->setStatut('en_attente_paiement');

        $this->notifications->creer(
            $commande->getDetaillant(),
            'demande_paiement',
            'Demande de paiement',
            sprintf(
                '%s vous demande le règlement de %s FCFA pour la commande n° %s',
                $grossiste->getNomBoutique(),
                number_format($reste, 0, ',', ' '),
                $commande->getNumeroCommande()
            ),
            '/commandes/'.$commande->getId()
        );

        $this->em->flush();

        return [
            'reference' => $reference,
            'passerelle' => $passerelle,
            'montant_widget' => $calc['montant_envoye'],
            'telephone' => $commande->getDetaillant()?->getTelephone(),
            'description' => 'Commande '.$commande->getNumeroCommande(),
        ];
    }

    public function annuler(User $user, Commande $commande): Commande
    {
        $estProprietaire = $commande->getDetaillant()?->getId() === $user->getId()
            || $commande->getGrossiste()?->getId() === $user->getId();

        if (!$estProprietaire) {
            throw new BusinessException("Cette commande ne vous concerne pas.", 403);
        }
        if (!\in_array($commande->getStatut(), ['en_attente'], true)) {
            throw new BusinessException("Seule une commande encore en attente peut être annulée.");
        }

        $commande->setStatut('annulee');
        $this->em->flush();

        return $commande;
    }

    /**
     * Redéfinit les échéances d'une commande à crédit.
     * Reprend creer_echeances() de includes/helpers_commandes.php, y compris
     * la tolérance d'un franc sur la somme.
     *
     * @param array<int, array{montant: float, date_limite: string}> $echeances
     */
    public function remplacerEcheances(Commande $commande, array $echeances, ?float $montantAttendu = null): void
    {
        $attendu = $montantAttendu ?? (float) $commande->getMontantTotal();

        $valides = [];
        $somme = 0.0;

        foreach ($echeances as $e) {
            $montant = (float) ($e['montant'] ?? 0);
            $date = trim((string) ($e['date_limite'] ?? ''));

            if ($montant <= 0 || '' === $date) {
                continue;
            }

            $valides[] = ['montant' => $montant, 'date' => new \DateTimeImmutable($date)];
            $somme += $montant;
        }

        if (!$valides) {
            throw new BusinessException('Aucune échéance fournie.');
        }

        if (abs($somme - $attendu) > 1) {
            throw new BusinessException(sprintf(
                'Le total des échéances (%s FCFA) ne correspond pas au montant de la commande (%s FCFA).',
                number_format($somme, 0, ',', ' '),
                number_format($attendu, 0, ',', ' ')
            ));
        }

        foreach ($commande->getEcheances() as $ancienne) {
            $this->em->remove($ancienne);
        }
        $commande->getEcheances()->clear();

        $total = \count($valides);
        foreach ($valides as $i => $e) {
            $echeance = (new CommandeEcheance())
                ->setCommande($commande)
                ->setDetaillant($commande->getDetaillant())
                ->setMontant(number_format($e['montant'], 2, '.', ''))
                ->setDateLimite($e['date'])
                ->setNumeroEcheance($i + 1)
                ->setNbEcheancesTotal($total)
                ->setStatut('en_cours');

            $commande->addEcheance($echeance);
            $this->em->persist($echeance);
        }
    }

    /**
     * Fait entrer les lignes de la commande dans le stock du détaillant.
     * Le prix d'achat est recalculé en moyenne pondérée, comme dans valider.php.
     *
     * @return array<int, array{produit: Produit, quantite: int, prix_unitaire: float, nom: string}>
     */
    private function entrerEnStock(User $detaillant, Commande $commande): array
    {
        $recus = [];

        foreach ($commande->getDetails() as $detail) {
            $produit = $this->produits->findOneByUserAndNom($detaillant, $detail->getProduitNom());
            $prixAchatLigne = (float) $detail->getPrixUnitaire();

            if ($produit) {
                $ancienStock = $produit->getStock();
                $nouveauStock = $ancienStock + $detail->getQuantite();

                $prixMoyen = $nouveauStock > 0
                    ? ((float) $produit->getPrixAchat() * $ancienStock + $prixAchatLigne * $detail->getQuantite()) / $nouveauStock
                    : $prixAchatLigne;

                $produit->setStock($nouveauStock)
                    ->setPrixAchat(number_format($prixMoyen, 2, '.', ''));
            } else {
                $produit = (new Produit())
                    ->setUser($detaillant)
                    ->setNom($detail->getProduitNom())
                    ->setPrixAchat(number_format($prixAchatLigne, 2, '.', ''))
                    ->setPrixVente(number_format($prixAchatLigne * self::MARGE_PAR_DEFAUT, 2, '.', ''))
                    ->setStock($detail->getQuantite())
                    ->setSeuilAlerte(self::SEUIL_ALERTE_AUTO);

                $this->em->persist($produit);
            }

            $recus[] = [
                'produit' => $produit,
                'quantite' => $detail->getQuantite(),
                'prix_unitaire' => $prixAchatLigne,
                'nom' => $detail->getProduitNom(),
            ];
        }

        // Nécessaire pour que les produits créés aient un id avant d'être
        // référencés par les approvisionnements.
        $this->em->flush();

        return $recus;
    }

    /**
     * Crée un crédit fournisseur (approvisionnement en attente) par ligne reçue,
     * et le relie à la commande d'origine.
     *
     * @param array<int, array{produit: Produit, quantite: int, prix_unitaire: float, nom: string}> $recus
     */
    private function creerCreditsFournisseurs(User $detaillant, Commande $commande, array $recus): void
    {
        foreach ($recus as $ligne) {
            $montant = $ligne['quantite'] * $ligne['prix_unitaire'];

            $appro = (new Approvisionnement())
                ->setUser($detaillant)
                ->setProduit($ligne['produit'])
                ->setQuantite($ligne['quantite'])
                ->setPrixAchat(number_format($ligne['prix_unitaire'], 2, '.', ''))
                ->setMontantTotal(number_format($montant, 2, '.', ''))
                ->setModePaiement('credit')
                ->setStatut(Approvisionnement::STATUT_EN_ATTENTE)
                ->setFournisseurTelephone($commande->getFournisseurTelephone())
                ->setFournisseurNom($commande->getFournisseurNom())
                ->setNotes(sprintf(
                    'Crédit depuis commande #%s - %s',
                    $commande->getNumeroCommande(),
                    $ligne['nom']
                ));

            $this->em->persist($appro);

            $lien = (new CommandeApprovisionnement())
                ->setCommande($commande)
                ->setApprovisionnement($appro)
                ->setStatut('credit_cree');

            $this->em->persist($lien);
        }
    }

    /**
     * Impute un règlement sur la commande : montant payé, statut, et solde des
     * échéances en cours si la commande était à crédit.
     */
    public function appliquerPaiement(Commande $commande, float $montant): void
    {
        $nouveauPaye = (float) $commande->getMontantPaye() + $montant;

        $commande
            ->setMontantPaye(number_format($nouveauPaye, 2, '.', ''))
            ->setStatut($nouveauPaye >= (float) $commande->getMontantTotal() - 0.01 ? 'payee' : 'en_attente_paiement')
            ->setDatePaiement(new \DateTimeImmutable());

        if ('credit' === $commande->getModePaiement()) {
            foreach ($commande->getEcheances() as $echeance) {
                if ('en_cours' === $echeance->getStatut()) {
                    $echeance->setStatut('payee')->setDatePaiement(new \DateTimeImmutable());
                }
            }
        }
    }
}
