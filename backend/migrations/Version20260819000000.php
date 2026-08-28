<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Évolutions du 19/08/2026.
 *
 *  1. Catalogue commun de catégories de produits (`categories.user_id` nullable
 *     + jeu de catégories livré par la plateforme, et reprise des catégories
 *     saisies à la main quand le nom correspond).
 *  2. Fiche client : date de naissance et second numéro de téléphone.
 *  3. Registre du commerce (RCCM) sur les comptes — conditionne la fréquence
 *     de retrait.
 *  4. Table `commande_negociations` : le marchandage des prix B2B.
 *
 * Les tables existantes sont en utf8mb3 (`CHARSET=utf8`) : les nouvelles le
 * restent, pour que les jointures et les clés étrangères conservent la même
 * collation que le reste de la base.
 */
final class Version20260819000000 extends AbstractMigration
{
    /** Catalogue livré, commun à toutes les boutiques. */
    private const CATEGORIES = [
        'Agriculture et élevage',
        'Boissons',
        'Carburants et lubrifiants',
        'Céréales et féculents',
        'Cosmétiques et beauté',
        'Électroménager',
        'Électronique et téléphonie',
        'Épicerie générale',
        'Fournitures scolaires et bureautique',
        'Habillement et chaussures',
        'Huiles et condiments',
        'Hygiène et entretien',
        'Matériaux de construction',
        'Produits frais',
        'Quincaillerie et outillage',
        'Santé et parapharmacie',
        'Divers',
    ];

    /**
     * Rattachement des anciens libellés au catalogue commun.
     * Ce qui n'est pas listé et ne correspond à aucun nom du catalogue reste tel
     * quel : mieux vaut une catégorie propre à la boutique qu'un reclassement
     * arbitraire de son stock.
     */
    private const EQUIVALENCES = [
        'Épicerie' => 'Épicerie générale',
        'Epicerie' => 'Épicerie générale',
        'Hygiène' => 'Hygiène et entretien',
        'Hygiene' => 'Hygiène et entretien',
        'Céréales' => 'Céréales et féculents',
        'Cosmétiques' => 'Cosmétiques et beauté',
        'Quincaillerie' => 'Quincaillerie et outillage',
        'Électronique' => 'Électronique et téléphonie',
        'Autres' => 'Divers',
    ];

    /**
     * Squelette ASCII d'un libellé : lettres et chiffres seulement.
     *
     * Le rapprochement des anciennes catégories avec le catalogue ne peut pas se
     * faire sur le nom exact. Une partie des libellés déjà en base est stockée
     * doublement encodée (« C├®r├®ales » pour « Céréales »), séquelle d'un dump
     * produit avec un client latin1 sur des tables utf8mb3 : comparés octet à
     * octet, deux libellés identiques à l'œil ne correspondent pas.
     *
     * Retirer tout ce qui n'est pas ASCII fait disparaître l'écart, puisqu'il ne
     * porte que sur les caractères accentués : « Céréales et féculents » et sa
     * version abîmée donnent tous deux « Cralesetfculents ». La comparaison
     * reste insensible à la casse, la collation de la colonne l'étant déjà.
     *
     * Ce contournement ne répare pas les données abîmées — c'est un autre sujet,
     * documenté dans README-MIGRATION.md — il évite seulement qu'elles fassent
     * échouer la reprise.
     */
    private static function squelette(string $expression): string
    {
        return sprintf("REGEXP_REPLACE(%s, '[^0-9A-Za-z]', '')", $expression);
    }

    public function getDescription(): string
    {
        return 'Catalogue commun de catégories, fiche client enrichie, registre du commerce, marchandage des commandes';
    }

    public function up(Schema $schema): void
    {
        // ── 1. Catégories ────────────────────────────────────────────────
        $this->addSql('ALTER TABLE categories MODIFY user_id INT(11) NULL');

        foreach (self::CATEGORIES as $nom) {
            $this->addSql(
                'INSERT INTO categories (user_id, nom, created_at)
                 SELECT NULL, :nom, NOW()
                   FROM DUAL
                  WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.user_id IS NULL AND c.nom = :nom)',
                ['nom' => $nom]
            );
        }

