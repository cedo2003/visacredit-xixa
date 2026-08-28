/**
 * Dépenses — port de frontend/src/app/(app)/depenses/page.tsx.
 *
 * Les catégories viennent de l'API (constante Depense::CATEGORIES) plutôt que
 * d'une liste recopiée ici : une catégorie ajoutée côté serveur apparaît sans
 * toucher à l'application.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BoutonFlottant, Ecran } from "@/components/Ecran";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampDate,
  ChampSelect,
  Chargement,
  EtatVide,
  LienTexte,
  LigneInfo,
  ModaleConfirmation,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { aujourdHui, date, libelleDepense, montant as formaterMontant } from "@/lib/format";
import type { Depense } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface Reponse {
  depenses: Depense[];
  total: number;
  categories: string[];
}

export default function Depenses() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/depenses");

  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const [aSupprimer, setASupprimer] = useState<Depense | null>(null);
  const [suppression, setSuppression] = useState(false);
  const [messageAction, setMessageAction] = useState("");
  const [erreurAction, setErreurAction] = useState("");

  const depenses = donnees?.depenses ?? [];

  async function supprimer(depense: Depense) {
    setSuppression(true);
    setErreurAction("");

    try {
      await api.delete(`/api/depenses/${depense.id}`);
      await recharger();
      setMessageAction(t("Dépense supprimée."));
    } catch (e) {
      setErreurAction(t(messageErreur(e, "Suppression impossible.")));
    } finally {
      setSuppression(false);
      setASupprimer(null);
    }
  }

  return (
    <>
      <Ecran
        titre={t("Dépenses")}
        sousTitre={t("Sorties d'argent de la boutique")}
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >
        {erreur ? <Alerte>{erreur}</Alerte> : null}
        {erreurAction ? <Alerte>{erreurAction}</Alerte> : null}
        {messageAction ? <Alerte type="succes">{messageAction}</Alerte> : null}

        <Carte>
          <LigneInfo libelle={t("Nombre de dépenses")}>{depenses.length}</LigneInfo>
          <LigneInfo libelle={t("Total dépensé")} fort couleur={couleurs.danger}>
            {formaterMontant(donnees?.total ?? 0)}
          </LigneInfo>
        </Carte>

        {chargement ? (
          <Chargement />
        ) : depenses.length === 0 ? (
          <EtatVide
            titre={t("Aucune dépense")}
            description={t("Enregistrez vos charges (loyer, salaires, transport…) pour connaître votre solde réel.")}
            action={<Bouton onPress={() => setFormulaireVisible(true)}>{t("Ajouter une dépense")}</Bouton>}
          />
        ) : (
          depenses.map((depense) => (
            <Carte key={depense.id}>
              <View style={styles.ligne}>
                <View style={styles.textes}>
                  <Text style={styles.categorie}>
                    {libelleDepense(depense.categorie, depense.autre_categorie)}
                  </Text>
                  {depense.description ? (
                    <Text style={styles.description}>{depense.description}</Text>
                  ) : null}
                  <Text style={styles.date}>{date(depense.date_depense)}</Text>
                </View>

                <View style={styles.droite}>
                  <Text style={styles.montant}>−{formaterMontant(depense.montant)}</Text>
                  <LienTexte couleur={couleurs.danger} onPress={() => setASupprimer(depense)}>
                    {t("Supprimer")}
                  </LienTexte>
                </View>
              </View>
            </Carte>
          ))
        )}
      </Ecran>

      <BoutonFlottant onPress={() => setFormulaireVisible(true)} />

      {formulaireVisible ? (
        <FormulaireDepense
          categories={donnees?.categories ?? []}
          onFermer={() => setFormulaireVisible(false)}
          onEnregistre={() => {
            setFormulaireVisible(false);
            setMessageAction(t("Dépense enregistrée."));
            void recharger();
          }}
        />
      ) : null}

      <ModaleConfirmation
        visible={aSupprimer !== null}
        titre={t("Supprimer cette dépense ?")}
        message={
          aSupprimer
            ? `${libelleDepense(aSupprimer.categorie, aSupprimer.autre_categorie)} — ${formaterMontant(aSupprimer.montant)}`
            : undefined
        }
        libelleConfirmer={t("Supprimer")}
        enCours={suppression}
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={() => aSupprimer && void supprimer(aSupprimer)}
      />
    </>
  );
}

function FormulaireDepense({
  categories,
  onFermer,
  onEnregistre,
}: {
  categories: string[];
  onFermer: () => void;
  onEnregistre: () => void;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const [categorie, setCategorie] = useState(categories[0] ?? "autres");
  const [autreCategorie, setAutreCategorie] = useState("");
  const [montantSaisi, setMontantSaisi] = useState("");
  const [description, setDescription] = useState("");
  const [dateDepense, setDateDepense] = useState(aujourdHui());
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre() {
    setErreur("");
    setEnvoi(true);

    try {
      await api.post("/api/depenses", {
        categorie,
        autre_categorie: autreCategorie,
        montant: parseFloat(montantSaisi) || 0,
        description,
        date_depense: dateDepense,
      });

      onEnregistre();
    } catch (e) {
      setErreur(t(messageErreur(e, "Enregistrement impossible.")));
      setEnvoi(false);
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onFermer}>
      <Pressable style={styles.voile} onPress={onFermer}>
        <Pressable style={styles.feuille} onPress={() => {}}>
          <View style={styles.poignee} />
          <Text style={styles.modaleTitre}>{t("Nouvelle dépense")}</Text>

          <ScrollView contentContainerStyle={styles.modaleCorps} keyboardShouldPersistTaps="handled">
            {erreur ? <Alerte>{erreur}</Alerte> : null}

            <ChampSelect
              label={t("Catégorie")}
              valeur={categorie}
              onChange={setCategorie}
              options={categories.map((c) => ({
                valeur: c,
                label: libelleDepense(c, null),
              }))}
            />

            {categorie === "autres" ? (
              <Champ
                label={t("Préciser la catégorie")}
                value={autreCategorie}
                onChangeText={setAutreCategorie}
                placeholder={t("Ex : Réparation de la vitrine")}
              />
            ) : null}

            <Champ
              label={t("Montant (FCFA)")}
              value={montantSaisi}
              onChangeText={setMontantSaisi}
              keyboardType="numeric"
              placeholder="0"
            />

            <ChampDate label={t("Date")} valeur={dateDepense} onChange={setDateDepense} />

            <Champ
              label={t("Description (optionnel)")}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.modaleActions}>
              <Bouton variante="neutre" onPress={onFermer} style={styles.modaleAction}>
                {t("Annuler")}
              </Bouton>
              <Bouton onPress={soumettre} disabled={envoi} style={styles.modaleAction}>
                {envoi ? "…" : "Enregistrer"}
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
  ligne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  textes: {
    flex: 1,
  },
  categorie: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  description: {
    marginTop: 2,
    fontSize: 13,
    color: couleurs.texteDoux,
  },
  date: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteTresFaible,
  },
  droite: {
    alignItems: "flex-end",
    gap: 5,
  },
  montant: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.danger,
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
