/**
 * Schéma de la base locale.
 *
 * Transposition SQLite du schéma MySQL de l'API (`boutiq.sql`). Les noms de
 * tables et de colonnes sont conservés à l'identique : les requêtes se lisent
 * donc comme leurs équivalents Doctrine, et une reprise ultérieure des données
 * vers le serveur reste directe.
 *
 * Écarts imposés par SQLite :
 *   - pas d'ENUM : des TEXT, dont les valeurs permises sont documentées ;
 *   - pas de DECIMAL : des REAL. Suffisant ici, les montants étant en FCFA,
 *     une monnaie sans sous-unité — donc des entiers en pratique ;
 *   - AUTOINCREMENT via INTEGER PRIMARY KEY.
 */

export const VERSION_SCHEMA = 2;

export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nom               TEXT NOT NULL,
  prenom            TEXT NOT NULL,
  telephone         TEXT NOT NULL UNIQUE,
  email             TEXT,
  ifu               TEXT,
  registre_commerce TEXT,                       -- RCCM ; vide = retraits limités à « 1 jour »
  date_naissance    TEXT,
  adresse           TEXT,
  password_hash     TEXT NOT NULL,
  nom_boutique      TEXT NOT NULL,
  etatEts           INTEGER NOT NULL DEFAULT 0, -- 1 = grossiste, 0 = détaillant
  created_at        TEXT NOT NULL,
  solde             REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_params (
  user_id           INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  frequence_retrait TEXT DEFAULT '7 jours'
);

