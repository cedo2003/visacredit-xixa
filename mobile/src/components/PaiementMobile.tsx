/**
 * Paiement mobile money (KkiaPay / agrégateur).
 *
 * Les deux passerelles ne fournissent qu'un widget JavaScript pour le web : il
 * n'existe pas de SDK React Native officiel. Le widget est donc chargé dans une
 * WebView à laquelle on injecte une page minimale ; quand il aboutit, la page
 * renvoie l'identifiant de transaction à l'application via postMessage.
 *
 * Point important, identique au web : la WebView ne fait qu'encaisser. C'est
 * /api/paiements/confirmer qui, côté serveur et avec la clé privée, revérifie
 * la transaction auprès de la passerelle avant d'imputer quoi que ce soit. Une
 * page manipulée ne peut donc pas déclarer un paiement qui n'a pas eu lieu.
 */

import { useT } from "@/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { api, messageErreur } from "../lib/api";
import { montant as formaterMontant } from "../lib/format";
import type { ConfigPasserelles, IntentionPaiement } from "../lib/types";
import { espacement, rayons, type Palette } from "../theme";
import { useStyles } from "../theme-contexte";
import { Alerte, Bouton, Carte } from "./ui";

/** Ce que la page injectée peut renvoyer à l'application. */
type MessageWidget =
  | { type: "succes"; transactionId: string }
  | { type: "echec"; message: string }
  | { type: "ferme" };

/**
 * Page hôte du widget.
 *
 * Elle est volontairement autonome (aucune ressource locale) : seule la
 * bibliothèque de la passerelle est chargée depuis son CDN. Les valeurs
 * interpolées viennent de l'API, jamais d'une saisie libre de l'utilisateur —
 * elles sont malgré tout passées par JSON.stringify pour rester des littéraux
 * JavaScript valides quoi qu'il arrive.
 */
