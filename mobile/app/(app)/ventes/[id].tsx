/**
 * Reçu de vente — port de frontend/src/app/(app)/ventes/[id]/page.tsx.
 *
 * L'API renvoie la vente détaillée, ses échéances et l'identité du vendeur ;
 * l'écran est en lecture seule, une vente ne se modifie pas après coup (les
 * règlements passent par l'écran des créances).
 */

import { useT } from "@/i18n";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import { Alerte, Badge, Carte, Chargement, LigneInfo, TitreSection } from "@/components/ui";
import { useRequete } from "@/lib/requete";
import { badgeCreance, date, dateHeure, montant, nombre } from "@/lib/format";
import type { Creance, User, Vente } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface Recu {
  vente: Vente;
  echeances: Creance[];
  vendeur: User;
}

const LIBELLES_MODE: Record<string, string> = {
  especes: "💵 Espèces",
  mobile_money: "📱 Mobile Money",
  fedapay: "💳 Agrégateur",
};

export default function RecuVente() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { donnees, chargement, erreur, rafraichissement, recharger } = useRequete<Recu>(
    id ? `/api/ventes/${id}` : null,
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

  const { vente, echeances, vendeur } = donnees;

  return (
    <Ecran onRafraichir={recharger} rafraichissement={rafraichissement}>
      <Carte>
        <View style={styles.enteteRecu}>
          <Text style={styles.boutique}>{vendeur.nom_boutique}</Text>
          <Text style={styles.vendeur}>
            {vendeur.prenom} {vendeur.nom} · {vendeur.telephone}
          </Text>

          <Text style={styles.facture}>{vente.numero_facture}</Text>
          <Text style={styles.dateVente}>{dateHeure(vente.date_vente)}</Text>
        </View>

        <View style={styles.badges}>
          <Badge
            fond={vente.reste > 0 ? couleurs.attenteClair : couleurs.succesClair}
            texte={vente.reste > 0 ? couleurs.attente : couleurs.succesSombre}
          >
            {vente.reste > 0 ? t("Vente à crédit") : t("Vente soldée")}
          </Badge>

          {vente.statut_paiement === "en_attente" ? (
            <Badge fond={couleurs.alerteClair} texte={couleurs.alerteSombre}>
              {t("⏳ Paiement en cours de confirmation")}
            </Badge>
          ) : null}
        </View>
      </Carte>

      <Carte>
        <TitreSection>{t("Articles")}</TitreSection>

        {(vente.lignes ?? []).map((ligne) => (
          <View key={ligne.id} style={styles.ligneArticle}>
            <View style={styles.ligneArticleTextes}>
              <Text style={styles.articleNom}>{ligne.produit_nom}</Text>
              <Text style={styles.articleDetail}>
                {nombre(ligne.quantite)} × {montant(ligne.prix_unitaire)}
              </Text>
            </View>
            <Text style={styles.articleTotal}>{montant(ligne.sous_total)}</Text>
          </View>
        ))}

        <View style={styles.totaux}>
          <LigneInfo libelle={t("Total")}>{montant(vente.montant_total)}</LigneInfo>
          <LigneInfo libelle={t("Payé")} couleur={couleurs.succes}>
            {montant(vente.montant_paye)}
          </LigneInfo>

          {vente.frais_client > 0 || vente.frais_vendeur > 0 ? (
            <LigneInfo libelle={t("Frais de passerelle")}>
              {montant(vente.frais_client + vente.frais_vendeur)}
            </LigneInfo>
          ) : null}

          <LigneInfo
            libelle={t("Reste à payer")}
            fort
            couleur={vente.reste > 0 ? couleurs.attente : couleurs.succes}
          >
            {montant(vente.reste)}
          </LigneInfo>
        </View>
      </Carte>

      <Carte>
        <TitreSection>{t("Détails")}</TitreSection>

        <LigneInfo libelle={t("Client")}>
          {vente.client?.nom_complet ?? "Client de passage"}
        </LigneInfo>
        {vente.client?.telephone ? (
          <LigneInfo libelle={t("Téléphone")}>{vente.client.telephone}</LigneInfo>
        ) : null}
        <LigneInfo libelle={t("Mode de paiement")}>
          {LIBELLES_MODE[vente.mode_paiement] ?? vente.mode_paiement}
        </LigneInfo>
        {vente.telephone_client ? (
          <LigneInfo libelle={t("Numéro payeur")}>{vente.telephone_client}</LigneInfo>
        ) : null}
      </Carte>

      {echeances.length > 0 ? (
        <Carte>
          <TitreSection>{t("Échéances")}</TitreSection>

          {echeances.map((echeance) => {
            const badge = badgeCreance(echeance.statut, echeance.en_retard, couleurs);

            return (
              <View key={echeance.id} style={styles.echeance}>
                <View style={styles.echeanceTextes}>
                  <Text style={styles.echeanceTitre}>
                    Échéance {echeance.numero_echeance}/{echeance.nb_echeances_total}
                  </Text>
                  <Text style={styles.echeanceDate}>
                    Avant le {date(echeance.date_limite)}
                  </Text>
                </View>

                <View style={styles.echeanceDroite}>
                  <Text style={styles.echeanceMontant}>
                    {montant(echeance.montant_restant)}
                  </Text>
                  <Badge fond={badge.fond} texte={badge.texte}>
                    {badge.label}
                  </Badge>
                </View>
              </View>
            );
          })}
        </Carte>
      ) : null}
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  enteteRecu: {
    alignItems: "center",
    paddingBottom: espacement.md,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.bordure,
    borderStyle: "dashed",
  },
  boutique: {
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.texte,
  },
  vendeur: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  facture: {
    marginTop: espacement.md,
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.primaire,
  },
  dateVente: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espacement.sm,
    marginTop: espacement.md,
    justifyContent: "center",
  },

  ligneArticle: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingVertical: espacement.sm,
  },
  ligneArticleTextes: {
    flex: 1,
  },
  articleNom: {
    fontSize: 14,
    fontWeight: "600",
    color: couleurs.texte,
  },
  articleDetail: {
    marginTop: 1,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  articleTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: couleurs.texte,
  },
  totaux: {
    marginTop: espacement.md,
    paddingTop: espacement.sm,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },

  echeance: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingVertical: espacement.sm,
  },
  echeanceTextes: {
    flex: 1,
  },
  echeanceTitre: {
    fontSize: 14,
    fontWeight: "600",
    color: couleurs.texte,
  },
  echeanceDate: {
    marginTop: 1,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  echeanceDroite: {
    alignItems: "flex-end",
    gap: 5,
  },
  echeanceMontant: {
    fontSize: 14,
    fontWeight: "800",
    color: couleurs.texte,
  },
});
