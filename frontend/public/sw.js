/**
 * Service worker de Visacredit XIXA — notifications push.
 *
 * Il ne fait que ça : afficher les push envoyés par l'API (EnvoiPushService)
 * et conduire au bon écran quand on clique dessus. Aucun cache, aucune
 * interception de requête : l'application fonctionne exactement comme sans lui.
 *
 * Servi sans cache (next.config.ts) pour qu'une nouvelle version soit prise
 * dès le prochain chargement.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let contenu = {};
  try {
    contenu = event.data ? event.data.json() : {};
  } catch {
    contenu = { message: event.data ? event.data.text() : "" };
  }

  const lien = contenu.lien || "/notifications";

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(contenu.titre || "Visacredit XIXA", {
        body: contenu.message || "",
        icon: "/icone-app.png",
        badge: "/icone-app.png",
        // Une même notification reçue deux fois (deux onglets, un renvoi)
        // ne s'empile pas.
        tag: contenu.id ? `notification-${contenu.id}` : undefined,
        lang: "fr",
        data: { lien },
      });

      // Les onglets ouverts rafraîchissent leur compteur de non-lues.
      const fenetres = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const fenetre of fenetres) {
        fenetre.postMessage({ type: "xixa-notification", id: contenu.id ?? null });
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const cible = new URL(event.notification.data?.lien || "/notifications", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const fenetres = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      // Un onglet XIXA déjà ouvert est réutilisé plutôt que d'en ouvrir un autre.
      for (const fenetre of fenetres) {
        if (new URL(fenetre.url).origin === self.location.origin) {
          await fenetre.focus();
          return fenetre.navigate(cible);
        }
      }

      return self.clients.openWindow(cible);
    })(),
  );
});
