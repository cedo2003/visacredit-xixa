/**
 * Fiche client — port de frontend/src/app/(app)/clients/[id]/page.tsx.
 *
 * Les créances du client sont extraites de /api/creances plutôt que d'un
 * point d'entrée dédié : l'API n'en expose pas, et la liste complète des
 * créances d'une boutique reste courte.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import FormulaireClient from "@/components/FormulaireClient";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Chargement,
  LigneInfo,
  ModaleConfirmation,
  TitreSection,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { badgeCreance, date, montant } from "@/lib/format";
import type { Client, Creance } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface ReponseCreances {
  creances: Creance[];
}

export default function FicheClient() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const fiche = useRequete<Client>(id ? `/api/clients/${id}` : null);
  const creances = useRequete<ReponseCreances>("/api/creances");

  const [modification, setModification] = useState(false);
  const [erreur, setErreur] = useState("");
  const [suppressionVisible, setSuppressionVisible] = useState(false);
  const [suppression, setSuppression] = useState(false);

  if (fiche.chargement) return <Chargement />;

  if (fiche.erreur && !fiche.donnees) {
    return (
      <Ecran>
        <Alerte>{fiche.erreur}</Alerte>
      </Ecran>
    );
  }

  const client = fiche.donnees;
  if (!client) return null;

  const siennes = (creances.donnees?.creances ?? []).filter(
    (c) => c.client?.id === client.id,
  );
  const duTotal = siennes
    .filter((c) => c.statut !== "payee")
    .reduce((s, c) => s + c.montant_restant, 0);

  async function supprimer() {
    setSuppression(true);

    try {
      await api.delete(`/api/clients/${id}`);
      router.replace("/clients");
    } catch (e) {
      setErreur(t(messageErreur(e, "Suppression impossible.")));
      setSuppressionVisible(false);
    } finally {
      setSuppression(false);
    }
  }

  return (
    <Ecran onRafraichir={fiche.recharger} rafraichissement={fiche.rafraichissement}>
      {erreur ? <Alerte>{erreur}</Alerte> : null}

      <Carte>
        <Text style={styles.nom}>{client.nom_complet}</Text>
        <Text style={styles.inscrit}>Client depuis le {date(client.created_at)}</Text>

        <View style={styles.actionsRapides}>
          <Bouton
            variante="neutre"
            compact
            onPress={() => Linking.openURL(`tel:${client.telephone}`)}
          >
            {t("📞 Appeler")}
          </Bouton>
          <Bouton
            variante="neutre"
            compact
            onPress={() => Linking.openURL(`sms:${client.telephone}`)}
          >
            {t("💬 SMS")}
          </Bouton>
        </View>

        <View style={styles.infos}>
          <LigneInfo libelle={t("Téléphone")}>{client.telephone}</LigneInfo>
          {client.email ? <LigneInfo libelle={t("Email")}>{client.email}</LigneInfo> : null}
          {client.adresse ? <LigneInfo libelle={t("Adresse")}>{client.adresse}</LigneInfo> : null}
          {client.notes ? <LigneInfo libelle={t("Notes")}>{client.notes}</LigneInfo> : null}
          <LigneInfo
            libelle={t("Reste dû")}
            fort
            couleur={duTotal > 0 ? couleurs.attente : couleurs.succes}
          >
            {montant(duTotal)}
          </LigneInfo>
        </View>
      </Carte>

      {siennes.length > 0 ? (
        <Carte>
          <TitreSection>{t("Créances")}</TitreSection>

          {siennes.map((creance) => {
            const badge = badgeCreance(creance.statut, creance.en_retard, couleurs);

            return (
              <View key={creance.id} style={styles.creance}>
                <View style={styles.creanceTextes}>
                  <Text style={styles.creanceFacture}>
                    {creance.vente?.numero_facture ?? "Créance"}
                  </Text>
                  <Text style={styles.creanceDate}>
                    Échéance {creance.numero_echeance}/{creance.nb_echeances_total} ·{" "}
                    {date(creance.date_limite)}
                  </Text>
                </View>

                <View style={styles.creanceDroite}>
                  <Text style={styles.creanceMontant}>{montant(creance.montant_restant)}</Text>
                  <Badge fond={badge.fond} texte={badge.texte}>
                    {t(badge.label)}
                  </Badge>
                </View>
              </View>
            );
          })}

          <View style={styles.lienCreances}>
            <Bouton
              variante="neutre"
              compact
              onPress={() => router.push("/creances")}
            >
              {t("Encaisser une créance")}
            </Bouton>
          </View>
        </Carte>
      ) : null}

      <Carte>
        <TitreSection
          action={
            <Bouton variante="neutre" compact onPress={() => setModification((v) => !v)}>
              {modification ? t("Fermer") : t("Modifier")}
            </Bouton>
          }
        >
          {t("Coordonnées")}
        </TitreSection>

        {modification ? (
          <FormulaireClient
            client={client}
            onEnregistre={(misAJour) => {
              fiche.definir(misAJour);
              setModification(false);
            }}
          />
        ) : (
          <Text style={styles.aideModif}>
            {t("Appuyez sur « Modifier » pour corriger le nom, le téléphone ou l'adresse.")}
          </Text>
        )}
      </Carte>

      <Bouton variante="danger" pleineLargeur onPress={() => setSuppressionVisible(true)}>
        {t("Supprimer ce client")}
      </Bouton>

      <ModaleConfirmation
        visible={suppressionVisible}
        titre={t("Supprimer ce client ?")}
        message={`« ${client.nom_complet} » sera retiré de votre carnet. Ses ventes déjà enregistrées restent inchangées.`}
        libelleConfirmer={t("Supprimer")}
        enCours={suppression}
        onAnnuler={() => setSuppressionVisible(false)}
        onConfirmer={supprimer}
      />
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  nom: {
    fontSize: 20,
    fontWeight: "800",
    color: couleurs.texte,
  },
  inscrit: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  actionsRapides: {
    flexDirection: "row",
    gap: espacement.sm,
    marginTop: espacement.md,
  },
  infos: {
    marginTop: espacement.md,
    paddingTop: espacement.sm,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
  creance: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingVertical: espacement.sm,
  },
  creanceTextes: {
    flex: 1,
  },
  creanceFacture: {
    fontSize: 14,
    fontWeight: "600",
    color: couleurs.texte,
  },
  creanceDate: {
    marginTop: 1,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  creanceDroite: {
    alignItems: "flex-end",
    gap: 5,
  },
  creanceMontant: {
    fontSize: 14,
    fontWeight: "800",
    color: couleurs.texte,
  },
  lienCreances: {
    marginTop: espacement.md,
    alignItems: "flex-start",
  },
  aideModif: {
    fontSize: 13,
    color: couleurs.texteFaible,
    lineHeight: 19,
  },
});
