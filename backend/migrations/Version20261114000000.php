<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Notifications push : les appareils abonnés de chaque boutique.
 *
 * Une ligne par navigateur (Web Push) ou par téléphone (jeton Expo). Le point
 * de terminaison est un texte libre — une URL de service push peut être
 * longue —, son unicité est donc portée par son empreinte SHA-256.
 *
 * En utf8mb3 comme le reste de la base, voir Version20260819000000.
 */
final class Version20261114000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Abonnements aux notifications push (web et mobile)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            "CREATE TABLE abonnements_push (
                id INT AUTO_INCREMENT NOT NULL,
                user_id INT(11) NOT NULL,
                canal VARCHAR(10) NOT NULL,
                point_terminaison LONGTEXT NOT NULL,
                empreinte VARCHAR(64) NOT NULL,
                cle_p256dh VARCHAR(255) DEFAULT NULL,
                cle_auth VARCHAR(255) DEFAULT NULL,
                created_at DATETIME NOT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_abonnement_empreinte (empreinte),
                KEY idx_abonnement_user (user_id),
                CONSTRAINT fk_abonnement_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci"
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS abonnements_push');
    }

    public function isTransactional(): bool
    {
        // MySQL valide implicitement chaque DDL : une transaction donnerait
        // l'illusion d'un retour arrière possible.
        return false;
    }
}
