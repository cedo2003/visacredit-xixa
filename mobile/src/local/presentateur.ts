/**
 * Mise en forme des lignes SQLite vers les objets JSON de l'API.
 *
 * Pendant local de App\Service\ApiPresenter. Les formes produites doivent rester
 * strictement identiques à celles du serveur : les 25 écrans les consomment sans
 * savoir d'où elles viennent, et le moindre écart de nom de champ casse un écran
 * sans que TypeScript le voie — les lignes SQLite arrivent non typées.
 */

import { premier, tous } from "./base";
import type {
  Client,
  Commande,
  Creance,
  CreditFournisseur,
  Depense,
  Echeance,
  Negociation,
  Notation,
  NotificationItem,
  Produit,
  Retrait,
  User,
  UserResume,
  Vente,
} from "../lib/types";

/** Ligne brute : SQLite ne connaît que number | string | null. */
export type Ligne = Record<string, any>;

const nb = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));
const txt = (v: unknown): string | null => (v === null || v === undefined ? null : String(v));

/** Les dates sont stockées « YYYY-MM-DD HH:MM:SS » ; le frontend attend de l'ISO. */
function iso(v: unknown): string | null {
  if (!v) return null;
  const s = String(v);
  if (s.includes("T")) return s;
  return s.replace(" ", "T");
}

/** Date seule (échéances, naissance) : conservée telle quelle en Y-m-d. */
function jour(v: unknown): string | null {
  if (!v) return null;
  return String(v).slice(0, 10);
}

export function user(l: Ligne): User {
  const ifu = txt(l.ifu);
  const registre = txt(l.registre_commerce);

  return {
    id: nb(l.id),
    nom: String(l.nom ?? ""),
    prenom: String(l.prenom ?? ""),
    telephone: String(l.telephone ?? ""),
    email: txt(l.email),
    ifu,
    ifu_manquant: ifu === null || ifu.trim() === "",
    registre_commerce: registre,
    registre_commerce_manquant: registre === null || registre.trim() === "",
    date_naissance: jour(l.date_naissance),
    adresse: txt(l.adresse),
    nom_boutique: String(l.nom_boutique ?? ""),
    etatEts: nb(l.etatEts),
    role: nb(l.etatEts) === 1 ? "grossiste" : "detaillant",
    created_at: iso(l.created_at),
  };
}

export function userResume(l: Ligne | null | undefined): UserResume | null {
  if (!l) return null;

  return {
    id: nb(l.id),
    nom_complet: `${l.prenom ?? ""} ${l.nom ?? ""}`.trim(),
    nom_boutique: String(l.nom_boutique ?? ""),
    telephone: String(l.telephone ?? ""),
    role: nb(l.etatEts) === 1 ? "grossiste" : "detaillant",
  };
}

export async function userResumeParId(id: unknown): Promise<UserResume | null> {
  if (!id) return null;
  const l = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [id]);
  return userResume(l);
}

export function client(l: Ligne | null | undefined): Client | null {
  if (!l) return null;

  return {
    id: nb(l.id),
    nom_complet: String(l.nom_complet ?? ""),
    telephone: String(l.telephone ?? ""),
    telephone2: txt(l.telephone2),
    date_naissance: jour(l.date_naissance),
    email: txt(l.email),
    adresse: txt(l.adresse),
    notes: txt(l.notes),
    created_at: iso(l.created_at),
  };
}

export function produit(l: Ligne, fournisseur?: UserResume | null): Produit {
  const seuil = l.seuil_alerte === null ? null : nb(l.seuil_alerte);

  const p: Produit = {
    id: nb(l.id),
    nom: String(l.nom ?? ""),
    prix_achat: nb(l.prix_achat),
    prix_vente: nb(l.prix_vente),
    stock: nb(l.stock),
    seuil_alerte: seuil,
    stock_faible: nb(l.stock) <= nb(l.seuil_alerte),
    description: txt(l.description),
    categorie: l.categorie_id ? { id: nb(l.categorie_id), nom: String(l.categorie_nom ?? "") } : null,
    created_at: iso(l.created_at),
  };

  if (fournisseur !== undefined) p.fournisseur = fournisseur;

  return p;
}

