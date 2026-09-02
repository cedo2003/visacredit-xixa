<?php

namespace App\Service;

/**
 * Montant écrit en toutes lettres, pour la mention « arrêtée la présente
 * facture à la somme de… ».
 *
 * C'est un usage constant de la facturation en zone francophone : le montant
 * en lettres fait foi contre une altération du montant en chiffres.
 *
 * L'implémentation est maison plutôt que basée sur `NumberFormatter::SPELLOUT`
 * de l'extension intl. Celui-ci existe bien dans l'image, mais son rendu suit
 * la locale du système ICU et varie d'une version à l'autre — « quatre-vingt »
 * ou « huitante », traits d'union de la réforme de 1990 ou non. Une facture ne
 * peut pas voir sa formulation changer au gré d'une mise à jour de l'image.
 *
 * Convention retenue : orthographe traditionnelle française (« quatre-vingt-dix »,
 * « soixante-dix »), « vingt » et « cent » accordés au pluriel quand ils
 * terminent le nombre, conformément à l'usage.
 */
class MontantEnLettres
{
    private const UNITES = [
        0 => 'zéro', 1 => 'un', 2 => 'deux', 3 => 'trois', 4 => 'quatre',
        5 => 'cinq', 6 => 'six', 7 => 'sept', 8 => 'huit', 9 => 'neuf',
        10 => 'dix', 11 => 'onze', 12 => 'douze', 13 => 'treize',
        14 => 'quatorze', 15 => 'quinze', 16 => 'seize',
    ];

    private const DIZAINES = [
        2 => 'vingt', 3 => 'trente', 4 => 'quarante',
        5 => 'cinquante', 6 => 'soixante',
    ];

    /**
     * Convertit un montant en francs CFA. Les centimes sont ignorés : le franc
     * CFA n'en a pas, et les montants de l'application sont entiers.
     */
    public function convertir(float $montant): string
    {
        $entier = (int) round(abs($montant));
        $mots = $this->nombre($entier);

        // « un franc » au singulier ; et « un million DE francs », la
        // préposition étant obligatoire quand million ou milliard termine le
        // nombre — mais fautive dès qu'un reste le suit (« un million cinq
        // cents francs »).
        $unite = $entier <= 1 ? 'franc CFA' : 'francs CFA';
        if ($entier >= 1_000_000 && 0 === $entier % 1_000_000) {
            $unite = 'de '.$unite;
        }

        return ucfirst($mots).' '.$unite;
    }

    /** Écrit un entier positif en lettres. */
    private function nombre(int $n): string
    {
        if ($n < 100) {
            return $this->souscentaine($n);
        }

        if ($n < 1000) {
            $centaines = intdiv($n, 100);
            $reste = $n % 100;
            // « cent » ne prend le pluriel que s'il termine le nombre, et
            // « un cent » ne se dit pas : on écrit « cent », pas « un cent ».
            $tete = 1 === $centaines ? 'cent' : self::UNITES[$centaines].' cent';
            if (0 === $reste) {
                return 1 === $centaines ? 'cent' : $tete.'s';
            }

            return $tete.' '.$this->souscentaine($reste);
        }

        if ($n < 1_000_000) {
            $milliers = intdiv($n, 1000);
            $reste = $n % 1000;
            // « mille » est invariable, et « un mille » ne se dit pas non plus.
            //
            // « vingt » et « cent » perdent par ailleurs leur « s » devant
            // lui : on écrit « quatre-vingt mille » et « deux cent mille »,
            // mille étant un adjectif numéral. Devant « millions », qui est un
            // nom, ils le gardent — « quatre-vingts millions » — d'où ce
            // traitement ici seulement.
            $tete = 1 === $milliers
                ? 'mille'
                : preg_replace('/(vingt|cent)s$/', '$1', $this->nombre($milliers)).' mille';

            return 0 === $reste ? $tete : $tete.' '.$this->nombre($reste);
        }

        if ($n < 1_000_000_000) {
            $millions = intdiv($n, 1_000_000);
            $reste = $n % 1_000_000;
            $tete = $this->nombre($millions).(1 === $millions ? ' million' : ' millions');

            return 0 === $reste ? $tete : $tete.' '.$this->nombre($reste);
        }

        $milliards = intdiv($n, 1_000_000_000);
        $reste = $n % 1_000_000_000;
        $tete = $this->nombre($milliards).(1 === $milliards ? ' milliard' : ' milliards');

        return 0 === $reste ? $tete : $tete.' '.$this->nombre($reste);
    }

    /** De 0 à 99, là où le français concentre ses irrégularités. */
    private function souscentaine(int $n): string
    {
        if ($n <= 16) {
            return self::UNITES[$n];
        }

        if ($n < 20) {
            return 'dix-'.self::UNITES[$n - 10];
        }

        $dizaine = intdiv($n, 10);
        $unite = $n % 10;

        // 70 à 79 et 90 à 99 se comptent par vingtaines : « soixante-dix »,
        // « quatre-vingt-dix-sept ».
        if (7 === $dizaine || 9 === $dizaine) {
            // 71 prend « et », comme 21 ou 31 ; 91 non, parce qu'il se lit
            // « quatre-vingt-onze » et non « quatre-vingt et onze ».
            if (7 === $dizaine && 1 === $unite) {
                return 'soixante et onze';
            }

            $base = 7 === $dizaine ? 'soixante' : 'quatre-vingt';

            return $base.'-'.$this->souscentaine(10 + $unite);
        }

        if (8 === $dizaine) {
            // « quatre-vingts » ne s'accorde que seul ; suivi d'une unité, il
            // reste au singulier.
            return 0 === $unite ? 'quatre-vingts' : 'quatre-vingt-'.self::UNITES[$unite];
        }

        $mot = self::DIZAINES[$dizaine];

        if (0 === $unite) {
            return $mot;
        }

        // « vingt et un », « trente et un »… mais « quatre-vingt-un ».
        if (1 === $unite) {
            return $mot.' et un';
        }

        return $mot.'-'.self::UNITES[$unite];
    }
}
