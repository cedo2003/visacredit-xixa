/**
 * Authentification et profil — pendant local de AuthController et
 * ParametreController.
 *
 * Le serveur signait un JWT ; ici le « jeton » est simplement l'identifiant de
 * l'utilisateur connecté, rangé dans le stockage sécurisé du téléphone. Cela
 * suffit : la base est locale, il n'y a personne à qui prouver son identité sur
 * un réseau. Le mot de passe reste vérifié, pour que l'écran de connexion garde
 * son sens et que deux comptes de démonstration cohabitent sur l'appareil.
 *
 * Le hachage passe de bcrypt à SHA-256 salé par le téléphone : bcrypt exige une
 * bibliothèque native absente d'Expo Go, et le modèle de menace n'est plus le
 * même — la base n'est lisible que par quelqu'un qui a déjà le téléphone.
 */

import * as Crypto from "expo-crypto";
import { ErreurMetier, executer, premier } from "../base";
import { maintenant, user, type Ligne } from "../presentateur";
import { lireToken } from "../../lib/api";
import type { User } from "../../lib/types";

export async function hacher(telephone: string, motDePasse: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${telephone}:${motDePasse}`,
  );
}

/** L'utilisateur connecté, d'après le jeton conservé sur l'appareil. */
export async function utilisateurCourant(): Promise<Ligne> {
  const jeton = await lireToken();

  if (!jeton) {
    throw new ErreurMetier("Session expirée, veuillez vous reconnecter.", 401);
  }

  const ligne = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [Number(jeton)]);

  if (!ligne) {
    throw new ErreurMetier("Session expirée, veuillez vous reconnecter.", 401);
  }

  return ligne;
}

export async function exigerGrossiste(): Promise<Ligne> {
  const u = await utilisateurCourant();
  if (Number(u.etatEts) !== 1) {
    throw new ErreurMetier("Cette action est réservée aux grossistes.", 403);
  }
  return u;
}

export async function exigerDetaillant(): Promise<Ligne> {
  const u = await utilisateurCourant();
  if (Number(u.etatEts) === 1) {
    throw new ErreurMetier("Cette action est réservée aux détaillants.", 403);
  }
  return u;
}

export async function connexion(corps: Ligne): Promise<{ token: string }> {
  const telephone = String(corps.telephone ?? "").trim();
  const motDePasse = String(corps.password ?? "");

  const ligne = await premier<Ligne>("SELECT * FROM users WHERE telephone = ?", [telephone]);

  // Message volontairement identique dans les deux cas : distinguer « compte
  // inconnu » de « mot de passe faux » renseignerait sur les comptes existants.
  if (!ligne || (await hacher(telephone, motDePasse)) !== String(ligne.password_hash)) {
    throw new ErreurMetier("Identifiants invalides.", 401);
  }

  return { token: String(ligne.id) };
}

export async function moi(): Promise<User> {
  return user(await utilisateurCourant());
}

/* ─────────────────────────── Contrôles de saisie ───────────────────────── */

/** Bornes larges : les formats d'IFU varient d'un pays à l'autre. */
const IFU_MIN = 5;
const IFU_MAX = 30;
const AGE_MIN = 15;
const AGE_MAX = 120;

export function validerIfu(valeur: unknown, obligatoire: boolean): string | null {
  const ifu = String(valeur ?? "")
    .trim()
    .replace(/[\s\-.]/g, "");

  if (ifu === "") {
    if (obligatoire) throw new ErreurMetier("L'IFU est obligatoire.");
    return null;
  }

  if (!/^[A-Za-z0-9]+$/.test(ifu)) {
    throw new ErreurMetier("L'IFU ne doit contenir que des chiffres et des lettres.");
  }
  if (ifu.length < IFU_MIN || ifu.length > IFU_MAX) {
    throw new ErreurMetier(`L'IFU doit comporter entre ${IFU_MIN} et ${IFU_MAX} caractères.`);
  }

  return ifu.toUpperCase();
}

