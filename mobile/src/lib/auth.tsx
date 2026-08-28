/**
 * Session utilisateur — pendant mobile de frontend/src/lib/auth.tsx.
 *
 * Le JWT est conservé dans le stockage sécurisé du téléphone et le profil est
 * rechargé depuis /api/auth/me au démarrage. Les helpers estGrossiste /
 * estDetaillant reprennent ceux de config.php.
 *
 * À la différence du web, la session survit à la fermeture de l'application :
 * l'utilisateur retrouve sa boutique ouverte tant que le jeton est valide.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  ecrireToken,
  effacerToken,
  lireToken,
  surSessionExpiree,
} from "./api";
import type { User } from "./types";

interface ContexteAuth {
  user: User | null;
  /** Vrai tant que la session n'a pas été restaurée depuis le stockage. */
  chargement: boolean;
  estGrossiste: boolean;
  estDetaillant: boolean;
  connexion: (telephone: string, password: string) => Promise<void>;
  inscription: (donnees: DonneesInscription) => Promise<void>;
  deconnexion: () => Promise<void>;
  rafraichir: () => Promise<void>;
}

export interface DonneesInscription {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  password: string;
  nom_boutique: string;
  /** Obligatoire : l'API refuse l'inscription sans IFU. */
  ifu: string;
  /** Facultatif : son absence limite les retraits à la fréquence « 1 jour ». */
  registre_commerce?: string;
  date_naissance?: string;
  adresse?: string;
  etatEts: string;
}

const Contexte = createContext<ContexteAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [chargement, setChargement] = useState(true);

  const rafraichir = useCallback(async () => {
    if (!(await lireToken())) {
      setUser(null);
      setChargement(false);
      return;
    }

    try {
      setUser(await api.get<User>("/api/auth/me"));
    } catch {
      // Jeton expiré ou révoqué : on repart d'une session vide.
      await effacerToken();
      setUser(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void rafraichir();
  }, [rafraichir]);

  // Un 401 sur n'importe quelle requête vide la session ; la redirection est
  // faite par le garde de app//_layout.tsx, qui observe `user`.
  useEffect(() => surSessionExpiree(() => setUser(null)), []);

  const connexion = useCallback(async (telephone: string, password: string) => {
    const { token } = await api.post<{ token: string }>("/api/auth/login", {
      telephone,
      password,
    });

    await ecrireToken(token);
    setUser(await api.get<User>("/api/auth/me"));
  }, []);

  const inscription = useCallback(async (donnees: DonneesInscription) => {
    const reponse = await api.post<{ token: string; user: User }>(
      "/api/auth/register",
      donnees,
    );

    await ecrireToken(reponse.token);
    setUser(reponse.user);
  }, []);

  const deconnexion = useCallback(async () => {
    await effacerToken();
    setUser(null);
  }, []);

  const valeur = useMemo<ContexteAuth>(
    () => ({
      user,
      chargement,
      estGrossiste: user?.role === "grossiste",
      estDetaillant: user?.role === "detaillant",
      connexion,
      inscription,
      deconnexion,
      rafraichir,
    }),
    [user, chargement, connexion, inscription, deconnexion, rafraichir],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useAuth(): ContexteAuth {
  const contexte = useContext(Contexte);

  if (!contexte) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return contexte;
}
