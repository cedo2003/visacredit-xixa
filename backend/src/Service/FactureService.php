<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\UserParam;
use App\Entity\Vente;
use Dompdf\Dompdf;
use Dompdf\Options;
use Doctrine\ORM\EntityManagerInterface;
use Twig\Environment;

/**
 * Facture PDF d'une vente.
 *
 * Le reçu imprimable existait déjà côté navigateur ; ce service produit un vrai
 * document : mentions légales de la boutique, ventilation de la TVA quand elle
 * s'applique, montant en toutes lettres, et un fichier qu'on peut archiver ou
 * transmettre.
 *
 * Le rendu passe par Twig puis dompdf. Twig pour l'échappement automatique —
 * un nom de client contenant `<` ou `&` casserait un HTML assemblé à la main —
 * et dompdf parce qu'il n'exige aucun binaire externe, contrairement aux
 * solutions à base de navigateur sans interface.
 */
class FactureService
{
    public function __construct(
        private readonly Environment $twig,
        private readonly EntityManagerInterface $em,
        private readonly MontantEnLettres $lettres,
    ) {
    }

    /** Le PDF, en mémoire. */
    public function pdf(Vente $vente, User $vendeur): string
    {
        $html = $this->twig->render('facture.html.twig', $this->donnees($vente, $vendeur));

        $options = new Options();
        // Aucune ressource distante : la facture ne doit dépendre d'aucun
        // serveur tiers au moment du rendu, et l'autoriser ouvrirait une porte
        // (le HTML vient de données saisies par l'utilisateur).
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }

    /** Nom du fichier proposé au téléchargement. */
    public function nomFichier(Vente $vente): string
    {
        // Le numéro suffit à l'identifier et ne contient que des caractères sûrs
        // (BOU-20260902-001) ; on s'en assure tout de même, il finit dans un
        // en-tête HTTP.
        $numero = preg_replace('/[^A-Za-z0-9_-]/', '', $vente->getNumeroFacture()) ?: 'facture';

        return 'Facture-'.$numero.'.pdf';
    }

    /**
     * @return array<string, mixed>
     */
    private function donnees(Vente $vente, User $vendeur): array
    {
        $params = $this->em->getRepository(UserParam::class)->findOneBy(['user' => $vendeur]);
        $assujetti = (bool) $params?->isAssujettiTva();
        $taux = (float) ($params?->getTauxTva() ?? '18.00');

        $lignes = [];
        foreach ($vente->getDetails() as $ligne) {
            $lignes[] = [
                'designation' => $ligne->getProduit()?->getNom() ?? 'Article',
                'quantite' => $ligne->getQuantite(),
                'prix_unitaire' => (float) $ligne->getPrixUnitaire(),
                'sous_total' => (float) $ligne->getSousTotal(),
            ];
        }

        $total = (float) $vente->getMontantTotal();

        /*
         * Les prix saisis dans l'application sont ceux payés par le client,
         * donc toutes taxes comprises : c'est ainsi qu'un commerçant affiche
         * son prix. La base hors taxes se déduit donc du total, elle ne s'y
         * ajoute pas — l'inverse gonflerait la facture de 18 % par rapport à
         * ce que le client a réellement réglé.
         */
        $ht = $assujetti && $taux > 0 ? $total / (1 + $taux / 100) : $total;
        $tva = $total - $ht;

        return [
            'vente' => $vente,
            'vendeur' => $vendeur,
            'lignes' => $lignes,
            'assujetti_tva' => $assujetti,
            'taux_tva' => $taux,
            'total_ht' => $ht,
            'montant_tva' => $tva,
            'total_ttc' => $total,
            'montant_paye' => (float) $vente->getMontantPaye(),
            'reste' => $total - (float) $vente->getMontantPaye(),
            'total_en_lettres' => $this->lettres->convertir($total),
            'emise_le' => new \DateTimeImmutable(),
        ];
    }
}