function pageWidget(intention: IntentionPaiement, config: ConfigPasserelles): string {
  const commun = `
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      html, body {
        margin: 0; height: 100%;
        font-family: -apple-system, Roboto, sans-serif;
        background: #f9fafb; color: #6b7280;
        display: flex; align-items: center; justify-content: center;
      }
      p { font-size: 15px; }
    </style>
    <script>
      function envoyer(charge) {
        window.ReactNativeWebView.postMessage(JSON.stringify(charge));
      }
      // Le CDN peut être injoignable (réseau coupé) : sans ce garde-fou,
      // l'écran resterait bloqué sur « Ouverture… » sans explication.
      window.onerror = function (message) {
        envoyer({ type: 'echec', message: String(message) });
      };
    </script>
  `;

  if (intention.passerelle === "kkiapay") {
    return `<!doctype html><html lang="fr"><head>${commun}
      <script src="https://cdn.kkiapay.me/k.js"></script>
    </head><body>
      <p>{t("Ouverture du paiement KkiaPay…")}</p>
      <script>
        (function () {
          if (typeof openKkiapayWidget !== 'function') {
            envoyer({ type: 'echec', message: "Service KkiaPay inaccessible." });
            return;
          }

          // Le widget peut émettre son événement de succès deux fois.
          var envoye = false;

          addSuccessListener(function (reponse) {
            if (envoye) return;
            envoye = true;
            envoyer({ type: 'succes', transactionId: String(reponse.transactionId) });
          });

          addFailedListener(function () {
            envoyer({ type: 'echec', message: "Paiement échoué ou annulé." });
          });

          openKkiapayWidget({
            amount: ${Math.round(intention.montant_widget)},
            key: ${JSON.stringify(config.kkiapay.cle_publique)},
            sandbox: ${config.kkiapay.sandbox ? "true" : "false"},
            phone: ${JSON.stringify(intention.telephone ?? "")},
            data: ${JSON.stringify(intention.reference)},
            position: 'center',
            theme: '#F08E00'
          });
        })();
      </script>
    </body></html>`;
  }

  const identifiant = intention.identifiant ?? intention.telephone ?? "";
  const email = identifiant.includes("@") ? identifiant : "";
  const telephone = identifiant.includes("@") ? "" : identifiant;

  return `<!doctype html><html lang="fr"><head>${commun}
    <script src="https://cdn.fedapay.com/checkout.js?v=1.1.7"></script>
  </head><body>
    <p>{t("Ouverture du paiement…")}</p>
    <script>
      (function () {
        if (typeof FedaPay === 'undefined') {
          envoyer({ type: 'echec', message: "Service de paiement inaccessible." });
          return;
        }

        var widget = FedaPay.init({
          public_key: ${JSON.stringify(config.fedapay.cle_publique)},
          environment: ${JSON.stringify(config.fedapay.sandbox ? "sandbox" : "live")},
          transaction: {
            amount: ${Math.round(intention.montant_widget)},
            description: ${JSON.stringify(intention.description)}
          },
          customer: {
            email: ${JSON.stringify(email)} || undefined,
            phone_number: { number: ${JSON.stringify(telephone)} }
          },
          onComplete: function (reponse) {
            var id = reponse && reponse.transaction && reponse.transaction.id;
            if (id) {
              envoyer({ type: 'succes', transactionId: String(id) });
            } else {
              envoyer({ type: 'echec', message: "Paiement non abouti." });
            }
          }
        });

        widget.open();
      })();
    </script>
  </body></html>`;
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
  const styles = useStyles(creerStyles);
  const marges = useSafeAreaInsets();

  const [etat, setEtat] = useState<"pret" | "ouvert" | "verification" | "erreur">("pret");
  const [message, setMessage] = useState("");
  const [config, setConfig] = useState<ConfigPasserelles | null>(null);

  const dejaConfirme = useRef(false);

  useEffect(() => {
    api
      .get<ConfigPasserelles>("/api/paiements/config")
      .then(setConfig)
      .catch(() => setMessage(t("Configuration de paiement indisponible.")));
  }, []);

  const confirmer = useCallback(
    async (transactionId: string) => {
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
        setMessage(t(messageErreur(e, "Confirmation impossible.")));
        dejaConfirme.current = false;
      }
    },
    [intention, onSucces],
  );

  function surMessage(evenement: WebViewMessageEvent) {
    let charge: MessageWidget;

    try {
      charge = JSON.parse(evenement.nativeEvent.data);
    } catch {
      return;
    }

    if (charge.type === "succes") {
      void confirmer(charge.transactionId);
      return;
    }

    if (charge.type === "echec") {
      setEtat("erreur");
      setMessage(charge.message);
      return;
    }

    setEtat("pret");
  }

  const nomPasserelle = intention.passerelle === "kkiapay" ? t("KkiaPay") : t("Agrégateur");

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onAnnuler}>
      <View style={styles.voile}>
        {etat === "ouvert" && config ? (
          <View style={[styles.plein, { paddingTop: marges.top }]}>
            <View style={styles.barre}>
              <Text style={styles.barreTitre}>Paiement {nomPasserelle}</Text>
              <Pressable onPress={() => setEtat("pret")} hitSlop={10}>
                <Text style={styles.barreFermer}>✕</Text>
              </Pressable>
            </View>

            <WebView
              originWhitelist={["*"]}
              // baseUrl donne une origine https à la page : sans elle, Android
              // considère le contenu comme local et refuse les scripts distants.
              source={{ html: pageWidget(intention, config), baseUrl: "https://visacredit.local" }}
              onMessage={surMessage}
              javaScriptEnabled
              domStorageEnabled
              // Les widgets s'ouvrent dans une couche superposée, pas une popup.
              setSupportMultipleWindows={false}
              onError={() => {
                setEtat("erreur");
                setMessage(t("Impossible de charger la page de paiement."));
              }}
              style={styles.webview}
            />
          </View>
        ) : (
          <View style={styles.centre}>
            <Carte style={styles.carte}>
              <Text style={styles.titre}>{t("Paiement mobile money")}</Text>
              <Text style={styles.description}>{intention.description}</Text>

              <View style={styles.encart}>
                <Text style={styles.encartLibelle}>{t("Montant à encaisser")}</Text>
                <Text style={styles.encartMontant}>
                  {formaterMontant(intention.montant_widget)}
                </Text>
                <Text style={styles.encartNote}>via {nomPasserelle}</Text>
              </View>

              {message ? (
                <Alerte type={etat === "erreur" ? "erreur" : "info"}>{message}</Alerte>
              ) : null}

              {etat === "verification" ? (
                <Text style={styles.verification}>{t("Vérification du paiement en cours…")}</Text>
              ) : (
                <View style={styles.actions}>
                  <Bouton variante="neutre" onPress={onAnnuler} style={styles.action}>
                    {t("Plus tard")}
                  </Bouton>
                  <Bouton
                    onPress={() => {
                      setMessage("");
                      setEtat("ouvert");
                    }}
                    disabled={!config}
                    style={styles.action}
                  >
                    {etat === "erreur" ? t("Réessayer") : t("Payer maintenant")}
                  </Bouton>
                </View>
              )}

              <Text style={styles.mentions}>
                {t("L'opération n'est enregistrée qu'après vérification auprès de la passerelle.")}
              </Text>
            </Carte>
          </View>
        )}
      </View>
    </Modal>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  voile: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  centre: {
    flex: 1,
    justifyContent: "center",
    padding: espacement.xl,
  },
  plein: {
    flex: 1,
    backgroundColor: couleurs.surface,
  },
  barre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espacement.lg,
    paddingVertical: espacement.md,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.bordure,
  },
  barreTitre: {
    fontSize: 16,
    fontWeight: "700",
    color: couleurs.texte,
  },
  barreFermer: {
    fontSize: 20,
    color: couleurs.texteFaible,
    paddingHorizontal: espacement.sm,
  },
  webview: {
    flex: 1,
  },

  carte: {
    width: "100%",
  },
  titre: {
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.texte,
  },
  description: {
    marginTop: 3,
    fontSize: 13,
    color: couleurs.texteFaible,
  },
  encart: {
    marginVertical: espacement.xl,
    borderRadius: rayons.lg,
    backgroundColor: couleurs.succesClair,
    paddingVertical: espacement.xl,
    alignItems: "center",
  },
  encartLibelle: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: couleurs.succesSombre,
  },
  encartMontant: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "800",
    color: couleurs.succesSombre,
  },
  encartNote: {
    marginTop: 6,
    fontSize: 12,
    color: couleurs.succes,
  },
  verification: {
    paddingVertical: espacement.lg,
    textAlign: "center",
    fontSize: 14,
    color: couleurs.texteDoux,
  },
  actions: {
    flexDirection: "row",
    gap: espacement.md,
  },
  action: {
    flex: 1,
  },
  mentions: {
    marginTop: espacement.lg,
    textAlign: "center",
    fontSize: 11,
    color: couleurs.texteTresFaible,
    lineHeight: 16,
  },
});
