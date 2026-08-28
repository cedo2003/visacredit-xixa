/**
 * Mes notations — port de frontend/src/app/(app)/notations/page.tsx.
 *
 * L'API renvoie déjà les listes du bon côté selon le rôle : un grossiste
 * émet des notes de clients et reçoit des notes de fournisseur, un détaillant
 * l'inverse. L'écran n'a donc qu'à afficher « émises » et « reçues ».
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import { Alerte, Carte, Chargement, EtatVide } from "@/components/ui";
import { useRequete } from "@/lib/requete";
import { date, etoiles } from "@/lib/format";
import type { MoyenneNotation, Notation, Role } from "@/lib/types";
import { espacement, rayons, type Palette } from "@/theme";
import { useStyles } from "@/theme-contexte";

interface Reponse {
  role: Role;
  emises: Notation[];
  recues: Notation[];
  moyenne_recue: MoyenneNotation;
}

export default function Notations() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const router = useRouter();

  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/notations");

  const [onglet, setOnglet] = useState<"recues" | "emises">("recues");

  if (chargement) return <Chargement />;

  if (erreur && !donnees) {
    return (
      <Ecran>
        <Alerte>{erreur}</Alerte>
      </Ecran>
    );
  }

  if (!donnees) return null;

  const moyenne = donnees.moyenne_recue;
  const liste = onglet === "recues" ? donnees.recues : donnees.emises;

  return (
    <Ecran
      titre={t("Notations")}
      sousTitre={
        donnees.role === "grossiste"
          ? t("Vos clients détaillants vous notent après chaque commande")
          : t("Vos fournisseurs vous notent après chaque commande")
      }
      onRafraichir={recharger}
      rafraichissement={rafraichissement}
    >

      <Carte style={styles.carteMoyenne}>
        <Text style={styles.moyenneValeur}>
          {moyenne.moyenne !== null ? moyenne.moyenne.toFixed(1) : "—"}
        </Text>
        <Text style={styles.moyenneEtoiles}>{etoiles(moyenne.moyenne ?? 0)}</Text>
        <Text style={styles.moyenneNote}>
          {moyenne.total > 0
            ? `Moyenne sur ${moyenne.total} avis reçu(s)`
            : "Aucun avis reçu pour l'instant"}
        </Text>
      </Carte>

      <View style={styles.onglets}>
        {(
          [
            { valeur: "recues" as const, label: `Reçues (${donnees.recues.length})` },
            { valeur: "emises" as const, label: `Émises (${donnees.emises.length})` },
          ]
        ).map((option) => {
          const actif = option.valeur === onglet;

          return (
            <Pressable
              key={option.valeur}
              onPress={() => setOnglet(option.valeur)}
              style={[styles.onglet, actif && styles.ongletActif]}
            >
              <Text style={[styles.ongletTexte, actif && styles.ongletTexteActif]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {liste.length === 0 ? (
        <EtatVide
          titre={onglet === "recues" ? t("Aucun avis reçu") : t("Aucun avis émis")}
          description={
            onglet === "recues"
              ? t("Les avis de vos partenaires apparaîtront ici après leurs commandes.")
              : t("Notez vos partenaires depuis la fiche d'une commande réceptionnée.")
          }
        />
      ) : (
        liste.map((notation) => {
          const partenaire = onglet === "recues" ? notation.auteur : notation.cible;

          return (
            <Pressable
              key={`${notation.type}-${notation.id}`}
              onPress={() =>
                partenaire &&
                router.push(`/notations/${notation.type}/${partenaire.id}`)
              }
            >
              {({ pressed }) => (
                <Carte style={pressed ? styles.cartePressee : undefined}>
                  <View style={styles.ligne}>
                    <View style={styles.textes}>
                      <Text style={styles.partenaire}>
                        {partenaire?.nom_boutique ?? "Boutique"}
                      </Text>
                      <Text style={styles.meta}>
                        {notation.commande?.numero_commande ?? "—"} ·{" "}
                        {date(notation.created_at)}
                      </Text>
                    </View>

                    <Text style={styles.note}>{etoiles(notation.note)}</Text>
                  </View>

                  {notation.commentaire ? (
                    <Text style={styles.commentaire}>« {notation.commentaire} »</Text>
                  ) : null}
                </Carte>
              )}
            </Pressable>
          );
        })
      )}
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  carteMoyenne: {
    alignItems: "center",
    paddingVertical: espacement.xl,
  },
  moyenneValeur: {
    fontSize: 40,
    fontWeight: "800",
    color: couleurs.texte,
  },
  moyenneEtoiles: {
    marginTop: 2,
    fontSize: 22,
    color: "#f59e0b",
    letterSpacing: 2,
  },
  moyenneNote: {
    marginTop: espacement.sm,
    fontSize: 13,
    color: couleurs.texteFaible,
  },

  onglets: {
    flexDirection: "row",
    gap: espacement.sm,
  },
  onglet: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: rayons.md,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.surface,
    alignItems: "center",
  },
  ongletActif: {
    backgroundColor: couleurs.primaire,
    borderColor: couleurs.primaire,
  },
  ongletTexte: {
    fontSize: 13,
    fontWeight: "700",
    color: couleurs.texteDoux,
  },
  ongletTexteActif: {
    color: "#ffffff",
  },

  cartePressee: {
    opacity: 0.7,
  },
  ligne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  textes: {
    flex: 1,
  },
  partenaire: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  note: {
    fontSize: 15,
    color: "#f59e0b",
    letterSpacing: 1,
  },
  commentaire: {
    marginTop: espacement.md,
    paddingTop: espacement.sm,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 19,
    color: couleurs.texteDoux,
  },
});
