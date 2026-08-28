/**
 * Crédits fournisseurs — port de frontend/src/app/(app)/credits/page.tsx.
 *
 * Deux lectures d'une même table selon le rôle :
 *   - détaillant : ce qu'il doit, réglable en espèces ou sur son solde ;
 *   - grossiste  : ce qu'on lui doit, dont il peut réclamer le règlement.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import ChoixPasserelle, { type Passerelle } from "@/components/ChoixPasserelle";
import PaiementMobile from "@/components/PaiementMobile";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Chargement,
  EtatVide,
  LigneInfo,
  ModaleConfirmation,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { date, libelleReglement, montant } from "@/lib/format";
import type { CreditFournisseur, IntentionPaiement, Role } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface Reponse {
  role: Role;
  en_attente: CreditFournisseur[];
  payes?: CreditFournisseur[];
  payees?: CreditFournisseur[];
  total_du?: number;
  total_a_encaisser?: number;
  solde?: number;
  solde_suffisant?: boolean;
}

export default function Credits() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/credits");

  const [messageAction, setMessageAction] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [enCours, setEnCours] = useState<number | null>(null);

  const [aPayer, setAPayer] = useState<{
    credit: CreditFournisseur;
    moyen: "especes" | "solde";
  } | null>(null);
  const [aReclamer, setAReclamer] = useState<CreditFournisseur | null>(null);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);

  if (chargement) return <Chargement />;

  if (erreur && !donnees) {
    return (
      <Ecran>
        <Alerte>{erreur}</Alerte>
      </Ecran>
    );
  }

  if (!donnees) return null;

  const estGrossiste = donnees.role === "grossiste";
  const enAttente = donnees.en_attente ?? [];
  const regles = (estGrossiste ? donnees.payees : donnees.payes) ?? [];

  async function payer(credit: CreditFournisseur, moyen: "especes" | "solde") {
    setErreurAction("");
    setMessageAction("");
    setEnCours(credit.id);

    try {
      const reponse = await api.post<{ solde: number }>(
        `/api/credits/${credit.id}/payer-${moyen}`,
      );

      setMessageAction(
        moyen === "solde"
          ? `Crédit payé. Nouveau solde : ${montant(reponse.solde)}.`
          : "Crédit soldé en espèces. La dépense correspondante a été générée.",
      );

      await recharger();
    } catch (e) {
      setErreurAction(t(messageErreur(e, "Paiement impossible.")));
    } finally {
      setEnCours(null);
      setAPayer(null);
    }
  }

  /**
   * Le grossiste réclame le règlement : le widget cible le téléphone du
   * détaillant, qui confirme depuis son mobile.
   */
  async function reclamer(
    credit: CreditFournisseur,
    passerelle: Passerelle,
    repartition: string,
  ) {
    setAReclamer(null);
    setErreurAction("");
    setEnCours(credit.id);

    try {
      const reponse = await api.post<{ paiement: IntentionPaiement }>(
        `/api/credits/${credit.id}/demander-paiement`,
        { passerelle, repartition_frais: repartition },
      );

      setIntention(reponse.paiement);
    } catch (e) {
      setErreurAction(t(messageErreur(e, "Demande impossible.")));
    } finally {
      setEnCours(null);
    }
  }

  return (
    <>
      <Ecran
        titre={estGrossiste ? t("Créances fournisseurs") : t("Crédits fournisseurs")}
        sousTitre={
          estGrossiste
            ? t("Ce que vos clients détaillants vous doivent")
            : t("Ce que vous devez à vos fournisseurs")
        }
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >

        {erreurAction ? <Alerte>{erreurAction}</Alerte> : null}
        {messageAction ? <Alerte type="succes">{messageAction}</Alerte> : null}

        <Carte>
          {estGrossiste ? (
            <LigneInfo libelle={t("Total à encaisser")} fort couleur={couleurs.attente}>
              {montant(donnees.total_a_encaisser ?? 0)}
            </LigneInfo>
          ) : (
            <>
              <LigneInfo libelle={t("Votre solde")} couleur={couleurs.succes}>
                {montant(donnees.solde ?? 0)}
              </LigneInfo>
              <LigneInfo libelle={t("Total dû")} fort couleur={couleurs.attente}>
                {montant(donnees.total_du ?? 0)}
              </LigneInfo>
              {donnees.solde_suffisant === false && (donnees.total_du ?? 0) > 0 ? (
                <Text style={styles.avertissement}>
                  {t("Votre solde ne couvre pas la totalité de vos crédits.")}
                </Text>
              ) : null}
            </>
          )}
        </Carte>

        {enAttente.length === 0 ? (
          <EtatVide
            titre={t("Aucun crédit en attente")}
            description={
              estGrossiste
                ? t("Vos clients détaillants sont à jour.")
                : t("Vous n'avez rien à régler à vos fournisseurs.")
            }
          />
        ) : (
          enAttente.map((credit) => (
            <Carte key={credit.id}>
              <View style={styles.ligne}>
                <View style={styles.textes}>
                  <Text style={styles.produit}>{credit.produit_nom}</Text>
                  <Text style={styles.meta}>
                    {estGrossiste
                      ? (credit.acheteur?.nom_boutique ?? "Détaillant")
                      : (credit.fournisseur_nom ?? credit.fournisseur_telephone ?? "Fournisseur")}
                  </Text>
                  <Text style={styles.date}>
                    {date(credit.date_appro)}
                    {credit.origine_commande ? ` · ${credit.origine_commande}` : ""}
                  </Text>
                </View>

                <View style={styles.droite}>
                  <Text style={styles.montant}>{montant(credit.montant_total)}</Text>
                  <Badge fond={couleurs.attenteClair} texte={couleurs.attente}>
                    {t("En attente")}
                  </Badge>
                </View>
              </View>

              <View style={styles.actions}>
                {estGrossiste ? (
                  <Bouton
                    compact
                    disabled={enCours === credit.id}
                    onPress={() => setAReclamer(credit)}
                  >
                    {t("💳 Réclamer le paiement")}
                  </Bouton>
                ) : (
                  <>
                    <Bouton
                      compact
                      disabled={enCours === credit.id}
                      onPress={() => setAPayer({ credit, moyen: "especes" })}
                    >
                      {t("💵 Payer en espèces")}
                    </Bouton>
                    <Bouton
                      variante="secondaire"
                      compact
                      disabled={enCours === credit.id}
                      onPress={() => setAPayer({ credit, moyen: "solde" })}
                    >
                      {t("🏦 Payer sur le solde")}
                    </Bouton>
                  </>
                )}
              </View>
            </Carte>
          ))
        )}

        {regles.length > 0 ? (
          <>
            <Text style={styles.titreGroupe}>{t("Réglés")}</Text>

            {regles.map((credit) => (
              <Carte key={credit.id}>
                <View style={styles.ligne}>
                  <View style={styles.textes}>
                    <Text style={styles.produit}>{credit.produit_nom}</Text>
                    <Text style={styles.date}>{date(credit.date_appro)}</Text>
                  </View>

                  <View style={styles.droite}>
                    <Text style={styles.montant}>{montant(credit.montant_total)}</Text>
                    <Badge fond={couleurs.succesClair} texte={couleurs.succesSombre}>
                      {t(libelleReglement(credit.moyen_reglement))}
                    </Badge>
                  </View>
                </View>
              </Carte>
            ))}
          </>
        ) : null}
      </Ecran>

      <ModaleConfirmation
        visible={aPayer !== null}
        titre={t("Régler ce crédit ?")}
        message={
          aPayer
            ? aPayer.moyen === "especes"
              ? `Marquer ce crédit de ${montant(aPayer.credit.montant_total)} comme payé en espèces ? Une dépense sera générée.`
              : `Payer ${montant(aPayer.credit.montant_total)} depuis votre solde ?`
            : undefined
        }
        libelleConfirmer={t("Payer")}
        variante="primaire"
        enCours={enCours !== null}
        onAnnuler={() => setAPayer(null)}
        onConfirmer={() => aPayer && void payer(aPayer.credit, aPayer.moyen)}
      />

      {aReclamer ? (
        <ChoixPasserelle
          titre={aReclamer.produit_nom}
          montantDu={aReclamer.montant_total}
          onValider={(passerelle, repartition) =>
            void reclamer(aReclamer, passerelle, repartition)
          }
          onFermer={() => setAReclamer(null)}
        />
      ) : null}

      {intention ? (
        <PaiementMobile
          intention={intention}
          onSucces={() => {
            setIntention(null);
            setMessageAction(t("Paiement encaissé."));
            void recharger();
          }}
          onAnnuler={() => {
            setIntention(null);
            void recharger();
          }}
        />
      ) : null}
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  avertissement: {
    marginTop: espacement.sm,
    fontSize: 12,
    color: couleurs.alerte,
  },
  titreGroupe: {
    marginTop: espacement.lg,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
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
  produit: {
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
    gap: 5,
  },
  montant: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.texte,
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
