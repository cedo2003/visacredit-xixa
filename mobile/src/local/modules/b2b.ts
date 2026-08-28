/**
 * Commandes B2B, crédits fournisseurs et notations — pendants locaux de
 * CommandeService, CreditFournisseurService et NotationController.
 *
 * Particularité de la version autonome : les deux rôles cohabitent dans la même
 * base, sur le même appareil. Une commande passée par le compte détaillant est
 * donc réellement visible par le compte grossiste, à condition de changer de
 * compte — c'est ce qui permet de dérouler tout le cycle sans serveur.
 */

import { ErreurMetier, executer, premier, tous, transaction } from "../base";
import {
  approvisionnement as presenterAppro,
  aujourdhui,
  commande as presenterCommande,
  echeance as presenterEcheance,
  maintenant,
  notationClient as presenterNotationClient,
  notationFournisseur as presenterNotationFournisseur,
  userResume,
  type Ligne,
} from "../presentateur";
import { exigerDetaillant, exigerGrossiste, utilisateurCourant } from "./auth";
import { calculerSolde } from "./solde";
import { notifier } from "./divers";
import type {
  ActionCommande,
  Commande,
  CreditFournisseur,
  IntentionPaiement,
  MoyenneNotation,
  Notation,
  VerificationFournisseur,
} from "../../lib/types";

/** Marge appliquée d'office à un produit entrant en stock sans prix de vente. */
const MARGE_PAR_DEFAUT = 1.2;
const SEUIL_ALERTE_AUTO = 5;

/* ─────────────────────────────── Fournisseur ──────────────────────────── */

export async function verifierFournisseur(telephone: string): Promise<VerificationFournisseur> {
  const tel = String(telephone ?? "").replace(/[^0-9]/g, "");

  if (tel.length < 8) {
    return { trouve: false, id: null, nom_boutique: "", telephone: tel };
  }

  const g = await premier<Ligne>(
    "SELECT * FROM users WHERE telephone = ? AND etatEts = 1",
    [tel],
  );

  return g
    ? { trouve: true, id: Number(g.id), nom_boutique: String(g.nom_boutique), telephone: tel }
    : { trouve: false, id: null, nom_boutique: "", telephone: tel };
}

/* ──────────────────────────────── Commandes ───────────────────────────── */

export async function listeCommandes() {
  const u = await utilisateurCourant();
  const estGrossiste = Number(u.etatEts) === 1;
  const colonne = estGrossiste ? "user_id_grossiste" : "user_id_detaillant";

  const lignes = await tous<Ligne>(
    `SELECT * FROM commandes WHERE ${colonne} = ? ORDER BY date_commande DESC`,
    [u.id],
  );

  const stats: Record<string, number> = {};
  for (const l of lignes) {
    const s = String(l.statut);
    stats[s] = (stats[s] ?? 0) + 1;
  }

  return {
    commandes: await Promise.all(lignes.map((l) => presenterCommande(l))),
    stats,
    role: estGrossiste ? "grossiste" : "detaillant",
  };
}

/** Charge une commande en vérifiant qu'elle concerne bien l'utilisateur. */
async function charger(id: number): Promise<{ ligne: Ligne; u: Ligne }> {
  const u = await utilisateurCourant();
  const ligne = await premier<Ligne>("SELECT * FROM commandes WHERE id = ?", [id]);

  if (!ligne) throw new ErreurMetier("Commande introuvable.", 404);

  const autorise =
    Number(ligne.user_id_detaillant) === Number(u.id) ||
    Number(ligne.user_id_grossiste) === Number(u.id);

  if (!autorise) throw new ErreurMetier("Cette commande ne vous concerne pas.", 403);

  return { ligne, u };
}

/**
 * Ce que l'utilisateur courant peut faire maintenant.
 * Transposition exacte de CommandeController::actionsPossibles.
 */
function actionsPossibles(
  c: Ligne,
  userId: number,
  negociationEnAttente: Ligne | null,
): ActionCommande[] {
  const estGrossiste = Number(c.user_id_grossiste) === userId;
  const estDetaillant = Number(c.user_id_detaillant) === userId;
  const surPlateforme = !!c.user_id_grossiste;
  const statut = String(c.statut);
  const reste = Number(c.montant_total) - Number(c.montant_paye);
  const recu = Number(c.recu_par_detaillant) === 1;

  const actions: ActionCommande[] = [];

  // Marchandage : la main revient toujours à celui qui n'a pas émis la
  // proposition ouverte.
  if (surPlateforme && statut === "en_attente") {
    if (!negociationEnAttente) {
      actions.push("marchander");
    } else if (Number(negociationEnAttente.user_id) !== userId) {
      actions.push("accepter_prix", "refuser_prix", "contre_proposer");
    }
  }

  if (estGrossiste) {
    if (statut === "en_attente") {
      // Une proposition ouverte bloque la validation.
      if (!negociationEnAttente) actions.push("valider");
      actions.push("annuler");
    }
    if (statut === "validee") actions.push("livrer");
    if (["validee", "livree"].includes(statut) && reste > 0) actions.push("demander_paiement");
    if (statut === "en_attente_paiement" && reste > 0) actions.push("encaisser_especes");
  }

  if (estDetaillant) {
    if (statut === "en_attente") {
      actions.push("annuler");
      if (!surPlateforme) actions.push("modifier_echeances");
    }
    if (!recu && (!surPlateforme || statut === "livree")) actions.push("confirmer_reception");
    if (!surPlateforme && recu && reste > 0) actions.push("payer_especes");
    if (recu) actions.push("noter_fournisseur");
  }

  if (estGrossiste && recu) actions.push("noter_client");

  return actions;
}

