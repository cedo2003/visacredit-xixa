/**
 * Choix de la passerelle et de la répartition des frais avant d'ouvrir le
 * widget — port de frontend/src/components/ChoixPasserelle.tsx
 * (lui-même issu de pages/commandes/selectionner_mode_paiement.php).
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { montant as formaterMontant } from "../lib/format";
import { espacement, rayons, type Palette } from "../theme";
import { useStyles } from "../theme-contexte";
import { Bouton, Carte, ChampSelect, ChoixCartes } from "./ui";

export type Passerelle = "kkiapay" | "fedapay";

export default function ChoixPasserelle({
  titre,
  montantDu,
  onValider,
  onFermer,
}: {
  titre: string;
  montantDu: number;
  onValider: (passerelle: Passerelle, repartition: string) => void;
  onFermer: () => void;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const [passerelle, setPasserelle] = useState<Passerelle>("kkiapay");
  const [repartition, setRepartition] = useState("client");

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onFermer}>
      <View style={styles.voile}>
        <Carte style={styles.carte}>
          <Text style={styles.titre}>{t("Demander le paiement")}</Text>
          <Text style={styles.sousTitre}>{titre}</Text>

          <View style={styles.encart}>
            <Text style={styles.encartLibelle}>{t("À recevoir")}</Text>
            <Text style={styles.encartMontant}>{formaterMontant(montantDu)}</Text>
          </View>

          <ChoixCartes<Passerelle>
            label={t("Passerelle")}
            valeur={passerelle}
            onChange={setPasserelle}
            options={[
              { valeur: "kkiapay", titre: t("📱 KkiaPay"), note: t("Mobile Money — frais 1,9 %") },
              { valeur: "fedapay", titre: t("💳 Agrégateur"), note: t("Carte et mobile — frais 1,8 %") },
            ]}
          />

          <ChampSelect
            label={t("Répartition des frais")}
            valeur={repartition}
            onChange={setRepartition}
            options={[
              { valeur: "client", label: t("Le payeur supporte les frais") },
              { valeur: "vendeur", label: t("Je supporte les frais") },
              { valeur: "50_50", label: t("Moitié-moitié") },
            ]}
          />

          <View style={styles.actions}>
            <Bouton variante="neutre" onPress={onFermer} style={styles.action}>
              {t("Annuler")}
            </Bouton>
            <Bouton onPress={() => onValider(passerelle, repartition)} style={styles.action}>
              {t("Continuer")}
            </Bouton>
          </View>
        </Carte>
      </View>
    </Modal>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  voile: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    padding: espacement.xl,
  },
  carte: {
    width: "100%",
  },
  titre: {
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.texte,
  },
  sousTitre: {
    marginTop: 3,
    fontSize: 13,
    color: couleurs.texteFaible,
  },
  encart: {
    marginVertical: espacement.lg,
    borderRadius: rayons.lg,
    backgroundColor: couleurs.dangerClair,
    paddingVertical: espacement.lg,
    alignItems: "center",
  },
  encartLibelle: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: couleurs.danger,
  },
  encartMontant: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "800",
    color: couleurs.danger,
  },
  actions: {
    flexDirection: "row",
    gap: espacement.md,
    marginTop: espacement.sm,
  },
  action: {
    flex: 1,
  },
});
