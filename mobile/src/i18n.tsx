/**
 * Français / anglais.
 *
 * ## La clé, c'est la phrase française
 *
 * `t("Nouvelle vente")` plutôt qu'une clé abstraite du genre `ventes.titre`.
 * Trois raisons : le code reste lisible sans aller-retour vers un fichier de
 * clés, le français — langue par défaut et langue source — s'affiche même si le
 * dictionnaire est incomplet, et une traduction manquante dégrade en français
 * au lieu de laisser une clé nue à l'écran.
 *
 * `node scripts/verifier-i18n.mjs` liste les entrées orphelines et les phrases
 * sans traduction.
 *
 * ## Portée
 *
 * Le choix appartient à l'appareil, comme le thème : rangé dans SecureStore, il
 * s'applique avant l'écran de connexion et ne suit pas le compte d'un téléphone
 * à l'autre.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { DICTIONNAIRE_EN } from "@/dictionnaire-en";
import { definirLocale } from "@/lib/format";

export type Langue = "fr" | "en";

export const LANGUES: Langue[] = ["fr", "en"];

export const LIBELLES_LANGUE: Record<Langue, string> = {
  fr: "Français",
  en: "English",
};

const CLE_LANGUE = "visacredit_xixa_langue";

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

/*
 * La langue vit dans SecureStore, hors de React. La lecture synchrone évite
 * l'éclair de français au démarrage d'une application réglée en anglais.
 */
const abonnes = new Set<() => void>();

function souscrire(rappel: () => void) {
  abonnes.add(rappel);
  return () => {
    abonnes.delete(rappel);
  };
}

function lireLangue(): Langue {
  try {
    if (SecureStore.getItem(CLE_LANGUE) === "en") return "en";
  } catch {
    // Trousseau indisponible : le français, langue par défaut, s'applique.
  }
  return "fr";
}

let langueEnCache: Langue | null = null;

function instantane(): Langue {
  if (langueEnCache === null) langueEnCache = lireLangue();
  return langueEnCache;
}

export function LangueProvider({ children }: { children: ReactNode }) {
  const langue = useSyncExternalStore(souscrire, instantane);

  // Montants et dates passent par Intl : ils suivent la langue sans que chaque
  // appelant ait à la leur passer.
  definirLocale(langue);

  const definir = useCallback((suivante: Langue) => {
    langueEnCache = suivante;
    abonnes.forEach((rappel) => rappel());

    void SecureStore.setItemAsync(CLE_LANGUE, suivante).catch(() => {
      // La langue s'applique quand même, elle ne survivra pas au redémarrage.
    });
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