export async function ficheCommande(id: number): Promise<Commande> {
  const { ligne, u } = await charger(id);

  const c = await presenterCommande(ligne, true);
  c.actions_possibles = actionsPossibles(ligne, Number(u.id), await negociationOuverte(id));
  c.mon_role = Number(ligne.user_id_grossiste) === Number(u.id) ? "grossiste" : "detaillant";

  return c;
}

/* ─────────────────────────────── Marchandage ──────────────────────────── */

/** La proposition de prix encore ouverte, s'il y en a une. */
async function negociationOuverte(commandeId: number): Promise<Ligne | null> {
  return premier<Ligne>(
    "SELECT * FROM commande_negociations WHERE commande_id = ? AND statut = 'en_attente' ORDER BY id DESC LIMIT 1",
    [commandeId],
  );
}

/**
 * Nouvelle proposition de prix — port de CommandeService::proposerPrix.
 *
 * Émettre une proposition ferme la précédente : il n'y a jamais deux prix
 * ouverts en même temps, donc jamais d'ambiguïté sur ce qui est accepté.
 */
export async function proposerPrix(id: number, corps: Ligne): Promise<Commande> {
  const { ligne, u } = await charger(id);

  if (!ligne.user_id_grossiste) {
    throw new ErreurMetier(
      "Ce fournisseur n'est pas sur Visacredit XIXA : négociez le prix directement avec lui, puis saisissez le montant convenu.",
    );
  }
  if (String(ligne.statut) !== "en_attente") {
    throw new ErreurMetier("Le prix ne peut plus être négocié une fois la commande traitée.");
  }

  const montant = Number(corps.montant ?? 0) || 0;
  const actuel = Number(ligne.montant_total);

  if (montant <= 0) {
    throw new ErreurMetier("Le montant proposé doit être supérieur à 0 FCFA.");
  }
  if (Math.abs(montant - actuel) < 0.01) {
    throw new ErreurMetier("Le montant proposé est identique au montant actuel de la commande.");
  }

  const ouverte = await negociationOuverte(id);
  if (ouverte && Number(ouverte.user_id) === Number(u.id)) {
    throw new ErreurMetier("Votre proposition précédente n'a pas encore reçu de réponse.");
  }

  const estGrossiste = Number(ligne.user_id_grossiste) === Number(u.id);

  await transaction(async () => {
    if (ouverte) {
      await executer(
        "UPDATE commande_negociations SET statut = 'contre_proposee', repondu_at = ? WHERE id = ?",
        [maintenant(), ouverte.id],
      );
    }

    await executer(
      `INSERT INTO commande_negociations
         (commande_id, user_id, role_auteur, montant_propose, montant_initial, message, statut, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'en_attente', ?)`,
      [
        id,
        u.id,
        estGrossiste ? "grossiste" : "detaillant",
        montant,
        actuel,
        String(corps.message ?? "").trim() || null,
        maintenant(),
      ],
    );
  });

  const destinataire = estGrossiste ? ligne.user_id_detaillant : ligne.user_id_grossiste;

  if (destinataire) {
    await notifier(
      Number(destinataire),
      "marchandage",
      "Proposition de prix",
      `${u.nom_boutique} propose ${Math.round(montant)} FCFA pour la commande n° ${ligne.numero_commande} (au lieu de ${Math.round(actuel)} FCFA).`,
      `/commandes/${id}`,
    );
  }

  return ficheCommande(id);
}

/**
 * Réponse à la proposition ouverte — port de CommandeService::repondrePrix.
 * Seul celui à qui elle est adressée peut trancher.
 */
export async function repondrePrix(id: number, accepte: boolean): Promise<Commande> {
  const { ligne, u } = await charger(id);
  const ouverte = await negociationOuverte(id);

  if (!ouverte) {
    throw new ErreurMetier("Aucune proposition de prix en attente sur cette commande.");
  }
  if (Number(ouverte.user_id) === Number(u.id)) {
    throw new ErreurMetier("C'est à votre interlocuteur de répondre à votre proposition.");
  }
  if (String(ligne.statut) !== "en_attente") {
    throw new ErreurMetier("Le prix ne peut plus être négocié une fois la commande traitée.");
  }

  await transaction(async () => {
    await executer(
      "UPDATE commande_negociations SET statut = ?, repondu_at = ? WHERE id = ?",
      [accepte ? "acceptee" : "refusee", maintenant(), ouverte.id],
    );

    if (accepte) {
      await appliquerPrixNegocie(ligne, Number(ouverte.montant_propose));
    }
  });

  await notifier(
    Number(ouverte.user_id),
    "marchandage",
    accepte ? "Prix accepté" : "Prix refusé",
    `${u.nom_boutique} a ${accepte ? "accepté" : "refusé"} votre proposition de ${Math.round(Number(ouverte.montant_propose))} FCFA pour la commande n° ${ligne.numero_commande}.`,
    `/commandes/${id}`,
  );

  return ficheCommande(id);
}

/**
 * Reporte le prix convenu sur la commande.
 *
 * Les lignes sont ajustées au prorata — le reçu travaille ligne par ligne, un
 * total remisé sans prix unitaires cohérents donnerait une addition fausse. Le
 * total est ensuite recalculé depuis les lignes arrondies, et l'échéancier suit
 * la même proportion, la dernière échéance absorbant l'écart d'arrondi.
 */