-- user_id NULL = catégorie du catalogue commun, définie par la plateforme et
-- proposée à toutes les boutiques.
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  nom        TEXT NOT NULL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS produits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categorie_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  nom          TEXT NOT NULL,
  prix_achat   REAL NOT NULL DEFAULT 0,
  prix_vente   REAL NOT NULL DEFAULT 0,
  stock        INTEGER NOT NULL DEFAULT 0,
  seuil_alerte INTEGER DEFAULT 0,
  description  TEXT,
  image_path   TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nom_complet    TEXT NOT NULL,
  telephone      TEXT NOT NULL,
  telephone2     TEXT,
  date_naissance TEXT,
  email          TEXT,
  adresse        TEXT,
  notes          TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ventes (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id             INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  numero_facture        TEXT NOT NULL,
  montant_total         REAL NOT NULL DEFAULT 0,
  montant_paye          REAL NOT NULL DEFAULT 0,
  statut                TEXT NOT NULL DEFAULT 'solde',      -- solde | creance
  date_vente            TEXT NOT NULL,
  mode_paiement         TEXT NOT NULL DEFAULT 'especes',    -- especes | mobile_money | fedapay
  telephone_client      TEXT,
  transaction_id        TEXT,
  statut_paiement       TEXT NOT NULL DEFAULT 'paye',       -- paye | en_attente
  frais_client          REAL NOT NULL DEFAULT 0,
  frais_vendeur         REAL NOT NULL DEFAULT 0,
  fedapay_identifiant   TEXT,
  fedapay_frais_client  INTEGER DEFAULT 0,
  fedapay_frais_vendeur INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vente_details (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  vente_id      INTEGER NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
  produit_id    INTEGER REFERENCES produits(id) ON DELETE SET NULL,
  quantite      INTEGER NOT NULL,
  prix_unitaire REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS creances (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  vente_id           INTEGER NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id          INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  montant_restant    REAL NOT NULL,
  date_limite        TEXT NOT NULL,
  statut             TEXT DEFAULT 'en_cours',   -- en_cours | payee | retard
  created_at         TEXT NOT NULL,
  numero_echeance    INTEGER NOT NULL DEFAULT 1,
  nb_echeances_total INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS creance_paiements (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  creance_id        INTEGER NOT NULL REFERENCES creances(id) ON DELETE CASCADE,
  montant           REAL NOT NULL,
  date_paiement     TEXT NOT NULL,
  mode_paiement     TEXT DEFAULT 'espece',
  repartition_frais TEXT DEFAULT 'client',
  transaction_id    TEXT
);

CREATE TABLE IF NOT EXISTS depenses (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categorie         TEXT NOT NULL,
  autre_categorie   TEXT,
  montant           REAL NOT NULL,
  description       TEXT,
  justificatif_path TEXT,
  date_depense      TEXT NOT NULL,
  created_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS retraits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  montant      REAL NOT NULL,
  frequence    TEXT,
  date_retrait TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commandes (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id_detaillant    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_grossiste     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  fournisseur_nom       TEXT,
  fournisseur_telephone TEXT NOT NULL,
  numero_commande       TEXT NOT NULL,
  montant_total         REAL NOT NULL DEFAULT 0,
  montant_paye          REAL NOT NULL DEFAULT 0,
  statut                TEXT DEFAULT 'en_attente',
  recu_par_detaillant   INTEGER DEFAULT 0,
  date_reception        TEXT,
  mode_reception        TEXT DEFAULT 'plateforme',
  mode_paiement         TEXT NOT NULL DEFAULT 'comptant',   -- comptant | credit
  date_commande         TEXT NOT NULL,
  date_validation       TEXT,
  date_livraison        TEXT,
  notes                 TEXT,
  date_echeance         TEXT,
  date_paiement         TEXT
);

CREATE TABLE IF NOT EXISTS commande_details (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  commande_id   INTEGER NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  produit_nom   TEXT NOT NULL,
  quantite      INTEGER NOT NULL,
  prix_unitaire REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS commande_echeances (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  commande_id        INTEGER NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  user_id_detaillant INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  montant            REAL NOT NULL,
  date_limite        TEXT NOT NULL,
  numero_echeance    INTEGER NOT NULL DEFAULT 1,
  nb_echeances_total INTEGER NOT NULL DEFAULT 1,
  statut             TEXT DEFAULT 'en_cours',   -- en_cours | payee | en_retard
  date_paiement      TEXT,
  transaction_id     TEXT,
  created_at         TEXT NOT NULL
);

-- Marchandage : un tour de négociation du prix d'une commande. Une seule ligne
-- est « en_attente » à la fois, le module b2b s'en porte garant.
CREATE TABLE IF NOT EXISTS commande_negociations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  commande_id     INTEGER NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_auteur     TEXT NOT NULL DEFAULT 'detaillant',  -- detaillant | grossiste
  montant_propose REAL NOT NULL DEFAULT 0,
  montant_initial REAL NOT NULL DEFAULT 0,
  message         TEXT,
  statut          TEXT NOT NULL DEFAULT 'en_attente',  -- en_attente | acceptee | refusee | contre_proposee
  created_at      TEXT NOT NULL,
  repondu_at      TEXT
);

CREATE TABLE IF NOT EXISTS commandes_versements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  commande_id    INTEGER NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  montant        REAL NOT NULL,
  mode_paiement  TEXT NOT NULL,
  transaction_id TEXT,
  date_versement TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS approvisionnements (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  produit_id            INTEGER REFERENCES produits(id) ON DELETE SET NULL,
  quantite              INTEGER NOT NULL DEFAULT 0,
  prix_achat            REAL NOT NULL DEFAULT 0,
  montant_total         REAL NOT NULL DEFAULT 0,
  mode_paiement         TEXT NOT NULL DEFAULT 'comptant',  -- comptant | credit
  statut                TEXT NOT NULL DEFAULT 'payé',      -- payé | en_attente
  moyen_reglement       TEXT,                              -- especes | mobile_money | solde
  notes                 TEXT,
  fournisseur_nom       TEXT,
  fournisseur_telephone TEXT,
  date_appro            TEXT
);

CREATE TABLE IF NOT EXISTS notations_fournisseurs (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id_detaillant INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_grossiste  INTEGER REFERENCES users(id) ON DELETE CASCADE,
  commande_id        INTEGER NOT NULL,
  note               INTEGER NOT NULL,
  commentaire        TEXT,
  created_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notations_clients (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id_grossiste  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_detaillant INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commande_id        INTEGER NOT NULL,
  note               INTEGER NOT NULL,
  commentaire        TEXT,
  created_at         TEXT,
  updated_at         TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  titre      TEXT NOT NULL,
  message    TEXT NOT NULL,
  lien       TEXT,
  lu         INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_produits_user   ON produits(user_id);
CREATE INDEX IF NOT EXISTS idx_ventes_user     ON ventes(user_id);
CREATE INDEX IF NOT EXISTS idx_creances_user   ON creances(user_id);
CREATE INDEX IF NOT EXISTS idx_commandes_det   ON commandes(user_id_detaillant);
CREATE INDEX IF NOT EXISTS idx_commandes_gros  ON commandes(user_id_grossiste);
CREATE INDEX IF NOT EXISTS idx_appro_user      ON approvisionnements(user_id);
CREATE INDEX IF NOT EXISTS idx_appro_tel       ON approvisionnements(fournisseur_telephone);
CREATE INDEX IF NOT EXISTS idx_notif_user      ON notifications(user_id, lu);
CREATE INDEX IF NOT EXISTS idx_nego_commande   ON commande_negociations(commande_id, statut);
`;

/**
 * Catalogue commun des catégories de produits.
 *
 * Défini par la plateforme, comme sur le serveur : le commerçant choisit dans
 * cette liste au lieu d'inventer ses propres libellés, ce qui rend les stocks
 * comparables d'une boutique à l'autre.
 */
export const CATEGORIES_COMMUNES = [
  "Agriculture et élevage",
  "Boissons",
  "Carburants et lubrifiants",
  "Céréales et féculents",
  "Cosmétiques et beauté",
  "Divers",
  "Électroménager",
  "Électronique et téléphonie",
  "Épicerie générale",
  "Fournitures scolaires et bureautique",
  "Habillement et chaussures",
  "Huiles et condiments",
  "Hygiène et entretien",
  "Matériaux de construction",
  "Produits frais",
  "Quincaillerie et outillage",
  "Santé et parapharmacie",
];

/** Reprise des libellés saisis avant le catalogue commun. */
const EQUIVALENCES_CATEGORIES: Record<string, string> = {
  "Épicerie": "Épicerie générale",
  Epicerie: "Épicerie générale",
  "Hygiène": "Hygiène et entretien",
  Hygiene: "Hygiène et entretien",
  "Céréales": "Céréales et féculents",
  Autres: "Divers",
};

/**
 * Migrations du schéma, indexées par la version qu'elles installent.
 *
 * Elles ne sont jouées que sur une base déjà installée : `CREATE TABLE IF NOT
 * EXISTS` ajoute bien les tables nouvelles, mais reste muet sur les colonnes
 * ajoutées à une table existante — d'où ces ALTER explicites. Chaque instruction
 * doit pouvoir échouer sans casser la suite (une colonne déjà présente), c'est
 * `base.ts` qui les joue une à une.
 */
export const MIGRATIONS: Record<number, string[]> = {
  2: [
    "ALTER TABLE users ADD COLUMN registre_commerce TEXT",
    "ALTER TABLE clients ADD COLUMN telephone2 TEXT",
    "ALTER TABLE clients ADD COLUMN date_naissance TEXT",
    `CREATE TABLE IF NOT EXISTS commande_negociations (
       id              INTEGER PRIMARY KEY AUTOINCREMENT,
       commande_id     INTEGER NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
       user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       role_auteur     TEXT NOT NULL DEFAULT 'detaillant',
       montant_propose REAL NOT NULL DEFAULT 0,
       montant_initial REAL NOT NULL DEFAULT 0,
       message         TEXT,
       statut          TEXT NOT NULL DEFAULT 'en_attente',
       created_at      TEXT NOT NULL,
       repondu_at      TEXT
     )`,
    "CREATE INDEX IF NOT EXISTS idx_nego_commande ON commande_negociations(commande_id, statut)",

    // Catalogue commun : les catégories livrées, puis reprise de l'existant.
    ...CATEGORIES_COMMUNES.map(
      (nom) =>
        `INSERT INTO categories (user_id, nom, created_at)
           SELECT NULL, '${nom.replace(/'/g, "''")}', datetime('now')
            WHERE NOT EXISTS (
              SELECT 1 FROM categories WHERE user_id IS NULL AND nom = '${nom.replace(/'/g, "''")}'
            )`,
    ),
    ...Object.entries(EQUIVALENCES_CATEGORIES).map(
      ([ancien, nouveau]) =>
        `UPDATE produits
            SET categorie_id = (SELECT id FROM categories WHERE user_id IS NULL AND nom = '${nouveau.replace(/'/g, "''")}')
          WHERE categorie_id IN (
            SELECT id FROM categories WHERE user_id IS NOT NULL AND nom = '${ancien.replace(/'/g, "''")}'
          )`,
    ),
    `UPDATE produits
        SET categorie_id = (
          SELECT commune.id
            FROM categories commune
            JOIN categories ancienne ON ancienne.nom = commune.nom
           WHERE commune.user_id IS NULL AND ancienne.id = produits.categorie_id
        )
      WHERE categorie_id IN (SELECT id FROM categories WHERE user_id IS NOT NULL)
        AND EXISTS (
          SELECT 1
            FROM categories commune
            JOIN categories ancienne ON ancienne.nom = commune.nom
           WHERE commune.user_id IS NULL AND ancienne.id = produits.categorie_id
        )`,
    `DELETE FROM categories
      WHERE user_id IS NOT NULL
        AND id NOT IN (SELECT categorie_id FROM produits WHERE categorie_id IS NOT NULL)`,
    // La catégorie devient obligatoire à la saisie : l'existant doit être complet.
    `UPDATE produits
        SET categorie_id = (SELECT id FROM categories WHERE user_id IS NULL AND nom = 'Divers')
      WHERE categorie_id IS NULL`,
    // Sans RCCM, seule la fréquence quotidienne reste ouverte.
    `UPDATE user_params
        SET frequence_retrait = '1 jour'
      WHERE user_id IN (
        SELECT id FROM users WHERE registre_commerce IS NULL OR trim(registre_commerce) = ''
      )`,
  ],
};
