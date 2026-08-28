"use client";

/**
 * Français / anglais.
 *
 * ## La clé, c'est la phrase française
 *
 * `t("Nouvelle vente")` plutôt qu'une clé abstraite du genre `ventes.titre`.
 * Trois raisons :
 * le code reste lisible sans aller-retour vers un fichier de clés, le français
 * — langue par défaut et langue source — s'affiche même si le dictionnaire est
 * incomplet, et une traduction manquante dégrade en français au lieu de laisser
 * une clé nue à l'écran.
 *
 * La contrepartie est connue : changer une phrase française oblige à changer
 * l'entrée correspondante du dictionnaire. `npm run i18n:verifier` (voir
 * `scripts/verifier-i18n.mjs`) liste les entrées orphelines.
 *
 * ## Portée
 *
 * Le choix appartient à l'appareil, comme le thème : rangé dans `localStorage`,
 * il s'applique avant la connexion et ne suit pas le compte d'un poste à
 * l'autre.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DICTIONNAIRE_EN } from "./dictionnaire-en";
import { definirLocale } from "./format";

export type Langue = "fr" | "en";

export const LANGUES: Langue[] = ["fr", "en"];

export const LIBELLES_LANGUE: Record<Langue, string> = {
  fr: "Français",
  en: "English",
};

export const CLE_LANGUE = "xixa_langue";

/** Pose `lang` sur <html> avant le premier rendu, pour les lecteurs d'écran et la césure. */
export const SCRIPT_LANGUE = `(function(){try{var l=localStorage.getItem("${CLE_LANGUE}");if(l==="en"){document.documentElement.setAttribute("lang","en")}}catch(e){}})()`;

/** Remplace les jetons `{nom}` par les valeurs fournies. */
function interpoler(modele: string, valeurs?: Record<string, string | number>): string {
  if (!valeurs) return modele;
  return modele.replace(/\{(\w+)\}/g, (entier, cle: string) =>
    cle in valeurs ? String(valeurs[cle]) : entier,
  );
}

export type Traducteur = (
  texte: string,
  valeurs?: Record<string, string | number>,
) => string;

interface ContexteLangue {
  langue: Langue;
  t: Traducteur;
  definir: (langue: Langue) => void;
}

const Contexte = createContext<ContexteLangue | null>(null);

const EVENEMENT_LOCAL = "xixa:langue";

function souscrire(rappel: () => void) {
  window.addEventListener("storage", rappel);
  window.addEventListener(EVENEMENT_LOCAL, rappel);
  return () => {
    window.removeEventListener("storage", rappel);
    window.removeEventListener(EVENEMENT_LOCAL, rappel);
  };
}

function lireLangue(): Langue {
  try {
    if (localStorage.getItem(CLE_LANGUE) === "en") return "en";
  } catch {
    // Stockage refusé : le français, langue par défaut, s'applique.
  }
  return "fr";
}

/** Le serveur ne connaît pas l'appareil : il rend le français, comme le script d'amorçage. */
function lireLangueServeur(): Langue {
  return "fr";
}

export function LangueProvider({ children }: { children: ReactNode }) {
  const langue = useSyncExternalStore(souscrire, lireLangue, lireLangueServeur);

  // Les montants et les dates passent par Intl : ils doivent suivre la langue
  // sans que chaque appelant ait à la leur passer.
  definirLocale(langue);

  const definir = useCallback((suivante: Langue) => {
    document.documentElement.setAttribute("lang", suivante);
    try {
      localStorage.setItem(CLE_LANGUE, suivante);
    } catch {
      // La langue s'applique quand même, elle ne survivra pas au rechargement.
    }
    window.dispatchEvent(new Event(EVENEMENT_LOCAL));
  }, []);

  const valeur = useMemo<ContexteLangue>(() => {
    const t: Traducteur = (texte, valeurs) =>
      interpoler(langue === "en" ? (DICTIONNAIRE_EN[texte] ?? texte) : texte, valeurs);

    return { langue, t, definir };
  }, [langue, definir]);

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useLangue(): ContexteLangue {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useLangue doit être utilisé dans un LangueProvider.");
  return contexte;
}

/** Raccourci pour le cas courant : seul le traducteur est utile. */
export function useT(): Traducteur {
  return useLangue().t;
}

/**
 * Traduit hors composant — messages d'erreur de l'API, tables de module.
 *
 * L'API répond en français ; comme la clé est la phrase française, ses messages
 * traversent le même dictionnaire que le reste. Ce qui n'y figure pas s'affiche
 * en français, ce qui vaut mieux qu'un code d'erreur.
 */
export function traduire(
  texte: string,
  langue: Langue,
  valeurs?: Record<string, string | number>,
): string {
  return interpoler(langue === "en" ? (DICTIONNAIRE_EN[texte] ?? texte) : texte, valeurs);
}
