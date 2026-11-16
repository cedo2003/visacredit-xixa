"use client";

/**
 * Activation des notifications push sur ce navigateur.
 *
 * Deux portes, un même état :
 *  - le bandeau, en haut de chaque page, tant que le push n'est ni activé ni
 *    écarté — c'est par lui que la plupart des commerçants l'activeront ;
 *  - la carte de Paramètres, pour l'activer plus tard ou le couper.
 *
 * Le navigateur n'accepte de demander la permission qu'après un clic : on ne
 * peut donc pas la demander d'office au chargement.
 */

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { activerPush, contexteNonSecurise, desactiverPush, etatPush, type EtatPush } from "@/lib/push";
import { Alerte, Bouton, Carte } from "@/components/ui";

/** Le bandeau écarté ne revient pas sur ce navigateur ; Paramètres reste là. */
const CLE_BANDEAU_ECARTE = "visacredit_xixa_bandeau_push_ecarte";

function useEtatPush() {
  const [etat, setEtat] = useState<EtatPush | null>(null);

  const actualiser = useCallback(() => {
    etatPush()
      .then(setEtat)
      .catch(() => setEtat("indisponible"));
  }, []);

  useEffect(actualiser, [actualiser]);

  return { etat, setEtat, actualiser };
}

export function BandeauPush() {
  const t = useT();
  const { etat, setEtat } = useEtatPush();
  const [ecarte, setEcarte] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(CLE_BANDEAU_ECARTE) === "1";
    } catch {
      return false;
    }
  });
  const [enCours, setEnCours] = useState(false);

  if (etat !== "inactif" || ecarte) return null;

  async function activer() {
    setEnCours(true);
    try {
      setEtat(await activerPush());
    } catch {
      setEtat("inactif");
    } finally {
      setEnCours(false);
    }
  }

  function ecarter() {
    try {
      window.localStorage.setItem(CLE_BANDEAU_ECARTE, "1");
    } catch {
      // Stockage indisponible : le bandeau reviendra, ce n'est pas grave.
    }
    setEcarte(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-marque-200 bg-marque-50 px-5 py-3 sm:px-8">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-titre">{t("Recevez vos notifications en direct")}</p>
        <p className="mt-0.5 text-xs text-corps">
          {t("Commandes, paiements, livraisons : soyez prévenu sur cet appareil, même quand XIXA est fermé.")}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Bouton type="button" variante="neutre" onClick={ecarter} className="px-3 py-2">
          {t("Plus tard")}
        </Bouton>
        <Bouton type="button" onClick={activer} disabled={enCours} className="px-3 py-2">
          {enCours ? t("Activation…") : t("Activer")}
        </Bouton>
      </div>
    </div>
  );
}

export function CartePush() {
  const t = useT();
  const { etat, setEtat, actualiser } = useEtatPush();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  async function basculer() {
    setErreur("");
    setEnCours(true);
    try {
      if (etat === "actif") {
        await desactiverPush();
        actualiser();
      } else {
        setEtat(await activerPush());
      }
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Modification impossible."));
    } finally {
      setEnCours(false);
    }
  }

  const explication: Record<EtatPush, string> = {
    actif: "Activées sur cet appareil : vous êtes prévenu de chaque notification, même XIXA fermé.",
    inactif: "Désactivées sur cet appareil. Activez-les pour être prévenu de chaque commande, paiement ou livraison.",
    refuse:
      "Vous avez bloqué les notifications pour ce site. Autorisez-les dans les réglages du navigateur (icône à gauche de l'adresse), puis rechargez la page.",
    "non-configure": "Les notifications push ne sont pas encore configurées sur le serveur.",
    indisponible: contexteNonSecurise()
      ? "Votre navigateur n'autorise les notifications push que sur une connexion sécurisée (HTTPS)."
      : "Ce navigateur ne prend pas en charge les notifications push.",
  };

  return (
    <Carte>
      <h2 className="mb-1 text-lg font-bold">{t("Notifications push")}</h2>
      <p className="mb-4 text-sm text-faible">{etat ? t(explication[etat]) : t("Vérification…")}</p>

      {erreur && <Alerte>{erreur}</Alerte>}

      {(etat === "actif" || etat === "inactif") && (
        <Bouton
          type="button"
          variante={etat === "actif" ? "neutre" : "primaire"}
          onClick={basculer}
          disabled={enCours}
          className="w-full"
        >
          {enCours
            ? t("Patientez…")
            : etat === "actif"
              ? t("Désactiver sur cet appareil")
              : t("Activer sur cet appareil")}
        </Bouton>
      )}

      <p className="mt-4 text-xs text-faible">
        {t("Ce réglage vaut pour ce navigateur : activez-le sur chaque appareil où vous voulez être prévenu.")}
      </p>
    </Carte>
  );
}
