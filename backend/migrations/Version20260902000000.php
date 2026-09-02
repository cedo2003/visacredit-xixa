<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Régime de TVA de la boutique, pour la facture PDF.
 *
 * Deux colonnes seulement, mais elles décident du contenu légal du document :
 * une boutique assujettie doit faire apparaître la base hors taxes, le taux et
 * le montant de la taxe ; une boutique au forfait n'a pas le droit de facturer
 * la TVA, et sa facture doit porter la mention « TVA non applicable ».
 *
 * Par défaut `0` : la très grande majorité des boutiques visées relèvent du
 * régime simplifié. Mieux vaut une facture sans TVA pour une boutique qui y est
 * soumise — qu'elle corrigera dans Paramètres — qu'une TVA facturée à tort par
 * une boutique qui n'en a pas le droit.
 *
 * Les tables existantes sont en utf8mb3 (`CHARSET=utf8`) ; on ne touche pas à
 * la collation ici, il n'y a aucune colonne texte.
 */
final class Version20260902000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Régime de TVA de la boutique (assujettissement et taux) pour la facturation';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_params ADD assujetti_tva TINYINT(1) NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE user_params ADD taux_tva DECIMAL(5,2) NOT NULL DEFAULT 18.00');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_params DROP COLUMN taux_tva');
        $this->addSql('ALTER TABLE user_params DROP COLUMN assujetti_tva');
    }

    public function isTransactional(): bool
    {
        // MySQL valide implicitement chaque DDL : une transaction donnerait
        // l'illusion d'un retour arrière possible.
        return false;
    }
}
