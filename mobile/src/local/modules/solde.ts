/**
 * Solde de caisse et tableau de bord — pendants locaux de SoldeService et
 * DashboardController.
 */

import { somme, tous } from "../base";
import { utilisateurCourant } from "./auth";
import type { DashboardStats } from "../../lib/types";
import type { Ligne } from "../presentateur";

/**
 * Position de caisse.
 *
 * Formule reprise telle quelle du serveur :
 *     ventes encaissées − dépenses − retraits + versements de commandes
 *
 * Le montant n'est jamais stocké : le recalculer à la demande évite qu'une
 * écriture oubliée quelque part laisse un solde faux en base.
 */
export async function calculerSolde(userId: number): Promise<number> {
  const encaisse = await somme(
    "SELECT SUM(montant_paye) AS total FROM ventes WHERE user_id = ?",
    [userId],
  );
  const depenses = await somme("SELECT SUM(montant) AS total FROM depenses WHERE user_id = ?", [
    userId,
  ]);
  const retraits = await somme("SELECT SUM(montant) AS total FROM retraits WHERE user_id = ?", [
    userId,
  ]);
  const versements = await somme(
    "SELECT SUM(montant) AS total FROM commandes_versements WHERE user_id = ?",
    [userId],
  );

  return Math.round((encaisse - depenses - retraits + versements) * 100) / 100;
}

export async function tableauDeBord(): Promise<DashboardStats> {
  const u = await utilisateurCourant();
  const id = Number(u.id);
  const estGrossiste = Number(u.etatEts) === 1;

  const debutJour = `${new Date().toISOString().slice(0, 10)} 00:00:00`;
  const debutMois = `${new Date().toISOString().slice(0, 7)}-01 00:00:00`;

  const clients = await somme("SELECT COUNT(*) AS total FROM clients WHERE user_id = ?", [id]);

  const ventesJour = await somme(
    "SELECT SUM(montant_total) AS total FROM ventes WHERE user_id = ? AND date_vente >= ?",
    [id, debutJour],
  );
  const ventesMois = await somme(
    "SELECT SUM(montant_total) AS total FROM ventes WHERE user_id = ? AND date_vente >= ?",
    [id, debutMois],
  );

  const creancesEnCours = await somme(
    "SELECT COUNT(*) AS total FROM creances WHERE user_id = ? AND statut != 'payee'",
    [id],
  );
  const montantCreances = await somme(
    "SELECT SUM(montant_restant) AS total FROM creances WHERE user_id = ? AND statut != 'payee'",
    [id],
  );

  const produitsAlerte = await somme(
    "SELECT COUNT(*) AS total FROM produits WHERE user_id = ? AND stock <= seuil_alerte",
    [id],
  );

  // Le grossiste compte ce qu'il attend de ses clients ; le détaillant ce qu'il
  // doit encore régler. Deux lectures d'une même table, comme sur le serveur.
  const commandesAttente = estGrossiste
    ? await somme(
        `SELECT COUNT(*) AS total FROM commandes
          WHERE user_id_grossiste = ? AND statut = 'en_attente_paiement'`,
        [id],
      )
    : await somme(
        `SELECT COUNT(*) AS total FROM commandes
          WHERE user_id_detaillant = ? AND statut = 'en_attente_paiement'`,
        [id],
      );

  const colonneRole = estGrossiste ? "user_id_grossiste" : "user_id_detaillant";
  const parStatut = await tous<Ligne>(
    `SELECT statut, COUNT(*) AS n FROM commandes WHERE ${colonneRole} = ? GROUP BY statut`,
    [id],
  );

  const statsCommandes: Record<string, number> = {};
  for (const l of parStatut) statsCommandes[String(l.statut)] = Number(l.n);

  return {
    solde: await calculerSolde(id),
    total_clients: clients,
    ventes_jour: ventesJour,
    ventes_mois: ventesMois,
    creances_en_cours: creancesEnCours,
    montant_creances: montantCreances,
    produits_alerte: produitsAlerte,
    commandes_attente_paiement: commandesAttente,
    stats_commandes: statsCommandes,
    role: estGrossiste ? "grossiste" : "detaillant",
    nom_boutique: String(u.nom_boutique ?? ""),
    prenom: String(u.prenom ?? ""),
  };
}
