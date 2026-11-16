/**
 * Notifications push du téléphone.
 *
 * Le téléphone obtient un jeton Expo (`ExponentPushToken[…]`) et le remet à
 * l'API (/api/push/abonnements). Chaque notification de la boutique lui est
 * alors envoyée par le service push d'Expo, qui relaie vers Firebase (Android)
 * ou APNs (iOS) — application ouverte, en arrière-plan ou fermée.
 *
 * Limites à connaître :
 *  - Expo Go ne reçoit plus de push à distance sur Android depuis le SDK 53 :
 *    il faut un build (APK de développement ou de production) ;
 *  - Android exige un projet Firebase (google-services.json, voir le README) ;
 *    sans lui, le jeton ne peut pas être obtenu.
 * Dans ces cas, l'application fonctionne normalement, sans push.
 */

import { useEffect } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { useRouter, type Href } from "expo-router";
import { api } from "./api";

/** Canal Android des notifications — le même nom que dans EnvoiPushService. */
const CANAL = "notifications";

/** Jeton remis à l'API, gardé pour pouvoir le retirer à la déconnexion. */
const CLE_JETON_PUSH = "visacredit_xixa_jeton_push";

export type EtatPush =
  /** Push reçu sur ce téléphone. */
  | "actif"
  /** L'utilisateur a refusé les notifications : seuls les réglages du téléphone peuvent les rétablir. */
  | "refuse"
  /** Expo Go, simulateur, Firebase absent… : pas de push possible ici. */
  | "indisponible";

// Application ouverte : la notification s'affiche quand même, en bandeau.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function dansExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function identifiantProjet(): string | undefined {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
}

/**
 * Demande la permission si besoin, obtient le jeton et le remet à l'API.
 *
 * Appelé à chaque ouverture de session : la boutique connectée récupère ce
 * téléphone, et un jeton renouvelé par le système est retransmis.
 */
export async function enregistrerAppareil(): Promise<EtatPush> {
  if (Platform.OS === "web" || dansExpoGo()) return "indisponible";

  try {
    // Android 13+ n'affiche la demande de permission qu'une fois un canal créé.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CANAL, {
        name: "Notifications",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F08E00",
      });
    }

    let { granted, canAskAgain } = await Notifications.getPermissionsAsync();
    if (!granted && canAskAgain) {
      ({ granted, canAskAgain } = await Notifications.requestPermissionsAsync());
    }
    if (!granted) return canAskAgain ? "indisponible" : "refuse";

    const { data: jeton } = await Notifications.getExpoPushTokenAsync({
      projectId: identifiantProjet(),
    });

    await api.post("/api/push/abonnements", { canal: "expo", token: jeton });
    await SecureStore.setItemAsync(CLE_JETON_PUSH, jeton);

    return "actif";
  } catch {
    // Firebase non configuré, réseau coupé… L'application marche sans push.
    return "indisponible";
  }
}

/** État actuel, sans rien demander à l'utilisateur. */
export async function etatPush(): Promise<EtatPush> {
  if (Platform.OS === "web" || dansExpoGo()) return "indisponible";

  try {
    const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
    if (!granted) return canAskAgain ? "indisponible" : "refuse";

    return (await SecureStore.getItemAsync(CLE_JETON_PUSH)) ? "actif" : "indisponible";
  } catch {
    return "indisponible";
  }
}

/**
 * Retire ce téléphone de la boutique qui se déconnecte. À appeler tant que le
 * jeton de session est encore valable.
 */
export async function oublierAppareil(): Promise<void> {
  try {
    const jeton = await SecureStore.getItemAsync(CLE_JETON_PUSH);
    if (!jeton) return;

    await api.post("/api/push/desabonnement", { token: jeton });
    await SecureStore.deleteItemAsync(CLE_JETON_PUSH);
  } catch {
    // Au pire, un push arrivera sur un téléphone déconnecté : l'appui mènera
    // à l'écran de connexion.
  }
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

export function versRouteMobile(lien: string | null | undefined): Href | null {
  if (!lien) return null;

  // Le reçu de commande du web n'a pas d'écran dédié ici : la fiche le porte.
  const chemin = lien.replace(/\/recu$/, "");

  if (!ROUTES_CONNUES.some((route) => chemin === route || chemin.startsWith(`${route}/`))) {
    return null;
  }

  return chemin as Href;
}

/**
 * Appui sur une notification : la marque comme lue et ouvre l'écran concerné.
 * Couvre aussi l'application lancée par cet appui (démarrage à froid).
 *
 * À monter une seule fois, dans la partie connectée de l'application.
 */
export function useOuvertureNotifications(): void {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "web") return;

    function ouvrir(reponse: Notifications.NotificationResponse | null) {
      if (!reponse || reponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

      const donnees = reponse.notification.request.content.data as {
        lien?: string | null;
        id?: number | null;
      };

      if (donnees.id) {
        void api.post(`/api/notifications/${donnees.id}/lue`).catch(() => {});
      }

      router.push(versRouteMobile(donnees.lien) ?? "/notifications");
      // Sans cela, la même réponse rouvrirait l'écran au prochain montage.
      Notifications.clearLastNotificationResponse();
    }

    ouvrir(Notifications.getLastNotificationResponse());

    const abonnement = Notifications.addNotificationResponseReceivedListener(ouvrir);
    return () => abonnement.remove();
  }, [router]);
}

/** Exécute `rappel` à chaque notification reçue pendant que l'application est ouverte. */
export function useSurPush(rappel: () => void): void {
  useEffect(() => {
    if (Platform.OS === "web") return;

    const abonnement = Notifications.addNotificationReceivedListener(() => rappel());
    return () => abonnement.remove();
  }, [rappel]);
}
