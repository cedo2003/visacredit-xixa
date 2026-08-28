/**
 * Détail d'une commande — port de frontend/src/app/(app)/commandes/[id]/page.tsx.
 *
 * Les boutons affichés viennent de `actions_possibles`, calculé côté API selon
 * le rôle et le statut. L'écran ne rejoue donc aucune règle métier : il traduit
 * une liste d'actions autorisées en boutons, et poste l'action choisie.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import ChoixPasserelle, { type Passerelle } from "@/components/ChoixPasserelle";
import Echeancier, {
  echeancierValide,
  versApi,
  type EcheanceSaisie,
} from "@/components/Echeancier";
import ModaleNotation from "@/components/ModaleNotation";
import PaiementMobile from "@/components/PaiementMobile";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Champ,
  Chargement,
  LigneInfo,
  ModaleConfirmation,
  TitreSection,
  type VarianteBouton,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { badgeCommande, date, dateHeure, montant, nombre } from "@/lib/format";
import type { ActionCommande, Commande, IntentionPaiement } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

/** Action simple : un POST sans corps, éventuellement précédé d'une confirmation. */
interface ActionSimple {
  chemin: string;
  libelle: string | ((commande: Commande) => string);
  variante?: VarianteBouton;
  confirmation?: (commande: Commande) => string;
}

/**
 * Les accords sont verts, les refus rouges : l'orange de la marque et le rouge
 * du danger se ressemblaient trop pour distinguer « valider » de « refuser ».
 */
const ACTIONS: Partial<Record<ActionCommande, ActionSimple>> = {
  valider: {
    chemin: "valider",
    libelle: "✅ Valider la commande",
    variante: "succes",
    confirmation: () =>
      "Valider cette commande ? Votre stock sera décrémenté et transféré au détaillant.",
  },
  livrer: {
    chemin: "livrer",
    libelle: "📦 Marquer comme livrée",
    variante: "secondaire",
  },
  confirmer_reception: {
    chemin: "reception",
    libelle: "✋ J'ai reçu la commande",
    variante: "succes",
    confirmation: () => "Confirmer la réception des produits ?",
  },
  encaisser_especes: {
    chemin: "encaisser-especes",
    libelle: "💵 Encaisser en espèces",
    confirmation: (c) => `Confirmer la réception de ${montant(c.reste)} en espèces ?`,
  },
  payer_especes: {
    chemin: "payer-especes",
    libelle: "💵 Payer en espèces",
    confirmation: (c) => `Payer ${montant(c.reste)} en espèces ? Une dépense sera générée.`,
  },
  annuler: {
    chemin: "annuler",
    // Côté grossiste, « annuler » veut dire refuser la commande du détaillant.
    libelle: (c) =>
      c.mon_role === "grossiste" ? "✖ Refuser la commande" : "✖ Annuler ma commande",
    variante: "danger",
    confirmation: (c) =>
      c.mon_role === "grossiste"
        ? "Refuser définitivement cette commande ?"
        : "Annuler définitivement cette commande ?",
  },
};

/**
 * Où en est chaque tour de marchandage.
 *
 * Prend la palette en paramètre plutôt que de la lire au chargement du module :
 * une table figée à l'import garderait les teintes claires même en thème sombre.
 */
function etiquettesNegociation(couleurs: Palette) {
  return {
    en_attente: {
      label: "En attente de réponse",
      fond: couleurs.alerteClair,
      texte: couleurs.alerte,
    },
    acceptee: { label: "Acceptée", fond: couleurs.succesClair, texte: couleurs.succesSombre },
    refusee: { label: "Refusée", fond: couleurs.dangerClair, texte: couleurs.danger },
    contre_proposee: {
      label: "Contre-proposée",
      fond: couleurs.surfaceDouce,
      texte: couleurs.texteDoux,
    },
  } as Record<string, { label: string; fond: string; texte: string }>;
}

