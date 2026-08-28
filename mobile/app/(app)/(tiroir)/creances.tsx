/**
 * Créances clients — port de frontend/src/app/(app)/creances/page.tsx.
 *
 * L'encaissement en espèces est imputé immédiatement ; en mobile money l'API
 * renvoie une intention de paiement, confirmée après passage du widget.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import PaiementMobile from "@/components/PaiementMobile";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  Chargement,
  EtatVide,
  LigneInfo,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { badgeCreance, date, montant as formaterMontant } from "@/lib/format";
import type { Creance, IntentionPaiement } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface Reponse {
  creances: Creance[];
  total_en_cours: number;
  montant_en_cours: number;
}

export default function Creances() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/creances");

  const [aRegler, setARegler] = useState<Creance | null>(null);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);
  const [message, setMessage] = useState("");

  const creances = donnees?.creances ?? [];
  const enCours = creances.filter((c) => c.statut !== "payee");
  const soldees = creances.filter((c) => c.statut === "payee");

  return (
    <>
      <Ecran
        titre={t("Créances clients")}
        sousTitre={t("Ce que vos clients vous doivent encore")}
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >
        {erreur ? <Alerte>{erreur}</Alerte> : null}
        {message ? <Alerte type="succes">{message}</Alerte> : null}

        <Carte>
          <LigneInfo libelle={t("Créances en cours")}>{donnees?.total_en_cours ?? 0}</LigneInfo>
          <LigneInfo libelle={t("Montant total")} fort couleur={couleurs.attente}>
            {formaterMontant(donnees?.montant_en_cours ?? 0)}
          </LigneInfo>
        </Carte>

        {chargement ? (
          <Chargement />
        ) : creances.length === 0 ? (
          <EtatVide
            titre={t("Aucune créance")}
            description={t("Toutes vos ventes sont soldées. Les ventes à crédit apparaîtront ici.")}
          />
        ) : (
          <>
            {enCours.map((creance) => (
              <LigneCreance
                key={creance.id}
                creance={creance}
                onRegler={() => {
                  setMessage("");
                  setARegler(creance);
                }}
              />
            ))}

            {soldees.length > 0 ? (
              <>
                <Text style={styles.titreGroupe}>{t("Créances soldées")}</Text>
                {soldees.map((creance) => (
                  <LigneCreance key={creance.id} creance={creance} />
                ))}
              </>
            ) : null}
          </>
        )}
      </Ecran>

      {aRegler ? (
        <ModaleReglement
          creance={aRegler}
          onFermer={() => setARegler(null)}
          onEspeces={(texte) => {
            setARegler(null);
            setMessage(texte);
            void recharger();
          }}
          onPasserelle={(paiement) => {
            setARegler(null);
            setIntention(paiement);
          }}
        />
      ) : null}

      {intention ? (
        <PaiementMobile
          intention={intention}
          onSucces={() => {
            setIntention(null);
            setMessage(t("Paiement encaissé."));
            void recharger();
          }}
          onAnnuler={() => {
            setIntention(null);
            void recharger();
          }}
        />
      ) : null}
    </>
  );
}

function LigneCreance({
  creance,
  onRegler,
}: {
  creance: Creance;
  onRegler?: () => void;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const badge = badgeCreance(creance.statut, creance.en_retard, couleurs);

  return (
    <Carte>
      <View style={styles.ligne}>
        <View style={styles.textes}>
          <Text style={styles.client}>
            {creance.client?.nom_complet ?? "Client de passage"}
          </Text>
          <Text style={styles.facture}>
            {creance.vente?.numero_facture ?? "—"} · échéance {creance.numero_echeance}/
            {creance.nb_echeances_total}
          </Text>
          <Text style={styles.limite}>À régler avant le {date(creance.date_limite)}</Text>
        </View>

        <View style={styles.droite}>
          <Text style={styles.montant}>{formaterMontant(creance.montant_restant)}</Text>
          <Badge fond={badge.fond} texte={badge.texte}>
            {t(badge.label)}
          </Badge>
        </View>
      </View>

      {onRegler ? (
        <View style={styles.action}>
          <Bouton compact onPress={onRegler}>
            {t("Encaisser")}
          </Bouton>
        </View>
      ) : null}
    </Carte>
  );
}

/** Saisie du règlement — reprend save_paiement_creance.php. */
function ModaleReglement({
  creance,
  onFermer,
  onEspeces,
  onPasserelle,
}: {
  creance: Creance;
  onFermer: () => void;
  onEspeces: (message: string) => void;
  onPasserelle: (paiement: IntentionPaiement) => void;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const [montantSaisi, setMontantSaisi] = useState(
    String(Math.round(creance.montant_restant)),
  );
  const [mode, setMode] = useState("espece");
  const [telephone, setTelephone] = useState(creance.client?.telephone ?? "");
  const [identifiant, setIdentifiant] = useState("");
  const [repartition, setRepartition] = useState("client");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre() {
    setErreur("");
    setEnvoi(true);

    try {
      const reponse = await api.post<{ paiement: IntentionPaiement | null }>(
        `/api/creances/${creance.id}/paiement`,
        {
          montant: parseFloat(montantSaisi) || 0,
          mode_paiement: mode,
          telephone,
          fedapay_identifiant: identifiant,
          repartition_frais: repartition,
        },
      );

      if (reponse.paiement) {
        onPasserelle(reponse.paiement);
      } else {
        onEspeces(`Paiement de ${formaterMontant(parseFloat(montantSaisi))} enregistré.`);
      }
    } catch (e) {
      setErreur(t(messageErreur(e, "Paiement impossible.")));
      setEnvoi(false);
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onFermer}>
      <Pressable style={styles.voile} onPress={onFermer}>
        <Pressable style={styles.feuille} onPress={() => {}}>
          <View style={styles.poignee} />

          <Text style={styles.modaleTitre}>{t("Encaisser une créance")}</Text>
          <Text style={styles.modaleSousTitre}>
            {creance.client?.nom_complet ?? "Client de passage"} ·{" "}
            {formaterMontant(creance.montant_restant)} restant
          </Text>

          {/* Défilement nécessaire : en mobile money la feuille dépasse la
              hauteur disponible une fois le clavier ouvert. */}
          <ScrollView
            contentContainerStyle={styles.modaleCorps}
            keyboardShouldPersistTaps="handled"
          >
            {erreur ? <Alerte>{erreur}</Alerte> : null}

            <Champ
              label={t("Montant encaissé (FCFA)")}
              value={montantSaisi}
              onChangeText={setMontantSaisi}
              keyboardType="numeric"
            />

            <ChampSelect
              label={t("Mode de paiement")}
              valeur={mode}
              onChange={setMode}
              options={[
                { valeur: "espece", label: t("💵 Espèces") },
                { valeur: "mobile_money", label: t("📱 Mobile Money (KkiaPay)") },
                { valeur: "fedapay", label: t("💳 Agrégateur") },
              ]}
            />

            {mode === "mobile_money" ? (
              <Champ
                label={t("Numéro Mobile Money")}
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
              />
            ) : null}

            {mode === "fedapay" ? (
              <Champ
                label={t("Téléphone ou email de l'agrégateur")}
                value={identifiant}
                onChangeText={setIdentifiant}
                autoCapitalize="none"
              />
            ) : null}

            {mode !== "espece" ? (
              <ChampSelect
                label={t("Répartition des frais")}
                valeur={repartition}
                onChange={setRepartition}
                options={[
                  { valeur: "client", label: t("Le client paie les frais") },
                  { valeur: "vendeur", label: t("Je paie les frais") },
                  { valeur: "50_50", label: t("Moitié-moitié") },
                ]}
              />
            ) : null}

            <View style={styles.modaleActions}>
              <Bouton variante="neutre" onPress={onFermer} style={styles.modaleAction}>
                {t("Annuler")}
              </Bouton>
              <Bouton onPress={soumettre} disabled={envoi} style={styles.modaleAction}>
                {envoi ? "…" : "Valider"}
              </Bouton>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  titreGroupe: {
    marginTop: espacement.lg,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: couleurs.texteFaible,
  },
  ligne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  textes: {
    flex: 1,
  },
  client: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  facture: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteDoux,
  },
  limite: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  droite: {
    alignItems: "flex-end",
    gap: 5,
  },
  montant: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.texte,
  },
  action: {
    marginTop: espacement.md,
    alignItems: "flex-start",
  },

  voile: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  feuille: {
    backgroundColor: couleurs.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: espacement.xxl,
    maxHeight: "88%",
  },
  poignee: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: couleurs.bordureForte,
    marginTop: espacement.md,
  },
  modaleTitre: {
    marginTop: espacement.lg,
    paddingHorizontal: espacement.xl,
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.texte,
  },
  modaleSousTitre: {
    marginTop: 3,
    paddingHorizontal: espacement.xl,
    fontSize: 13,
    color: couleurs.texteFaible,
  },
  modaleCorps: {
    padding: espacement.xl,
  },
  modaleActions: {
    flexDirection: "row",
    gap: espacement.md,
    marginTop: espacement.sm,
  },
  modaleAction: {
    flex: 1,
  },
});
