"use client";

/**
 * Ouverture du widget de paiement mobile money et confirmation serveur.
 *
 * Remplace pages/ventes/kkiapay_payment.php, fedapay_payment.php et leurs
 * callbacks. Point important : le widget ne fait qu'encaisser. C'est
 * /api/paiements/confirmer qui, côté serveur et avec la clé privée, revérifie
 * la transaction auprès de la passerelle avant d'imputer quoi que ce soit —
 * le navigateur ne peut donc pas déclarer un paiement qui n'a pas eu lieu.
 */

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { montant } from "@/lib/format";
import type { IntentionPaiement } from "@/lib/types";
import { Alerte, Bouton, Carte } from "@/components/ui";

interface ConfigPasserelles {
  kkiapay: { cle_publique: string; sandbox: boolean };
  fedapay: { cle_publique: string; sandbox: boolean };
}

declare global {
  interface Window {
    openKkiapayWidget?: (options: Record<string, unknown>) => void;
    addSuccessListener?: (cb: (reponse: { transactionId: string }) => void) => void;
    addFailedListener?: (cb: (erreur: unknown) => void) => void;
    FedaPay?: {
      init: (options: Record<string, unknown>) => { open: () => void };
    };
  }
}

function chargerScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Script de paiement inaccessible."));
    document.head.appendChild(script);
  });
}

export default function PaiementMobile({
  intention,
  onSucces,
  onAnnuler,
}: {
  intention: IntentionPaiement;
  onSucces: () => void;
  onAnnuler: () => void;
}) {
  const t = useT();
  const [etat, setEtat] = useState<"pret" | "ouvert" | "verification" | "erreur">("pret");
  const [message, setMessage] = useState("");
  const [config, setConfig] = useState<ConfigPasserelles | null>(null);
  const dejaConfirme = useRef(false);

  useEffect(() => {
    api
      .get<ConfigPasserelles>("/api/paiements/config")
      .then(setConfig)
      .catch(() => setMessage(t("Configuration de paiement indisponible.")));
  }, [t]);

  const confirmer = useCallback(
    async (transactionId: string) => {
      // Le widget peut émettre deux fois son événement de succès.
      if (dejaConfirme.current) return;
      dejaConfirme.current = true;

      setEtat("verification");

      try {
        const reponse = await api.post<{ statut: string; message: string }>(
          "/api/paiements/confirmer",
          {
            reference: intention.reference,
            transaction_id: transactionId,
            passerelle: intention.passerelle,
          },
        );

        if (reponse.statut === "echec") {
          setEtat("erreur");
          setMessage(reponse.message);
          dejaConfirme.current = false;
          return;
        }

        onSucces();
      } catch (e) {
        setEtat("erreur");
        setMessage(e instanceof Error ? t(e.message) : t("Confirmation impossible."));
        dejaConfirme.current = false;
      }
    },
    [intention, onSucces, t],
  );

  async function ouvrir() {
    if (!config) return;
    setMessage("");
    setEtat("ouvert");

    try {
      if (intention.passerelle === "kkiapay") {
        await chargerScript(
          "https://cdn.kkiapay.me/k.js",
          "script-kkiapay",
        );

        window.addSuccessListener?.((reponse) => void confirmer(reponse.transactionId));
        window.addFailedListener?.(() => {
          setEtat("erreur");
          setMessage(t("Paiement échoué ou annulé."));
        });

        window.openKkiapayWidget?.({
          amount: Math.round(intention.montant_widget),
          key: config.kkiapay.cle_publique,
          sandbox: config.kkiapay.sandbox,
          phone: intention.telephone ?? "",
          data: intention.reference,
          position: "center",
          theme: "#E84A17",
        });
      } else {
        await chargerScript(
          "https://cdn.fedapay.com/checkout.js?v=1.1.7",
          "script-fedapay",
        );

        const widget = window.FedaPay?.init({
          public_key: config.fedapay.cle_publique,
          environment: config.fedapay.sandbox ? "sandbox" : "live",
          transaction: {
            amount: Math.round(intention.montant_widget),
            description: intention.description,
          },
          customer: {
            email: intention.identifiant?.includes("@") ? intention.identifiant : undefined,
            phone_number: { number: intention.identifiant ?? intention.telephone ?? "" },
          },
          onComplete: (reponse: { transaction?: { id?: string | number } }) => {
            const id = reponse?.transaction?.id;
            if (id) {
              void confirmer(String(id));
            } else {
              setEtat("erreur");
              setMessage(t("Paiement non abouti."));
            }
          },
        });

        widget?.open();
      }
    } catch (e) {
      setEtat("erreur");
      setMessage(
        e instanceof Error
          ? `${e.message} Vérifiez votre connexion, puis réessayez.`
          : "Ouverture du paiement impossible.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Carte className="w-full max-w-md">
        <h2 className="text-xl font-bold">{t("Paiement mobile money")}</h2>
        <p className="mt-1 text-sm text-faible">{intention.description}</p>

        <div className="my-6 rounded-2xl bg-emerald-50 p-5 text-center">
          <div className="text-xs uppercase tracking-wide text-emerald-700">
            {t("Montant à encaisser")}
          </div>
          <div className="mt-1 text-3xl font-bold text-emerald-700">
            {montant(intention.montant_widget)}
          </div>
          <div className="mt-2 text-xs text-emerald-600">
            via {intention.passerelle === "kkiapay" ? t("KkiaPay") : t("l’agrégateur")}
          </div>
        </div>

        {message && <Alerte type={etat === "erreur" ? "erreur" : "info"}>{message}</Alerte>}

        {etat === "verification" ? (
          <p className="py-4 text-center text-sm text-doux">
            {t("Vérification du paiement en cours…")}
          </p>
        ) : (
          <div className="flex gap-3">
            <Bouton variante="neutre" className="flex-1" onClick={onAnnuler}>
              {t("Plus tard")}
            </Bouton>
            <Bouton className="flex-1" onClick={ouvrir} disabled={!config}>
              {etat === "erreur" ? t("Réessayer") : t("Payer maintenant")}
            </Bouton>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-estompe">
          {t("L'opération n'est enregistrée qu'après vérification auprès de la passerelle.")}
        </p>
      </Carte>
    </div>
  );
}