async function appliquerPrixNegocie(commande: Ligne, montantNegocie: number): Promise<void> {
  const ancienTotal = Number(commande.montant_total);
  const id = Number(commande.id);

  if (ancienTotal <= 0) {
    await executer("UPDATE commandes SET montant_total = ? WHERE id = ?", [montantNegocie, id]);
    return;
  }

  const ratio = montantNegocie / ancienTotal;
  const details = await tous<Ligne>("SELECT * FROM commande_details WHERE commande_id = ?", [id]);

  let nouveauTotal = 0;

  for (const d of details) {
    const prix = Math.round(Number(d.prix_unitaire) * ratio * 100) / 100;
    await executer("UPDATE commande_details SET prix_unitaire = ? WHERE id = ?", [prix, d.id]);
    nouveauTotal += Number(d.quantite) * prix;
  }

  nouveauTotal = Math.round(nouveauTotal * 100) / 100;
  await executer("UPDATE commandes SET montant_total = ? WHERE id = ?", [nouveauTotal, id]);

  const echeances = await tous<Ligne>(
    "SELECT * FROM commande_echeances WHERE commande_id = ? ORDER BY numero_echeance",
    [id],
  );

  let cumul = 0;

  for (let i = 0; i < echeances.length; i++) {
    const montant =
      i === echeances.length - 1
        ? Math.round((nouveauTotal - cumul) * 100) / 100
        : Math.round(Number(echeances[i].montant) * ratio * 100) / 100;

    await executer("UPDATE commande_echeances SET montant = ? WHERE id = ?", [
      Math.max(0, montant),
      echeances[i].id,
    ]);
    cumul += montant;
  }
}

/** Numéro de commande : CMD-YYMMDD-NNNNN, compteur journalier global. */
async function numeroCommande(): Promise<string> {
  const d = new Date();
  const prefixe = `CMD-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-`;

  const dernier = await premier<Ligne>(
    "SELECT numero_commande FROM commandes WHERE numero_commande LIKE ? ORDER BY numero_commande DESC LIMIT 1",
    [`${prefixe}%`],
  );

  let sequence = 1;
  if (dernier) {
    const m = /CMD-\d{6}-(\d+)/.exec(String(dernier.numero_commande));
    if (m) sequence = Number(m[1]) + 1;
  }

  return prefixe + String(sequence).padStart(5, "0");
}

/** Valide un échéancier et le réécrit intégralement. Tolérance d'un franc. */
async function remplacerEcheances(
  commandeId: number,
  detaillantId: number,
  echeances: Ligne[],
  montantAttendu: number,
): Promise<void> {
  const valides: { montant: number; date: string }[] = [];
  let somme = 0;

  for (const e of echeances ?? []) {
    const montant = Number(e.montant ?? 0) || 0;
    const date = String(e.date_limite ?? "").trim();
    if (montant <= 0 || date === "") continue;

    valides.push({ montant, date });
    somme += montant;
  }

  if (valides.length === 0) throw new ErreurMetier("Aucune échéance fournie.");

  if (Math.abs(somme - montantAttendu) > 1) {
    throw new ErreurMetier(
      `Le total des échéances (${Math.round(somme)} FCFA) ne correspond pas au montant de la commande (${Math.round(montantAttendu)} FCFA).`,
    );
  }

  await executer("DELETE FROM commande_echeances WHERE commande_id = ?", [commandeId]);

  for (let i = 0; i < valides.length; i++) {
    await executer(
      `INSERT INTO commande_echeances
         (commande_id, user_id_detaillant, montant, date_limite, numero_echeance,
          nb_echeances_total, statut, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'en_cours', ?)`,
      [
        commandeId,
        detaillantId,
        valides[i].montant,
        valides[i].date,
        i + 1,
        valides.length,
        maintenant(),
      ],
    );
  }
}

export async function creerCommande(corps: Ligne): Promise<Commande> {
  const u = await exigerDetaillant();

  const fournisseur = await verifierFournisseur(String(corps.fournisseur_telephone ?? ""));

  let modePaiement = String(corps.mode_paiement ?? "comptant");
  if (!["comptant", "credit"].includes(modePaiement)) modePaiement = "comptant";

  const produits = Array.isArray(corps.produits) ? (corps.produits as Ligne[]) : [];
  if (produits.length === 0) throw new ErreurMetier("Ajoutez au moins un produit à la commande.");

  const echeances = Array.isArray(corps.echeances) ? (corps.echeances as Ligne[]) : [];
  if (modePaiement === "credit" && echeances.length === 0) {
    throw new ErreurMetier("Vous devez définir les échéances pour un paiement au crédit.");
  }

  let total = 0;
  for (const l of produits) {
    const nom = String(l.nom ?? "").trim();
    const quantite = Number(l.quantite ?? 0);
    const prix = Number(l.prix_unitaire ?? 0);

    if (nom === "" || quantite <= 0 || prix <= 0) {
      throw new ErreurMetier(
        "Chaque ligne doit avoir un produit, une quantité et un prix valides.",
      );
    }
    total += quantite * prix;
  }

  const numero = await numeroCommande();

  const id = await transaction(async () => {
    const { dernierId } = await executer(
      `INSERT INTO commandes
         (user_id_detaillant, user_id_grossiste, fournisseur_nom, fournisseur_telephone,
          numero_commande, montant_total, montant_paye, statut, recu_par_detaillant,
          mode_reception, mode_paiement, date_commande, notes)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'en_attente', 0, ?, ?, ?, ?)`,
      [
        u.id,
        fournisseur.id,
        fournisseur.trouve ? fournisseur.nom_boutique : String(corps.fournisseur_nom ?? "") || null,
        fournisseur.telephone,
        numero,
        total,
        fournisseur.trouve ? "plateforme" : "manuel",
        modePaiement,
        maintenant(),
        String(corps.notes ?? "").trim() || null,
      ],
    );

    for (const l of produits) {
      await executer(
        "INSERT INTO commande_details (commande_id, produit_nom, quantite, prix_unitaire) VALUES (?, ?, ?, ?)",
        [dernierId, String(l.nom).trim(), Number(l.quantite), Number(l.prix_unitaire)],
      );
    }

    if (modePaiement === "credit") {
      await remplacerEcheances(dernierId, Number(u.id), echeances, total);
    }

    return dernierId;
  });

  // Le grossiste est prévenu dès la création.
  if (fournisseur.id) {
    await notifier(
      fournisseur.id,
      "nouvelle_commande",
      "Nouvelle commande",
      `Commande n° ${numero} de ${u.nom_boutique} — ${Math.round(total)} FCFA`,
      `/commandes/${id}`,
    );
  }

  return ficheCommande(id);
}

