/**
 * Chargement de données d'écran.
 *
 * Le web se contentait d'un `useEffect` + `useState` par page. Sur mobile deux
 * besoins s'ajoutent :
 *   - recharger quand l'écran reprend le focus (on revient d'un formulaire qui
 *     vient de modifier la donnée : la liste doit être à jour) ;
 *   - le « tirer pour rafraîchir », geste attendu sur toute liste mobile.
 *
 * D'où ce petit hook plutôt qu'une bibliothèque de cache complète : le besoin
 * tient en trente lignes et l'application reste sans dépendance supplémentaire.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api, messageErreur } from "./api";
import { useT } from "@/i18n";

interface EtatRequete<T> {
  donnees: T | null;
  chargement: boolean;
  rafraichissement: boolean;
  erreur: string;
  /** Rechargement discret, sans vider l'écran (utilisé par le pull-to-refresh). */
  recharger: () => Promise<void>;
  /** Mise à jour locale, pour refléter une action sans refaire un aller-retour. */
  definir: (donnees: T | null) => void;
}

export function useRequete<T>(
  chemin: string | null,
  options: { rechargerAuFocus?: boolean } = {},
): EtatRequete<T> {
  const { rechargerAuFocus = true } = options;
  const t = useT();

  const [donnees, setDonnees] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [erreur, setErreur] = useState("");

  // Évite un setState sur un écran démonté quand la requête traîne.
  const monte = useRef(true);
  useEffect(() => {
    monte.current = true;
    return () => {
      monte.current = false;
    };
  }, []);

  const charger = useCallback(
    async (discret: boolean) => {
      if (!chemin) {
        setChargement(false);
        return;
      }

      if (discret) setRafraichissement(true);

      try {
        const reponse = await api.get<T>(chemin);
        if (!monte.current) return;
        setDonnees(reponse);
        setErreur("");
      } catch (e) {
        if (!monte.current) return;
        setErreur(t(messageErreur(e, "Chargement impossible.")));
      } finally {
        if (!monte.current) return;
        setChargement(false);
        setRafraichissement(false);
      }
    },
    [chemin, t],
  );

  useEffect(() => {
    setChargement(true);
    void charger(false);
  }, [charger]);

  // Premier rendu exclu : `charger` vient déjà de partir ci-dessus.
  const premierFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (premierFocus.current) {
        premierFocus.current = false;
        return;
      }
      if (rechargerAuFocus) {
        void charger(true);
      }
    }, [charger, rechargerAuFocus]),
  );

  return {
    donnees,
    chargement,
    rafraichissement,
    erreur,
    recharger: () => charger(true),
    definir: setDonnees,
  };
}