export function validerDateNaissance(valeur: unknown): string | null {
  const brut = String(valeur ?? "").trim();
  if (brut === "") return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(brut)) {
    throw new ErreurMetier("Date de naissance invalide (format attendu : AAAA-MM-JJ).");
  }

  const date = new Date(`${brut}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new ErreurMetier("Date de naissance invalide.");
  }

  const age = (Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (age < 0 || age > AGE_MAX) throw new ErreurMetier("Date de naissance invalide.");
  if (age < AGE_MIN) throw new ErreurMetier(`Vous devez avoir au moins ${AGE_MIN} ans.`);

  return brut;
}

/**
 * Numéro du registre du commerce (RCCM).
 *
 * Facultatif — mais son absence limite les retraits à la fréquence quotidienne,
 * ce qui est une conséquence métier, pas un refus de saisie. Le format varie
 * d'un greffe à l'autre : on n'impose que le jeu de caractères et la longueur.
 */
export function validerRegistreCommerce(valeur: unknown): string | null {
  const rccm = String(valeur ?? "")
    .trim()
    .toUpperCase();

  if (rccm === "") return null;

  if (!/^[A-Z0-9/\-. ]+$/.test(rccm)) {
    throw new ErreurMetier(
      "Le registre du commerce ne doit contenir que des lettres, des chiffres, des tirets et des barres obliques.",
    );
  }
  if (rccm.length < 4 || rccm.length > 50) {
    throw new ErreurMetier("Le registre du commerce doit comporter entre 4 et 50 caractères.");
  }

  return rccm;
}

export function validerAdresse(valeur: unknown): string | null {
  const adresse = String(valeur ?? "").trim();
  if (adresse === "") return null;
  if (adresse.length > 255) {
    throw new ErreurMetier("L'adresse ne peut pas dépasser 255 caractères.");
  }
  return adresse;
}

/* ───────────────────────────── Inscription ─────────────────────────────── */

export async function inscription(corps: Ligne): Promise<{ token: string; user: User }> {
  const nom = String(corps.nom ?? "").trim();
  const prenom = String(corps.prenom ?? "").trim();
  const telephone = String(corps.telephone ?? "").replace(/[^0-9]/g, "");
  const email = String(corps.email ?? "").trim();
  const motDePasse = String(corps.password ?? "");
  const nomBoutique = String(corps.nom_boutique ?? "").trim();
  const etatEts = String(corps.etatEts ?? "");

  if (!["0", "1"].includes(etatEts)) {
    throw new ErreurMetier("Veuillez choisir votre type de fournisseur (en détail ou en gros).");
  }
  if (motDePasse.length < 6) {
    throw new ErreurMetier("Le mot de passe doit contenir au moins 6 caractères.");
  }
  if (nom === "" || prenom === "" || nomBoutique === "") {
    throw new ErreurMetier("Nom, prénom et nom de boutique sont obligatoires.");
  }
  if (telephone.length < 8) {
    throw new ErreurMetier("Numéro de téléphone invalide.");
  }

  const existant = await premier<Ligne>("SELECT id FROM users WHERE telephone = ?", [telephone]);
  if (existant) {
    throw new ErreurMetier("Ce numéro de téléphone est déjà utilisé.", 409);
  }

  // Accepté vide à l'inscription : voir AuthController::register côté backend.
  const ifu = validerIfu(corps.ifu, false);
  const registreCommerce = validerRegistreCommerce(corps.registre_commerce);
  const dateNaissance = validerDateNaissance(corps.date_naissance);
  const adresse = validerAdresse(corps.adresse);

  const { dernierId } = await executer(
    `INSERT INTO users
       (nom, prenom, telephone, email, ifu, registre_commerce, date_naissance, adresse,
        password_hash, nom_boutique, etatEts, created_at, solde)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      nom,
      prenom,
      telephone,
      email || null,
      ifu,
      registreCommerce,
      dateNaissance,
      adresse,
      await hacher(telephone, motDePasse),
      nomBoutique,
      Number(etatEts),
      maintenant(),
    ],
  );

  // Sans RCCM, la fréquence quotidienne s'impose d'entrée.
  await executer("INSERT INTO user_params (user_id, frequence_retrait) VALUES (?, ?)", [
    dernierId,
    registreCommerce ? "7 jours" : "1 jour",
  ]);

  const ligne = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [dernierId]);

  return { token: String(dernierId), user: user(ligne!) };
}

/* ─────────────────────────────── Paramètres ────────────────────────────── */