/**
 * Fait entrer les lignes d'une commande dans le stock du détaillant.
 * Le prix d'achat est recalculé en moyenne pondérée, comme sur le serveur.
 */
async function entrerEnStock(
  detaillantId: number,
  commandeId: number,
): Promise<{ produitId: number; quantite: number; prix: number; nom: string }[]> {
  const details = await tous<Ligne>("SELECT * FROM commande_details WHERE commande_id = ?", [
    commandeId,
  ]);

  const recus: { produitId: number; quantite: number; prix: number; nom: string }[] = [];

  for (const d of details) {
    const nom = String(d.produit_nom);
    const quantite = Number(d.quantite);
    const prix = Number(d.prix_unitaire);

    const existant = await premier<Ligne>(
      "SELECT * FROM produits WHERE user_id = ? AND nom = ?",
      [detaillantId, nom],
    );

    let produitId: number;

    if (existant) {
      const ancienStock = Number(existant.stock);
      const nouveauStock = ancienStock + quantite;
      const prixMoyen =
        nouveauStock > 0
          ? (Number(existant.prix_achat) * ancienStock + prix * quantite) / nouveauStock
          : prix;

      await executer("UPDATE produits SET stock = ?, prix_achat = ? WHERE id = ?", [
        nouveauStock,
        Math.round(prixMoyen * 100) / 100,
        existant.id,
      ]);
      produitId = Number(existant.id);
    } else {
      const { dernierId } = await executer(
        `INSERT INTO produits
           (user_id, nom, prix_achat, prix_vente, stock, seuil_alerte, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          detaillantId,
          nom,
          prix,
          Math.round(prix * MARGE_PAR_DEFAUT * 100) / 100,
          quantite,
          SEUIL_ALERTE_AUTO,
          maintenant(),
        ],
      );
      produitId = dernierId;
    }

    recus.push({ produitId, quantite, prix, nom });
  }

  return recus;
}

/** Un crédit fournisseur par ligne reçue, relié à la commande d'origine. */
async function creerCreditsFournisseurs(
  detaillantId: number,
  commande: Ligne,
  recus: { produitId: number; quantite: number; prix: number; nom: string }[],
): Promise<void> {
  for (const l of recus) {
    await executer(
      `INSERT INTO approvisionnements
         (user_id, produit_id, quantite, prix_achat, montant_total, mode_paiement,
          statut, notes, fournisseur_nom, fournisseur_telephone, date_appro)
       VALUES (?, ?, ?, ?, ?, 'credit', 'en_attente', ?, ?, ?, ?)`,
      [
        detaillantId,
        l.produitId,
        l.quantite,
        l.prix,
        l.quantite * l.prix,
        `Crédit depuis commande #${commande.numero_commande} - ${l.nom}`,
        commande.fournisseur_nom,
        commande.fournisseur_telephone,
        maintenant(),
      ],
    );
  }
}

/** Impute un règlement : montant payé, statut, et solde des échéances en cours. */
async function appliquerPaiement(commande: Ligne, montant: number): Promise<void> {
  const nouveauPaye = Number(commande.montant_paye) + montant;
  const total = Number(commande.montant_total);

  await executer("UPDATE commandes SET montant_paye = ?, statut = ?, date_paiement = ? WHERE id = ?", [
    nouveauPaye,
    nouveauPaye >= total - 0.01 ? "payee" : "en_attente_paiement",
    maintenant(),
    commande.id,
  ]);

  if (String(commande.mode_paiement) === "credit") {
    await executer(
      "UPDATE commande_echeances SET statut = 'payee', date_paiement = ? WHERE commande_id = ? AND statut = 'en_cours'",
      [maintenant(), commande.id],
    );
  }
}

