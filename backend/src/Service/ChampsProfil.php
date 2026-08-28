<?php

namespace App\Service;

use App\Exception\BusinessException;

/**
 * Normalisation et contrôle des champs d'identité de la boutique.
 *
 * Ces champs sont saisis à deux endroits — l'inscription et l'écran
 * Paramètres — avec exactement les mêmes règles. Les factoriser ici évite que
 * les deux contrôles divergent : c'est précisément le genre d'écart qui laisse
 * passer un IFU vide par un chemin et pas par l'autre.
 */
final class ChampsProfil
{
    /** Bornes volontairement larges : les formats d'IFU varient selon les pays. */
    private const IFU_LONGUEUR_MIN = 5;
    private const IFU_LONGUEUR_MAX = 30;

    /** Personne ne tient une boutique à moins de 15 ans, ni à plus de 120. */
    private const AGE_MIN = 15;
    private const AGE_MAX = 120;

    /**
     * @param bool $obligatoire vrai à l'inscription et à toute mise à jour du
     *                          profil ; les comptes antérieurs gardent un IFU
     *                          nul tant qu'ils ne touchent pas à leur profil
     */
    public static function ifu(mixed $valeur, bool $obligatoire): ?string
    {
        // Les séparateurs de saisie (espaces, tirets) sont retirés : deux
        // utilisateurs saisissant le même numéro différemment doivent obtenir
        // la même valeur en base.
        $ifu = preg_replace('/[\s\-.]/', '', trim((string) ($valeur ?? '')));

        if ('' === $ifu) {
            if ($obligatoire) {
                throw new BusinessException("L'IFU est obligatoire.");
            }

            return null;
        }

        if (!preg_match('/^[A-Za-z0-9]+$/', $ifu)) {
            throw new BusinessException("L'IFU ne doit contenir que des chiffres et des lettres.");
        }

        $longueur = strlen($ifu);
        if ($longueur < self::IFU_LONGUEUR_MIN || $longueur > self::IFU_LONGUEUR_MAX) {
            throw new BusinessException(sprintf(
                "L'IFU doit comporter entre %d et %d caractères.",
                self::IFU_LONGUEUR_MIN,
                self::IFU_LONGUEUR_MAX
            ));
        }

        return strtoupper($ifu);
    }

    /**
     * Attend une date au format Y-m-d ; une chaîne vide vaut « non renseignée ».
     *
     * @param int $ageMinimum 15 ans pour le titulaire du compte, 0 pour un
     *                        client du carnet d'adresses : rien n'empêche de
     *                        vendre à un mineur, alors qu'on n'ouvre pas de
     *                        boutique à cet âge
     */
    public static function dateNaissance(mixed $valeur, int $ageMinimum = self::AGE_MIN): ?\DateTimeImmutable
    {
        $brut = trim((string) ($valeur ?? ''));

        if ('' === $brut) {
            return null;
        }

        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $brut);

        if (!$date || $date->format('Y-m-d') !== $brut) {
            throw new BusinessException('Date de naissance invalide (format attendu : AAAA-MM-JJ).');
        }

        $age = $date->diff(new \DateTimeImmutable())->y;

        if ($date > new \DateTimeImmutable() || $age > self::AGE_MAX) {
            throw new BusinessException('Date de naissance invalide.');
        }
        if ($age < $ageMinimum) {
            throw new BusinessException(sprintf('Vous devez avoir au moins %d ans.', $ageMinimum));
        }

        return $date;
    }

    /**
     * Numéro du registre du commerce (RCCM).
     *
     * Facultatif — mais son absence limite les retraits à la fréquence
     * quotidienne, ce qui est une conséquence métier, pas un refus de saisie.
     * Le format varie d'un greffe à l'autre : on n'impose donc que le jeu de
     * caractères et une longueur plausible.
     */
    public static function registreCommerce(mixed $valeur): ?string
    {
        $rccm = strtoupper(trim((string) ($valeur ?? '')));

        if ('' === $rccm) {
            return null;
        }

        if (!preg_match('#^[A-Z0-9/\-. ]+$#', $rccm)) {
            throw new BusinessException(
                'Le registre du commerce ne doit contenir que des lettres, des chiffres, des tirets et des barres obliques.'
            );
        }

        $longueur = mb_strlen($rccm);
        if ($longueur < 4 || $longueur > 50) {
            throw new BusinessException('Le registre du commerce doit comporter entre 4 et 50 caractères.');
        }

        return $rccm;
    }

    public static function adresse(mixed $valeur): ?string
    {
        $adresse = trim((string) ($valeur ?? ''));

        if ('' === $adresse) {
            return null;
        }

        if (mb_strlen($adresse) > 255) {
            throw new BusinessException("L'adresse ne peut pas dépasser 255 caractères.");
        }

        return $adresse;
    }
}