export async function vente(l: Ligne, avecDetails = false): Promise<Vente> {
  const montantTotal = nb(l.montant_total);
  const montantPaye = nb(l.montant_paye);

  const v: Vente = {
    id: nb(l.id),
    numero_facture: String(l.numero_facture ?? ""),
    montant_total: montantTotal,
    montant_paye: montantPaye,
    reste: Math.max(0, Math.round((montantTotal - montantPaye) * 100) / 100),
    statut: String(l.statut ?? ""),
    statut_paiement: String(l.statut_paiement ?? ""),
    mode_paiement: String(l.mode_paiement ?? ""),
    telephone_client: txt(l.telephone_client),
    frais_client: nb(l.frais_client),
    frais_vendeur: nb(l.frais_vendeur),
    date_vente: iso(l.date_vente),
    client: null,
  };

  if (l.client_id) {
    v.client = client(await premier<Ligne>("SELECT * FROM clients WHERE id = ?", [l.client_id]));
  }

  if (avecDetails) {
    const lignes = await tous<Ligne>(
      `SELECT d.*, p.nom AS produit_nom
         FROM vente_details d
         LEFT JOIN produits p ON p.id = d.produit_id
        WHERE d.vente_id = ?`,
      [l.id],
    );

    v.lignes = lignes.map((d) => ({
      id: nb(d.id),
      produit_id: d.produit_id === null ? null : nb(d.produit_id),
      produit_nom: String(d.produit_nom ?? "Produit supprimé"),
      quantite: nb(d.quantite),
      prix_unitaire: nb(d.prix_unitaire),
      sous_total: nb(d.quantite) * nb(d.prix_unitaire),
    }));
  }

  return v;
}

export async function creance(l: Ligne): Promise<Creance> {
  const limite = jour(l.date_limite);
  const statut = String(l.statut ?? "en_cours");

  return {
    id: nb(l.id),
    montant_restant: nb(l.montant_restant),
    date_limite: limite,
    statut,
    en_retard: statut !== "payee" && !!limite && limite < new Date().toISOString().slice(0, 10),
    numero_echeance: nb(l.numero_echeance),
    nb_echeances_total: nb(l.nb_echeances_total),
    created_at: iso(l.created_at),
    client: l.client_id
      ? client(await premier<Ligne>("SELECT * FROM clients WHERE id = ?", [l.client_id]))
      : null,
    vente: l.vente_id
      ? await (async () => {
          const v = await premier<Ligne>("SELECT * FROM ventes WHERE id = ?", [l.vente_id]);
          return v
            ? {
                id: nb(v.id),
                numero_facture: String(v.numero_facture ?? ""),
                montant_total: nb(v.montant_total),
              }
            : null;
        })()
      : null,
  };
}

export function depense(l: Ligne): Depense {
  return {
    id: nb(l.id),
    categorie: String(l.categorie ?? ""),
    autre_categorie: txt(l.autre_categorie),
    montant: nb(l.montant),
    description: txt(l.description),
    date_depense: jour(l.date_depense),
    created_at: iso(l.created_at),
  };
}

export function retrait(l: Ligne): Retrait {
  return {
    id: nb(l.id),
    montant: nb(l.montant),
    frequence: txt(l.frequence),
    date_retrait: iso(l.date_retrait),
  };
}

export function echeance(l: Ligne): Echeance {
  return {
    id: nb(l.id),
    montant: nb(l.montant),
    date_limite: jour(l.date_limite),
    numero_echeance: nb(l.numero_echeance),
    nb_echeances_total: nb(l.nb_echeances_total),
    statut: String(l.statut ?? "en_cours"),
    date_paiement: iso(l.date_paiement),
  };
}

export async function commande(l: Ligne, avecDetails = false): Promise<Commande> {
  const total = nb(l.montant_total);
  const paye = nb(l.montant_paye);

  const c: Commande = {
    id: nb(l.id),
    numero_commande: String(l.numero_commande ?? ""),
    montant_total: total,
    montant_paye: paye,
    reste: Math.max(0, Math.round((total - paye) * 100) / 100),
    statut: String(l.statut ?? "en_attente"),
    mode_paiement: (l.mode_paiement === "credit" ? "credit" : "comptant") as "comptant" | "credit",
    recu_par_detaillant: nb(l.recu_par_detaillant) === 1,
    fournisseur_nom: txt(l.fournisseur_nom),
    fournisseur_telephone: String(l.fournisseur_telephone ?? ""),
    fournisseur_sur_plateforme: !!l.user_id_grossiste,
    detaillant: await userResumeParId(l.user_id_detaillant),
    grossiste: await userResumeParId(l.user_id_grossiste),
    date_commande: iso(l.date_commande),
    date_validation: iso(l.date_validation),
    date_livraison: iso(l.date_livraison),
    date_reception: iso(l.date_reception),
    date_paiement: iso(l.date_paiement),
    notes: txt(l.notes),
  };

  if (avecDetails) {
    const lignes = await tous<Ligne>(
      "SELECT * FROM commande_details WHERE commande_id = ?",
      [l.id],
    );

    c.lignes = lignes.map((d) => ({
      id: nb(d.id),
      produit_nom: String(d.produit_nom ?? ""),
      quantite: nb(d.quantite),
      prix_unitaire: nb(d.prix_unitaire),
      montant: nb(d.quantite) * nb(d.prix_unitaire),
    }));

    const ech = await tous<Ligne>(
      "SELECT * FROM commande_echeances WHERE commande_id = ? ORDER BY numero_echeance",
      [l.id],
    );
    c.echeances = ech.map(echeance);

    const negos = await tous<Ligne>(
      "SELECT * FROM commande_negociations WHERE commande_id = ? ORDER BY id",
      [l.id],
    );

    c.negociations = await Promise.all(negos.map(negociation));
    c.negociation_en_attente =
      c.negociations.find((n) => n.statut === "en_attente") ?? null;
  }

  return c;
}

