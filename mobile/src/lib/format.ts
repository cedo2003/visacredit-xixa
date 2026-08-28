/**
 * Formatage d'affichage — pendant mobile de frontend/src/lib/format.ts.
 *
 * Les badges renvoient ici un couple de couleurs plutôt que des classes
 * Tailwind : React Native n'a pas de feuille de style globale.
 */

import type { Palette } from "../theme";

/**
 * Locale des dates, posée par le fournisseur de langue.
 *
 * Une variable de module plutôt qu'un paramètre : `date()` est appelée à des
 * dizaines d'endroits, et lui faire traverser la langue alourdirait chaque
 * appel pour un réglage qui ne change qu'au geste de l'utilisateur. Les
 * montants, eux, sont groupés à la main (voir `grouper`) et ne dépendent pas
 * de la locale.
 */
let locale = "fr-FR";

export function definirLocale(langue: "fr" | "en") {
  locale = langue === "en" ? "en-GB" : "fr-FR";
}

/**
 * Intl est disponible sur Hermes (SDK 54) mais l'espace fine insécable qu'il
 * produit comme séparateur de milliers en fr-FR s'affiche mal dans certaines
 * polices Android. Le groupement est donc fait à la main, avec une espace
 * insécable classique.
 */
function grouper(n: number): string {
  const arrondi = Math.round(Math.abs(n));
  const signe = n < 0 ? "-" : "";

  return signe + String(arrondi).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function versNombre(valeur: number | string | null | undefined): number {
  const n = typeof valeur === "string" ? parseFloat(valeur) : (valeur ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function montant(valeur: number | string | null | undefined): string {
  return `${grouper(versNombre(valeur))} FCFA`;
}

export function nombre(valeur: number | string | null | undefined): string {
  return grouper(versNombre(valeur));
}

export function date(valeur: string | null | undefined): string {
  if (!valeur) return "—";
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function dateHeure(valeur: string | null | undefined): string {
  if (!valeur) return "—";
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Date du jour au format attendu par l'API (Y-m-d), en heure locale. */
export function aujourdHui(): string {
  const d = new Date();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${mois}-${jour}`;
}

/** Ajoute des jours à une date ISO (Y-m-d) — sert aux échéanciers proposés. */
export function ajouterJours(iso: string, jours: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + jours);

  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${mois}-${jour}`;
}

export interface Badge {
  label: string;
  fond: string;
  texte: string;
}

/**
 * Libellé et couleurs d'un statut de commande — reprend get_statut_badge().
 *
 * Ces couleurs disent un état, pas la marque : un badge « Payée » reste vert et
 * « Attente paiement » orange sombre, même si la charte est orange et bleue.
 * Les teindre aux couleurs du logo rendrait les deux indiscernables.
 *
 * La palette arrive en paramètre, et les tables sont construites à l'appel :
 * figées à l'import, elles garderaient leurs fonds clairs en thème sombre.
 */
export function badgeCommande(statut: string, couleurs: Palette): Badge {
  const badges: Record<string, Badge> = {
    en_attente: {
      label: "⏳ En attente",
      fond: couleurs.alerteClair,
      texte: couleurs.alerteSombre,
    },
    validee: { label: "✅ Validée", fond: couleurs.secondaireClair, texte: couleurs.secondaire },
    livree: { label: "📦 Livrée", fond: couleurs.violetClair, texte: couleurs.violet },
    recu_par_detaillant: {
      label: "✋ Reçue",
      fond: couleurs.succesClair,
      texte: couleurs.succesSombre,
    },
    en_attente_paiement: {
      label: "💳 Attente paiement",
      fond: couleurs.attenteClair,
      texte: couleurs.attente,
    },
    payee: { label: "✅ Payée", fond: couleurs.succesClair, texte: couleurs.succesSombre },
    annulee: { label: "✖ Annulée", fond: couleurs.surfaceDouce, texte: couleurs.texteDoux },
  };

  return badges[statut] ?? badges.en_attente;
}

export function badgeCreance(statut: string, enRetard: boolean, couleurs: Palette): Badge {
  const badges: Record<string, Badge> = {
    en_cours: { label: "En cours", fond: couleurs.attenteClair, texte: couleurs.attente },
    payee: { label: "Payée", fond: couleurs.succesClair, texte: couleurs.succesSombre },
    retard: { label: "En retard", fond: couleurs.dangerClair, texte: couleurs.danger },
  };

  if (enRetard && statut !== "payee") return badges.retard;
  return badges[statut] ?? badges.en_cours;
}

export function badgeNeutre(couleurs: Palette): Badge {
  return { label: "—", fond: couleurs.surfaceDouce, texte: couleurs.texteDoux };
}

export const LIBELLES_DEPENSE: Record<string, string> = {
  salaires: "Salaires",
  achat_marchandises: "Achat de marchandises",
  loyer: "Loyer",
  transport: "Transport",
  electricite: "Électricité",
  autres: "Autres",
};

export function libelleDepense(categorie: string, autre: string | null): string {
  if (categorie === "autres" && autre) return autre;
  return LIBELLES_DEPENSE[categorie] ?? categorie;
}

/**
 * Complète « Payé » par le moyen de règlement.
 *
 * Renvoie « Payé » tout court quand le moyen est inconnu : c'est le cas de tous
 * les règlements antérieurs au suivi, et inventer « Espèces » y serait faux.
 */
export function libelleReglement(moyen: string | null | undefined): string {
  switch (moyen) {
    case "especes":
      return "Payé · Espèces";
    case "mobile_money":
      return "Payé · Mobile Money";
    case "solde":
      return "Payé · Sur le solde";
    default:
      return "Payé";
  }
}

/**
 * Mention rappelant que les fonds ne transitent pas par la plateforme.
 *
 * Réservée à l'écran Retraits, là où l'argent sort réellement : sur le tableau
 * de bord, elle s'affichait à chaque ouverture de l'application sans rien
 * apprendre de nouveau.
 */
export const MENTION_FONDS =
  "Fonds détenus chez l'agrégateur de paiement · Visacredit XIXA ne conserve aucun fonds";

/** Étoiles pleines/vides d'une note sur 5. */
export function etoiles(note: number): string {
  const pleines = Math.max(0, Math.min(5, Math.round(note)));
  return "★".repeat(pleines) + "☆".repeat(5 - pleines);
}
