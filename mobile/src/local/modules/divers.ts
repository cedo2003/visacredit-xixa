/**
 * Dépenses, retraits, notifications et paiements — pendants locaux de
 * DepenseController, RetraitController, NotificationController et
 * PaiementController.
 */

import { ErreurMetier, executer, premier, somme, tous } from "../base";
import {
  aujourdhui,
  depense as presenterDepense,
  maintenant,
  notification as presenterNotification,
  retrait as presenterRetrait,
  type Ligne,
} from "../presentateur";
import { utilisateurCourant } from "./auth";
import { calculerSolde } from "./solde";
import type { Depense, NotificationItem, Retrait } from "../../lib/types";

/* ──────────────────────────────── Dépenses ────────────────────────────── */

const CATEGORIES_DEPENSE = [
  "salaires",
  "achat_marchandises",
  "loyer",
  "transport",
  "electricite",
  "autres",
];

export async function depenses(): Promise<{
  depenses: Depense[];
  total: number;
  categories: string[];
}> {
  const u = await utilisateurCourant();

  const lignes = await tous<Ligne>(
    "SELECT * FROM depenses WHERE user_id = ? ORDER BY date_depense DESC, id DESC",
    [u.id],
  );

  return {
    depenses: lignes.map(presenterDepense),
    total: await somme("SELECT SUM(montant) AS total FROM depenses WHERE user_id = ?", [u.id]),
    categories: CATEGORIES_DEPENSE,
  };
}

