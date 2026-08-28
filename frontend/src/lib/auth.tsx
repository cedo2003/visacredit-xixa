"use client";

/**
 * Session utilisateur côté client.
 *
 * Remplace $_SESSION : le JWT est stocké dans le navigateur et le profil est
 * rechargé depuis /api/auth/me au démarrage. Les helpers estGrossiste /
 * estDetaillant reprennent ceux de config.php.
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
import { useRouter } from "next/navigation";
import { api, ecrireToken, effacerToken, lireToken } from "./api";
import type { User } from "./types";

interface ContexteAuth {
  user: User | null;
  chargement: boolean;
  estGrossiste: boolean;
  estDetaillant: boolean;
  connexion: (telephone: string, password: string) => Promise<void>;
  inscription: (donnees: DonneesInscription) => Promise<void>;
  deconnexion: () => void;
  rafraichir: () => Promise<void>;
}

export interface DonneesInscription {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  password: string;
  nom_boutique: string;
  etatEts: string;
}

const Contexte = createContext<ContexteAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [chargement, setChargement] = useState(true);
  const router = useRouter();

  const rafraichir = useCallback(async () => {
    if (!lireToken()) {
      setUser(null);
      setChargement(false);
      return;
    }

    try {
      setUser(await api.get<User>("/api/auth/me"));
    } catch {
      // Jeton expiré ou révoqué : on repart d'une session vide.
      effacerToken();
      setUser(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void rafraichir();
  }, [rafraichir]);

  const connexion = useCallback(async (telephone: string, password: string) => {
    const { token } = await api.post<{ token: string }>("/api/auth/login", {
      telephone,
      password,
    });
    ecrireToken(token);
    setUser(await api.get<User>("/api/auth/me"));
  }, []);

  const inscription = useCallback(async (donnees: DonneesInscription) => {
    const reponse = await api.post<{ token: string; user: User }>(
      "/api/auth/register",
      donnees,
    );
    ecrireToken(reponse.token);
    setUser(reponse.user);
  }, []);

  const deconnexion = useCallback(() => {
    effacerToken();
    setUser(null);
    router.push("/connexion");
  }, [router]);

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
