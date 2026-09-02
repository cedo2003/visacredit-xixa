/**
 * Client HTTP de l'API Symfony.
 *
 * Remplace les appels directs à PDO des anciennes pages PHP. Le jeton JWT est
 * conservé côté navigateur et joint à chaque requête ; une réponse 401 purge la
 * session et renvoie vers l'écran de connexion.
 */

// Vide par défaut : les appels partent en relatif (`/api/...`) vers l'origine
// qui sert les pages, et next.config.ts les relaie au backend par le réseau
// interne. Une seule origine, donc aucun CORS — en développement comme en
// production. Ne renseigner NEXT_PUBLIC_API_URL que pour viser une API sur un
// autre domaine, ce qui impose alors de régler CORS_ALLOW_ORIGIN côté Symfony.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const CLE_TOKEN = "visacredit_xixa_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function lireToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLE_TOKEN);
}

export function ecrireToken(token: string) {
  window.localStorage.setItem(CLE_TOKEN, token);
}

export function effacerToken() {
  window.localStorage.removeItem(CLE_TOKEN);
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

async function requete<T>(chemin: string, options: Options = {}): Promise<T> {
  const { body, headers, ...reste } = options;
  const token = lireToken();

  const reponse = await fetch(`${BASE_URL}${chemin}`, {
    ...reste,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (reponse.status === 401) {
    effacerToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/connexion")) {
      window.location.href = "/connexion";
    }
    throw new ApiError("Session expirée, veuillez vous reconnecter.", 401);
  }

  if (reponse.status === 204) {
    return undefined as T;
  }

  const texte = await reponse.text();
  const donnees = texte ? JSON.parse(texte) : null;

  if (!reponse.ok) {
    // L'API renvoie {error}. LexikJWT renvoie {message} sur les échecs de login.
    const message =
      donnees?.error ?? donnees?.message ?? "Une erreur est survenue.";
    throw new ApiError(message, reponse.status);
  }

  return donnees as T;
}

/**
 * Télécharge un fichier servi par l'API.
 *
 * Un simple lien ne convient pas : le jeton voyage dans un en-tête
 * `Authorization`, qu'un `<a href>` ne peut pas poser. On récupère donc le
 * corps de la réponse, puis on déclenche l'enregistrement depuis le navigateur.
 *
 * Le nom du fichier vient de l'en-tête `Content-Disposition` s'il est lisible ;
 * il ne l'est pas toujours, un proxy pouvant le retirer, d'où le repli.
 */
export async function telecharger(chemin: string, nomParDefaut: string): Promise<void> {
  const token = lireToken();

  const reponse = await fetch(`${BASE_URL}${chemin}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!reponse.ok) {
    throw new ApiError(
      reponse.status === 404 ? "Document introuvable." : "Le téléchargement a échoué.",
      reponse.status,
    );
  }

  const disposition = reponse.headers.get("Content-Disposition") ?? "";
  const trouve = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const nom = trouve ? decodeURIComponent(trouve[1]) : nomParDefaut;

  const blob = await reponse.blob();
  const url = URL.createObjectURL(blob);

  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();

  // Sans cette libération, le blob reste en mémoire tant que l'onglet vit.
  URL.revokeObjectURL(url);
}

export const api = {
  get: <T>(chemin: string) => requete<T>(chemin),
  post: <T>(chemin: string, body?: unknown) =>
    requete<T>(chemin, { method: "POST", body }),
  put: <T>(chemin: string, body?: unknown) =>
    requete<T>(chemin, { method: "PUT", body }),
  patch: <T>(chemin: string, body?: unknown) =>
    requete<T>(chemin, { method: "PATCH", body }),
  delete: <T>(chemin: string) => requete<T>(chemin, { method: "DELETE" }),
};
