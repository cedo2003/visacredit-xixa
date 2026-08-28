/**
 * Notifications — port de frontend/src/app/(app)/notifications/page.tsx.
 *
 * Les liens sont déjà traduits en routes par ApiPresenter::lienFrontend ; ils
 * pointent donc vers /commandes/12, /creances… — les mêmes chemins que ceux du
 * routeur mobile, au préfixe de groupe près.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Bouton,
  Carte,
  Chargement,
  EtatVide,
  LienTexte,
  ModaleConfirmation,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { dateHeure } from "@/lib/format";
import type { NotificationItem } from "@/lib/types";
import { couleurs, espacement, rayons, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface Reponse {
  notifications: NotificationItem[];
  non_lues: number;
}

/**
 * Les chemins servis par l'API sont ceux du frontend web (« /commandes/12 »).
 * Le routeur mobile utilise les mêmes — les groupes (app) et (tiroir)
 * n'apparaissent pas dans les URL — mais tous les écrans du web n'ont pas leur
 * équivalent ici. Un lien non reconnu n'est donc pas ouvert, plutôt que de
 * risquer un écran « route introuvable ».
 */
const ROUTES_CONNUES = [
  "/commandes",
  "/ventes",
  "/creances",
  "/credits",
  "/notations",
  "/tableau-de-bord",
];

function versRouteMobile(lien: string | null): Href | null {
  if (!lien) return null;

  // Le reçu de commande du web n'a pas d'écran dédié ici : la fiche le porte.
  const chemin = lien.replace(/\/recu$/, "");

  if (!ROUTES_CONNUES.some((route) => chemin === route || chemin.startsWith(`${route}/`))) {
    return null;
  }

  return chemin as Href;
}

export default function Notifications() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();

  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/notifications");

  const [erreurAction, setErreurAction] = useState("");
  const [suppressionVisible, setSuppressionVisible] = useState<"lues" | "toutes" | null>(null);
  const [enCours, setEnCours] = useState(false);

  const notifications = donnees?.notifications ?? [];
  const nonLues = donnees?.non_lues ?? 0;

  async function ouvrir(notification: NotificationItem) {
    if (!notification.lu) {
      try {
        await api.post(`/api/notifications/${notification.id}/lue`);
        void recharger();
      } catch {
        // Marquer comme lu n'est pas critique : on ouvre quand même.
      }
    }

    const route = versRouteMobile(notification.lien);
    if (route) router.push(route);
  }

  async function toutMarquerLu() {
    setErreurAction("");

    try {
      await api.post("/api/notifications/tout-lu");
      await recharger();
    } catch (e) {
      setErreurAction(t(messageErreur(e, "Opération impossible.")));
    }
  }

  async function supprimer(portee: "lues" | "toutes") {
    setEnCours(true);
    setErreurAction("");

    try {
      await api.delete(`/api/notifications/${portee}`);
      await recharger();
    } catch (e) {
      setErreurAction(t(messageErreur(e, "Suppression impossible.")));
    } finally {
      setEnCours(false);
      setSuppressionVisible(null);
    }
  }

  async function supprimerUne(notification: NotificationItem) {
    setErreurAction("");

    try {
      await api.delete(`/api/notifications/${notification.id}`);
      await recharger();
    } catch (e) {
      setErreurAction(t(messageErreur(e, "Suppression impossible.")));
    }
  }

  return (
    <>
      <Ecran
        titre={t("Notifications")}
        sousTitre={nonLues > 0 ? `${nonLues} non lue(s)` : "Tout est à jour"}
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >
        {erreur ? <Alerte>{erreur}</Alerte> : null}
        {erreurAction ? <Alerte>{erreurAction}</Alerte> : null}

        {notifications.length > 0 ? (
          <View style={styles.actionsGlobales}>
            {nonLues > 0 ? (
              <Bouton variante="neutre" compact onPress={toutMarquerLu}>
                {t("Tout marquer lu")}
              </Bouton>
            ) : null}
            <Bouton
              variante="neutre"
              compact
              onPress={() => setSuppressionVisible("lues")}
            >
              {t("Supprimer les lues")}
            </Bouton>
            <Bouton
              variante="danger"
              compact
              onPress={() => setSuppressionVisible("toutes")}
            >
              {t("Tout supprimer")}
            </Bouton>
          </View>
        ) : null}

        {chargement ? (
          <Chargement />
        ) : notifications.length === 0 ? (
          <EtatVide
            titre={t("Aucune notification")}
            description={t("Les validations de commandes, réceptions et paiements apparaîtront ici.")}
          />
        ) : (
          notifications.map((notification) => (
            <Pressable key={notification.id} onPress={() => ouvrir(notification)}>
              {({ pressed }) => (
                <Carte
                  style={{
                    ...(notification.lu ? {} : styles.carteNonLue),
                    ...(pressed ? styles.cartePressee : {}),
                  }}
                >
                  <View style={styles.ligne}>
                    {!notification.lu ? <View style={styles.point} /> : null}

                    <View style={styles.textes}>
                      <Text style={styles.titre}>{notification.titre}</Text>
                      <Text style={styles.message}>{notification.message}</Text>
                      <Text style={styles.date}>{dateHeure(notification.created_at)}</Text>
                    </View>

                    <LienTexte
                      couleur={couleurs.texteTresFaible}
                      onPress={() => supprimerUne(notification)}
                    >
                      ✕
                    </LienTexte>
                  </View>
                </Carte>
              )}
            </Pressable>
          ))
        )}
      </Ecran>

      <ModaleConfirmation
        visible={suppressionVisible !== null}
        titre={
          suppressionVisible === "toutes"
            ? t("Supprimer toutes les notifications ?")
            : t("Supprimer les notifications lues ?")
        }
        message={
          suppressionVisible === "toutes"
            ? t("Y compris celles que vous n'avez pas encore consultées.")
            : t("Les notifications non lues sont conservées.")
        }
        libelleConfirmer={t("Supprimer")}
        enCours={enCours}
        onAnnuler={() => setSuppressionVisible(null)}
        onConfirmer={() => suppressionVisible && void supprimer(suppressionVisible)}
      />
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  actionsGlobales: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espacement.sm,
  },
  carteNonLue: {
    borderColor: couleurs.primaireBordure,
    backgroundColor: couleurs.primaireClair,
  },
  cartePressee: {
    opacity: 0.7,
  },
  ligne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: rayons.rond,
    backgroundColor: couleurs.primaire,
    marginTop: 6,
  },
  textes: {
    flex: 1,
  },
  titre: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  message: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: couleurs.texteDoux,
  },
  date: {
    marginTop: 5,
    fontSize: 11,
    color: couleurs.texteTresFaible,
  },
});
