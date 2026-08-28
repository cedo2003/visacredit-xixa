"use client";

/**
 * Rendu de l'écran d'accueil de l'application mobile, dans un cadre de
 * téléphone.
 *
 * Ce n'est pas une illustration inventée : la disposition, les libellés, les
 * couleurs et les icônes reprennent exactement
 * `mobile/app/(app)/(tiroir)/tableau-de-bord.tsx`, et les chiffres sont ceux
 * que l'API renvoie pour le compte de démonstration « Boutique Ayaba »
 * (détaillant). Toute évolution de l'écran mobile doit se répercuter ici, sinon
 * la vitrine promet un produit qui n'existe plus.
 *
 * Les couleurs sont écrites en dur, et non en classes Tailwind : ce sont celles
 * de `mobile/src/theme.ts`, recopiées telles quelles pour que l'écart entre les
 * deux fichiers se voie d'un coup d'œil. Le téléphone suit le thème du site
 * parce que l'application le fait aussi — une maquette claire sur un site
 * sombre annoncerait une application qui n'existe pas.
 */

import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

/** Recopie de `PALETTE_CLAIRE` — seules les clés utilisées ici. */
const PALETTE_CLAIRE = {
  succes: "#059669",
  secondaire: "#143747",
  violet: "#7C3AED",
  attente: "#EA580C",
  indigo: "#4F46E5",
  alerte: "#D97706",
  danger: "#DC2626",
  info: "#1D4ED8",
  infoClair: "#EFF6FF",
  infoBordure: "#BFDBFE",
  texte: "#143747",
  texteFaible: "#6B7280",
  fond: "#F8FAFB",
  surface: "#FFFFFF",
  surfaceDouce: "#F1F4F6",
  bordure: "#E3E8EC",
  actionPrimaire: "#E84A17",
};

type PaletteApercu = typeof PALETTE_CLAIRE;

/** Recopie de `PALETTE_SOMBRE`. */
const PALETTE_SOMBRE: PaletteApercu = {
  succes: "#34D399",
  secondaire: "#7FB3CC",
  violet: "#C4B5FD",
  attente: "#FB923C",
  indigo: "#A5B4FC",
  alerte: "#FBBF24",
  danger: "#F87171",
  info: "#93C5FD",
  infoClair: "#17354F",
  infoBordure: "#1E4A72",
  texte: "#F2F7F9",
  texteFaible: "#90A6B2",
  fond: "#0C1C25",
  surface: "#132934",
  surfaceDouce: "#18333F",
  bordure: "#27495A",
  actionPrimaire: "#E84A17",
};

/** Les six tuiles de l'accueil mobile, dans l'ordre de l'écran. */
function stats(c: PaletteApercu) {
  return [
    { valeur: "25 850 FCFA", libelle: "Solde actuel", couleur: c.succes, icone: "💚" },
    { valeur: "5", libelle: "Clients", couleur: c.secondaire, icone: "👥" },
    { valeur: "0 FCFA", libelle: "Ventes aujourd'hui", couleur: c.violet, icone: "📈" },
    { valeur: "2", libelle: "Créances en cours", couleur: c.attente, icone: "💰" },
    { valeur: "44 950 FCFA", libelle: "Ventes du mois", couleur: c.indigo, icone: "📊" },
    { valeur: "3", libelle: "Produits en alerte", couleur: c.alerte, icone: "⚠️" },
  ];
}

const RACCOURCIS = [
  { icone: "👤", titre: "Nouveau client", note: "Ajouté rapidement", principal: false },
  { icone: "🛒", titre: "Nouvelle vente", note: "Enregistrer une transaction", principal: true },
  { icone: "💸", titre: "Nouveau retrait", note: "Retirer de la caisse", principal: false },
];

