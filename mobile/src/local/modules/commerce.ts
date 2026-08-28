/**
 * Clients, ventes et créances — pendants locaux de ClientController,
 * VenteService et CreanceService.
 */

import { ErreurMetier, executer, premier, somme, tous, transaction } from "../base";
import {
  aujourdhui,
  client as presenterClient,
  creance as presenterCreance,
  maintenant,
  vente as presenterVente,
  type Ligne,
} from "../presentateur";
import { utilisateurCourant } from "./auth";
import type { Client, Creance, IntentionPaiement, Vente } from "../../lib/types";

/* ──────────────────────────────── Clients ─────────────────────────────── */

export async function clients(recherche?: string): Promise<Client[]> {
  const u = await utilisateurCourant();

  const lignes = recherche
    ? await tous<Ligne>(
        `SELECT * FROM clients
          WHERE user_id = ? AND (nom_complet LIKE ? OR telephone LIKE ?)
          ORDER BY nom_complet`,
        [u.id, `%${recherche}%`, `%${recherche}%`],
      )
    : await tous<Ligne>("SELECT * FROM clients WHERE user_id = ? ORDER BY nom_complet", [u.id]);

  return lignes.map((l) => presenterClient(l)!);
}

export async function client(id: number): Promise<Client> {
  const u = await utilisateurCourant();
  const l = await premier<Ligne>("SELECT * FROM clients WHERE id = ? AND user_id = ?", [id, u.id]);

  if (!l) throw new ErreurMetier("Client introuvable.", 404);

  return presenterClient(l)!;
}

/**
 * Contrôle des champs communs à la création et à la modification d'un client.
 *
 * Le second numéro doit être différent du premier — le saisir deux fois n'ajoute
 * rien et fait croire à une ligne de secours. La date de naissance, elle, n'a
 * pas d'âge minimum, à la différence du profil de la boutique : rien n'empêche
 * de vendre à un mineur.
 */
function champsClient(corps: Ligne, telephone: string) {
  const telephone2 = String(corps.telephone2 ?? "").trim();

  if (
    telephone2 !== "" &&
    telephone2.replace(/\D/g, "") === telephone.replace(/\D/g, "")
  ) {
    throw new ErreurMetier("Le second numéro doit être différent du premier.");
  }

  const naissance = String(corps.date_naissance ?? "").trim();

  if (naissance !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(naissance)) {
      throw new ErreurMetier("Date de naissance invalide (format attendu : AAAA-MM-JJ).");
    }
    if (naissance > aujourdhui()) {
      throw new ErreurMetier("Date de naissance invalide.");
    }
  }

  return {
    telephone2: telephone2 || null,
    dateNaissance: naissance || null,
    email: String(corps.email ?? "").trim() || null,
    adresse: String(corps.adresse ?? "").trim() || null,
    notes: String(corps.notes ?? "").trim() || null,
  };
}