export async function validerCommande(id: number): Promise<Commande> {
  const g = await exigerGrossiste();
  const { ligne } = await charger(id);

  if (Number(ligne.user_id_grossiste) !== Number(g.id)) {
    throw new ErreurMetier("Cette commande ne vous est pas destinée.", 403);
  }
  if (String(ligne.statut) !== "en_attente") {
    throw new ErreurMetier("Seule une commande en attente peut être validée.");
  }
  if (await negociationOuverte(id)) {
    throw new ErreurMetier(
      "Une proposition de prix est en attente : acceptez-la ou refusez-la avant de valider la commande.",
    );
  }

  if (String(ligne.mode_paiement) === "credit") {
    const n = await premier<Ligne>(
      "SELECT COUNT(*) AS n FROM commande_echeances WHERE commande_id = ?",
      [id],
    );
    if (!n || Number(n.n) === 0) {
      throw new ErreurMetier("Les échéances doivent être définies pour un paiement au crédit.");
    }
  }

  await transaction(async () => {
    // 1. Décrémenter le stock du grossiste
    const details = await tous<Ligne>("SELECT * FROM commande_details WHERE commande_id = ?", [id]);

    for (const d of details) {
      const p = await premier<Ligne>("SELECT * FROM produits WHERE user_id = ? AND nom = ?", [
        g.id,
        d.produit_nom,
      ]);

      if (!p) {
        throw new ErreurMetier(`Produit « ${d.produit_nom} » introuvable dans votre stock.`);
      }
      if (Number(p.stock) < Number(d.quantite)) {
        throw new ErreurMetier(
          `Stock insuffisant pour « ${d.produit_nom} ». Disponible : ${p.stock}, demandé : ${d.quantite}.`,
        );
      }

      await executer("UPDATE produits SET stock = stock - ? WHERE id = ?", [d.quantite, p.id]);
    }

    // 2. Créditer le stock du détaillant
    const recus = await entrerEnStock(Number(ligne.user_id_detaillant), id);

    // 3. Statut
    await executer("UPDATE commandes SET statut = 'validee', date_validation = ? WHERE id = ?", [
      maintenant(),
      id,
    ]);

    // 4. Crédits fournisseurs si la commande est à crédit
    if (String(ligne.mode_paiement) === "credit") {
      await creerCreditsFournisseurs(Number(ligne.user_id_detaillant), ligne, recus);
    }
  });

  await notifier(
    Number(ligne.user_id_detaillant),
    "commande_validee",
    "Commande validée",
    `Votre commande n° ${ligne.numero_commande} a été validée par ${g.nom_boutique}`,
    `/commandes/${id}`,
  );

  return ficheCommande(id);
}

export async function livrerCommande(id: number): Promise<Commande> {
  const g = await exigerGrossiste();
  const { ligne } = await charger(id);

  if (Number(ligne.user_id_grossiste) !== Number(g.id)) {
    throw new ErreurMetier("Cette commande ne vous est pas destinée.", 403);
  }
  if (String(ligne.statut) !== "validee") {
    throw new ErreurMetier("Seule une commande validée peut être marquée comme livrée.");
  }

  await executer("UPDATE commandes SET statut = 'livree', date_livraison = ? WHERE id = ?", [
    maintenant(),
    id,
  ]);

  await notifier(
    Number(ligne.user_id_detaillant),
    "commande_livree",
    "Commande livrée",
    `Votre commande n° ${ligne.numero_commande} a été expédiée.`,
    `/commandes/${id}`,
  );

  return ficheCommande(id);
}

export async function receptionCommande(id: number): Promise<Commande> {
  const d = await exigerDetaillant();
  const { ligne } = await charger(id);

  if (Number(ligne.user_id_detaillant) !== Number(d.id)) {
    throw new ErreurMetier("Cette commande ne vous appartient pas.", 403);
  }
  if (Number(ligne.recu_par_detaillant) === 1) {
    throw new ErreurMetier("Vous avez déjà confirmé la réception de cette commande.");
  }

  const surPlateforme = !!ligne.user_id_grossiste;

  if (surPlateforme && String(ligne.statut) !== "livree") {
    throw new ErreurMetier(
      "Cette commande n'a pas encore été marquée comme livrée par le fournisseur.",
    );
  }

  await transaction(async () => {
    await executer(
      "UPDATE commandes SET recu_par_detaillant = 1, date_reception = ? WHERE id = ?",
      [maintenant(), id],
    );

    // Fournisseur externe : c'est ici que le stock entre réellement.
    if (!surPlateforme) {
      const recus = await entrerEnStock(Number(d.id), id);

      if (String(ligne.mode_paiement) === "credit") {
        await creerCreditsFournisseurs(Number(d.id), ligne, recus);
      }
    }
  });

  return ficheCommande(id);
}

export async function encaisserEspeces(id: number): Promise<Commande> {
  const g = await exigerGrossiste();
  const { ligne } = await charger(id);

  if (Number(ligne.user_id_grossiste) !== Number(g.id)) {
    throw new ErreurMetier("Cette commande ne vous est pas destinée.", 403);
  }

  const reste = Number(ligne.montant_total) - Number(ligne.montant_paye);
  if (reste <= 0) throw new ErreurMetier("Cette commande est déjà entièrement payée.");

  await transaction(async () => {
    // Le versement alimente le solde du grossiste.
    await executer(
      `INSERT INTO commandes_versements (commande_id, user_id, montant, mode_paiement, date_versement)
       VALUES (?, ?, ?, 'especes', ?)`,
      [id, g.id, reste, maintenant()],
    );

    await appliquerPaiement(ligne, reste);
  });

  return ficheCommande(id);
}