        // Les catégories créées par les boutiques sont rapprochées du catalogue,
        // d'abord par équivalence, puis par nom identique.
        foreach (self::EQUIVALENCES as $ancien => $nouveau) {
            $this->addSql(
                sprintf(
                    'UPDATE produits p
                       JOIN categories ancienne ON ancienne.id = p.categorie_id AND ancienne.user_id IS NOT NULL
                       JOIN categories commune ON commune.user_id IS NULL AND %s = %s
                        SET p.categorie_id = commune.id
                      WHERE %s = %s',
                    self::squelette('commune.nom'),
                    self::squelette(':nouveau'),
                    self::squelette('ancienne.nom'),
                    self::squelette(':ancien'),
                ),
                ['ancien' => $ancien, 'nouveau' => $nouveau]
            );
        }

        $this->addSql(
            sprintf(
                'UPDATE produits p
                   JOIN categories ancienne ON ancienne.id = p.categorie_id AND ancienne.user_id IS NOT NULL
                   JOIN categories commune ON commune.user_id IS NULL AND %s = %s
                    SET p.categorie_id = commune.id',
                self::squelette('commune.nom'),
                self::squelette('ancienne.nom'),
            )
        );

        // Une catégorie de boutique devenue orpheline n'a plus de raison d'être.
        $this->addSql(
            'DELETE FROM categories
              WHERE user_id IS NOT NULL
                AND id NOT IN (SELECT categorie_id FROM (SELECT DISTINCT categorie_id FROM produits WHERE categorie_id IS NOT NULL) AS utilisees)'
        );

        // Les produits sans catégorie sont versés dans « Divers » : le champ
        // devient obligatoire à la saisie, l'existant doit donc être complet.
        $this->addSql(
            'UPDATE produits
                SET categorie_id = (SELECT id FROM (SELECT id FROM categories WHERE user_id IS NULL AND nom = :divers) AS c)
              WHERE categorie_id IS NULL',
            ['divers' => 'Divers']
        );

        // ── 2. Fiche client ──────────────────────────────────────────────
        $this->addSql('ALTER TABLE clients ADD telephone2 VARCHAR(20) NULL DEFAULT NULL AFTER telephone');
        $this->addSql('ALTER TABLE clients ADD date_naissance DATE NULL DEFAULT NULL AFTER telephone2');

        // ── 3. Registre du commerce ──────────────────────────────────────
        $this->addSql('ALTER TABLE users ADD registre_commerce VARCHAR(50) NULL DEFAULT NULL AFTER ifu');

        // Les comptes sans RCCM basculent sur la fréquence quotidienne, seule
        // autorisée pour eux — sans quoi l'écran afficherait un rythme que
        // l'API refuserait au moment du retrait.
        $this->addSql(
            "UPDATE user_params up
               JOIN users u ON u.id = up.user_id
                SET up.frequence_retrait = '1 jour'
              WHERE u.registre_commerce IS NULL OR u.registre_commerce = ''"
        );

        // ── 4. Marchandage ───────────────────────────────────────────────
        $this->addSql(
            "CREATE TABLE commande_negociations (
                id INT(11) NOT NULL AUTO_INCREMENT,
                commande_id INT(11) NOT NULL,
                user_id INT(11) NOT NULL,
                role_auteur VARCHAR(20) NOT NULL DEFAULT 'detaillant',
                montant_propose DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                montant_initial DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                message TEXT NULL DEFAULT NULL,
                statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                repondu_at DATETIME NULL DEFAULT NULL,
                PRIMARY KEY (id),
                KEY idx_nego_commande (commande_id),
                KEY idx_nego_statut (statut),
                CONSTRAINT fk_nego_commande FOREIGN KEY (commande_id) REFERENCES commandes (id) ON DELETE CASCADE,
                CONSTRAINT fk_nego_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci"
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS commande_negociations');
        $this->addSql('ALTER TABLE users DROP COLUMN registre_commerce');
        $this->addSql('ALTER TABLE clients DROP COLUMN date_naissance');
        $this->addSql('ALTER TABLE clients DROP COLUMN telephone2');

        // Les catégories communes sont retirées ; les produits qui les
        // référençaient retombent sans catégorie, comme avant la migration.
        $this->addSql('UPDATE produits p JOIN categories c ON c.id = p.categorie_id AND c.user_id IS NULL SET p.categorie_id = NULL');
        $this->addSql('DELETE FROM categories WHERE user_id IS NULL');
        $this->addSql('ALTER TABLE categories MODIFY user_id INT(11) NOT NULL');
    }

    public function isTransactional(): bool
    {
        // MySQL valide implicitement chaque DDL : une transaction donnerait
        // l'illusion d'un retour arrière possible.
        return false;
    }
}
