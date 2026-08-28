/**
 * Types partagés avec l'API Symfony. Reflètent la sortie de ApiPresenter.
 *
 * Volontairement identiques à frontend/src/lib/types.ts : le mobile et le web
 * consomment le même backend, un écart entre les deux fichiers signalerait un
 * bug plutôt qu'une variante voulue.
 */

export type Role = "grossiste" | "detaillant";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  /** Identifiant Fiscal Unique — obligatoire, nul sur les comptes antérieurs. */
  ifu: string | null;
  /** Calculé par l'API : déclenche le bandeau de rappel. */
  ifu_manquant: boolean;
  /** Registre du commerce (RCCM) — facultatif, mais il débloque les fréquences de retrait. */
  registre_commerce: string | null;
  registre_commerce_manquant: boolean;
  date_naissance: string | null;
  adresse: string | null;
  nom_boutique: string;
  /** 1 = grossiste, 0 = détaillant (colonne historique conservée) */
  etatEts: number;
  role: Role;
  created_at: string | null;
}

export interface UserResume {
  id: number;
  nom_complet: string;
  nom_boutique: string;
  telephone: string;
  role: Role;
}

export interface Client {
  id: number;
  nom_complet: string;
  telephone: string;
  /** Second numéro, facultatif. */
  telephone2: string | null;
  date_naissance: string | null;
  email: string | null;
  adresse: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface Categorie {
  id: number;
  nom: string;
  /** Vrai pour les catégories du catalogue commun défini par la plateforme. */
  globale?: boolean;
}

export interface Produit {
  id: number;
  nom: string;
  prix_achat: number;
  prix_vente: number;
  stock: number;
  seuil_alerte: number | null;
  stock_faible: boolean;
  description: string | null;
  categorie: Categorie | null;
  created_at: string | null;
  /** Présent uniquement sur la recherche inter-boutiques. */
  fournisseur?: UserResume | null;
}

export interface LigneVente {
  id: number;
  produit_id: number | null;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface Vente {
  id: number;
  numero_facture: string;
  montant_total: number;
  montant_paye: number;
  reste: number;
  statut: string;
  statut_paiement: string;
  mode_paiement: string;
  telephone_client: string | null;
  frais_client: number;
  frais_vendeur: number;
  date_vente: string | null;
  client: Client | null;
  lignes?: LigneVente[];
}

export interface Creance {
  id: number;
  montant_restant: number;
  date_limite: string | null;
  statut: string;
  en_retard: boolean;
  numero_echeance: number;
  nb_echeances_total: number;
  created_at: string | null;
  client: Client | null;
  vente: { id: number; numero_facture: string; montant_total: number } | null;
}

export interface Depense {
  id: number;
  categorie: string;
  autre_categorie: string | null;
  montant: number;
  description: string | null;
  date_depense: string | null;
  created_at: string | null;
}

export interface Retrait {
  id: number;
  montant: number;
  frequence: string | null;
  date_retrait: string | null;
}

export interface LigneCommande {
  id: number;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  montant: number;
}

export interface Echeance {
  id: number;
  montant: number;
  date_limite: string | null;
  numero_echeance: number;
  nb_echeances_total: number;
  statut: string;
  date_paiement: string | null;
}

/** Un tour de marchandage : qui a proposé quoi, et ce qu'il en est advenu. */
export interface Negociation {
  id: number;
  montant_propose: number;
  montant_initial: number;
  /** Négatif quand une remise est demandée. */
  ecart: number;
  ecart_pourcent: number;
  message: string | null;
  statut: "en_attente" | "acceptee" | "refusee" | "contre_proposee";
  role_auteur: Role;
  auteur: UserResume | null;
  created_at: string | null;
  repondu_at: string | null;
}

export type ActionCommande =
  | "valider"
  | "livrer"
  | "annuler"
  | "marchander"
  | "accepter_prix"
  | "refuser_prix"
  | "contre_proposer"
  | "demander_paiement"
  | "encaisser_especes"
  | "confirmer_reception"
  | "payer_especes"
  | "modifier_echeances"
  | "noter_fournisseur"
  | "noter_client";

export interface Commande {
  id: number;
  numero_commande: string;
  montant_total: number;
  montant_paye: number;
  reste: number;
  statut: string;
  mode_paiement: "comptant" | "credit";
  recu_par_detaillant: boolean;
  fournisseur_nom: string | null;
  fournisseur_telephone: string;
  fournisseur_sur_plateforme: boolean;
  detaillant: UserResume | null;
  grossiste: UserResume | null;
  date_commande: string | null;
  date_validation: string | null;
  date_livraison: string | null;
  date_reception: string | null;
  date_paiement: string | null;
  notes: string | null;
  lignes?: LigneCommande[];
  echeances?: Echeance[];
  negociations?: Negociation[];
  negociation_en_attente?: Negociation | null;
  actions_possibles?: ActionCommande[];
  mon_role?: Role;
}

export interface CreditFournisseur {
  id: number;
  produit_nom: string;
  produit_id: number | null;
  quantite: number;
  prix_achat: number;
  montant_total: number;
  mode_paiement: string;
  statut: string;
  /** Comment la dette a été réglée. Nul pour l'historique non tracé. */
  moyen_reglement: "especes" | "mobile_money" | "solde" | null;
  notes: string | null;
  fournisseur_nom: string | null;
  fournisseur_telephone: string | null;
  date_appro: string | null;
  acheteur: UserResume | null;
  origine_commande: string | null;
}

export interface Notation {
  id: number;
  note: number;
  commentaire: string | null;
  created_at: string | null;
  type: "fournisseur" | "client";
  auteur: UserResume | null;
  cible: UserResume | null;
  commande: { id: number; numero_commande: string } | null;
}

export interface NotificationItem {
  id: number;
  type: string;
  titre: string;
  message: string;
  lien: string | null;
  lu: boolean;
  created_at: string | null;
}

export interface DashboardStats {
  solde: number;
  total_clients: number;
  ventes_jour: number;
  ventes_mois: number;
  creances_en_cours: number;
  montant_creances: number;
  produits_alerte: number;
  commandes_attente_paiement: number;
  stats_commandes: Record<string, number>;
  role: Role;
  nom_boutique: string;
  prenom: string;
}

/** Intention de paiement renvoyée quand un règlement passe par une passerelle. */
export interface IntentionPaiement {
  reference: string;
  passerelle: "kkiapay" | "fedapay";
  montant_widget: number;
  telephone?: string | null;
  identifiant?: string | null;
  description: string;
}

/** Clés publiques des passerelles — /api/paiements/config. */
export interface ConfigPasserelles {
  kkiapay: { cle_publique: string; sandbox: boolean };
  fedapay: { cle_publique: string; sandbox: boolean };
}

/** Réponse de /api/commandes/verifier-fournisseur. */
export interface VerificationFournisseur {
  trouve: boolean;
  id: number | null;
  nom_boutique: string;
  telephone: string;
}

/** Moyenne de notation d'un partenaire. */
export interface MoyenneNotation {
  moyenne: number | null;
  total: number;
}
