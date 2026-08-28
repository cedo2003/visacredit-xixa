/**
 * Formatage d'affichage.
 * Reprend formatMontant() et format_date() qui vivaient dans config.php et
 * includes/helpers_commandes.php — désormais côté client, là où c'est leur place.
 */

/**
 * Locale des nombres et des dates, posée par le fournisseur de langue.
 *
 * Une variable de module plutôt qu'un paramètre : `montant()` et `date()` sont
 * appelés à des centaines d'endroits, et leur faire traverser la langue
 * alourdirait chaque appel pour un réglage qui ne change qu'au clic de
 * l'utilisateur. Le rendu serveur reste en français, seule valeur possible côté
 * serveur.
 */
let locale = "fr-FR";

export function definirLocale(langue: "fr" | "en") {
  locale = langue === "en" ? "en-GB" : "fr-FR";
}

export function montant(valeur: number | string | null | undefined): string {
  const n = typeof valeur === "string" ? parseFloat(valeur) : (valeur ?? 0);
  return `${new Intl.NumberFormat(locale).format(Math.round(n))} FCFA`;
}

export function nombre(valeur: number | string | null | undefined): string {
  const n = typeof valeur === "string" ? parseFloat(valeur) : (valeur ?? 0);
  return new Intl.NumberFormat(locale).format(Math.round(n));
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

/** Date en toutes lettres, pour l'en-tête du tableau de bord. */
export function dateLongue(valeur: Date): string {
  return valeur.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
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

export function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Libellé et couleurs d'un statut de commande — reprend get_statut_badge(). */
export const BADGES_COMMANDE: Record<string, { label: string; classe: string }> = {
  en_attente: { label: "⏳ En attente", classe: "bg-yellow-100 text-yellow-800" },
  validee: { label: "✅ Validée", classe: "bg-blue-100 text-blue-800" },
  livree: { label: "📦 Livrée", classe: "bg-purple-100 text-purple-800" },
  recu_par_detaillant: { label: "✋ Reçue", classe: "bg-green-100 text-green-800" },
  en_attente_paiement: { label: "💳 En attente de paiement", classe: "bg-orange-100 text-orange-800" },
  payee: { label: "✅ Payée", classe: "bg-green-100 text-green-800" },
  annulee: { label: "✖ Annulée", classe: "bg-surface-forte text-doux" },
};

export function badgeCommande(statut: string) {
  return BADGES_COMMANDE[statut] ?? BADGES_COMMANDE.en_attente;
}

export const BADGES_CREANCE: Record<string, { label: string; classe: string }> = {
  en_cours: { label: "En cours", classe: "bg-orange-100 text-orange-800" },
  payee: { label: "Payée", classe: "bg-green-100 text-green-800" },
  retard: { label: "En retard", classe: "bg-red-100 text-red-800" },
};

export const LIBELLES_DEPENSE: Record<string, string> = {
  salaires: "Salaires",
  achat_marchandises: "Achat de marchandises",
  loyer: "Loyer",
  transport: "Transport",
  electricite: "Électricité",
  autres: "Autres",
};

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