export async function payerEspecesCommande(id: number): Promise<Commande> {
  const d = await exigerDetaillant();
  const { ligne } = await charger(id);

  if (Number(ligne.user_id_detaillant) !== Number(d.id)) {
    throw new ErreurMetier("Cette commande ne vous appartient pas.", 403);
  }
  if (ligne.user_id_grossiste) {
    throw new ErreurMetier(
      "Ce fournisseur est sur Visacredit XIXA : c'est lui qui déclenche la demande de paiement.",
    );
  }
  if (Number(ligne.recu_par_detaillant) !== 1) {
    throw new ErreurMetier("Vous devez d'abord confirmer la réception des produits.");
  }

  const reste = Number(ligne.montant_total) - Number(ligne.montant_paye);
  if (reste <= 0) throw new ErreurMetier("Cette commande est déjà entièrement payée.");

  await transaction(async () => {
    await executer(
      `INSERT INTO depenses (user_id, categorie, montant, description, date_depense, created_at)
       VALUES (?, 'achat_marchandises', ?, ?, ?, ?)`,
      [
        d.id,
        reste,
        `Paiement espèces commande #${ligne.numero_commande} - ${ligne.fournisseur_nom ?? ""}`,
        aujourdhui(),
        maintenant(),
      ],
    );

    await appliquerPaiement(ligne, reste);
  });

  return ficheCommande(id);
}

export async function demanderPaiementCommande(
  id: number,
  corps: Ligne,
): Promise<{ paiement: IntentionPaiement }> {
  const g = await exigerGrossiste();
  const { ligne } = await charger(id);

  if (Number(ligne.user_id_grossiste) !== Number(g.id)) {
    throw new ErreurMetier("Cette commande ne vous est pas destinée.", 403);
  }

  const reste = Number(ligne.montant_total) - Number(ligne.montant_paye);
  if (reste <= 0) throw new ErreurMetier("Cette commande est déjà entièrement payée.");

  let passerelle = String(corps.passerelle ?? "kkiapay");
  if (!["kkiapay", "fedapay"].includes(passerelle)) passerelle = "kkiapay";

  await executer("UPDATE commandes SET statut = 'en_attente_paiement' WHERE id = ?", [id]);

  const detaillant = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [
    ligne.user_id_detaillant,
  ]);

  return {
    paiement: {
      reference: `COMMANDE-${id}-${Date.now().toString(36)}`,
      passerelle: passerelle as "kkiapay" | "fedapay",
      montant_widget: reste,
      telephone: detaillant ? String(detaillant.telephone) : null,
      identifiant: null,
      description: `Commande ${ligne.numero_commande}`,
    },
  };
}

export async function annulerCommande(id: number): Promise<Commande> {
  const { ligne } = await charger(id);

  if (String(ligne.statut) !== "en_attente") {
    throw new ErreurMetier("Seule une commande encore en attente peut être annulée.");
  }

  await executer("UPDATE commandes SET statut = 'annulee' WHERE id = ?", [id]);

  return ficheCommande(id);
}

export async function majEcheancesCommande(id: number, corps: Ligne): Promise<Commande> {
  const { ligne, u } = await charger(id);

  if (String(ligne.mode_paiement) !== "credit") {
    throw new ErreurMetier("Cette commande n'est pas à crédit.");
  }

  await remplacerEcheances(
    id,
    Number(ligne.user_id_detaillant),
    Array.isArray(corps.echeances) ? (corps.echeances as Ligne[]) : [],
    Number(ligne.montant_total),
  );

  void u;
  return ficheCommande(id);
}

/* ────────────────────────── Crédits fournisseurs ──────────────────────── */

const SELECT_APPRO = `
  SELECT a.*, p.nom AS produit_nom
    FROM approvisionnements a
    LEFT JOIN produits p ON p.id = a.produit_id
`;

export async function credits() {
  const u = await utilisateurCourant();
  const estGrossiste = Number(u.etatEts) === 1;

  if (estGrossiste) {
    // Côté grossiste : ce que les détaillants lui doivent, repéré par son numéro.
    const lignes = await tous<Ligne>(
      `${SELECT_APPRO} WHERE a.fournisseur_telephone = ? ORDER BY a.date_appro DESC`,
      [u.telephone],
    );

    const enAttente = lignes.filter((l) => String(l.statut) === "en_attente");
    const payees = lignes.filter((l) => String(l.statut) === "payé");

    return {
      role: "grossiste",
      en_attente: await Promise.all(enAttente.map((l) => presenterAppro(l))),
      payees: await Promise.all(payees.map((l) => presenterAppro(l))),
      total_a_encaisser: enAttente.reduce((s, l) => s + Number(l.montant_total), 0),
    };
  }

  const enAttente = await tous<Ligne>(
    `${SELECT_APPRO} WHERE a.user_id = ? AND a.statut = 'en_attente' ORDER BY a.date_appro DESC`,
    [u.id],
  );
  const payes = await tous<Ligne>(
    `${SELECT_APPRO} WHERE a.user_id = ? AND a.statut = 'payé' ORDER BY a.date_appro DESC`,
    [u.id],
  );

  const totalDu = enAttente.reduce((s, l) => s + Number(l.montant_total), 0);
  const solde = await calculerSolde(Number(u.id));

  return {
    role: "detaillant",
    en_attente: await Promise.all(enAttente.map((l) => presenterAppro(l))),
    payes: await Promise.all(payes.map((l) => presenterAppro(l))),
    total_du: totalDu,
    solde,
    solde_suffisant: solde >= totalDu,
  };
}

