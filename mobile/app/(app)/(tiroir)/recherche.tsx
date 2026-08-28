/**
 * Recherche inter-boutiques — port de frontend/src/app/(app)/recherche/page.tsx.
 *
 * Réservée aux détaillants (l'API renvoie 403 aux grossistes). Choisir un
 * résultat préremplit le formulaire de commande avec le fournisseur, le nom du
 * produit et son prix.
 */

import { useT } from "@/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Champ,
  Chargement,
  EtatVide,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { montant, nombre } from "@/lib/format";
import type { Produit } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function Recherche() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();

  const [terme, setTerme] = useState("");
  const [resultats, setResultats] = useState<Produit[] | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    // L'API ignore les termes de moins de deux caractères.
    if (terme.trim().length < 2) {
      setResultats(null);
      return;
    }

    setEnCours(true);

    const minuterie = setTimeout(async () => {
      try {
        setResultats(
          await api.get<Produit[]>(
            `/api/produits/recherche-grossistes?q=${encodeURIComponent(terme.trim())}`,
          ),
        );
        setErreur("");
      } catch (e) {
        setErreur(t(messageErreur(e, "Recherche impossible.")));
      } finally {
        setEnCours(false);
      }
    }, 400);

    return () => clearTimeout(minuterie);
  }, [terme]);

  function commander(produit: Produit) {
    router.push({
      pathname: "/commandes/nouvelle",
      params: {
        telephone: produit.fournisseur?.telephone ?? "",
        produit: produit.nom,
        prix: String(produit.prix_vente),
      },
    });
  }

  return (
    <Ecran titre={t("Chercher un produit")} sousTitre={t("Chez les grossistes inscrits sur Visacredit XIXA")}>
      <Champ
        value={terme}
        onChangeText={setTerme}
        placeholder={t("🔍 Nom du produit (2 caractères minimum)")}
        autoCorrect={false}
        autoFocus
      />

      {erreur ? <Alerte>{erreur}</Alerte> : null}

      {enCours ? (
        <Chargement texte={t("Recherche en cours…")} />
      ) : resultats === null ? (
        <EtatVide
          titre={t("Que cherchez-vous ?")}
          description={t("Saisissez le nom d'un article pour voir quels grossistes le proposent, à quel prix et en quelle quantité.")}
        />
      ) : resultats.length === 0 ? (
        <EtatVide
          titre={t("Aucun grossiste ne propose cet article")}
          description={`Rien ne correspond à « ${terme.trim()} ». Vous pouvez tout de même commander auprès d'un fournisseur externe.`}
          action={
            <Bouton
              variante="neutre"
              onPress={() => router.push("/commandes/nouvelle")}
            >
              {t("Commander hors plateforme")}
            </Bouton>
          }
        />
      ) : (
        resultats.map((produit) => (
          <Carte key={produit.id}>
            <View style={styles.ligne}>
              <View style={styles.textes}>
                <Text style={styles.nom}>{produit.nom}</Text>
                <Text style={styles.fournisseur}>
                  📦 {produit.fournisseur?.nom_boutique ?? "Grossiste"}
                </Text>
                <Text style={styles.telephone}>{produit.fournisseur?.telephone}</Text>
              </View>

              <View style={styles.droite}>
                <Text style={styles.prix}>{montant(produit.prix_vente)}</Text>
                <Badge
                  fond={produit.stock > 0 ? couleurs.succesClair : couleurs.dangerClair}
                  texte={produit.stock > 0 ? couleurs.succesSombre : couleurs.danger}
                >
                  {nombre(produit.stock)} dispo.
                </Badge>
              </View>
            </View>

            {produit.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {produit.description}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <Bouton compact onPress={() => commander(produit)}>
                {t("🚚 Commander")}
              </Bouton>
              {produit.fournisseur ? (
                <Bouton
                  variante="neutre"
                  compact
                  onPress={() =>
                    router.push(`/notations/fournisseur/${produit.fournisseur!.id}`)
                  }
                >
                  {t("⭐ Voir les avis")}
                </Bouton>
              ) : null}
            </View>
          </Carte>
        ))
      )}
    </Ecran>
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
  nom: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  fournisseur: {
    marginTop: 3,
    fontSize: 13,
    color: couleurs.texteDoux,
  },
  telephone: {
    marginTop: 1,
    fontSize: 12,
    color: couleurs.texteTresFaible,
  },
  droite: {
    alignItems: "flex-end",
    gap: 5,
  },
  prix: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.succes,
  },
  description: {
    marginTop: espacement.sm,
    fontSize: 12,
    color: couleurs.texteFaible,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espacement.sm,
    marginTop: espacement.md,
    paddingTop: espacement.md,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
});