export async function negociation(l: Ligne): Promise<Negociation> {
  const initial = nb(l.montant_initial);
  const propose = nb(l.montant_propose);

  return {
    id: nb(l.id),
    montant_propose: propose,
    montant_initial: initial,
    ecart: Math.round((propose - initial) * 100) / 100,
    ecart_pourcent:
      initial > 0 ? Math.round(((propose - initial) / initial) * 1000) / 10 : 0,
    message: txt(l.message),
    statut: String(l.statut ?? "en_attente") as Negociation["statut"],
    role_auteur: l.role_auteur === "grossiste" ? "grossiste" : "detaillant",
    auteur: await userResumeParId(l.user_id),
    created_at: iso(l.created_at),
    repondu_at: iso(l.repondu_at),
  };
}

export async function approvisionnement(
  l: Ligne,
  origineCommande: string | null = null,
): Promise<CreditFournisseur> {
  return {
    id: nb(l.id),
    produit_nom: String(l.produit_nom ?? "Crédit groupé"),
    produit_id: l.produit_id === null ? null : nb(l.produit_id),
    quantite: nb(l.quantite),
    prix_achat: nb(l.prix_achat),
    montant_total: nb(l.montant_total),
    mode_paiement: String(l.mode_paiement ?? ""),
    statut: String(l.statut ?? ""),
    moyen_reglement: (txt(l.moyen_reglement) as CreditFournisseur["moyen_reglement"]) ?? null,
    notes: txt(l.notes),
    fournisseur_nom: txt(l.fournisseur_nom),
    fournisseur_telephone: txt(l.fournisseur_telephone),
    date_appro: iso(l.date_appro),
    acheteur: await userResumeParId(l.user_id),
    origine_commande: origineCommande,
  };
}

export async function notationFournisseur(l: Ligne): Promise<Notation> {
  return {
    id: nb(l.id),
    note: nb(l.note),
    commentaire: txt(l.commentaire),
    created_at: iso(l.created_at),
    type: "fournisseur",
    auteur: await userResumeParId(l.user_id_detaillant),
    cible: await userResumeParId(l.user_id_grossiste),
    commande: await commandeResume(l.commande_id),
  };
}

export async function notationClient(l: Ligne): Promise<Notation> {
  return {
    id: nb(l.id),
    note: nb(l.note),
    commentaire: txt(l.commentaire),
    created_at: iso(l.created_at),
    type: "client",
    auteur: await userResumeParId(l.user_id_grossiste),
    cible: await userResumeParId(l.user_id_detaillant),
    commande: await commandeResume(l.commande_id),
  };
}

async function commandeResume(id: unknown) {
  if (!id) return null;
  const c = await premier<Ligne>("SELECT id, numero_commande FROM commandes WHERE id = ?", [id]);
  return c ? { id: nb(c.id), numero_commande: String(c.numero_commande ?? "") } : null;
}

export function notification(l: Ligne): NotificationItem {
  return {
    id: nb(l.id),
    type: String(l.type ?? ""),
    titre: String(l.titre ?? ""),
    message: String(l.message ?? ""),
    lien: txt(l.lien),
    lu: nb(l.lu) === 1,
    created_at: iso(l.created_at),
  };
}

/** Horodatage au format de stockage (identique à MySQL DATETIME). */
export function maintenant(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

/** Date du jour, en heure locale. */
export function aujourdhui(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}