async function chargerCredit(id: number, userId: number): Promise<Ligne> {
  const l = await premier<Ligne>(
    "SELECT * FROM approvisionnements WHERE id = ? AND user_id = ?",
    [id, userId],
  );

  if (!l) throw new ErreurMetier("Crédit introuvable.", 404);
  if (String(l.statut) === "payé") throw new ErreurMetier("Ce crédit est déjà réglé.");

  return l;
}

/** Règlement en espèces : génère la dépense correspondante. */
export async function payerCreditEspeces(id: number) {
  const u = await exigerDetaillant();
  const appro = await chargerCredit(id, Number(u.id));

  await transaction(async () => {
    await executer(
      "UPDATE approvisionnements SET statut = 'payé', moyen_reglement = 'especes' WHERE id = ?",
      [id],
    );
    await genererDepenseCredit(Number(u.id), appro, "espèces");
  });

  const l = await premier<Ligne>(`${SELECT_APPRO} WHERE a.id = ?`, [id]);

  return { credit: await presenterAppro(l!), solde: await calculerSolde(Number(u.id)) };
}

export async function payerCreditSolde(id: number) {
  const u = await exigerDetaillant();
  const appro = await chargerCredit(id, Number(u.id));

  const solde = await calculerSolde(Number(u.id));
  const montant = Number(appro.montant_total);

  if (solde < montant) {
    throw new ErreurMetier(
      `Solde insuffisant ! Vous avez ${Math.round(solde)} FCFA, mais ce crédit coûte ${Math.round(montant)} FCFA.`,
    );
  }

  await transaction(async () => {
    await executer(
      "UPDATE approvisionnements SET statut = 'payé', moyen_reglement = 'solde' WHERE id = ?",
      [id],
    );
    await genererDepenseCredit(Number(u.id), appro, "solde");
  });

  const l = await premier<Ligne>(`${SELECT_APPRO} WHERE a.id = ?`, [id]);

  return { credit: await presenterAppro(l!), solde: await calculerSolde(Number(u.id)) };
}

async function genererDepenseCredit(userId: number, appro: Ligne, moyen: string): Promise<void> {
  await executer(
    `INSERT INTO depenses (user_id, categorie, montant, description, date_depense, created_at)
     VALUES (?, 'achat_marchandises', ?, ?, ?, ?)`,
    [
      userId,
      Number(appro.montant_total),
      `Règlement crédit fournisseur (${moyen}) — ${appro.fournisseur_nom ?? "fournisseur"}`,
      aujourdhui(),
      maintenant(),
    ],
  );
}

export async function demanderPaiementCredit(
  id: number,
  corps: Ligne,
): Promise<{ paiement: IntentionPaiement }> {
  const g = await exigerGrossiste();

  const appro = await premier<Ligne>(
    `${SELECT_APPRO} WHERE a.id = ? AND a.fournisseur_telephone = ?`,
    [id, g.telephone],
  );

  if (!appro) throw new ErreurMetier("Crédit introuvable.", 404);
  if (String(appro.statut) === "payé") throw new ErreurMetier("Ce crédit est déjà réglé.");

  let passerelle = String(corps.passerelle ?? "kkiapay");
  if (!["kkiapay", "fedapay"].includes(passerelle)) passerelle = "kkiapay";

  const detaillant = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [appro.user_id]);

  return {
    paiement: {
      reference: `CREDIT-${id}-${Date.now().toString(36)}`,
      passerelle: passerelle as "kkiapay" | "fedapay",
      montant_widget: Number(appro.montant_total),
      telephone: detaillant ? String(detaillant.telephone) : null,
      identifiant: null,
      description: `Crédit fournisseur — ${appro.produit_nom ?? "marchandise"}`,
    },
  };
}

/* ──────────────────────────────── Notations ───────────────────────────── */

async function moyennePour(
  table: "notations_fournisseurs" | "notations_clients",
  colonne: string,
  userId: number,
): Promise<MoyenneNotation> {
  const r = await premier<Ligne>(
    `SELECT AVG(note) AS moyenne, COUNT(*) AS total FROM ${table} WHERE ${colonne} = ?`,
    [userId],
  );

  const total = Number(r?.total ?? 0);

  return {
    moyenne: total > 0 ? Math.round(Number(r?.moyenne) * 100) / 100 : null,
    total,
  };
}

export async function notations() {
  const u = await utilisateurCourant();
  const id = Number(u.id);

  if (Number(u.etatEts) === 1) {
    const emises = await tous<Ligne>(
      "SELECT * FROM notations_clients WHERE user_id_grossiste = ? ORDER BY created_at DESC",
      [id],
    );
    const recues = await tous<Ligne>(
      "SELECT * FROM notations_fournisseurs WHERE user_id_grossiste = ? ORDER BY created_at DESC",
      [id],
    );

    return {
      role: "grossiste",
      emises: await Promise.all(emises.map(presenterNotationClient)),
      recues: await Promise.all(recues.map(presenterNotationFournisseur)),
      moyenne_recue: await moyennePour("notations_fournisseurs", "user_id_grossiste", id),
    };
  }

  const emises = await tous<Ligne>(
    "SELECT * FROM notations_fournisseurs WHERE user_id_detaillant = ? ORDER BY created_at DESC",
    [id],
  );
  const recues = await tous<Ligne>(
    "SELECT * FROM notations_clients WHERE user_id_detaillant = ? ORDER BY created_at DESC",
    [id],
  );

  return {
    role: "detaillant",
    emises: await Promise.all(emises.map(presenterNotationFournisseur)),
    recues: await Promise.all(recues.map(presenterNotationClient)),
    moyenne_recue: await moyennePour("notations_clients", "user_id_detaillant", id),
  };
}

