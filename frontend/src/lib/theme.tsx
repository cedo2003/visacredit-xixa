"use client";

/**
 * Thème clair / sombre.
 *
 * Le choix est propre à l'appareil, pas au compte : il est rangé dans
 * `localStorage` et non côté serveur. Une boutique qui travaille sur la
 * tablette de la caisse en plein jour et sur un téléphone le soir ne veut pas
 * le même réglage aux deux endroits, et le thème doit s'appliquer avant même
 * qu'on sache qui se connecte.
 *
 * Trois états : « système » suit le réglage de l'appareil, « clair » et
 * « sombre » le forcent. Le rendu réel est fait par le CSS — ce module ne pose
 * que l'attribut `data-theme` sur <html>.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ModeTheme = "systeme" | "clair" | "sombre";

/** Ce que l'écran affiche vraiment, une fois « système » résolu. */
export type ThemeResolu = "clair" | "sombre";

export const CLE_THEME = "xixa_theme";

export const LIBELLES_THEME: Record<ModeTheme, string> = {
  systeme: "Système",
  clair: "Clair",
  sombre: "Sombre",
};

/**
 * Script exécuté avant le premier rendu, injecté dans <head>.
 *
 * Sans lui la page s'afficherait en clair le temps que React s'hydrate, puis
 * basculerait — un éclair blanc à chaque ouverture. Il est écrit à la main
 * plutôt que généré : il doit rester minuscule et sans dépendance.
 */
export const SCRIPT_AMORCAGE = `(function(){try{var m=localStorage.getItem("${CLE_THEME}");if(m==="clair"||m==="sombre"){document.documentElement.setAttribute("data-theme",m)}}catch(e){}})()`;

/** Prévient les abonnés d'un changement fait dans cet onglet ; `storage` ne couvre que les autres. */
const EVENEMENT_LOCAL = "xixa:theme";

interface ContexteTheme {
  mode: ModeTheme;
  resolu: ThemeResolu;
  definir: (mode: ModeTheme) => void;
}

const Contexte = createContext<ContexteTheme | null>(null);

/*
 * Le mode et la préférence système sont deux états extérieurs à React —
 * `localStorage` et une requête média. `useSyncExternalStore` les lit au bon
 * moment plutôt que de les recopier dans un état local depuis un effet : c'est
 * ce qui évite le rendu en cascade, et l'instantané serveur règle du même coup
 * la question de l'hydratation.
 */

function souscrireMode(rappel: () => void) {
  window.addEventListener("storage", rappel);
  window.addEventListener(EVENEMENT_LOCAL, rappel);
  return () => {
    window.removeEventListener("storage", rappel);
    window.removeEventListener(EVENEMENT_LOCAL, rappel);
  };
}

function lireMode(): ModeTheme {
  try {
    const brut = localStorage.getItem(CLE_THEME);
    if (brut === "clair" || brut === "sombre" || brut === "systeme") return brut;
  } catch {
    // Navigation privée, stockage refusé : on retombe sur le réglage système.
  }
  return "systeme";
}

/** Le serveur ne connaît pas l'appareil : il rend le thème système, comme le script d'amorçage. */
function lireModeServeur(): ModeTheme {
  return "systeme";
}

const REQUETE_SOMBRE = "(prefers-color-scheme: dark)";

function souscrireSysteme(rappel: () => void) {
  if (typeof matchMedia !== "function") return () => {};
  const requete = matchMedia(REQUETE_SOMBRE);
  requete.addEventListener("change", rappel);
  return () => requete.removeEventListener("change", rappel);
}

function lireSysteme(): boolean {
  return typeof matchMedia === "function" && matchMedia(REQUETE_SOMBRE).matches;
}

function lireSystemeServeur(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(souscrireMode, lireMode, lireModeServeur);
  const systemeSombre = useSyncExternalStore(
    souscrireSysteme,
    lireSysteme,
    lireSystemeServeur,
  );

  const definir = useCallback((suivant: ModeTheme) => {
    const racine = document.documentElement;
    if (suivant === "systeme") racine.removeAttribute("data-theme");
    else racine.setAttribute("data-theme", suivant);

    try {
      localStorage.setItem(CLE_THEME, suivant);
    } catch {
      // Le thème s'applique quand même, il ne survivra simplement pas au rechargement.
    }

    window.dispatchEvent(new Event(EVENEMENT_LOCAL));
  }, []);

  const valeur = useMemo<ContexteTheme>(
    () => ({
      mode,
      resolu: mode === "systeme" ? (systemeSombre ? "sombre" : "clair") : mode,
      definir,
    }),
    [mode, systemeSombre, definir],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useTheme(): ContexteTheme {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useTheme doit être utilisé dans un ThemeProvider.");
  return contexte;
}