export async function creerClient(corps: Ligne): Promise<Client> {
  const u = await utilisateurCourant();

  const nomComplet = String(corps.nom_complet ?? "").trim();
  const telephone = String(corps.telephone ?? "").trim();

  if (nomComplet === "" || telephone === "") {
    throw new ErreurMetier("Le nom et le téléphone du client sont obligatoires.");
  }

  const champs = champsClient(corps, telephone);

  const { dernierId } = await executer(
    `INSERT INTO clients
       (user_id, nom_complet, telephone, telephone2, date_naissance, email, adresse, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      u.id,
      nomComplet,
      telephone,
      champs.telephone2,
      champs.dateNaissance,
      champs.email,
      champs.adresse,
      champs.notes,
      maintenant(),
    ],
  );

  return client(dernierId);
}

export async function modifierClient(id: number, corps: Ligne): Promise<Client> {
  await client(id); // valide l'appartenance

  const nomComplet = String(corps.nom_complet ?? "").trim();
  const telephone = String(corps.telephone ?? "").trim();

  if (nomComplet === "" || telephone === "") {
    throw new ErreurMetier("Le nom et le téléphone du client sont obligatoires.");
  }

  const champs = champsClient(corps, telephone);

  await executer(
    `UPDATE clients
        SET nom_complet = ?, telephone = ?, telephone2 = ?, date_naissance = ?,
            email = ?, adresse = ?, notes = ?
      WHERE id = ?`,
    [
      nomComplet,
      telephone,
      champs.telephone2,
      champs.dateNaissance,
      champs.email,
      champs.adresse,
      champs.notes,
      id,
    ],
  );

  return client(id);
}

export async function supprimerClient(id: number): Promise<void> {
  const u = await utilisateurCourant();
  const { lignes } = await executer("DELETE FROM clients WHERE id = ? AND user_id = ?", [id, u.id]);

  if (lignes === 0) throw new ErreurMetier("Client introuvable.", 404);
}

/* ───────────────────────────────── Ventes ─────────────────────────────── */

/** Frais de passerelle — reprend FraisPaiementService. */
const TAUX_KKIAPAY = 0.019;
const TAUX_FEDAPAY = 0.018;

/**
 * Part des frais à la charge du vendeur, en pourcentage.
 *
 * Les trois raccourcis historiques ne sont que des pourcentages particuliers ;
 * « personnalise:NN » porte sa valeur dans la chaîne elle-même, comme côté
 * serveur, pour qu'une seule donnée circule.
 */
function partVendeur(repartition: string): number {
  if (repartition.startsWith("personnalise:")) {
    const part = Number(repartition.slice("personnalise:".length));
    return Number.isFinite(part) ? Math.max(0, Math.min(100, Math.round(part))) : 0;
  }

  if (repartition === "vendeur") return 100;
  if (repartition === "50_50") return 50;

  return 0;
}

function calculerFrais(montant: number, repartition: string, taux: number) {
  if (montant <= 0) {
    return { fraisClient: 0, fraisVendeur: 0, montantEnvoye: 0 };
  }

  const part = partVendeur(repartition);
  const fraisTotal = Math.ceil(montant * taux);
  // Le franc indivisible va au client, comme sur le serveur.
  const fraisClient = Math.ceil((fraisTotal * (100 - part)) / 100);
  const fraisVendeur = fraisTotal - fraisClient;

  return { fraisClient, fraisVendeur, montantEnvoye: montant - fraisVendeur };
}

/** Numéro de facture : BOU-YYYYMMDD-NNN, compteur journalier par boutique. */
async function numeroFacture(userId: number): Promise<string> {
  const jour = aujourdhui();
  const n = await somme(
    "SELECT COUNT(*) AS total FROM ventes WHERE user_id = ? AND date_vente >= ?",
    [userId, `${jour} 00:00:00`],
  );

  return `BOU-${jour.replace(/-/g, "")}-${String(n + 1).padStart(3, "0")}`;
}

export async function ventes(): Promise<Vente[]> {
  const u = await utilisateurCourant();
  const lignes = await tous<Ligne>(
    "SELECT * FROM ventes WHERE user_id = ? ORDER BY date_vente DESC",
    [u.id],
  );

  return Promise.all(lignes.map((l) => presenterVente(l)));
}

export async function vente(id: number) {
  const u = await utilisateurCourant();
  const l = await premier<Ligne>("SELECT * FROM ventes WHERE id = ? AND user_id = ?", [id, u.id]);

  if (!l) throw new ErreurMetier("Vente introuvable.", 404);

  const echeances = await tous<Ligne>(
    "SELECT * FROM creances WHERE vente_id = ? ORDER BY numero_echeance",
    [id],
  );

  const { user } = await import("../presentateur");

  return {
    vente: await presenterVente(l, true),
    echeances: await Promise.all(echeances.map(presenterCreance)),
    vendeur: user(u),
  };
}

/**
 * Enregistrement d'une vente — port de VenteService::creer.
 *
 * Tout se joue en une transaction : contrôle du stock, décrément, lignes de
 * vente et échéancier. Une vente à moitié écrite fausserait le stock ou
 * laisserait un reste à payer sans créance en face.
 */
export async function creerVente(
  corps: Ligne,
): Promise<{ vente: Vente; paiement: IntentionPaiement | null }> {
  const u = await utilisateurCourant();

  const modePaiement = String(corps.mode_paiement ?? "especes");
  const montantPaye = Number(corps.montant_paye ?? 0) || 0;
  const telephoneClient = String(corps.telephone_client ?? "").trim();
  const fedapayIdentifiant = String(corps.fedapay_identifiant ?? "").trim();
  const repartition = String(corps.repartition_frais ?? "client");
  const lignesSaisies = Array.isArray(corps.lignes) ? (corps.lignes as Ligne[]) : [];

  if (lignesSaisies.length === 0) throw new ErreurMetier("Aucun produit valide ajouté.");

  if (modePaiement === "mobile_money" && montantPaye > 0 && telephoneClient.length < 8) {
    throw new ErreurMetier("Numéro Mobile Money invalide.");
  }
  if (modePaiement === "fedapay" && montantPaye > 0 && fedapayIdentifiant === "") {
    throw new ErreurMetier("Identifiant de l'agrégateur (téléphone/email) invalide.");
  }

  // ── Contrôle du stock et calcul du total ────────────────────────────────
  let total = 0;
  const preparees: { produit: Ligne; quantite: number }[] = [];

  for (const ligne of lignesSaisies) {
    const produitId = Number(ligne.produit_id ?? 0);
    const quantite = Math.max(1, Number(ligne.quantite ?? 1));
    if (produitId <= 0) continue;

    const p = await premier<Ligne>("SELECT * FROM produits WHERE id = ? AND user_id = ?", [
      produitId,
      u.id,
    ]);
    if (!p) throw new ErreurMetier("Produit introuvable.");

    if (Number(p.stock) < quantite) {
      throw new ErreurMetier(
        `Stock insuffisant pour « ${p.nom} » (stock disponible : ${p.stock}).`,
      );
    }

    total += quantite * Number(p.prix_vente);
    preparees.push({ produit: p, quantite });
  }

  if (preparees.length === 0) throw new ErreurMetier("Aucun produit valide ajouté.");
  if (montantPaye > total) throw new ErreurMetier("Le montant payé dépasse le total de la vente.");

  const reste = Math.round((total - montantPaye) * 100) / 100;

  // ── Frais de passerelle ─────────────────────────────────────────────────
  let fraisClient = 0;
  let fraisVendeur = 0;
  let montantEnvoye = montantPaye;

  if (modePaiement === "mobile_money" && montantPaye > 0) {
    const c = calculerFrais(montantPaye, repartition, TAUX_KKIAPAY);
    fraisClient = c.fraisClient;
    fraisVendeur = c.fraisVendeur;
    montantEnvoye = c.montantEnvoye;
  } else if (modePaiement === "fedapay" && montantPaye > 0) {
    const c = calculerFrais(montantPaye, repartition, TAUX_FEDAPAY);
    fraisClient = c.fraisClient;
    fraisVendeur = c.fraisVendeur;
    montantEnvoye = c.montantEnvoye;
  }

  const parPasserelle = ["mobile_money", "fedapay"].includes(modePaiement) && montantPaye > 0;

  let clientId: number | null = null;
  if (corps.client_id) {
    const c = await premier<Ligne>("SELECT id FROM clients WHERE id = ? AND user_id = ?", [
      corps.client_id,
      u.id,
    ]);
    if (!c) throw new ErreurMetier("Client introuvable.");
    clientId = Number(c.id);
  }

  // ── Échéancier : validé avant d'écrire quoi que ce soit ─────────────────
  const echeancesSaisies = Array.isArray(corps.echeances) ? (corps.echeances as Ligne[]) : [];
  const echeancesValides: { montant: number; date: string }[] = [];

  if (reste > 0) {
    let sommeEcheances = 0;

    const jourCourant = aujourdhui();

    for (const e of echeancesSaisies) {
      const montant = Number(e.montant ?? 0) || 0;
      const date = String(e.date_limite ?? "").trim();
      if (montant <= 0 || date === "") continue;

      // Une échéance planifie un paiement à venir : une date déjà passée
      // ferait naître la vente avec une créance en retard le jour même.
      if (date < jourCourant) {
        throw new ErreurMetier(
          `La date d'échéance du ${date} est déjà passée : planifiez un paiement à venir.`,
        );
      }

      echeancesValides.push({ montant, date });
      sommeEcheances += montant;
    }

    if (echeancesValides.length === 0) {
      throw new ErreurMetier("Aucune échéance valide n'a été fournie pour le reste à payer.");
    }
    if (Math.abs(sommeEcheances - reste) > 1) {
      throw new ErreurMetier(
        `La somme des échéances (${Math.round(sommeEcheances)} FCFA) ne correspond pas au reste à payer (${Math.round(reste)} FCFA).`,
      );
    }
  }

  const numero = await numeroFacture(Number(u.id));

  const venteId = await transaction(async () => {
    const { dernierId } = await executer(
      `INSERT INTO ventes
         (user_id, client_id, numero_facture, montant_total, montant_paye, statut,
          date_vente, mode_paiement, telephone_client, statut_paiement,
          frais_client, frais_vendeur, fedapay_identifiant)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.id,
        clientId,
        numero,
        total,
        montantPaye,
        reste <= 0 ? "solde" : "creance",
        maintenant(),
        modePaiement,
        telephoneClient || null,
        parPasserelle ? "en_attente" : "paye",
        fraisClient,
        fraisVendeur,
        fedapayIdentifiant || null,
      ],
    );

    for (const p of preparees) {
      await executer(
        "INSERT INTO vente_details (vente_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)",
        [dernierId, p.produit.id, p.quantite, p.produit.prix_vente],
      );
      await executer("UPDATE produits SET stock = stock - ? WHERE id = ?", [
        p.quantite,
        p.produit.id,
      ]);
    }

    for (let i = 0; i < echeancesValides.length; i++) {
      const e = echeancesValides[i];
      await executer(
        `INSERT INTO creances
           (vente_id, user_id, client_id, montant_restant, date_limite, statut,
            created_at, numero_echeance, nb_echeances_total)
         VALUES (?, ?, ?, ?, ?, 'en_cours', ?, ?, ?)`,
        [
          dernierId,
          u.id,
          clientId,
          e.montant,
          e.date,
          maintenant(),
          i + 1,
          echeancesValides.length,
        ],
      );
    }

    return dernierId;
  });

  const ligneVente = await premier<Ligne>("SELECT * FROM ventes WHERE id = ?", [venteId]);

  const paiement: IntentionPaiement | null = parPasserelle
    ? {
        reference: `VENTE-${venteId}-${Date.now().toString(36)}`,
        passerelle: modePaiement === "mobile_money" ? "kkiapay" : "fedapay",
        montant_widget: montantEnvoye,
        telephone: telephoneClient || null,
        identifiant: fedapayIdentifiant || null,
        description: `Facture ${numero}`,
      }
    : null;

  return { vente: await presenterVente(ligneVente!, true), paiement };
}

/* ──────────────────────────────── Créances ────────────────────────────── */

export async function creances(): Promise<{
  creances: Creance[];
  total_en_cours: number;
  montant_en_cours: number;
}> {
  const u = await utilisateurCourant();

  const lignes = await tous<Ligne>(
    `SELECT * FROM creances WHERE user_id = ?
      ORDER BY CASE statut WHEN 'payee' THEN 1 ELSE 0 END, date_limite`,
    [u.id],
  );

  const liste = await Promise.all(lignes.map(presenterCreance));
  const enCours = liste.filter((c) => c.statut !== "payee");

  return {
    creances: liste,
    total_en_cours: enCours.length,
    montant_en_cours: enCours.reduce((s, c) => s + c.montant_restant, 0),
  };
}

/**
 * Encaissement d'une créance — port de CreanceService.
 *
 * Le règlement s'impute sur l'échéance, remonte sur la vente, et solde la
 * créance quand le restant tombe à zéro.
 */
export async function payerCreance(
  id: number,
  corps: Ligne,
): Promise<{ paiement: IntentionPaiement | null; creance: Creance }> {
  const u = await utilisateurCourant();

  const ligne = await premier<Ligne>("SELECT * FROM creances WHERE id = ? AND user_id = ?", [
    id,
    u.id,
  ]);
  if (!ligne) throw new ErreurMetier("Créance introuvable.", 404);
  if (String(ligne.statut) === "payee") throw new ErreurMetier("Cette créance est déjà soldée.");

  const montant = Number(corps.montant ?? 0) || 0;
  const restant = Number(ligne.montant_restant);

  if (montant <= 0) throw new ErreurMetier("Le montant doit être supérieur à zéro.");
  if (montant > restant + 1) {
    throw new ErreurMetier(`Le montant dépasse le restant dû (${Math.round(restant)} FCFA).`);
  }

  const mode = String(corps.mode_paiement ?? "espece");
  const parPasserelle = ["mobile_money", "fedapay"].includes(mode);

  await transaction(async () => {
    const nouveauRestant = Math.max(0, Math.round((restant - montant) * 100) / 100);

    await executer("UPDATE creances SET montant_restant = ?, statut = ? WHERE id = ?", [
      nouveauRestant,
      nouveauRestant <= 0 ? "payee" : "en_cours",
      id,
    ]);

    await executer(
      `INSERT INTO creance_paiements
         (creance_id, montant, date_paiement, mode_paiement, repartition_frais)
       VALUES (?, ?, ?, ?, ?)`,
      [id, montant, maintenant(), mode, String(corps.repartition_frais ?? "client")],
    );

    // Le règlement entre en caisse : la vente d'origine est créditée.
    await executer("UPDATE ventes SET montant_paye = montant_paye + ? WHERE id = ?", [
      montant,
      ligne.vente_id,
    ]);

    const resteVente = await premier<Ligne>(
      "SELECT montant_total, montant_paye FROM ventes WHERE id = ?",
      [ligne.vente_id],
    );

    if (resteVente && Number(resteVente.montant_paye) >= Number(resteVente.montant_total)) {
      await executer("UPDATE ventes SET statut = 'solde' WHERE id = ?", [ligne.vente_id]);
    }
  });

  const misAJour = await premier<Ligne>("SELECT * FROM creances WHERE id = ?", [id]);

  const paiement: IntentionPaiement | null = parPasserelle
    ? {
        reference: `CREANCE-${id}-${Date.now().toString(36)}`,
        passerelle: mode === "mobile_money" ? "kkiapay" : "fedapay",
        montant_widget: montant,
        telephone: String(corps.telephone ?? "") || null,
        identifiant: String(corps.fedapay_identifiant ?? "") || null,
        description: `Règlement de créance`,
      }
    : null;

  return { paiement, creance: await presenterCreance(misAJour!) };
}
