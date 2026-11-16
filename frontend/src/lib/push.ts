/**
 * Notifications push du navigateur (Web Push).
 *
 * Le navigateur s'abonne auprès de son propre service push (Google, Mozilla,
 * Apple…) avec la clé publique VAPID de l'API, puis remet cet abonnement à
 * l'API (/api/push/abonnements). Chaque notification de la boutique lui est
 * alors envoyée, même onglet fermé ; public/sw.js l'affiche.
 *
 * Deux conditions que l'application ne maîtrise pas :
 *  - un contexte sécurisé : HTTPS, ou localhost en développement. Sur une
 *    adresse IP en HTTP, le navigateur n'expose tout simplement pas l'API ;
 *  - la permission de l'utilisateur, qui ne se demande qu'en réponse à un
 *    geste (un clic) — d'où le bouton, plutôt qu'une demande au chargement.
 */

import { useEffect } from "react";
import { api } from "./api";

export type EtatPush =
  /** Navigateur trop ancien, ou contexte non sécurisé (HTTP). */
  | "indisponible"
  /** L'API n'a pas de clés VAPID : rien à faire côté navigateur. */
  | "non-configure"
  /** L'utilisateur a bloqué les notifications pour ce site. */
  | "refuse"
  | "actif"
  | "inactif";

const SW = "/sw.js";

function supporte(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Page servie en HTTP sur une adresse autre que localhost : le navigateur refuse le push. */
export function contexteNonSecurise(): boolean {
  return typeof window !== "undefined" && !window.isSecureContext;
}

async function clePublique(): Promise<string | null> {
  const { cle_publique_web } = await api.get<{ cle_publique_web: string | null }>("/api/push/config");
  return cle_publique_web;
}

/** La clé VAPID arrive en base64 « URL » ; l'API Push la veut en octets. */
function versOctets(base64: string): Uint8Array<ArrayBuffer> {
  const complet = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(complet);
  const octets = new Uint8Array(new ArrayBuffer(brut.length));
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

async function enregistrement(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register(SW, { scope: "/", updateViaCache: "none" });
  return navigator.serviceWorker.ready;
}

async function transmettre(abonnement: PushSubscription): Promise<void> {
  await api.post("/api/push/abonnements", { canal: "web", ...abonnement.toJSON() });
}

/**
 * Abonnement en cours, partagé.
 *
 * S'abonner auprès du service push prend plusieurs secondes. Deux appels
 * simultanés — la synchronisation de connexion et un clic sur « Activer »,
 * ou un effet React joué deux fois — créeraient deux abonnements, dont un
 * mort-né. Le second appel attend donc le premier.
 */
let abonnementEnCours: Promise<PushSubscription> | null = null;

function abonner(cle: string): Promise<PushSubscription> {
  abonnementEnCours ??= (async () => {
    const sw = await enregistrement();
    return (
      (await sw.pushManager.getSubscription()) ??
      (await sw.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: versOctets(cle) }))
    );
  })().finally(() => {
    abonnementEnCours = null;
  });

  return abonnementEnCours;
}

export async function etatPush(): Promise<EtatPush> {
  if (!supporte()) return "indisponible";
  if (Notification.permission === "denied") return "refuse";
  if (!(await clePublique())) return "non-configure";

  const existant = await navigator.serviceWorker.getRegistration(SW);
  const abonnement = await existant?.pushManager.getSubscription();

  return abonnement && Notification.permission === "granted" ? "actif" : "inactif";
}

/**
 * Demande la permission et abonne ce navigateur. À appeler depuis un clic.
 *
 * @returns l'état obtenu : « actif », ou « refuse » si l'utilisateur a dit non
 */
export async function activerPush(): Promise<EtatPush> {
  if (!supporte()) return "indisponible";

  const cle = await clePublique();
  if (!cle) return "non-configure";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "refuse" : "inactif";

  await transmettre(await abonner(cle));
  return "actif";
}

/** Coupe le push sur ce navigateur, côté navigateur comme côté API. */
export async function desactiverPush(): Promise<void> {
  if (!supporte()) return;

  const abonnement = await (await navigator.serviceWorker.getRegistration(SW))?.pushManager.getSubscription();
  if (!abonnement) return;

  await api.post("/api/push/desabonnement", { endpoint: abonnement.endpoint }).catch(() => {});
  await abonnement.unsubscribe();
}

/**
 * Remet l'abonnement de ce navigateur à la boutique connectée.
 *
 * Appelé à chaque ouverture de session : la permission une fois accordée vaut
 * pour toutes les sessions suivantes, sans redemander. Cela couvre aussi un
 * navigateur partagé — il suit la dernière boutique connectée — et un
 * abonnement que le navigateur a renouvelé de lui-même.
 */
export async function synchroniserPush(): Promise<void> {
  if (!supporte() || Notification.permission !== "granted") return;

  try {
    const cle = await clePublique();
    if (!cle) return;

    await transmettre(await abonner(cle));
  } catch {
    // Service push injoignable, clés changées… L'application marche sans.
  }
}

/**
 * Retire ce navigateur de la boutique qui se déconnecte, en gardant la
 * permission : la prochaine session le réabonnera sans rien demander.
 * À appeler tant que le jeton est encore valable.
 */
export async function oublierAppareil(): Promise<void> {
  if (!supporte()) return;

  try {
    const abonnement = await (await navigator.serviceWorker.getRegistration(SW))?.pushManager.getSubscription();
    if (abonnement) await api.post("/api/push/desabonnement", { endpoint: abonnement.endpoint });
  } catch {
    // Au pire, le prochain push arrivera sur un navigateur déconnecté : le
    // clic mènera à l'écran de connexion.
  }
}

/** Exécute `rappel` à chaque push reçu pendant que la page est ouverte. */
export function useSurPush(rappel: () => void): void {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    function surMessage(e: MessageEvent) {
      if (e.data?.type === "xixa-notification") rappel();
    }

    navigator.serviceWorker.addEventListener("message", surMessage);
    return () => navigator.serviceWorker.removeEventListener("message", surMessage);
  }, [rappel]);
}
