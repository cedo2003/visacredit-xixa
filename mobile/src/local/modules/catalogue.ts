/**
 * Produits, catégories et recherche inter-boutiques — pendant local de
 * ProduitController et ProduitService.
 */

import { ErreurMetier, executer, premier, tous, transaction } from "../base";
import { aujourdhui, maintenant, produit, userResume, type Ligne } from "../presentateur";
import { exigerDetaillant, utilisateurCourant } from "./auth";
import type { Categorie, Produit } from "../../lib/types";

const SELECT_PRODUIT = `
  SELECT p.*, c.nom AS categorie_nom
    FROM produits p
    LEFT JOIN categories c ON c.id = p.categorie_id
`;

export async function liste(recherche?: string): Promise<Produit[]> {
  const u = await utilisateurCourant();

  const lignes = recherche
    ? await tous<Ligne>(`${SELECT_PRODUIT} WHERE p.user_id = ? AND p.nom LIKE ? ORDER BY p.nom`, [
        u.id,
        `%${recherche}%`,
      ])
    : await tous<Ligne>(`${SELECT_PRODUIT} WHERE p.user_id = ? ORDER BY p.nom`, [u.id]);

  return lignes.map((l) => produit(l));
}

export async function fiche(id: number): Promise<Produit> {
  const u = await utilisateurCourant();
  const l = await premier<Ligne>(`${SELECT_PRODUIT} WHERE p.id = ? AND p.user_id = ?`, [id, u.id]);

  if (!l) throw new ErreurMetier("Produit introuvable.", 404);

  return produit(l);
}

/**
 * Catalogue des catégories : celles définies par la plateforme (`user_id` nul),
 * suivies de celles propres à la boutique, héritées d'avant le catalogue commun.
 */
export async function categories(): Promise<Categorie[]> {
  const u = await utilisateurCourant();
  const lignes = await tous<Ligne>(
    `SELECT id, nom, user_id FROM categories
      WHERE user_id IS NULL OR user_id = ?
      ORDER BY CASE WHEN user_id IS NULL THEN 0 ELSE 1 END, nom`,
    [u.id],
  );

  return lignes.map((l) => ({
    id: Number(l.id),
    nom: String(l.nom),
    globale: l.user_id === null,
  }));
}

/**
 * Résout la catégorie d'un produit — obligatoire depuis le catalogue commun.
 * Transposition de ProduitService::categorie.
 */
async function resoudreCategorie(userId: number, valeur: unknown): Promise<number> {
  const id = Number(valeur ?? 0);

  if (!Number.isFinite(id) || id <= 0) {
    throw new ErreurMetier("La catégorie du produit est obligatoire.");
  }

  const c = await premier<Ligne>(
    "SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)",
    [id, userId],
  );

  if (!c) throw new ErreurMetier("Catégorie inconnue.");

  return Number(c.id);
}

/**
 * Création d'un produit avec son approvisionnement initial.
 *
 * Reprend ProduitService::creer : payé comptant, le stock d'entrée génère une
 * dépense ; à crédit, il crée une dette fournisseur qui apparaîtra dans les
 * crédits. Les trois écritures sont liées, d'où la transaction.
 */
