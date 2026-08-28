/**
 * Historique des ventes — port de frontend/src/app/(app)/ventes/page.tsx.
 */

import { useT } from "@/i18n";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BoutonFlottant, Ecran } from "@/components/Ecran";
import { Alerte, Badge, Bouton, Carte, Chargement, EtatVide } from "@/components/ui";
import { useRequete } from "@/lib/requete";
import { dateHeure, montant } from "@/lib/format";
import type { Vente } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function Ventes() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();

  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Vente[]>("/api/ventes");

  const ventes = donnees ?? [];
  const totalEncaisse = ventes.reduce((s, v) => s + v.montant_paye, 0);
  const totalReste = ventes.reduce((s, v) => s + v.reste, 0);

  return (
    <>
      <Ecran
        titre={t("Mes ventes")}
        sousTitre={
          ventes.length > 0
            ? `${ventes.length} vente(s) enregistrée(s)`
            : "Historique des transactions"
        }
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >
        {erreur ? <Alerte>{erreur}</Alerte> : null}

        {ventes.length > 0 ? (
          <Carte>
            <View style={styles.totaux}>
              <View style={styles.total}>
                <Text style={styles.totalLibelle}>{t("Encaissé")}</Text>
                <Text style={[styles.totalValeur, { color: couleurs.succes }]}>
                  {montant(totalEncaisse)}
                </Text>
              </View>
              <View style={styles.separateur} />
              <View style={styles.total}>
                <Text style={styles.totalLibelle}>{t("Reste à encaisser")}</Text>
                <Text style={[styles.totalValeur, { color: couleurs.attente }]}>
                  {montant(totalReste)}
                </Text>
              </View>
            </View>
          </Carte>
        ) : null}

        {chargement ? (
          <Chargement />
        ) : ventes.length === 0 ? (
          <EtatVide
            titre={t("Aucune vente")}
            description={t("Enregistrez votre première transaction pour suivre votre chiffre d'affaires.")}
            action={
              <Bouton onPress={() => router.push("/ventes/nouvelle")}>
                {t("Nouvelle vente")}
              </Bouton>
            }
          />
        ) : (
          ventes.map((vente) => (
            <Pressable key={vente.id} onPress={() => router.push(`/ventes/${vente.id}`)}>
              {({ pressed }) => (
                <Carte style={pressed ? styles.cartePressee : undefined}>
                  <View style={styles.ligne}>
                    <View style={styles.textes}>
                      <Text style={styles.facture}>{vente.numero_facture}</Text>
                      <Text style={styles.meta}>
                        {vente.client?.nom_complet ?? "Client de passage"}
                      </Text>
                      <Text style={styles.date}>{dateHeure(vente.date_vente)}</Text>
                    </View>

                    <View style={styles.droite}>
                      <Text style={styles.montantTotal}>{montant(vente.montant_total)}</Text>
                      <Badge
                        fond={vente.reste > 0 ? couleurs.attenteClair : couleurs.succesClair}
                        texte={vente.reste > 0 ? couleurs.attente : couleurs.succesSombre}
                      >
                        {vente.reste > 0 ? `Reste ${montant(vente.reste)}` : "Soldée"}
                      </Badge>
                    </View>
                  </View>

                  {vente.statut_paiement === "en_attente" ? (
                    <Text style={styles.attente}>
                      {t("⏳ Paiement mobile money en attente de confirmation")}
                    </Text>
                  ) : null}
                </Carte>
              )}
            </Pressable>
          ))
        )}
      </Ecran>

      <BoutonFlottant onPress={() => router.push("/ventes/nouvelle")} />
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  cartePressee: {
    opacity: 0.7,
  },
  totaux: {
    flexDirection: "row",
    alignItems: "center",
  },
  total: {
    flex: 1,
    alignItems: "center",
  },
  separateur: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: couleurs.bordure,
  },
  totalLibelle: {
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  totalValeur: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "800",
  },
  ligne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  textes: {
    flex: 1,
  },
  facture: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  meta: {
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
    gap: 6,
  },
  montantTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.texte,
  },
  attente: {
    marginTop: espacement.md,
    paddingTop: espacement.sm,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    fontSize: 12,
    color: couleurs.alerte,
  },
});
