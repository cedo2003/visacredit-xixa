/**
 * Jetons de style de l'application.
 *
 * Les couleurs de marque sont prélevées directement dans le logo Visacredit
 * XIXA : l'orange des billets et le bleu de la loupe.
 *
 * Marque et sémantique sont volontairement séparées. Le vert ne fait pas partie
 * de la charte mais reste indispensable : sans lui, « Payé » et « Reste à
 * payer » s'afficheraient tous deux en orange. La marque habille donc les
 * commandes et la navigation, la sémantique dit l'état d'un montant.
 *
 * Deux palettes de mêmes clés, une par thème. Un écran ne choisit jamais entre
 * les deux : il reçoit celle qui est active via `useStyles` (voir
 * `src/theme-contexte.tsx`), et son code ne change pas d'un thème à l'autre.
 */

export const PALETTE_CLAIRE = {
  // ── Marque ──────────────────────────────────────────────────────────
  /**
   * Orange du logo — actions principales, éléments actifs, accents.
   *
   * Légèrement désaturé par rapport au fichier du logo (#FD3F02) : à pleine
   * vivacité il brûlait les aplats — boutons, raccourcis, en-têtes — qui en
   * couvrent de larges surfaces. Même teinte, saturation ramenée à 82 %.
   */
  primaire: "#E84A17",
  primaireSombre: "#BD3A11",
  primaireClair: "#FFF3EE",
  primaireBordure: "#FFCBB5",

  /** Bleu du logo — en-têtes, actions secondaires, totaux neutres. */
  secondaire: "#143747",
  secondaireSombre: "#0B222D",
  secondaireClair: "#E8EEF2",
  secondaireBordure: "#B9CBD6",

  // ── Sémantique ──────────────────────────────────────────────────────
  /** Montant encaissé, créance soldée, stock suffisant. */
  succes: "#059669",
  succesSombre: "#047857",
  succesClair: "#ECFDF5",
  succesBordure: "#A7F3D0",

  danger: "#DC2626",
  dangerClair: "#FEF2F2",
  dangerBordure: "#FECACA",

  alerte: "#D97706",
  /** Texte d'un bandeau d'alerte, plus soutenu que l'icône. */
  alerteSombre: "#92400E",
  alerteClair: "#FFFBEB",
  alerteBordure: "#FCD34D",

  /** Reste à payer, échéance en attente. */
  attente: "#EA580C",
  attenteClair: "#FFEDD5",

  violet: "#7C3AED",
  violetClair: "#F5F3FF",

  /** Bleu d'information : encarts « pour aller plus loin », liens de repli. */
  info: "#1D4ED8",
  infoClair: "#EFF6FF",
  infoBordure: "#BFDBFE",

  /** Totaux cumulés (ventes du mois), distincts du violet du jour. */
  indigo: "#4F46E5",

  /*
   * ── Aplats portant du texte blanc ───────────────────────────────────
   *
   * Un bouton « Valider » et un montant encaissé sont tous deux verts, mais
   * pas du même vert : le premier est un fond sous du blanc, le second un
   * texte sur un fond. En thème sombre les deux divergent — le texte
   * s'éclaircit, l'aplat ne bouge pas, sans quoi le libellé blanc passerait
   * sous le seuil de contraste. D'où ces quatre jetons distincts.
   */
  actionPrimaire: "#E84A17",
  actionPrimaireVif: "#BD3A11",
  actionSecondaire: "#143747",
  actionSecondaireVif: "#0B222D",
  actionSucces: "#059669",
  actionSuccesVif: "#047857",
  actionDanger: "#DC2626",
  actionDangerVif: "#B91C1C",

  // ── Neutres ─────────────────────────────────────────────────────────
  /** Le texte reprend le bleu du logo plutôt qu'un gris neutre. */
  texte: "#143747",
  texteDoux: "#4B5563",
  texteFaible: "#6B7280",
  texteTresFaible: "#9CA3AF",

  fond: "#F8FAFB",
  surface: "#FFFFFF",
  surfaceDouce: "#F1F4F6",
  bordure: "#E3E8EC",
  bordureForte: "#CBD5DC",

  /** Barre d'état : texte foncé sur fond clair. */
  barreEtat: "dark" as "dark" | "light",
};

/**
 * Forme partagée par les deux palettes.
 *
 * Pas de `as const` sur la palette claire : il figerait chaque valeur sur son
 * littéral (`"#FD3F02"` plutôt que `string`) et la palette sombre ne pourrait
 * plus satisfaire le type.
 */
export type Palette = typeof PALETTE_CLAIRE;

/**
 * Palette sombre.
 *
 * Les mêmes clés, retournées : les teintes « claires » (`succesClair`,
 * `alerteClair`…) deviennent des fonds sourds, et les teintes pleines
 * s'éclaircissent pour rester lisibles sur ces fonds. Seuls les jetons
 * `action*`, qui portent du texte blanc, gardent leur valeur.
 */
export const PALETTE_SOMBRE: Palette = {
  primaire: "#F5906B",
  primaireSombre: "#F9A98A",
  primaireClair: "#2A1408",
  primaireBordure: "#5A2B10",

  secondaire: "#7FB3CC",
  secondaireSombre: "#A3CBDE",
  secondaireClair: "#17354F",
  secondaireBordure: "#1E4A72",

  succes: "#34D399",
  succesSombre: "#6EE7B7",
  succesClair: "#0D2F26",
  succesBordure: "#1D6450",

  danger: "#F87171",
  dangerClair: "#3A1616",
  dangerBordure: "#7F2A2A",

  alerte: "#FBBF24",
  alerteSombre: "#FDE68A",
  alerteClair: "#3A2B0C",
  alerteBordure: "#7C5C1A",

  attente: "#FB923C",
  attenteClair: "#4D2C15",

  violet: "#C4B5FD",
  violetClair: "#221A38",

  info: "#93C5FD",
  infoClair: "#17354F",
  infoBordure: "#1E4A72",

  indigo: "#A5B4FC",

  actionPrimaire: "#E84A17",
  actionPrimaireVif: "#CF4113",
  actionSecondaire: "#2F6480",
  actionSecondaireVif: "#3B7A9B",
  actionSucces: "#059669",
  actionSuccesVif: "#047857",
  actionDanger: "#DC2626",
  actionDangerVif: "#B91C1C",

  texte: "#F2F7F9",
  texteDoux: "#B2C4CE",
  texteFaible: "#90A6B2",
  texteTresFaible: "#6D848F",

  fond: "#0C1C25",
  surface: "#132934",
  surfaceDouce: "#18333F",
  bordure: "#27495A",
  bordureForte: "#33596B",

  barreEtat: "light",
};

/**
 * Palette par défaut.
 *
 * Réservée au code qui s'exécute hors composant (constantes de module,
 * helpers). Dans un composant, c'est `useStyles` ou `useCouleurs` qu'il faut
 * appeler : eux seuls suivent le thème choisi.
 */
export const couleurs = PALETTE_CLAIRE;

export const espacement = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const rayons = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  rond: 999,
} as const;

/**
 * Ombre portée des cartes.
 *
 * iOS et Android n'utilisent pas les mêmes propriétés ; les deux sont posées
 * ensemble, chaque plateforme ignorant celles qu'elle ne connaît pas. La
 * couleur ne dépend pas du thème : une ombre noire sur fond sombre ne se voit
 * pas, elle ne gêne pas non plus.
 */
export const ombre = {
  shadowColor: "#0B222D",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;
