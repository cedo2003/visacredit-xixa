/**
 * Notation d'un partenaire après une commande reçue —
 * port de frontend/src/components/ModaleNotation.tsx
 * (pages/notations/{noter_fournisseur,noter_client}.php).
 *
 * L'API n'ouvre la notation qu'une fois la commande réceptionnée et n'accepte
 * qu'une note de 1 à 5 ; une seconde notation remplace la première.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { api, messageErreur } from "../lib/api";
import { espacement, type Palette } from "../theme";
import { useStyles } from "../theme-contexte";
import { Alerte, Bouton, Carte, Champ } from "./ui";

export default function ModaleNotation({
  type,
  commandeId,
  onFerme,
  onNote,
}: {
  type: "fournisseur" | "client";
  commandeId: number;
  onFerme: () => void;
  onNote: () => void;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre() {
    if (note < 1) {
      setErreur(t("Choisissez une note entre 1 et 5 étoiles."));
      return;
    }

    setErreur("");
    setEnvoi(true);

    try {
      await api.post(`/api/notations/${type}/${commandeId}`, { note, commentaire });
      onNote();
    } catch (e) {
      setErreur(t(messageErreur(e, "Notation impossible.")));
      setEnvoi(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onFerme}>
      <View style={styles.voile}>
        <Carte style={styles.carte}>
          <Text style={styles.titre}>
            Noter {type === "fournisseur" ? "le fournisseur" : "le client"}
          </Text>
          <Text style={styles.sousTitre}>
            {t("Votre avis aide les autres boutiques de la plateforme.")}
          </Text>

          {erreur ? <Alerte>{erreur}</Alerte> : null}

          <View style={styles.etoiles}>
            {[1, 2, 3, 4, 5].map((valeur) => (
              <Pressable key={valeur} onPress={() => setNote(valeur)} hitSlop={4}>
                <Text style={[styles.etoile, valeur <= note && styles.etoilePleine]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          <Champ
            label={t("Commentaire (optionnel)")}
            value={commentaire}
            onChangeText={setCommentaire}
            multiline
            placeholder={t("Livraison rapide, marchandise conforme…")}
          />

          <View style={styles.actions}>
            <Bouton variante="neutre" onPress={onFerme} style={styles.action}>
              {t("Annuler")}
            </Bouton>
            <Bouton onPress={soumettre} disabled={envoi} style={styles.action}>
              {envoi ? "…" : "Envoyer"}
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
    marginBottom: espacement.lg,
    fontSize: 13,
    color: couleurs.texteFaible,
  },
  etoiles: {
    flexDirection: "row",
    justifyContent: "center",
    gap: espacement.sm,
    marginBottom: espacement.lg,
  },
  etoile: {
    fontSize: 38,
    color: couleurs.bordureForte,
  },
  etoilePleine: {
    color: "#f59e0b",
  },
  actions: {
    flexDirection: "row",
    gap: espacement.md,
  },
  action: {
    flex: 1,
  },
});
