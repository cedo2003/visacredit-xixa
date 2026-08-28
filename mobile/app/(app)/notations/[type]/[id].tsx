/**
 * Fiche publique de notation d'un partenaire —
 * port de frontend/src/app/(app)/notations/[type]/[id]/page.tsx.
 *
 * `type` indique de quel côté on consulte : les avis reçus en tant que
 * fournisseur, ou en tant que client. L'API renvoie au plus vingt avis.
 */

import { useT } from "@/i18n";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import { Alerte, Carte, Chargement, EtatVide } from "@/components/ui";
import { useRequete } from "@/lib/requete";
import { date, etoiles } from "@/lib/format";
import type { Notation, UserResume } from "@/lib/types";
import { espacement, type Palette } from "@/theme";
import { useStyles } from "@/theme-contexte";

interface Reponse {
  type: "fournisseur" | "client";
  profil: UserResume;
  moyenne: number | null;
  total: number;
  avis: Notation[];
}

export default function ProfilNotation() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();

  const { donnees, chargement, erreur, rafraichissement, recharger } = useRequete<Reponse>(
    type && id ? `/api/notations/profil/${type}/${id}` : null,
  );

  if (chargement) return <Chargement />;

  if (erreur && !donnees) {
    return (
      <Ecran>
        <Alerte>{erreur}</Alerte>
      </Ecran>
    );
  }

  if (!donnees) return null;

  return (
    <Ecran onRafraichir={recharger} rafraichissement={rafraichissement}>
      <Carte style={styles.carteProfil}>
        <Text style={styles.boutique}>{donnees.profil.nom_boutique}</Text>
        <Text style={styles.identite}>
          {donnees.profil.nom_complet} · {donnees.profil.telephone}
        </Text>

        <Text style={styles.moyenne}>
          {donnees.moyenne !== null ? donnees.moyenne.toFixed(1) : "—"}
        </Text>
        <Text style={styles.etoiles}>{etoiles(donnees.moyenne ?? 0)}</Text>
        <Text style={styles.total}>
          {donnees.total > 0
            ? `${donnees.total} avis en tant que ${donnees.type}`
            : `Aucun avis en tant que ${donnees.type}`}
        </Text>
      </Carte>

      {donnees.avis.length === 0 ? (
        <EtatVide
          titre={t("Aucun avis publié")}
          description={t("Ce partenaire n'a pas encore été noté sur Visacredit XIXA.")}
        />
      ) : (
        donnees.avis.map((avis) => (
          <Carte key={`${avis.type}-${avis.id}`}>
            <View style={styles.ligne}>
              <View style={styles.textes}>
                <Text style={styles.auteur}>
                  {avis.auteur?.nom_boutique ?? "Boutique"}
                </Text>
                <Text style={styles.meta}>
                  {avis.commande?.numero_commande ?? "—"} · {date(avis.created_at)}
                </Text>
              </View>

              <Text style={styles.note}>{etoiles(avis.note)}</Text>
            </View>

            {avis.commentaire ? (
              <Text style={styles.commentaire}>« {avis.commentaire} »</Text>
            ) : null}
          </Carte>
        ))
      )}
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  carteProfil: {
    alignItems: "center",
    paddingVertical: espacement.xl,
  },
  boutique: {
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.texte,
  },
  identite: {
    marginTop: 2,
    fontSize: 13,
    color: couleurs.texteFaible,
  },
  moyenne: {
    marginTop: espacement.lg,
    fontSize: 38,
    fontWeight: "800",
    color: couleurs.texte,
  },
  etoiles: {
    marginTop: 2,
    fontSize: 22,
    color: "#f59e0b",
    letterSpacing: 2,
  },
  total: {
    marginTop: espacement.sm,
    fontSize: 13,
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
  auteur: {
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