/** La notation n'ouvre qu'après réception, comme sur le serveur. */
async function chargerCommandeNotable(commandeId: number, userId: number, cotDetaillant: boolean) {
  const c = await premier<Ligne>("SELECT * FROM commandes WHERE id = ?", [commandeId]);

  if (!c) throw new ErreurMetier("Commande introuvable.", 404);

  const proprietaire = cotDetaillant
    ? Number(c.user_id_detaillant)
    : Number(c.user_id_grossiste);

  if (proprietaire !== userId) {
    throw new ErreurMetier("Cette commande ne vous concerne pas.", 403);
  }
  if (Number(c.recu_par_detaillant) !== 1) {
    throw new ErreurMetier("La commande doit d'abord être réceptionnée.");
  }

  return c;
}

function validerNote(note: number): void {
  if (note < 1 || note > 5) {
    throw new ErreurMetier("La note doit être comprise entre 1 et 5.");
  }
}

export async function noterFournisseur(commandeId: number, corps: Ligne): Promise<Notation> {
  const u = await exigerDetaillant();
  const c = await chargerCommandeNotable(commandeId, Number(u.id), true);

  const note = Number(corps.note ?? 0);
  validerNote(note);

  const commentaire = String(corps.commentaire ?? "").trim() || null;

  const existante = await premier<Ligne>(
    "SELECT id FROM notations_fournisseurs WHERE commande_id = ? AND user_id_detaillant = ?",
    [commandeId, u.id],
  );

  if (existante) {
    await executer(
      "UPDATE notations_fournisseurs SET note = ?, commentaire = ?, created_at = ? WHERE id = ?",
      [note, commentaire, maintenant(), existante.id],
    );
  } else {
    await executer(
      `INSERT INTO notations_fournisseurs
         (user_id_detaillant, user_id_grossiste, commande_id, note, commentaire, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, c.user_id_grossiste, commandeId, note, commentaire, maintenant()],
    );
  }

  const l = await premier<Ligne>(
    "SELECT * FROM notations_fournisseurs WHERE commande_id = ? AND user_id_detaillant = ?",
    [commandeId, u.id],
  );

  return presenterNotationFournisseur(l!);
}

export async function noterClient(commandeId: number, corps: Ligne): Promise<Notation> {
  const u = await exigerGrossiste();
  const c = await chargerCommandeNotable(commandeId, Number(u.id), false);

  const note = Number(corps.note ?? 0);
  validerNote(note);

  const commentaire = String(corps.commentaire ?? "").trim() || null;

  const existante = await premier<Ligne>(
    "SELECT id FROM notations_clients WHERE commande_id = ? AND user_id_grossiste = ?",
    [commandeId, u.id],
  );

  if (existante) {
    await executer(
      "UPDATE notations_clients SET note = ?, commentaire = ?, updated_at = ? WHERE id = ?",
      [note, commentaire, maintenant(), existante.id],
    );
  } else {
    await executer(
      `INSERT INTO notations_clients
         (user_id_grossiste, user_id_detaillant, commande_id, note, commentaire, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, c.user_id_detaillant, commandeId, note, commentaire, maintenant()],
    );
  }

  const l = await premier<Ligne>(
    "SELECT * FROM notations_clients WHERE commande_id = ? AND user_id_grossiste = ?",
    [commandeId, u.id],
  );

  return presenterNotationClient(l!);
}

export async function profilNotation(type: string, id: number) {
  if (!["fournisseur", "client"].includes(type)) {
    throw new ErreurMetier("Type de profil inconnu.", 404);
  }

  const cible = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [id]);
  if (!cible) throw new ErreurMetier("Utilisateur introuvable.", 404);

  if (type === "fournisseur") {
    const avis = await tous<Ligne>(
      "SELECT * FROM notations_fournisseurs WHERE user_id_grossiste = ? ORDER BY created_at DESC LIMIT 20",
      [id],
    );
    const m = await moyennePour("notations_fournisseurs", "user_id_grossiste", id);

    return {
      type,
      profil: userResume(cible),
      moyenne: m.moyenne,
      total: m.total,
      avis: await Promise.all(avis.map(presenterNotationFournisseur)),
    };
  }

  const avis = await tous<Ligne>(
    "SELECT * FROM notations_clients WHERE user_id_detaillant = ? ORDER BY created_at DESC LIMIT 20",
    [id],
  );
  const m = await moyennePour("notations_clients", "user_id_detaillant", id);

  return {
    type,
    profil: userResume(cible),
    moyenne: m.moyenne,
    total: m.total,
    avis: await Promise.all(avis.map(presenterNotationClient)),
  };
}

export async function moyenneGrossiste(id: number): Promise<MoyenneNotation> {
  const g = await premier<Ligne>("SELECT * FROM users WHERE id = ? AND etatEts = 1", [id]);
  if (!g) throw new ErreurMetier("Grossiste introuvable.", 404);

  return moyennePour("notations_fournisseurs", "user_id_grossiste", id);
}

/** Réexporté pour le routeur : les échéances d'une commande. */
export async function echeancesCommande(id: number) {
  const lignes = await tous<Ligne>(
    "SELECT * FROM commande_echeances WHERE commande_id = ? ORDER BY numero_echeance",
    [id],
  );

  return lignes.map(presenterEcheance);
}

export type { CreditFournisseur };
