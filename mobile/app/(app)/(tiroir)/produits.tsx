/**
 * Stock de la boutique — port de frontend/src/app/(app)/produits/page.tsx.
 *
 * La recherche est déléguée à l'API (`/api/produits?q=`) comme sur le web ;
 * elle est débattue de 350 ms pour ne pas lancer une requête par frappe.
 */

import { useT } from "@/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BoutonFlottant, Ecran } from "@/components/Ecran";
import { Alerte, Badge, Carte, Champ, Chargement, EtatVide, Bouton } from "@/components/ui";
import { useRequete } from "@/lib/requete";
import { montant, nombre } from "@/lib/format";
import type { Produit } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function Produits() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();

  const [recherche, setRecherche] = useState("");
  const [termeDifferee, setTermeDifferee] = useState("");

  useEffect(() => {
    const minuterie = setTimeout(() => setTermeDifferee(recherche.trim()), 350);
    return () => clearTimeout(minuterie);
  }, [recherche]);

  const chemin = termeDifferee
    ? `/api/produits?q=${encodeURIComponent(termeDifferee)}`
    : "/api/produits";

  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Produit[]>(chemin);

  const produits = donnees ?? [];
  const enAlerte = produits.filter((p) => p.stock_faible).length;

  return (
    <>
      <Ecran
        titre={t("Mes produits")}
        sousTitre={
          produits.length > 0
            ? `${nombre(produits.length)} produit(s)${enAlerte > 0 ? ` · ${enAlerte} en alerte` : ""}`
            : "Gérez votre stock"
        }
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >
        <Champ
          value={recherche}
          onChangeText={setRecherche}
          placeholder={t("🔍 Rechercher un produit…")}
          autoCorrect={false}
        />

        {erreur ? <Alerte>{erreur}</Alerte> : null}

        {chargement ? (
          <Chargement />
        ) : produits.length === 0 ? (
          <EtatVide
            titre={termeDifferee ? t("Aucun résultat") : t("Aucun produit")}
            description={
              termeDifferee
                ? `Rien ne correspond à « ${termeDifferee} ».`
                : "Ajoutez vos articles pour suivre votre stock et enregistrer des ventes."
            }
            action={
              termeDifferee ? undefined : (
                <Bouton onPress={() => router.push("/produits/nouveau")}>
                  {t("Ajouter un produit")}
                </Bouton>
              )
            }
          />
        ) : (
          produits.map((produit) => (
            <Pressable
              key={produit.id}
              onPress={() => router.push(`/produits/${produit.id}`)}
            >
              {({ pressed }) => (
                <Carte style={pressed ? styles.cartePressee : undefined}>
                  <View style={styles.ligne}>
                    <View style={styles.textes}>
                      <Text style={styles.nom} numberOfLines={1}>
                        {produit.nom}
                      </Text>
                      <Text style={styles.meta}>
                        {produit.categorie?.nom ?? "Sans catégorie"}
                      </Text>
                    </View>

                    <Badge
                      fond={produit.stock_faible ? couleurs.dangerClair : couleurs.succesClair}
                      texte={produit.stock_faible ? couleurs.danger : couleurs.succesSombre}
                    >
                      {produit.stock_faible ? "⚠ " : ""}
                      {nombre(produit.stock)} en stock
                    </Badge>
                  </View>

                  <View style={styles.prix}>
                    <View>
                      <Text style={styles.prixLibelle}>{t("Achat")}</Text>
                      <Text style={styles.prixValeur}>{montant(produit.prix_achat)}</Text>
                    </View>
                    <View>
                      <Text style={styles.prixLibelle}>{t("Vente")}</Text>
                      <Text style={[styles.prixValeur, styles.prixVente]}>
                        {montant(produit.prix_vente)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.prixLibelle}>{t("Valeur du stock")}</Text>
                      <Text style={styles.prixValeur}>
                        {montant(produit.stock * produit.prix_vente)}
                      </Text>
                    </View>
                  </View>
                </Carte>
              )}
            </Pressable>
          ))
        )}
      </Ecran>

      <BoutonFlottant onPress={() => router.push("/produits/nouveau")} />
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  cartePressee: {
    opacity: 0.7,
  },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
  },
  textes: {
    flex: 1,
  },
  nom: {
    fontSize: 16,
    fontWeight: "700",
    color: couleurs.texte,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  prix: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: espacement.md,
    marginTop: espacement.md,
    paddingTop: espacement.md,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
  prixLibelle: {
    fontSize: 11,
    color: couleurs.texteFaible,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  prixValeur: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: couleurs.texte,
  },
  prixVente: {
    color: couleurs.succes,
  },
});
