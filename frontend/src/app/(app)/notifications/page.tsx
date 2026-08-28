"use client";

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateHeure } from "@/lib/format";
import type { NotificationItem } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Carte,
  Chargement,
  EtatVide,
  TitrePage,
} from "@/components/ui";
import ModaleConfirmation, {
  type DemandeConfirmation,
} from "@/components/ModaleConfirmation";

interface Reponse {
  notifications: NotificationItem[];
  non_lues: number;
}

/**
 * Les pictogrammes vivent ici, pas en base : les tables sont en CHARSET=utf8
 * (3 octets), qui ne peut pas stocker les emojis sur 4 octets — MySQL les
 * remplacerait par « ? ». Le serveur n'enregistre donc que du texte.
 */
const ICONES: Record<string, string> = {
  nouvelle_commande: "📦",
  commande_validee: "✅",
  commande_livree: "🚚",
  commande_rejetee: "❌",
  demande_paiement: "💳",
  echeance_proche: "⏰",
};

export default function Notifications() {
  const t = useT();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState("");
  const [demande, setDemande] = useState<DemandeConfirmation | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      setDonnees(await api.get<Reponse>("/api/notifications"));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function toutMarquer() {
    await api.post("/api/notifications/tout-lu");
    await charger();
  }

  async function marquerLue(notification: NotificationItem) {
    if (notification.lu) return;
    await api.post(`/api/notifications/${notification.id}/lue`);
    await charger();
  }

  /** Exécute la suppression demandée puis referme la modale. */
  async function executer(appel: () => Promise<unknown>) {
    setErreur("");
    setEnCours(true);

    try {
      await appel();
      await charger();
      setDemande(null);
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Suppression impossible."));
      setDemande(null);
    } finally {
      setEnCours(false);
    }
  }

  function confirmerSuppression(notification: NotificationItem) {
    setDemande({
      titre: t("Supprimer cette notification ?"),
      message: notification.titre,
      onConfirmer: () =>
        executer(() => api.delete(`/api/notifications/${notification.id}`)),
    });
  }

  function confirmerSuppressionLues() {
    const nombre = donnees?.notifications.filter((n) => n.lu).length ?? 0;

    setDemande({
      titre: t("Supprimer les notifications lues ?"),
      message: `${nombre} notification(s) déjà lue(s) seront supprimées. Celles non lues sont conservées.`,
      libelleConfirmer: "Supprimer les lues",
      onConfirmer: () => executer(() => api.delete("/api/notifications/lues")),
    });
  }

  function confirmerSuppressionToutes() {
    const total = donnees?.notifications.length ?? 0;
    const nonLues = donnees?.non_lues ?? 0;

    setDemande({
      titre: t("Tout supprimer ?"),
      message: `Les ${total} notification(s) de votre compte seront supprimées.`,
      avertissement:
        nonLues > 0
          ? `Attention : ${nonLues} notification(s) non lue(s) seront également supprimées. Cette action est définitive.`
          : t("Cette action est définitive."),
      libelleConfirmer: "Tout supprimer",
      onConfirmer: () => executer(() => api.delete("/api/notifications/toutes")),
    });
  }

  if (erreur && !donnees) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  return (
    <div>
      <TitrePage
        titre={t("Notifications")}
        sousTitre={
          donnees.non_lues > 0
            ? `${donnees.non_lues} notification(s) non lue(s)`
            : t("Tout est à jour")
        }
        action={
          donnees.notifications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {donnees.non_lues > 0 && (
                <Bouton variante="neutre" onClick={toutMarquer}>
                  {t("Tout marquer comme lu")}
                </Bouton>
              )}
              {donnees.notifications.some((n) => n.lu) && (
                <Bouton variante="neutre" onClick={confirmerSuppressionLues}>
                  {t("Supprimer les lues")}
                </Bouton>
              )}
              <Bouton variante="danger" onClick={confirmerSuppressionToutes}>
                {t("Tout supprimer")}
              </Bouton>
            </div>
          ) : undefined
        }
      />

      {erreur && <Alerte>{erreur}</Alerte>}

      {donnees.notifications.length === 0 ? (
        <EtatVide
          titre={t("Aucune notification")}
          description={t("Les événements de vos commandes apparaîtront ici.")}
        />
      ) : (
        <div className="space-y-3">
          {donnees.notifications.map((notification) => {
            // Le corps de la carte reste cliquable (lien ou simple marquage
            // comme lu) ; le bouton Supprimer est son frère, jamais son enfant :
            // un <button> imbriqué dans un <a> n'est pas du HTML valide.
            const corps = (
              <>
                <span className="text-2xl leading-none">
                  {ICONES[notification.type] ?? "🔔"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-titre">
                    {notification.titre}
                  </span>
                  <span className="mt-1 block text-sm text-doux">
                    {notification.message}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-estompe">
                  {dateHeure(notification.created_at)}
                </span>
              </>
            );

            return (
              <Carte
                key={notification.id}
                className={`transition hover:shadow-md ${
                  notification.lu ? "opacity-70" : "border-l-4 border-marque-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  {notification.lien ? (
                    <Link
                      href={notification.lien}
                      onClick={() => void marquerLue(notification)}
                      className="flex min-w-0 flex-1 items-start gap-4"
                    >
                      {corps}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void marquerLue(notification)}
                      className="flex min-w-0 flex-1 items-start gap-4 text-left"
                    >
                      {corps}
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={t("Supprimer cette notification")}
                    title="Supprimer"
                    onClick={() => confirmerSuppression(notification)}
                    className="shrink-0 rounded-lg p-2 text-estompe transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </Carte>
            );
          })}
        </div>
      )}

      {demande && (
        <ModaleConfirmation
          demande={demande}
          enCours={enCours}
          onAnnuler={() => setDemande(null)}
        />
      )}
    </div>
  );
}