export async function creerDepense(corps: Ligne): Promise<Depense> {
  const u = await utilisateurCourant();

  let categorie = String(corps.categorie ?? "autres");
  if (!CATEGORIES_DEPENSE.includes(categorie)) categorie = "autres";

  const montant = Number(corps.montant ?? 0) || 0;
  if (montant <= 0) throw new ErreurMetier("Le montant doit être supérieur à zéro.");

  const { dernierId } = await executer(
    `INSERT INTO depenses
       (user_id, categorie, autre_categorie, montant, description, date_depense, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      u.id,
      categorie,
      categorie === "autres" ? String(corps.autre_categorie ?? "").trim() || null : null,
      montant,
      String(corps.description ?? "").trim() || null,
      String(corps.date_depense ?? "").trim() || aujourdhui(),
      maintenant(),
    ],
  );

  const l = await premier<Ligne>("SELECT * FROM depenses WHERE id = ?", [dernierId]);
  return presenterDepense(l!);
}

export async function supprimerDepense(id: number): Promise<void> {
  const u = await utilisateurCourant();
  const { lignes } = await executer("DELETE FROM depenses WHERE id = ? AND user_id = ?", [
    id,
    u.id,
  ]);

  if (lignes === 0) throw new ErreurMetier("Dépense introuvable.", 404);
}

/* ──────────────────────────────── Retraits ────────────────────────────── */

/** Rythmes de retrait proposés, du plus court au plus long. */
export const FREQUENCES_RETRAIT = ["1 jour", "7 jours", "15 jours", "30 jours"];

/**
 * Seule fréquence ouverte tant que le registre du commerce n'est pas déclaré.
 *
 * Une boutique non enregistrée ne peut pas accumuler ses encaissements sur une
 * quinzaine ou un mois : elle retire au jour le jour. Renseigner son RCCM dans
 * Paramètres débloque les autres rythmes.
 */
export const FREQUENCE_SANS_REGISTRE = "1 jour";

function sansRegistre(u: Ligne): boolean {
  const rccm = u.registre_commerce;
  return rccm === null || rccm === undefined || String(rccm).trim() === "";
}

async function frequenceCourante(u: Ligne): Promise<string> {
  if (sansRegistre(u)) return FREQUENCE_SANS_REGISTRE;

  const params = await premier<Ligne>("SELECT * FROM user_params WHERE user_id = ?", [u.id]);

  return String(params?.frequence_retrait ?? "7 jours");
}

export async function retraits(): Promise<{
  retraits: Retrait[];
  total: number;
  solde: number;
  frequence: string;
  frequences_autorisees: string[];
  registre_commerce_manquant: boolean;
  frequence_imposee: string | null;
}> {
  const u = await utilisateurCourant();
  const manquant = sansRegistre(u);

  const lignes = await tous<Ligne>(
    "SELECT * FROM retraits WHERE user_id = ? ORDER BY date_retrait DESC",
    [u.id],
  );

  return {
    retraits: lignes.map(presenterRetrait),
    total: await somme("SELECT SUM(montant) AS total FROM retraits WHERE user_id = ?", [u.id]),
    solde: await calculerSolde(Number(u.id)),
    frequence: await frequenceCourante(u),
    frequences_autorisees: manquant ? [FREQUENCE_SANS_REGISTRE] : FREQUENCES_RETRAIT,
    registre_commerce_manquant: manquant,
    frequence_imposee: manquant ? FREQUENCE_SANS_REGISTRE : null,
  };
}

export async function creerRetrait(corps: Ligne): Promise<{ retrait: Retrait; solde: number }> {
  const u = await utilisateurCourant();

  const montant = Number(corps.montant ?? 0) || 0;
  if (montant <= 0) throw new ErreurMetier("Le montant doit être supérieur à zéro.");

  // Le contrôle s'appuie sur le solde recalculé, jamais sur une valeur stockée.
  const solde = await calculerSolde(Number(u.id));
  if (montant > solde) {
    throw new ErreurMetier(
      `Solde insuffisant : vous disposez de ${Math.round(solde)} FCFA.`,
    );
  }

  // La règle du registre du commerce est appliquée ici, et pas seulement à
  // l'affichage : c'est le seul endroit par lequel un retrait passe.
  const demandee = String(corps.frequence ?? "").trim();
  let frequence: string;

  if (sansRegistre(u)) {
    if (demandee !== "" && demandee !== FREQUENCE_SANS_REGISTRE) {
      throw new ErreurMetier(
        `Sans registre du commerce enregistré, seuls les retraits « ${FREQUENCE_SANS_REGISTRE} » sont possibles. Renseignez votre RCCM dans Paramètres pour débloquer les autres rythmes.`,
      );
    }
    frequence = FREQUENCE_SANS_REGISTRE;
  } else if (demandee === "") {
    frequence = await frequenceCourante(u);
  } else if (!FREQUENCES_RETRAIT.includes(demandee)) {
    throw new ErreurMetier("Fréquence de retrait inconnue.");
  } else {
    frequence = demandee;
  }

  const { dernierId } = await executer(
    "INSERT INTO retraits (user_id, montant, frequence, date_retrait) VALUES (?, ?, ?, ?)",
    [u.id, montant, frequence, maintenant()],
  );

  const l = await premier<Ligne>("SELECT * FROM retraits WHERE id = ?", [dernierId]);

  return { retrait: presenterRetrait(l!), solde: await calculerSolde(Number(u.id)) };
}

/* ────────────────────────────── Notifications ─────────────────────────── */

/** Création interne — appelée par les modules métier. */
export async function notifier(
  userId: number,
  type: string,
  titre: string,
  message: string,
  lien: string | null = null,
): Promise<void> {
  await executer(
    "INSERT INTO notifications (user_id, type, titre, message, lien, lu, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
    [userId, type, titre, message, lien, maintenant()],
  );
}

export async function notifications(): Promise<{
  notifications: NotificationItem[];
  non_lues: number;
}> {
  const u = await utilisateurCourant();

  const lignes = await tous<Ligne>(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
    [u.id],
  );

  return {
    notifications: lignes.map(presenterNotification),
    non_lues: await somme(
      "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND lu = 0",
      [u.id],
    ),
  };
}

export async function nonLues(): Promise<{ non_lues: number }> {
  const u = await utilisateurCourant();

  return {
    non_lues: await somme(
      "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND lu = 0",
      [u.id],
    ),
  };
}

export async function marquerLue(id: number): Promise<void> {
  const u = await utilisateurCourant();
  await executer("UPDATE notifications SET lu = 1 WHERE id = ? AND user_id = ?", [id, u.id]);
}

export async function toutMarquerLu(): Promise<void> {
  const u = await utilisateurCourant();
  await executer("UPDATE notifications SET lu = 1 WHERE user_id = ?", [u.id]);
}

export async function supprimerNotification(id: number): Promise<void> {
  const u = await utilisateurCourant();
  await executer("DELETE FROM notifications WHERE id = ? AND user_id = ?", [id, u.id]);
}

export async function supprimerLues(): Promise<void> {
  const u = await utilisateurCourant();
  await executer("DELETE FROM notifications WHERE user_id = ? AND lu = 1", [u.id]);
}

export async function supprimerToutes(): Promise<void> {
  const u = await utilisateurCourant();
  await executer("DELETE FROM notifications WHERE user_id = ?", [u.id]);
}

/* ──────────────────────────────── Paiements ───────────────────────────── */

/**
 * Configuration des passerelles.
 *
 * Les clés publiques vivaient dans le .env du serveur. Hors ligne, il n'y a pas
 * de serveur pour les fournir : on renvoie des clés vides et le mode bac à
 * sable. L'écran de paiement le signale à l'utilisateur.
 */
export function configPaiements() {
  return {
    kkiapay: { cle_publique: "", sandbox: true },
    fedapay: { cle_publique: "", sandbox: true },
  };
}

/**
 * Confirmation d'un paiement.
 *
 * Sur le serveur, cette route revérifiait la transaction auprès de la
 * passerelle avec la clé privée avant d'imputer quoi que ce soit. Hors ligne,
 * cette vérification est **impossible** : il n'y a ni clé privée ni interlocuteur.
 * L'application autonome ne peut donc pas encaisser réellement — elle le dit
 * plutôt que de faire croire à un règlement.
 */
export function confirmerPaiement() {
  return {
    statut: "echec",
    message:
      "Le paiement mobile money exige une vérification auprès de la passerelle, impossible hors ligne. Enregistrez le règlement en espèces.",
  };
}
