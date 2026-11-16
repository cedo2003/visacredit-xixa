/**
 * Client HTTP de l'API Symfony — pendant mobile de frontend/src/lib/api.ts.
 *
 * L'application partage le serveur du web : mêmes comptes, mêmes données, et
 * les commandes B2B circulent réellement d'un téléphone à l'autre. C'est aussi
 * ce qui lui permet de recevoir les notifications en push (voir ./push.ts).
 *
 * L'interface (`api.get`, `api.post`…) est celle qu'utilisaient déjà les
 * écrans : ils n'ont pas eu à changer.
 *
 * Le JWT est rangé dans le stockage sécurisé du téléphone, et la session
 * survit à la fermeture de l'application tant qu'il est valide.
 */

import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const CLE_TOKEN = "visacredit_xixa_session";

/** Adresse de production, quand le build n'en précise pas d'autre. */
const API_PRODUCTION = "http://13.140.134.229:8090";

/** Port de l'API Symfony en développement (demarrer-mobile.bat). */
const PORT_API_DEV = 8000;

/** Au-delà, on considère le serveur injoignable plutôt que de laisser l'écran tourner. */
const DELAI_MS = 20000;

/**
 * Adresse de l'API vue depuis le téléphone.
 *
 *  1. `EXPO_PUBLIC_API_URL`, figée au build (mobile/.env) — c'est elle qui
 *     compte pour un APK distribué ;
 *  2. en développement, la machine qui sert Metro : c'est le PC du
 *     développeur, où tourne aussi l'API (« localhost » désignerait le
 *     téléphone lui-même) ;
 *  3. à défaut, la production.
 */
function resoudreUrlApi(): string {
  const explicite = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicite) return explicite.replace(/\/+$/, "");

  if (__DEV__) {
    const hote = Constants.expoConfig?.hostUri?.split(":")[0];
    if (hote) return `http://${hote}:${PORT_API_DEV}`;
  }

  return API_PRODUCTION;
}

/** Affiché dans Paramètres, pour savoir à quel serveur parle l'application. */
export const BASE_URL = resoudreUrlApi();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Copie en mémoire du jeton.
 * `undefined` = pas encore lu, `null` = lu et absent.
 */
let jetonEnMemoire: string | null | undefined;

export async function lireToken(): Promise<string | null> {
  if (jetonEnMemoire !== undefined) return jetonEnMemoire;

  try {
    jetonEnMemoire = await SecureStore.getItemAsync(CLE_TOKEN);
  } catch {
    // Keystore indisponible : on repart d'une session vide plutôt que de
    // bloquer l'application au démarrage.
    jetonEnMemoire = null;
  }

  return jetonEnMemoire;
}

export async function ecrireToken(token: string): Promise<void> {
  jetonEnMemoire = token;
  await SecureStore.setItemAsync(CLE_TOKEN, token);
}

export async function effacerToken(): Promise<void> {
  jetonEnMemoire = null;
  await SecureStore.deleteItemAsync(CLE_TOKEN);
}

/** Abonnement à l'expiration de session — AuthProvider s'en sert pour rediriger. */
type EcouteurSession = () => void;

const ecouteurs = new Set<EcouteurSession>();

export function surSessionExpiree(ecouteur: EcouteurSession): () => void {
  ecouteurs.add(ecouteur);
  return () => ecouteurs.delete(ecouteur);
}

type Methode = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function requete<T>(methode: Methode, chemin: string, corps?: unknown): Promise<T> {
  const token = await lireToken();
  const abandon = new AbortController();
  const minuterie = setTimeout(() => abandon.abort(), DELAI_MS);

  let reponse: Response;
  try {
    reponse = await fetch(`${BASE_URL}${chemin}`, {
      method: methode,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal: abandon.signal,
    });
  } catch {
    // Pas de réseau, serveur arrêté, délai dépassé : le message doit dire
    // quoi faire, pas « Network request failed ».
    throw new ApiError("Serveur injoignable. Vérifiez votre connexion Internet, puis réessayez.", 0);
  } finally {
    clearTimeout(minuterie);
  }

  // Un 401 sur la connexion elle-même veut dire « identifiants faux », pas
  // « session expirée » : on laisse passer le message de l'API.
  if (reponse.status === 401 && chemin !== "/api/auth/login") {
    await effacerToken();
    ecouteurs.forEach((ecouteur) => ecouteur());
    throw new ApiError("Session expirée, veuillez vous reconnecter.", 401);
  }

  if (reponse.status === 204) {
    return undefined as T;
  }

  const texte = await reponse.text();
  let donnees: any = null;
  try {
    donnees = texte ? JSON.parse(texte) : null;
  } catch {
    // Page d'erreur HTML d'un proxy, par exemple.
  }

  if (!reponse.ok) {
    // L'API renvoie {error}. LexikJWT renvoie {message} sur les échecs de login.
    const message =
      donnees?.error ??
      (reponse.status === 401 ? "Téléphone ou mot de passe incorrect." : donnees?.message) ??
      "Une erreur est survenue.";
    throw new ApiError(message, reponse.status);
  }

  return donnees as T;
}

export const api = {
  get: <T>(chemin: string) => requete<T>("GET", chemin),
  post: <T>(chemin: string, body?: unknown) => requete<T>("POST", chemin, body),
  put: <T>(chemin: string, body?: unknown) => requete<T>("PUT", chemin, body),
  patch: <T>(chemin: string, body?: unknown) => requete<T>("PATCH", chemin, body),
  delete: <T>(chemin: string) => requete<T>("DELETE", chemin),
};

/** Message lisible pour n'importe quelle erreur remontée à l'écran. */
export function messageErreur(e: unknown, repli = "Une erreur est survenue."): string {
  return e instanceof Error ? e.message : repli;
}