export async function lireParametres() {
  const u = await utilisateurCourant();
  const params = await premier<Ligne>("SELECT * FROM user_params WHERE user_id = ?", [u.id]);
  const { calculerSolde } = await import("./solde");
  const { FREQUENCES_RETRAIT, FREQUENCE_SANS_REGISTRE } = await import("./divers");

  const manquant = !u.registre_commerce || String(u.registre_commerce).trim() === "";

  return {
    profil: user(u),
    frequence_retrait: manquant
      ? FREQUENCE_SANS_REGISTRE
      : String(params?.frequence_retrait ?? "7 jours"),
    frequences_autorisees: manquant ? [FREQUENCE_SANS_REGISTRE] : FREQUENCES_RETRAIT,
    solde: await calculerSolde(Number(u.id)),
  };
}

export async function majParametres(corps: Ligne): Promise<User> {
  const u = await utilisateurCourant();
  const champs: string[] = [];
  const valeurs: unknown[] = [];

  const poser = (colonne: string, valeur: unknown) => {
    champs.push(`${colonne} = ?`);
    valeurs.push(valeur);
  };

  if ("nom" in corps) poser("nom", String(corps.nom ?? "").trim());
  if ("prenom" in corps) poser("prenom", String(corps.prenom ?? "").trim());

  if ("nom_boutique" in corps) {
    const nomBoutique = String(corps.nom_boutique ?? "").trim();
    if (nomBoutique === "") throw new ErreurMetier("Le nom de la boutique est obligatoire.");
    poser("nom_boutique", nomBoutique);
  }

  if ("email" in corps) poser("email", String(corps.email ?? "").trim() || null);

  // Même règle que le serveur : l'IFU devient exigible dès qu'on touche au
  // profil, y compris pour un compte créé avant son introduction.
  const ifuManquant = !u.ifu || String(u.ifu).trim() === "";
  if ("ifu" in corps || ifuManquant) {
    poser("ifu", validerIfu("ifu" in corps ? corps.ifu : u.ifu, true));
  }

  // Facultatif, mais le renseigner débloque les fréquences de retrait.
  let registreCommerce = u.registre_commerce ? String(u.registre_commerce) : null;

  if ("registre_commerce" in corps) {
    registreCommerce = validerRegistreCommerce(corps.registre_commerce);
    poser("registre_commerce", registreCommerce);
  }

  if ("date_naissance" in corps) {
    poser("date_naissance", validerDateNaissance(corps.date_naissance));
  }
  if ("adresse" in corps) {
    poser("adresse", validerAdresse(corps.adresse));
  }

  if (champs.length > 0) {
    valeurs.push(u.id);
    await executer(`UPDATE users SET ${champs.join(", ")} WHERE id = ?`, valeurs);
  }

  if ("frequence_retrait" in corps) {
    const { FREQUENCES_RETRAIT, FREQUENCE_SANS_REGISTRE } = await import("./divers");
    let frequence = String(corps.frequence_retrait ?? "").trim();

    // Contrôlé après la mise à jour du RCCM : renseigner son registre et
    // choisir une fréquence longue dans le même envoi doit fonctionner.
    if (!registreCommerce) {
      if (frequence !== "" && frequence !== FREQUENCE_SANS_REGISTRE) {
        throw new ErreurMetier(
          `Renseignez votre registre du commerce pour choisir une autre fréquence que « ${FREQUENCE_SANS_REGISTRE} ».`,
        );
      }
      frequence = FREQUENCE_SANS_REGISTRE;
    } else if (!FREQUENCES_RETRAIT.includes(frequence)) {
      throw new ErreurMetier("Fréquence de retrait inconnue.");
    }

    await executer(
      `INSERT INTO user_params (user_id, frequence_retrait) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET frequence_retrait = excluded.frequence_retrait`,
      [u.id, frequence],
    );
  }

  const misAJour = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [u.id]);
  return user(misAJour!);
}

export async function changerMotDePasse(corps: Ligne): Promise<{ message: string }> {
  const u = await utilisateurCourant();
  const actuel = String(corps.mot_de_passe_actuel ?? "");
  const nouveau = String(corps.nouveau_mot_de_passe ?? "");

  const telephone = String(u.telephone);

  if ((await hacher(telephone, actuel)) !== String(u.password_hash)) {
    throw new ErreurMetier("Mot de passe actuel incorrect.");
  }
  if (nouveau.length < 6) {
    throw new ErreurMetier("Le nouveau mot de passe doit contenir au moins 6 caractères.");
  }

  await executer("UPDATE users SET password_hash = ? WHERE id = ?", [
    await hacher(telephone, nouveau),
    u.id,
  ]);

  return { message: "Mot de passe mis à jour." };
}