export default function DetailCommande() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { donnees, chargement, erreur, rafraichissement, recharger } = useRequete<Commande>(
    id ? `/api/commandes/${id}` : null,
  );

  const [messageErreurAction, setMessageErreurAction] = useState("");
  const [succes, setSucces] = useState("");
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const [aConfirmer, setAConfirmer] = useState<{ action: ActionSimple; texte: string } | null>(
    null,
  );
  const [choixPasserelle, setChoixPasserelle] = useState(false);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);
  const [notation, setNotation] = useState<"fournisseur" | "client" | null>(null);

  const [echeances, setEcheances] = useState<EcheanceSaisie[] | null>(null);

  const [marchandageOuvert, setMarchandageOuvert] = useState(false);
  const [prixPropose, setPrixPropose] = useState("");
  const [messageMarchandage, setMessageMarchandage] = useState("");

  if (chargement) return <Chargement />;

  if (erreur && !donnees) {
    return (
      <Ecran>
        <Alerte>{erreur}</Alerte>
      </Ecran>
    );
  }

  const commande = donnees;
  if (!commande) return null;

  const badge = badgeCommande(commande.statut, couleurs);
  const actions = commande.actions_possibles ?? [];
  const occupe = actionEnCours !== null;
  const negociations = commande.negociations ?? [];
  const negociationOuverte = commande.negociation_en_attente ?? null;
  const peutMarchander =
    actions.includes("marchander") || actions.includes("contre_proposer");

  async function executer(action: ActionSimple) {
    setMessageErreurAction("");
    setSucces("");
    setActionEnCours(action.chemin);

    try {
      await api.post(`/api/commandes/${id}/${action.chemin}`);
      await recharger();
      setSucces(t("Opération enregistrée."));
    } catch (e) {
      setMessageErreurAction(t(messageErreur(e, "Opération impossible.")));
    } finally {
      setActionEnCours(null);
      setAConfirmer(null);
    }
  }

  function lancer(action: ActionSimple) {
    const texte = action.confirmation?.(commande!);

    if (texte) {
      setAConfirmer({ action, texte });
      return;
    }

    void executer(action);
  }

  /** Proposition de prix : le détaillant marchande, le grossiste tranche. */
  async function proposerPrix() {
    setMessageErreurAction("");
    setSucces("");
    setActionEnCours("marchandage");

    try {
      await api.post(`/api/commandes/${id}/marchandage`, {
        montant: parseFloat(prixPropose) || 0,
        message: messageMarchandage.trim(),
      });

      await recharger();
      setMarchandageOuvert(false);
      setPrixPropose("");
      setMessageMarchandage("");
      setSucces(t("Proposition envoyée. Votre interlocuteur doit maintenant se prononcer."));
    } catch (e) {
      setMessageErreurAction(t(messageErreur(e, "Proposition impossible.")));
    } finally {
      setActionEnCours(null);
    }
  }

  async function demanderPaiement(passerelle: Passerelle, repartition: string) {
    setChoixPasserelle(false);
    setMessageErreurAction("");
    setActionEnCours("demander_paiement");

    try {
      const reponse = await api.post<{ paiement: IntentionPaiement }>(
        `/api/commandes/${id}/demander-paiement`,
        { passerelle, repartition_frais: repartition },
      );

      setIntention(reponse.paiement);
      await recharger();
    } catch (e) {
      setMessageErreurAction(t(messageErreur(e, "Demande impossible.")));
    } finally {
      setActionEnCours(null);
    }
  }

  async function enregistrerEcheances() {
    if (!echeances) return;

    if (!echeancierValide(echeances, commande!.montant_total)) {
      setMessageErreurAction(
        `Le total des échéances doit correspondre au montant de la commande (${montant(commande!.montant_total)}).`,
      );
      return;
    }

    setMessageErreurAction("");
    setActionEnCours("echeances");

    try {
      await api.put(`/api/commandes/${id}/echeances`, { echeances: versApi(echeances) });
      await recharger();
      setEcheances(null);
      setSucces(t("Échéancier mis à jour."));
    } catch (e) {
      setMessageErreurAction(t(messageErreur(e, "Mise à jour impossible.")));
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <>
      <Ecran onRafraichir={recharger} rafraichissement={rafraichissement}>
        {messageErreurAction ? <Alerte>{messageErreurAction}</Alerte> : null}
        {succes ? <Alerte type="succes">{succes}</Alerte> : null}

        <Carte>
          <View style={styles.entete}>
            <View style={styles.enteteTextes}>
              <Text style={styles.numero}>{commande.numero_commande}</Text>
              <Text style={styles.dateCommande}>{dateHeure(commande.date_commande)}</Text>
            </View>
            <Badge fond={badge.fond} texte={badge.texte}>
              {t(badge.label)}
            </Badge>
          </View>

          <View style={styles.montants}>
            <LigneInfo libelle={t("Montant total")}>{montant(commande.montant_total)}</LigneInfo>
            <LigneInfo libelle={t("Déjà payé")} couleur={couleurs.succes}>
              {montant(commande.montant_paye)}
            </LigneInfo>
            <LigneInfo
              libelle={t("Reste à payer")}
              fort
              couleur={commande.reste > 0 ? couleurs.attente : couleurs.succes}
            >
              {montant(commande.reste)}
            </LigneInfo>
          </View>
        </Carte>

        <Carte>
          <TitreSection>{t("Partenaire")}</TitreSection>

          <LigneInfo libelle={t("Fournisseur")}>
            {commande.fournisseur_nom ?? commande.fournisseur_telephone}
          </LigneInfo>
          <LigneInfo libelle={t("Téléphone")}>{commande.fournisseur_telephone}</LigneInfo>
          <LigneInfo libelle={t("Sur Visacredit XIXA")}>
            {commande.fournisseur_sur_plateforme ? t("Oui") : t("Fournisseur externe")}
          </LigneInfo>
          {commande.detaillant ? (
            <LigneInfo libelle={t("Détaillant")}>{commande.detaillant.nom_boutique}</LigneInfo>
          ) : null}
          <LigneInfo libelle={t("Mode de paiement")}>
            {commande.mode_paiement === "credit" ? t("À crédit") : t("Comptant")}
          </LigneInfo>
          {commande.notes ? <LigneInfo libelle={t("Notes")}>{commande.notes}</LigneInfo> : null}
        </Carte>

        <Carte>
          <TitreSection>{t("Produits")}</TitreSection>

          {(commande.lignes ?? []).map((ligne) => (
            <View key={ligne.id} style={styles.ligneProduit}>
              <View style={styles.ligneProduitTextes}>
                <Text style={styles.produitNom}>{ligne.produit_nom}</Text>
                <Text style={styles.produitDetail}>
                  {nombre(ligne.quantite)} × {montant(ligne.prix_unitaire)}
                </Text>
              </View>
              <Text style={styles.produitTotal}>{montant(ligne.montant)}</Text>
            </View>
          ))}
        </Carte>

        {(commande.echeances ?? []).length > 0 && !echeances ? (
          <Carte>
            <TitreSection
              action={
                actions.includes("modifier_echeances") ? (
                  <Bouton
                    variante="neutre"
                    compact
                    onPress={() =>
                      setEcheances(
                        (commande.echeances ?? []).map((e) => ({
                          montant: String(Math.round(e.montant)),
                          date_limite: e.date_limite ?? "",
                        })),
                      )
                    }
                  >
                    {t("Modifier")}
                  </Bouton>
                ) : undefined
              }
            >
              {t("Échéancier")}
            </TitreSection>

            {(commande.echeances ?? []).map((echeance) => (
              <View key={echeance.id} style={styles.ligneEcheance}>
                <View style={styles.ligneProduitTextes}>
                  <Text style={styles.produitNom}>
                    Échéance {echeance.numero_echeance}/{echeance.nb_echeances_total}
                  </Text>
                  <Text style={styles.produitDetail}>
                    Avant le {date(echeance.date_limite)}
                  </Text>
                </View>

                <View style={styles.echeanceDroite}>
                  <Text style={styles.produitTotal}>{montant(echeance.montant)}</Text>
                  <Badge
                    fond={echeance.statut === "payee" ? couleurs.succesClair : couleurs.attenteClair}
                    texte={echeance.statut === "payee" ? couleurs.succesSombre : couleurs.attente}
                  >
                    {echeance.statut === "payee" ? t("Payée") : t("En attente")}
                  </Badge>
                </View>
              </View>
            ))}
          </Carte>
        ) : null}

        {echeances ? (
          <Carte>
            <Echeancier
              titre={t("Modifier l'échéancier")}
              echeances={echeances}
              onChange={setEcheances}
              montantDu={commande.montant_total}
            />

            <View style={styles.actionsEcheancier}>
              <Bouton
                variante="neutre"
                onPress={() => setEcheances(null)}
                style={styles.actionMoitie}
              >
                {t("Annuler")}
              </Bouton>
              <Bouton
                onPress={enregistrerEcheances}
                disabled={occupe}
                style={styles.actionMoitie}
              >
                {t("Enregistrer")}
              </Bouton>
            </View>
          </Carte>
        ) : null}

        {/*
          Marchandage : le prix se discute tant que la commande est en attente.
          Le détaillant propose, le grossiste accepte ou refuse — et peut
          contre-proposer, comme au marché.
        */}
        {peutMarchander || negociations.length > 0 ? (
          <Carte>
            <TitreSection>{t("Négociation du prix")}</TitreSection>

            {negociations.length === 0 ? (
              <Text style={styles.marchandageAide}>
                {t("Le prix affiché est celui de la commande. Vous pouvez en proposer un autre : le grossiste devra l'accepter pour qu'il s'applique.")}
              </Text>
            ) : (
              negociations.map((negociation) => {
                const etiquettes = etiquettesNegociation(couleurs);
                const etiquette =
                  etiquettes[negociation.statut] ?? etiquettes.en_attente;

                return (
                  <View key={negociation.id} style={styles.negociation}>
                    <View style={styles.negociationEntete}>
                      <Text style={styles.negociationMontant}>
                        {montant(negociation.montant_propose)}
                      </Text>
                      <Badge fond={etiquette.fond} texte={etiquette.texte}>
                        {t(etiquette.label)}
                      </Badge>
                    </View>

                    <Text style={styles.negociationMeta}>
                      {negociation.auteur?.nom_boutique ??
                        (negociation.role_auteur === "grossiste"
                          ? t("Le grossiste")
                          : t("Le détaillant"))}{" "}
                      · {dateHeure(negociation.created_at)}
                    </Text>
                    <Text style={styles.negociationMeta}>
                      Au lieu de {montant(negociation.montant_initial)} (
                      {negociation.ecart_pourcent > 0 ? "+" : ""}
                      {negociation.ecart_pourcent} %)
                    </Text>

                    {negociation.message ? (
                      <Text style={styles.negociationMessage}>
                        « {negociation.message} »
                      </Text>
                    ) : null}
                  </View>
                );
              })
            )}

            {peutMarchander && !marchandageOuvert ? (
              <View style={styles.marchandageAction}>
                <Bouton
                  variante="neutre"
                  pleineLargeur
                  onPress={() => {
                    setPrixPropose(String(Math.round(commande!.montant_total)));
                    setMarchandageOuvert(true);
                  }}
                >
                  🤝{" "}
                  {actions.includes("contre_proposer")
                    ? t("Contre-proposer")
                    : t("Proposer un prix")}
                </Bouton>
              </View>
            ) : null}

            {peutMarchander && marchandageOuvert ? (
              <View style={styles.marchandageAction}>
                <Champ
                  label={t("Prix proposé pour la commande entière (FCFA)")}
                  value={prixPropose}
                  onChangeText={setPrixPropose}
                  keyboardType="numeric"
                  aide={`Montant actuel : ${montant(commande.montant_total)}`}
                />
                <Champ
                  label={t("Message (optionnel)")}
                  value={messageMarchandage}
                  onChangeText={setMessageMarchandage}
                  placeholder={t("Ex : client fidèle, commande régulière…")}
                  multiline
                />

                <View style={styles.actionsEcheancier}>
                  <Bouton
                    variante="neutre"
                    onPress={() => setMarchandageOuvert(false)}
                    style={styles.actionMoitie}
                  >
                    {t("Annuler")}
                  </Bouton>
                  <Bouton
                    onPress={proposerPrix}
                    disabled={occupe || !prixPropose}
                    style={styles.actionMoitie}
                  >
                    {t("Envoyer")}
                  </Bouton>
                </View>
              </View>
            ) : null}

            {negociationOuverte && actions.includes("accepter_prix") ? (
              <View style={styles.marchandageAction}>
                <Bouton
                  variante="succes"
                  pleineLargeur
                  disabled={occupe}
                  onPress={() =>
                    lancer({
                      chemin: "marchandage/accepter",
                      libelle: t("Accepter le prix"),
                      variante: "succes",
                      confirmation: () =>
                        `Accepter le prix de ${montant(negociationOuverte.montant_propose)} pour cette commande ?`,
                    })
                  }
                >
                  ✅ Accepter {montant(negociationOuverte.montant_propose)}
                </Bouton>

                <View style={styles.marchandageRefus}>
                  <Bouton
                    variante="danger"
                    pleineLargeur
                    disabled={occupe}
                    onPress={() =>
                      lancer({
                        chemin: "marchandage/refuser",
                        libelle: t("Refuser le prix"),
                        variante: "danger",
                        confirmation: () => "Refuser cette proposition de prix ?",
                      })
                    }
                  >
                    {t("✖ Refuser le prix")}
                  </Bouton>
                </View>
              </View>
            ) : null}
          </Carte>
        ) : null}

        <Carte>
          <TitreSection>{t("Suivi")}</TitreSection>

          <LigneInfo libelle={t("Commande passée")}>{dateHeure(commande.date_commande)}</LigneInfo>
          <LigneInfo libelle={t("Validée")}>{dateHeure(commande.date_validation)}</LigneInfo>
          <LigneInfo libelle={t("Livrée")}>{dateHeure(commande.date_livraison)}</LigneInfo>
          <LigneInfo libelle={t("Réceptionnée")}>{dateHeure(commande.date_reception)}</LigneInfo>
          <LigneInfo libelle={t("Payée")}>{dateHeure(commande.date_paiement)}</LigneInfo>
        </Carte>

        {actions.length > 0 ? (
          <Carte>
            <TitreSection>{t("Actions")}</TitreSection>

            <View style={styles.actions}>
              {(Object.keys(ACTIONS) as ActionCommande[])
                .filter((nom) => actions.includes(nom))
                .map((nom) => {
                  const action = ACTIONS[nom]!;

                  return (
                    <Bouton
                      key={nom}
                      variante={action.variante ?? "primaire"}
                      disabled={occupe}
                      pleineLargeur
                      onPress={() => lancer(action)}
                    >
                      {t(
                        typeof action.libelle === "function"
                          ? action.libelle(commande!)
                          : action.libelle,
                      )}
                    </Bouton>
                  );
                })}

              {actions.includes("demander_paiement") ? (
                <Bouton
                  variante="secondaire"
                  disabled={occupe}
                  pleineLargeur
                  onPress={() => setChoixPasserelle(true)}
                >
                  {t("💳 Demander le paiement")}
                </Bouton>
              ) : null}

              {actions.includes("noter_fournisseur") ? (
                <Bouton variante="neutre" pleineLargeur onPress={() => setNotation("fournisseur")}>
                  {t("⭐ Noter le fournisseur")}
                </Bouton>
              ) : null}

              {actions.includes("noter_client") ? (
                <Bouton variante="neutre" pleineLargeur onPress={() => setNotation("client")}>
                  {t("⭐ Noter le client")}
                </Bouton>
              ) : null}
            </View>
          </Carte>
        ) : null}
      </Ecran>

      <ModaleConfirmation
        visible={aConfirmer !== null}
        titre={t("Confirmer l'opération")}
        message={aConfirmer?.texte}
        libelleConfirmer={t("Confirmer")}
        variante={aConfirmer?.action.variante === "danger" ? "danger" : "primaire"}
        enCours={occupe}
        onAnnuler={() => setAConfirmer(null)}
        onConfirmer={() => aConfirmer && void executer(aConfirmer.action)}
      />

      {choixPasserelle ? (
        <ChoixPasserelle
          titre={`Commande ${commande.numero_commande}`}
          montantDu={commande.reste}
          onValider={demanderPaiement}
          onFermer={() => setChoixPasserelle(false)}
        />
      ) : null}

      {intention ? (
        <PaiementMobile
          intention={intention}
          onSucces={() => {
            setIntention(null);
            setSucces(t("Paiement encaissé."));
            void recharger();
          }}
          onAnnuler={() => {
            setIntention(null);
            void recharger();
          }}
        />
      ) : null}

      {notation ? (
        <ModaleNotation
          type={notation}
          commandeId={commande.id}
          onFerme={() => setNotation(null)}
          onNote={() => {
            setNotation(null);
            setSucces(t("Merci pour votre note."));
            void recharger();
          }}
        />
      ) : null}
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  entete: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: espacement.md,
  },
  enteteTextes: {
    flex: 1,
  },
  numero: {
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.texte,
  },
  dateCommande: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  montants: {
    marginTop: espacement.md,
    paddingTop: espacement.sm,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },

  ligneProduit: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingVertical: espacement.sm,
  },
  ligneEcheance: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingVertical: espacement.sm,
  },
  ligneProduitTextes: {
    flex: 1,
  },
  produitNom: {
    fontSize: 14,
    fontWeight: "600",
    color: couleurs.texte,
  },
  produitDetail: {
    marginTop: 1,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  produitTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: couleurs.texte,
  },
  echeanceDroite: {
    alignItems: "flex-end",
    gap: 5,
  },

  actions: {
    gap: espacement.md,
  },
  marchandageAide: {
    fontSize: 13,
    lineHeight: 19,
    color: couleurs.texteFaible,
  },
  marchandageAction: {
    marginTop: espacement.md,
  },
  marchandageRefus: {
    marginTop: espacement.md,
  },
  negociation: {
    backgroundColor: couleurs.fond,
    borderRadius: 14,
    padding: espacement.md,
    marginBottom: espacement.sm,
  },
  negociationEntete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espacement.sm,
  },
  negociationMontant: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.texte,
  },
  negociationMeta: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  negociationMessage: {
    marginTop: espacement.sm,
    fontSize: 13,
    lineHeight: 19,
    color: couleurs.texteDoux,
  },
  actionsEcheancier: {
    flexDirection: "row",
    gap: espacement.md,
    marginTop: espacement.md,
  },
  actionMoitie: {
    flex: 1,
  },
});
