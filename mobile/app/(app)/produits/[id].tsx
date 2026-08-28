/**
 * Fiche produit — port de frontend/src/app/(app)/produits/[id]/page.tsx.
 *
 * Consultation et modification sur le même écran : sur mobile, une page de
 * détail suivie d'une page d'édition ferait deux navigations pour corriger un
 * prix. Les champs sont donc directement modifiables, l'enregistrement n'envoie
 * que ce qui a changé (l'API accepte un PATCH partiel).
 */

import { useT } from "@/i18n";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  Chargement,
  LigneInfo,
  ModaleConfirmation,
  TitreSection,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { date, montant, nombre } from "@/lib/format";
import type { Categorie, Produit } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function FicheProduit() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { donnees, chargement, erreur, rafraichissement, recharger, definir } =
    useRequete<Produit>(id ? `/api/produits/${id}` : null);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [nom, setNom] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [stock, setStock] = useState("");
  const [seuilAlerte, setSeuilAlerte] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [erreurForm, setErreurForm] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [suppressionVisible, setSuppressionVisible] = useState(false);
  const [suppression, setSuppression] = useState(false);

  useEffect(() => {
    api
      .get<Categorie[]>("/api/produits/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Les champs sont réamorcés dès que la fiche arrive (ou après rechargement).
  useEffect(() => {
    if (!donnees) return;

    setNom(donnees.nom);
    setPrixAchat(String(donnees.prix_achat));
    setPrixVente(String(donnees.prix_vente));
    setStock(String(donnees.stock));
    setSeuilAlerte(String(donnees.seuil_alerte ?? 0));
    setCategorieId(donnees.categorie ? String(donnees.categorie.id) : "");
    setDescription(donnees.description ?? "");
  }, [donnees]);

  if (chargement) return <Chargement />;

  if (erreur && !donnees) {
    return (
      <Ecran>
        <Alerte>{erreur}</Alerte>
      </Ecran>
    );
  }

  const produit = donnees;
  if (!produit) return null;

  async function enregistrer() {
    setErreurForm("");
    setMessage("");

    if (!categorieId) {
      setErreurForm(t("Choisissez la catégorie du produit."));
      return;
    }

    setEnvoi(true);

    try {
      const misAJour = await api.patch<Produit>(`/api/produits/${id}`, {
        nom: nom.trim(),
        prix_achat: parseFloat(prixAchat) || 0,
        prix_vente: parseFloat(prixVente) || 0,
        stock: parseInt(stock, 10) || 0,
        seuil_alerte: parseInt(seuilAlerte, 10) || 0,
        categorie_id: parseInt(categorieId, 10),
        description: description.trim(),
      });

      definir(misAJour);
      setMessage(t("Produit mis à jour."));
    } catch (e) {
      setErreurForm(t(messageErreur(e, "Enregistrement impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer() {
    setSuppression(true);

    try {
      await api.delete(`/api/produits/${id}`);
      router.replace("/produits");
    } catch (e) {
      setErreurForm(t(messageErreur(e, "Suppression impossible.")));
      setSuppressionVisible(false);
    } finally {
      setSuppression(false);
    }
  }

  const marge = produit.prix_vente - produit.prix_achat;
  const margePourcent =
    produit.prix_achat > 0 ? Math.round((marge / produit.prix_achat) * 100) : null;

  return (
    <Ecran onRafraichir={recharger} rafraichissement={rafraichissement}>
      <Carte>
        <View style={styles.entete}>
          <View style={styles.enteteTextes}>
            <Text style={styles.titre}>{produit.nom}</Text>
            <Text style={styles.sousTitre}>
              Ajouté le {date(produit.created_at)}
            </Text>
          </View>

          <Badge
            fond={produit.stock_faible ? couleurs.dangerClair : couleurs.succesClair}
            texte={produit.stock_faible ? couleurs.danger : couleurs.succesSombre}
          >
            {produit.stock_faible ? t("⚠ Stock faible") : t("Stock OK")}
          </Badge>
        </View>

        <View style={styles.stats}>
          <LigneInfo libelle={t("Stock actuel")}>{nombre(produit.stock)}</LigneInfo>
          <LigneInfo libelle={t("Valeur du stock")}>
            {montant(produit.stock * produit.prix_vente)}
          </LigneInfo>
          <LigneInfo libelle={t("Marge unitaire")} couleur={marge >= 0 ? couleurs.succes : couleurs.danger}>
            {montant(marge)}
            {margePourcent !== null ? ` (${margePourcent} %)` : ""}
          </LigneInfo>
        </View>
      </Carte>

      <Carte>
        <TitreSection>{t("Modifier")}</TitreSection>

        {erreurForm ? <Alerte>{erreurForm}</Alerte> : null}
        {message ? <Alerte type="succes">{message}</Alerte> : null}

        <Champ label={t("Nom du produit")} value={nom} onChangeText={setNom} />
        <Champ
          label={t("Prix d'achat (FCFA)")}
          value={prixAchat}
          onChangeText={setPrixAchat}
          keyboardType="numeric"
        />
        <Champ
          label={t("Prix de vente (FCFA)")}
          value={prixVente}
          onChangeText={setPrixVente}
          keyboardType="numeric"
        />
        <Champ
          label={t("Stock")}
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
          aide={t("Corrigez ici après un inventaire")}
        />
        <Champ
          label={t("Seuil d'alerte")}
          value={seuilAlerte}
          onChangeText={setSeuilAlerte}
          keyboardType="number-pad"
        />
        <ChampSelect
          label={t("Catégorie")}
          valeur={categorieId}
          onChange={setCategorieId}
          placeholder={t("Choisir une catégorie…")}
          options={categories.map((c) => ({ valeur: String(c.id), label: c.nom }))}
        />
        <Champ
          label={t("Description")}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Bouton onPress={enregistrer} disabled={envoi} pleineLargeur>
          {envoi ? t("Enregistrement…") : t("Enregistrer les modifications")}
        </Bouton>
      </Carte>

      <Bouton variante="danger" pleineLargeur onPress={() => setSuppressionVisible(true)}>
        {t("Supprimer ce produit")}
      </Bouton>

      <ModaleConfirmation
        visible={suppressionVisible}
        titre={t("Supprimer ce produit ?")}
        message={`« ${produit.nom} » disparaîtra de votre stock. Les ventes déjà enregistrées ne sont pas modifiées.`}
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
  entete: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  enteteTextes: {
    flex: 1,
  },
  titre: {
    fontSize: 20,
    fontWeight: "800",
    color: couleurs.texte,
  },
  sousTitre: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  stats: {
    marginTop: espacement.md,
    paddingTop: espacement.sm,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
});
