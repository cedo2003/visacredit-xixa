/**
 * Confronte les chaînes employées dans le code au dictionnaire anglais.
 *
 * La clé de traduction étant la phrase française elle-même, une phrase retouchée
 * dans un écran laisse derrière elle une entrée orpheline dans le dictionnaire —
 * et sa nouvelle version sans traduction. Ce script montre les deux :
 *
 *     node scripts/verifier-i18n.mjs            # comptes
 *     node scripts/verifier-i18n.mjs --details  # la liste
 *
 * Il ne rend jamais un code d'erreur : une chaîne sans traduction s'affiche en
 * français, ce qui est un manque, pas une panne.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SOURCES_MOBILE = ["src", "app"];
const DICTIONNAIRE = "src/dictionnaire-en.ts";
/** Le jeu de démonstration est de la donnée, pas de l'interface. */
const EXCLUS = ["src/local/amorcage.ts"];

/** Clés d'objet dont la valeur est une phrase lue par l'utilisateur. */
const CLES_TEXTE =
  "label|libelle|titre|note|texte|question|reponse|contexte|citation|role|" +
  "aide|description|sousTitre|message|confirmation";

const LITTERAL = String.raw`"((?:[^"\\]|\\.)*)"`;

function fichiers(racine) {
  const trouves = [];
  for (const nom of readdirSync(racine)) {
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin));
    else if (/\.tsx?$/.test(nom)) trouves.push(chemin);
  }
  return trouves;
}

const employees = new Set();
for (const chemin of SOURCES_MOBILE.flatMap(fichiers)) {
  if (chemin.replace(/\\/g, "/") === DICTIONNAIRE) continue;
  const texte = readFileSync(chemin, "utf8");

  for (const m of texte.matchAll(new RegExp(String.raw`\bt\(` + LITTERAL, "g"))) {
    employees.add(m[1]);
  }
  for (const m of texte.matchAll(
    new RegExp(String.raw`\b(?:` + CLES_TEXTE + String.raw`):\s*` + LITTERAL, "g"),
  )) {
    employees.add(m[1]);
  }
}

const dico = readFileSync(DICTIONNAIRE, "utf8");
const cles = new Set();
for (const m of dico.matchAll(new RegExp(String.raw`^  ` + LITTERAL + `:`, "gm"))) {
  cles.add(m[1]);
}
// Les clés sans espace ni accent sont écrites sans guillemets par convention JS.
for (const m of dico.matchAll(/^ {2}([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9]*): "/gm)) {
  cles.add(m[1]);
}

/** Ni les nombres, ni les montants, ni les codes couleur ne se traduisent. */
function traduisible(v) {
  if (!/[A-Za-zÀ-ÿ]{2,}/.test(v)) return false;
  if (/^#[0-9A-Fa-f]{3,8}$/.test(v)) return false;
  if (/^[\d\s.,%]+(FCFA)?$/.test(v)) return false;
  return true;
}

const sansTraduction = [...employees].filter((v) => traduisible(v) && !cles.has(v)).sort();
/*
 * Une entrée peut être employée sans que le scanner la voie : les tables de
 * module rendues par `{t(item.libelle)}` n'exposent pas la phrase à l'appel.
 * On retombe donc sur une recherche plein texte avant de la déclarer orpheline.
 */
const toutLeCode = SOURCES_MOBILE.flatMap(fichiers)
  .filter((c) => c.replace(/\\/g, "/") !== DICTIONNAIRE)
  .map((c) => readFileSync(c, "utf8"))
  .join("\n");

const orphelines = [...cles]
  .filter((c) => !employees.has(c) && !toutLeCode.includes(c))
  .sort();

console.log(
  `${cles.size} entrées · ${sansTraduction.length} sans traduction · ${orphelines.length} orphelines`,
);

if (process.argv.includes("--details")) {
  if (sansTraduction.length) {
    console.log("\nSans traduction (s'afficheront en français) :");
    for (const v of sansTraduction) console.log("  " + v);
  }
  if (orphelines.length) {
    console.log("\nOrphelines (plus employées dans le code) :");
    for (const v of orphelines) console.log("  " + v);
  }
}