export function ApercuMobile() {
  const t = useT();
  const { resolu } = useTheme();
  const c = resolu === "sombre" ? PALETTE_SOMBRE : PALETTE_CLAIRE;

  return (
    <div
      className="relative w-[20rem] shrink-0 rounded-[2.6rem] border-[10px] border-encre-800 bg-encre-800 shadow-2xl shadow-encre-900/30"
      role="img"
      aria-label={t("Écran d'accueil de l'application mobile Visacredit XIXA : solde, clients, ventes, créances et raccourcis")}
    >
      {/* Encoche */}
      <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/25" />

      <div className="overflow-hidden rounded-[2rem]" style={{ backgroundColor: c.fond }}>
        {/* En-tête : ☰ + salutation + cloche, comme sur mobile */}
        <div
          className="flex items-start gap-3 px-4 pb-3 pt-6"
          style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.bordure}` }}
        >
          <span className="pt-0.5 text-lg" style={{ color: c.texte }}>
            ☰
          </span>

          <div className="min-w-0 flex-1">
            <div
              className="truncate text-[0.95rem] font-extrabold"
              style={{ color: c.texte }}
            >
              {t("Bonjour, Rollande 👋")}
            </div>
            <div
              className="mt-0.5 text-[0.6rem] leading-snug"
              style={{ color: c.texteFaible }}
            >
              {t("Fournisseur en détail — vous commandez chez les grossistes et vendez à vos clients")}
            </div>
          </div>

          <span className="relative pt-0.5 text-base">
            🔔
            <span
              className="absolute -right-1.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[0.5rem] font-extrabold text-white"
              style={{ backgroundColor: "#DC2626" }}
            >
              3
            </span>
          </span>
        </div>

        {/* Corps de l'écran */}
        <div className="space-y-2.5 px-3.5 py-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            {stats(c).map((stat) => (
              <Tuile key={stat.libelle} palette={c} {...stat} />
            ))}
          </div>

          <Tuile
            palette={c}
            valeur="27 500 FCFA"
            libelle={t("Montant total des créances")}
            couleur={c.danger}
            icone="🧾"
          />

          {/* Raccourci propre au détaillant */}
          <div
            className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
            style={{ backgroundColor: c.infoClair, border: `1px solid ${c.infoBordure}` }}
          >
            <span className="text-lg">🔍</span>
            <div className="min-w-0 flex-1">
              <div className="text-[0.78rem] font-extrabold" style={{ color: c.info }}>
                {t("Chercher des produits")}
              </div>
              <div className="mt-0.5 text-[0.62rem]" style={{ color: c.info }}>
                {t("Trouver un grossiste et passer une commande")}
              </div>
            </div>
            <span className="text-lg" style={{ color: c.info }}>
              →
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {RACCOURCIS.map((raccourci) => (
              <Raccourci key={raccourci.titre} palette={c} {...raccourci} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pendant de `StatCarte` du mobile : valeur colorée, pastille d'icône, libellé. */
function Tuile({
  palette,
  valeur,
  libelle,
  couleur,
  icone,
}: {
  palette: PaletteApercu;
  valeur: string;
  libelle: string;
  couleur: string;
  icone: string;
}) {
  const t = useT();
  return (
    <div
      className="rounded-2xl px-3 py-2.5 shadow-sm"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.bordure}` }}
    >
      <div className="flex items-start justify-between gap-1.5">
        <span
          className="whitespace-nowrap text-[0.75rem] font-extrabold"
          style={{ color: couleur }}
        >
          {valeur}
        </span>
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[0.6rem]"
          style={{ backgroundColor: `${couleur}1A` }}
        >
          {icone}
        </span>
      </div>
      <div className="mt-1 text-[0.6rem]" style={{ color: palette.texteFaible }}>
        {t(libelle)}
      </div>
    </div>
  );
}

function Raccourci({
  palette,
  icone,
  titre,
  note,
  principal,
}: {
  palette: PaletteApercu;
  icone: string;
  titre: string;
  note: string;
  principal: boolean;
}) {
  const t = useT();
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl px-1.5 py-3 text-center shadow-sm"
      style={
        principal
          ? { backgroundColor: palette.actionPrimaire }
          : { backgroundColor: palette.surface, border: `1px solid ${palette.bordure}` }
      }
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
        style={{
          backgroundColor: principal ? "rgba(255,255,255,0.22)" : palette.surfaceDouce,
        }}
      >
        {icone}
      </span>
      <span
        className="text-[0.6rem] font-bold leading-tight"
        style={{ color: principal ? "#ffffff" : palette.texte }}
      >
        {t(titre)}
      </span>
      <span
        className="text-[0.52rem] leading-tight"
        style={{ color: principal ? "#FFD9C7" : palette.texteFaible }}
      >
        {t(note)}
      </span>
    </div>
  );
}