export async function creer(corps: Ligne): Promise<Produit> {
  const u = await utilisateurCourant();

  const nom = String(corps.nom ?? "").trim();
  if (nom === "") throw new ErreurMetier("Le nom du produit est obligatoire.");

  const prixAchat = Number(corps.prix_achat ?? 0) || 0;
  const prixVente = Number(corps.prix_vente ?? 0) || 0;
  const stock = Math.max(0, Number(corps.stock ?? 0) || 0);
  const seuil = Number(corps.seuil_alerte ?? 10) || 0;

  if (prixAchat < 0 || prixVente < 0) {
    throw new ErreurMetier("Les prix ne peuvent pas être négatifs.");
  }

  let modePaiement = String(corps.mode_paiement ?? "comptant");
  if (!["comptant", "credit"].includes(modePaiement)) modePaiement = "comptant";
  const estCredit = modePaiement === "credit";

  const categorieId = await resoudreCategorie(Number(u.id), corps.categorie_id);

  const id = await transaction(async () => {
    const { dernierId } = await executer(
      `INSERT INTO produits
         (user_id, categorie_id, nom, prix_achat, prix_vente, stock, seuil_alerte, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.id,
        categorieId,
        nom,
        prixAchat,
        prixVente,
        stock,
        seuil,
        String(corps.description ?? "").trim() || null,
        maintenant(),
      ],
    );

    const montantTotal = prixAchat * stock;
    const telFournisseur = String(corps.fournisseur_telephone ?? "").replace(/[^0-9]/g, "");

    await executer(
      `INSERT INTO approvisionnements
         (user_id, produit_id, quantite, prix_achat, montant_total, mode_paiement,
          statut, moyen_reglement, notes, fournisseur_nom, fournisseur_telephone, date_appro)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.id,
        dernierId,
        stock,
        prixAchat,
        montantTotal,
        modePaiement,
        estCredit ? "en_attente" : "payé",
        estCredit ? null : "especes",
        String(corps.notes ?? "").trim() || null,
        estCredit ? String(corps.fournisseur_nom ?? "").trim() || null : null,
        estCredit ? telFournisseur || null : null,
        maintenant(),
      ],
    );

    // Achat comptant : la sortie de caisse est enregistrée tout de suite.
    if (!estCredit && stock > 0) {
      await executer(
        `INSERT INTO depenses (user_id, categorie, montant, description, date_depense, created_at)
         VALUES (?, 'achat_marchandises', ?, ?, ?, ?)`,
        [
          u.id,
          montantTotal,
          `Achat produit : ${nom} (${stock} unités × ${Math.round(prixAchat)} FCFA)`,
          aujourdhui(),
          maintenant(),
        ],
      );
    }

    return dernierId;
  });

  return fiche(id);
}

export async function modifier(id: number, corps: Ligne): Promise<Produit> {
  const u = await utilisateurCourant();

  const existant = await premier<Ligne>("SELECT * FROM produits WHERE id = ? AND user_id = ?", [
    id,
    u.id,
  ]);
  if (!existant) throw new ErreurMetier("Produit introuvable.", 404);

  const champs: string[] = [];
  const valeurs: unknown[] = [];
  const poser = (colonne: string, valeur: unknown) => {
    champs.push(`${colonne} = ?`);
    valeurs.push(valeur);
  };

  if ("nom" in corps) {
    const nom = String(corps.nom ?? "").trim();
    if (nom === "") throw new ErreurMetier("Le nom du produit est obligatoire.");
    poser("nom", nom);
  }
  if ("prix_achat" in corps) poser("prix_achat", Number(corps.prix_achat) || 0);
  if ("prix_vente" in corps) poser("prix_vente", Number(corps.prix_vente) || 0);
  if ("stock" in corps) poser("stock", Math.max(0, Number(corps.stock) || 0));
  if ("seuil_alerte" in corps) poser("seuil_alerte", Number(corps.seuil_alerte) || 0);
  if ("description" in corps) poser("description", String(corps.description ?? "").trim() || null);

  if ("categorie_id" in corps) {
    poser("categorie_id", await resoudreCategorie(Number(u.id), corps.categorie_id));
  }

  if (champs.length > 0) {
    valeurs.push(id);
    await executer(`UPDATE produits SET ${champs.join(", ")} WHERE id = ?`, valeurs);
  }

  return fiche(id);
}

export async function supprimer(id: number): Promise<void> {
  const u = await utilisateurCourant();

  const { lignes } = await executer("DELETE FROM produits WHERE id = ? AND user_id = ?", [
    id,
    u.id,
  ]);

  if (lignes === 0) throw new ErreurMetier("Produit introuvable.", 404);
}

/**
 * Recherche chez les autres boutiques — réservée aux détaillants.
 *
 * Sur le serveur, elle balayait tous les grossistes inscrits. En local, elle
 * balaie les grossistes présents dans la base de l'appareil : le catalogue de
 * démonstration en contient un.
 */
export async function rechercheGrossistes(terme: string): Promise<Produit[]> {
  await exigerDetaillant();

  if (terme.trim().length < 2) return [];

  const lignes = await tous<Ligne>(
    `${SELECT_PRODUIT}
      JOIN users u ON u.id = p.user_id
     WHERE u.etatEts = 1 AND p.stock > 0 AND p.nom LIKE ?
     ORDER BY p.nom
     LIMIT 50`,
    [`%${terme.trim()}%`],
  );

  const resultats: Produit[] = [];

  for (const l of lignes) {
    const proprietaire = await premier<Ligne>("SELECT * FROM users WHERE id = ?", [l.user_id]);
    resultats.push(produit(l, userResume(proprietaire)));
  }

  return resultats;
}
