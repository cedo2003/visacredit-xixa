/**
 * Base de données locale.
 *
 * L'application est autonome : toutes les données vivent dans un fichier SQLite
 * sur le téléphone, il n'y a pas de serveur. Ce module ouvre la base, crée le
 * schéma au premier lancement, y verse les données de démonstration, et fournit
 * les quelques helpers de requête utilisés par les modules métier.
 *
 * L'amorçage n'a lieu **qu'une seule fois**, à la création du fichier. Tout ce
 * que l'utilisateur saisit ensuite lui appartient et n'est jamais écrasé, même
 * après une mise à jour de l'application.
 */

import * as SQLite from "expo-sqlite";
import { AMORCAGE } from "./amorcage";
import { MIGRATIONS, SCHEMA, VERSION_SCHEMA } from "./schema";

const NOM_BASE = "visacredit.db";

let base: SQLite.SQLiteDatabase | null = null;
let ouverture: Promise<SQLite.SQLiteDatabase> | null = null;

/** Erreur métier — pendant local de BusinessException côté Symfony. */
export class ErreurMetier extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "ErreurMetier";
  }
}

/**
 * Ouvre la base, en la créant au besoin.
 *
 * La promesse est mémorisée : plusieurs écrans montés en même temps demandent
 * la base simultanément, et sans cela le schéma serait créé en double.
 */
export function ouvrirBase(): Promise<SQLite.SQLiteDatabase> {
  if (base) return Promise.resolve(base);
  if (ouverture) return ouverture;

  ouverture = (async () => {
    const db = await SQLite.openDatabaseAsync(NOM_BASE);

    await db.execAsync("PRAGMA journal_mode = WAL;");

    const version = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
    const installee = version?.user_version ?? 0;

    if (installee === 0) {
      // `user_version` n'est posé qu'après un amorçage réussi. Le trouver à zéro
      // signifie donc que la base n'a jamais été installée correctement — soit
      // c'est un premier lancement, soit une version antérieure a échoué en
      // laissant un schéma partiel. Dans les deux cas il n'y a rien à préserver,
      // et repartir d'un schéma propre est plus sûr que de composer avec des
      // tables incomplètes : `CREATE TABLE IF NOT EXISTS` ne corrige pas une
      // table à qui il manque une colonne.
      await vider(db);
      await db.execAsync(SCHEMA);
      await amorcer(db);
      await db.execAsync(`PRAGMA user_version = ${VERSION_SCHEMA};`);
    } else {
      // Base déjà installée : on ne réamorce jamais, ce serait effacer le
      // travail de l'utilisateur. `IF NOT EXISTS` ajoute seulement les tables
      // qu'une version ultérieure aurait introduites — les colonnes ajoutées à
      // une table existante, elles, passent par les migrations.
      await db.execAsync(SCHEMA);
      await migrer(db, installee);
    }

    base = db;
    return db;
  })();

  return ouverture;
}

/**
 * Applique les migrations manquantes, de la version installée à la version cible.
 *
 * Chaque instruction est jouée séparément et son échec est ignoré : sur SQLite,
 * `ALTER TABLE … ADD COLUMN` n'a pas de forme « si absente », et une base déjà
 * à jour sur ce point renverrait « duplicate column name ». S'arrêter là
 * empêcherait les instructions suivantes de passer, pour un cas parfaitement
 * bénin. `user_version` n'avance qu'une fois le lot entier tenté.
 */
async function migrer(db: SQLite.SQLiteDatabase, installee: number): Promise<void> {
  for (let version = installee + 1; version <= VERSION_SCHEMA; version++) {
    for (const instruction of MIGRATIONS[version] ?? []) {
      try {
        await db.execAsync(instruction);
      } catch (erreur) {
        console.warn(`[base] migration ${version} — instruction ignorée`, erreur);
      }
    }

    await db.execAsync(`PRAGMA user_version = ${version};`);
  }
}

/**
 * Supprime toutes les tables applicatives.
 *
 * Lit `sqlite_master` plutôt qu'une liste écrite en dur : une table oubliée
 * dans la liste survivrait avec son ancien schéma, ce qui est précisément le
 * défaut qu'on cherche à corriger.
 */
async function vider(db: SQLite.SQLiteDatabase): Promise<void> {
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';",
  );

  await db.execAsync("PRAGMA foreign_keys = OFF;");
  for (const t of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS "${t.name}";`);
  }
  await db.execAsync("PRAGMA foreign_keys = ON;");
}

/** Verse les données de démonstration dans une base vide. */
async function amorcer(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const [table, lignes] of Object.entries(AMORCAGE)) {
      for (const ligne of lignes) {
        const colonnes = Object.keys(ligne);
        if (colonnes.length === 0) continue;

        const trous = colonnes.map(() => "?").join(", ");
        const valeurs = colonnes.map((c) => normaliser(ligne[c]));

        await db.runAsync(
          `INSERT INTO ${table} (${colonnes.join(", ")}) VALUES (${trous});`,
          valeurs,
        );
      }
    }
  });
}

/** SQLite n'accepte ni booléens ni objets : tout est ramené aux types supportés. */
function normaliser(valeur: unknown): SQLite.SQLiteBindValue {
  if (valeur === null || valeur === undefined) return null;
  if (typeof valeur === "boolean") return valeur ? 1 : 0;
  if (typeof valeur === "number" || typeof valeur === "string") return valeur;
  return String(valeur);
}

/* ─────────────────────────── Helpers de requête ────────────────────────── */

export async function tous<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = await ouvrirBase();
  return db.getAllAsync<T>(sql, params.map(normaliser));
}

export async function premier<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const db = await ouvrirBase();
  return db.getFirstAsync<T>(sql, params.map(normaliser));
}

/** Renvoie l'identifiant inséré, ou le nombre de lignes touchées. */
export async function executer(
  sql: string,
  params: unknown[] = [],
): Promise<{ dernierId: number; lignes: number }> {
  const db = await ouvrirBase();
  const r = await db.runAsync(sql, params.map(normaliser));

  return { dernierId: r.lastInsertRowId, lignes: r.changes };
}

/**
 * Exécute plusieurs écritures en tout-ou-rien.
 *
 * Indispensable partout où le métier l'exigeait côté serveur : une vente qui
 * décrémente le stock et crée ses échéances ne doit jamais aboutir à moitié.
 */
export async function transaction<T>(operation: () => Promise<T>): Promise<T> {
  const db = await ouvrirBase();
  let resultat!: T;

  await db.withTransactionAsync(async () => {
    resultat = await operation();
  });

  return resultat;
}

/** Somme d'une colonne, 0 si aucune ligne — évite les `null` en cascade. */
export async function somme(sql: string, params: unknown[] = []): Promise<number> {
  const r = await premier<{ total: number | null }>(sql, params);
  return r?.total ?? 0;
}

/** Remet la base dans son état d'origine (menu Paramètres). */
export async function reinitialiser(): Promise<void> {
  const db = await ouvrirBase();

  await db.execAsync("PRAGMA foreign_keys = OFF;");
  for (const table of Object.keys(AMORCAGE)) {
    await db.execAsync(`DELETE FROM ${table};`);
    await db.execAsync(`DELETE FROM sqlite_sequence WHERE name = '${table}';`);
  }
  await db.execAsync("PRAGMA foreign_keys = ON;");

  await amorcer(db);
}
