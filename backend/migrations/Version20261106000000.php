<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ouverture de l'API aux applications partenaires.
 *
 *  1. `applications_partenaires` : les applications autorisées, avec l'empreinte
 *     de leur secret — jamais le secret lui-même.
 *  2. `liaisons_partenaires` : quelle boutique XIXA correspond à quel compte
 *     chez quel partenaire. Un partenaire n'obtient de jeton que pour une
 *     boutique liée.
 *
 * Les tables existantes sont en utf8mb3 (`CHARSET=utf8`) : les nouvelles le
 * restent, comme dans Version20260819000000. 191 caractères pour la référence
 * externe, la longueur qu'un index unique tolère quel que soit le jeu de
 * caractères.
 */
final class Version20261106000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Applications partenaires et liaisons avec les boutiques';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            "CREATE TABLE applications_partenaires (
                id INT AUTO_INCREMENT NOT NULL,
                nom VARCHAR(150) NOT NULL,
                client_id VARCHAR(40) NOT NULL,
                secret_hash VARCHAR(64) NOT NULL,
                actif TINYINT(1) NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL,
                derniere_utilisation DATETIME DEFAULT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_application_client_id (client_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci"
        );

        $this->addSql(
            "CREATE TABLE liaisons_partenaires (
                id INT AUTO_INCREMENT NOT NULL,
                application_id INT NOT NULL,
                user_id INT(11) NOT NULL,
                reference_externe VARCHAR(191) NOT NULL,
                created_at DATETIME NOT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_liaison_reference (application_id, reference_externe),
                UNIQUE KEY uniq_liaison_user (application_id, user_id),
                KEY idx_liaison_user (user_id),
                CONSTRAINT fk_liaison_application FOREIGN KEY (application_id) REFERENCES applications_partenaires (id) ON DELETE CASCADE,
                CONSTRAINT fk_liaison_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci"
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS liaisons_partenaires');
        $this->addSql('DROP TABLE IF EXISTS applications_partenaires');
    }

    public function isTransactional(): bool
    {
        // MySQL valide implicitement chaque DDL : une transaction donnerait
        // l'illusion d'un retour arrière possible.
        return false;
    }
}
