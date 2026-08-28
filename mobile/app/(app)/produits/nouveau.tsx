/**
 * Nouveau produit — port de frontend/src/app/(app)/produits/nouveau/page.tsx.
 *
 * L'écran couvre aussi l'approvisionnement initial, comme le faisait
 * pages/produits/create.php : payé comptant, le stock d'entrée génère une
 * dépense ; à crédit, il crée une créance fournisseur. Le choix se fait ici,
 * ProduitService s'occupe des écritures.
 */

import { useT } from "@/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  ChoixCartes,
  LigneInfo,
  TitreSection,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { montant } from "@/lib/format";
import type { Categorie, VerificationFournisseur } from "@/lib/types";
import { couleurs, espacement, rayons, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function NouveauProduit() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [nom, setNom] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [stock, setStock] = useState("0");
  const [seuilAlerte, setSeuilAlerte] = useState("10");
  const [categorieId, setCategorieId] = useState("");
  const [description, setDescription] = useState("");
  const [modePaiement, setModePaiement] = useState<"comptant" | "credit">("comptant");
  const [notes, setNotes] = useState("");
  const [fournisseurNom, setFournisseurNom] = useState("");
  const [fournisseurTelephone, setFournisseurTelephone] = useState("");
  const [fournisseurTrouve, setFournisseurTrouve] = useState<string | null>(null);

  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api
      .get<Categorie[]>("/api/produits/categories")
      .then(setCategories)
      .catch(() => {
        // Une liste de catégories vide n'empêche pas de créer un produit.
      });
  }, []);

  // Vérification du fournisseur à la volée (ancien check_grossiste.php).
  useEffect(() => {
    const tel = fournisseurTelephone.trim();

    if (modePaiement !== "credit" || tel.length < 8) {
      setFournisseurTrouve(null);
      return;
    }

    const minuterie = setTimeout(async () => {
      try {
        const r = await api.post<VerificationFournisseur>(
          "/api/commandes/verifier-fournisseur",
          { telephone: tel },
        );
        setFournisseurTrouve(r.trouve ? r.nom_boutique : null);
      } catch {
        setFournisseurTrouve(null);
      }
    }, 500);

    return () => clearTimeout(minuterie);
  }, [fournisseurTelephone, modePaiement]);

  const montantAppro = (parseFloat(prixAchat) || 0) * (parseInt(stock, 10) || 0);

  async function soumettre() {
    setErreur("");

    if (!categorieId) {
      setErreur(t("Choisissez la catégorie du produit."));
      return;
    }

    setEnvoi(true);

    try {
      await api.post("/api/produits", {
        nom: nom.trim(),
        prix_achat: parseFloat(prixAchat) || 0,
        prix_vente: parseFloat(prixVente) || 0,
        stock: parseInt(stock, 10) || 0,
        seuil_alerte: parseInt(seuilAlerte, 10) || 0,
        categorie_id: parseInt(categorieId, 10),
        description: description.trim(),
        mode_paiement: modePaiement,
        notes: notes.trim(),
        fournisseur_nom: fournisseurNom.trim(),
        fournisseur_telephone: fournisseurTelephone.trim(),
      });

      router.replace("/produits");
    } catch (e) {
      setErreur(t(messageErreur(e, "Enregistrement impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Ecran>
      {erreur ? <Alerte>{erreur}</Alerte> : null}

      <Carte>
        <TitreSection>{t("Article")}</TitreSection>

        <Champ
          label={t("Nom du produit")}
          value={nom}
          onChangeText={setNom}
          placeholder={t("Ex : Sac de riz 25 kg")}
        />

        <Champ
          label={t("Prix d'achat (FCFA)")}
          value={prixAchat}
          onChangeText={setPrixAchat}
          keyboardType="numeric"
          placeholder="0"
        />

        <Champ
          label={t("Prix de vente (FCFA)")}
          value={prixVente}
          onChangeText={setPrixVente}
          keyboardType="numeric"
          placeholder="0"
        />

        <Champ
          label={t("Stock initial")}
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
        />

        <Champ
          label={t("Seuil d'alerte")}
          value={seuilAlerte}
          onChangeText={setSeuilAlerte}
          keyboardType="number-pad"
          aide={t("En dessous de ce stock, le produit apparaît en alerte")}
        />

        <ChampSelect
          label={t("Catégorie")}
          valeur={categorieId}
          onChange={setCategorieId}
          placeholder={t("Choisir une catégorie…")}
          options={categories.map((c) => ({ valeur: String(c.id), label: c.nom }))}
          aide={t("Choisie dans le catalogue commun : c'est ce qui rend les stocks comparables d'une boutique à l'autre")}
        />

        <Champ
          label={t("Description (optionnel)")}
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </Carte>

      <Carte>
        <TitreSection>{t("Approvisionnement initial")}</TitreSection>

        <ChoixCartes<"comptant" | "credit">
          valeur={modePaiement}
          onChange={setModePaiement}
          options={[
            {
              valeur: "comptant",
              titre: t("💵 Payé comptant"),
              note: t("Une dépense est enregistrée automatiquement"),
            },
            {
              valeur: "credit",
              titre: t("📅 À crédit"),
              note: t("Apparaîtra dans vos crédits fournisseurs"),
            },
          ]}
        />

        {modePaiement === "credit" ? (
          <>
            <Champ
              label={t("Nom du fournisseur")}
              value={fournisseurNom}
              onChangeText={setFournisseurNom}
            />
            <Champ
              label={t("Téléphone du fournisseur")}
              value={fournisseurTelephone}
              onChangeText={setFournisseurTelephone}
              keyboardType="phone-pad"
              aide={t("S'il est inscrit sur Visacredit XIXA, il verra la créance de son côté")}
            />

            {fournisseurTrouve ? (
              <View style={styles.fournisseurTrouve}>
                <Text style={styles.fournisseurTrouveTexte}>
                  ✅ Grossiste « {fournisseurTrouve} » reconnu sur Visacredit XIXA
                </Text>
              </View>
            ) : null}
          </>
        ) : null}

        <Champ label={t("Notes (optionnel)")} value={notes} onChangeText={setNotes} multiline />

        <View style={styles.recap}>
          <LigneInfo libelle={t("Montant de l'approvisionnement")} fort couleur={couleurs.primaire}>
            {montant(montantAppro)}
          </LigneInfo>
        </View>
      </Carte>

      <Bouton
        onPress={soumettre}
        disabled={envoi || !nom.trim() || !categorieId}
        pleineLargeur
      >
        {envoi ? t("Enregistrement…") : t("Enregistrer le produit")}
      </Bouton>
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  fournisseurTrouve: {
    backgroundColor: couleurs.succesClair,
    borderRadius: rayons.md,
    paddingVertical: espacement.md,
    paddingHorizontal: espacement.lg,
    marginBottom: espacement.md,
  },
  fournisseurTrouveTexte: {
    fontSize: 13,
    color: couleurs.succesSombre,
  },
  recap: {
    marginTop: espacement.sm,
  },
});
