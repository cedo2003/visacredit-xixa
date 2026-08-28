/**
 * Accès aux données — version autonome.
 *
 * L'application ne dépend d'aucun serveur : tout vit dans une base SQLite sur
 * le téléphone. Ce module conserve pourtant l'interface exacte du client HTTP
 * d'origine (`api.get`, `api.post`…) et se contente d'aiguiller vers le routeur
 * local. Les 25 écrans n'ont donc pas eu à changer, et un retour ultérieur vers
 * une API distante ne toucherait que ce fichier.
 *
 * Le « jeton » n'est plus un JWT mais l'identifiant de l'utilisateur connecté,
 * rangé dans le stockage sécurisé du téléphone. Voir local/modules/auth.
 */

import * as SecureStore from "expo-secure-store";
import { ErreurMetier } from "../local/base";
import { router, type Methode } from "../local/routeur";

const CLE_TOKEN = "visacredit_xixa_session";

/** Affiché dans Paramètres : il n'y a pas de serveur à joindre. */
export const BASE_URL = "Base locale (hors ligne)";

/** Conservé pour la compatibilité des écrans ; toujours faux hors ligne. */
export const tunnelDetecte = false;

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
 * Copie en mémoire de la session.
 * `undefined` = pas encore lue, `null` = lue et absente.
 */
let sessionEnMemoire: string | null | undefined;

export async function lireToken(): Promise<string | null> {
  if (sessionEnMemoire !== undefined) return sessionEnMemoire;

  try {
    sessionEnMemoire = await SecureStore.getItemAsync(CLE_TOKEN);
  } catch {
    // Keystore indisponible : on repart d'une session vide plutôt que de
    // bloquer l'application au démarrage.
    sessionEnMemoire = null;
  }

  return sessionEnMemoire;
}

export async function ecrireToken(token: string): Promise<void> {
  sessionEnMemoire = token;
  await SecureStore.setItemAsync(CLE_TOKEN, token);
}

export async function effacerToken(): Promise<void> {
  sessionEnMemoire = null;
  await SecureStore.deleteItemAsync(CLE_TOKEN);
}

/** Abonnement à l'expiration de session — AuthProvider s'en sert pour rediriger. */
type EcouteurSession = () => void;

const ecouteurs = new Set<EcouteurSession>();

export function surSessionExpiree(ecouteur: EcouteurSession): () => void {
  ecouteurs.add(ecouteur);
  return () => ecouteurs.delete(ecouteur);
}

async function requete<T>(methode: Methode, chemin: string, corps?: unknown): Promise<T> {
  try {
    return (await router(methode, chemin, (corps ?? {}) as Record<string, unknown>)) as T;
  } catch (e) {
    if (e instanceof ErreurMetier) {
      // Une session invalide se traite comme le 401 du serveur : on purge et
      // on prévient, le garde de navigation renvoie vers l'écran de connexion.
      if (e.status === 401) {
        await effacerToken();
        ecouteurs.forEach((ecouteur) => ecouteur());
      }

      throw new ApiError(e.message, e.status);
    }

    // Erreur inattendue (SQLite, bogue) : le message brut est plus utile ici
    // qu'un texte générique, l'application étant seule responsable.
    throw new ApiError(e instanceof Error ? e.message : "Une erreur est survenue.", 500);
  }
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
