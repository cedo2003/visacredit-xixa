/**
 * Thème clair / sombre de l'application.
 *
 * Le réglage appartient à l'appareil, pas au compte : il est rangé dans
 * SecureStore et non dans la base, pour s'appliquer avant même l'écran de
 * connexion. Trois états — « système » suit le réglage du téléphone, « clair »
 * et « sombre » le forcent.
 *
 * ## Pourquoi `useStyles` et pas simplement `couleurs`
 *
 * `StyleSheet.create` fige les valeurs au chargement du module : une feuille
 * écrite une fois pour toutes ne peut pas changer de couleur ensuite. Chaque
 * écran expose donc une *fabrique* de styles, `(couleurs) => StyleSheet.create(…)`,
 * et `useStyles` lui rend la feuille correspondant au thème actif. Les feuilles
 * sont mémorisées par palette : la fabrique n'est exécutée qu'une fois par
 * thème et par écran, pas à chaque rendu.
 */

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { PALETTE_CLAIRE, PALETTE_SOMBRE, type Palette } from "@/theme";

export type ModeTheme = "systeme" | "clair" | "sombre";
export type ThemeResolu = "clair" | "sombre";

const CLE_THEME = "visacredit_xixa_theme";

export const LIBELLES_THEME: Record<ModeTheme, string> = {
  systeme: "Système",
  clair: "Clair",
  sombre: "Sombre",
};

interface ContexteTheme {
  mode: ModeTheme;
  resolu: ThemeResolu;
  couleurs: Palette;
  definir: (mode: ModeTheme) => void;
}

const Contexte = createContext<ContexteTheme | null>(null);

/*
 * Le mode vit dans SecureStore, hors de React. `useSyncExternalStore` le lit au
 * moment du rendu plutôt que de le recopier dans un état depuis un effet — ce
 * qui évite l'éclair de thème clair au démarrage, la lecture synchrone donnant
 * la bonne valeur dès le premier rendu.
 */
const abonnes = new Set<() => void>();

function souscrire(rappel: () => void) {
  abonnes.add(rappel);
  return () => {
    abonnes.delete(rappel);
  };
}

function lireMode(): ModeTheme {
  try {
    const brut = SecureStore.getItem(CLE_THEME);
    if (brut === "clair" || brut === "sombre" || brut === "systeme") return brut;
  } catch {
    // Trousseau indisponible : on retombe sur le réglage du téléphone.
  }
  return "systeme";
}

/** Mémorisé pour que `useSyncExternalStore` ne voie pas un nouvel instantané à chaque rendu. */
let modeEnCache: ModeTheme | null = null;

function instantane(): ModeTheme {
  if (modeEnCache === null) modeEnCache = lireMode();
  return modeEnCache;
}

function ecrireMode(mode: ModeTheme) {
  modeEnCache = mode;
  abonnes.forEach((rappel) => rappel());

  // L'écriture est asynchrone ; l'affichage, lui, a déjà basculé.
  void SecureStore.setItemAsync(CLE_THEME, mode).catch(() => {
    // Le thème s'applique quand même, il ne survivra pas au redémarrage.
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(souscrire, instantane);
  const schemaSysteme = useColorScheme();

  const valeur = useMemo<ContexteTheme>(() => {
    const resolu: ThemeResolu =
      mode === "systeme" ? (schemaSysteme === "dark" ? "sombre" : "clair") : mode;

    return {
      mode,
      resolu,
      couleurs: resolu === "sombre" ? PALETTE_SOMBRE : PALETTE_CLAIRE,
      definir: ecrireMode,
    };
  }, [mode, schemaSysteme]);

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useTheme(): ContexteTheme {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useTheme doit être utilisé dans un ThemeProvider.");
  return contexte;
}

/** La palette active, pour les couleurs posées directement dans le JSX. */
export function useCouleurs(): Palette {
  return useTheme().couleurs;
}

/*
 * Cache des feuilles de style : une entrée par fabrique, puis une par palette.
 * La WeakMap laisse le ramasse-miettes libérer la feuille avec le module qui la
 * définit.
 */
const cacheStyles = new WeakMap<object, Map<Palette, unknown>>();

/**
 * Rend la feuille de styles correspondant au thème actif.
 *
 * ```ts
 * const creerStyles = (couleurs: Palette) => StyleSheet.create({ … });
 * // puis, dans le composant :
 * const styles = useStyles(creerStyles);
 * ```
 */
export function useStyles<T>(fabrique: (couleurs: Palette) => T): T {
  const couleurs = useCouleurs();

  return useMemo(() => {
    let parPalette = cacheStyles.get(fabrique);
    if (!parPalette) {
      parPalette = new Map<Palette, unknown>();
      cacheStyles.set(fabrique, parPalette);
    }

    if (!parPalette.has(couleurs)) parPalette.set(couleurs, fabrique(couleurs));
    return parPalette.get(couleurs) as T;
  }, [fabrique, couleurs]);
}
