/**
 * Nouvelle vente — port de frontend/src/app/(app)/ventes/nouvelle/page.tsx.
 *
 * Comme sur le web, le panier, le règlement et les échéances partent en une
 * seule requête, donc en une seule transaction côté serveur : l'ancien tunnel
 * PHP en quatre pages reliées par $_SESSION pouvait laisser une vente sans ses
 * créances si l'utilisateur abandonnait au milieu.
 */

import { useT } from "@/i18n";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  Chargement,
  LienTexte,
  LigneInfo,
  TitreSection,
} from "@/components/ui";
import Echeancier, {
  echeanceInitiale,
  echeancierValide,
  echeancesDepassees,
  versApi,
  type EcheanceSaisie,
} from "@/components/Echeancier";
import PaiementMobile from "@/components/PaiementMobile";
import { api, messageErreur } from "@/lib/api";
import {
  OPTIONS_REPARTITION,
  PALIERS_PART_VENDEUR,
  calculerFrais,
  partVendeurPourcent,
  tauxPour,
  versApi as repartitionVersApi,
  type Repartition,
} from "@/lib/frais";
import { montant as formaterMontant, nombre } from "@/lib/format";
import type { Client, IntentionPaiement, Produit, Vente } from "@/lib/types";
import { couleurs, espacement, rayons, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface LignePanier {
  produit: Produit;
  quantite: number;
}

export default function NouvelleVente() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();

  const [produits, setProduits] = useState<Produit[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const [panier, setPanier] = useState<LignePanier[]>([]);
  const [clientId, setClientId] = useState("");
  const [modePaiement, setModePaiement] = useState("especes");
  const [montantPaye, setMontantPaye] = useState("");
  const [telephoneClient, setTelephoneClient] = useState("");
  const [fedapayIdentifiant, setFedapayIdentifiant] = useState("");
  const [repartitionFrais, setRepartitionFrais] = useState<Repartition>("client");
  const [partVendeurSaisie, setPartVendeurSaisie] = useState("40");
  const [echeances, setEcheances] = useState<EcheanceSaisie[]>([]);

  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);
  const [venteCreee, setVenteCreee] = useState<Vente | null>(null);

  useEffect(() => {
    Promise.all([api.get<Produit[]>("/api/produits"), api.get<Client[]>("/api/clients")])
      .then(([p, c]) => {
        setProduits(p);
        setClients(c);
      })
      .catch((e) => {
        setProduits([]);
        setErreur(t(messageErreur(e, "Chargement impossible.")));
      });
  }, []);

  const total = useMemo(
    () => panier.reduce((s, l) => s + l.quantite * l.produit.prix_vente, 0),
    [panier],
  );

  const paye = Math.min(parseFloat(montantPaye) || 0, total);
  const reste = Math.max(0, total - paye);

  // Un reste à payer impose un échéancier (règle de creances_setup.php).
  // L'échéance par défaut n'est posée qu'au passage de « soldé » à « à crédit »,
  // pour ne pas écraser une saisie en cours à chaque frappe sur le montant.
  const aUnReste = reste > 0;

  useEffect(() => {
    if (aUnReste) {
      setEcheances((liste) => (liste.length === 0 ? [echeanceInitiale(reste)] : liste));
    } else {
      setEcheances([]);
    }
    // `reste` est volontairement hors dépendances : seul le passage à crédit
    // doit réamorcer la liste.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aUnReste]);

  function ajouterProduit(id: string) {
    const produit = produits?.find((p) => p.id === parseInt(id, 10));
    if (!produit) return;

    setPanier((p) => {
      const existante = p.find((l) => l.produit.id === produit.id);

      if (existante) {
        return p.map((l) =>
          l.produit.id === produit.id
            ? { ...l, quantite: Math.min(l.quantite + 1, produit.stock) }
            : l,
        );
      }

      return [...p, { produit, quantite: 1 }];
    });
  }

  function changerQuantite(produitId: number, quantite: number) {
    setPanier((p) =>
      p.map((l) =>
        l.produit.id === produitId
          ? { ...l, quantite: Math.max(1, Math.min(quantite, l.produit.stock)) }
          : l,
      ),
    );
  }

  async function soumettre() {
    setErreur("");

    if (panier.length === 0) {
      setErreur(t("Ajoutez au moins un produit."));
      return;
    }
    if (reste > 0 && !echeancierValide(echeances, reste)) {
      setErreur(
        `La somme des échéances ne correspond pas au reste à payer (${formaterMontant(reste)}).`,
      );
      return;
    }
    if (echeancesDepassees(echeances) > 0) {
      setErreur(
        t("Une échéance est datée dans le passé : un paiement se planifie à une date à venir."),
      );
      return;
    }

    setEnvoi(true);

    try {
      const reponse = await api.post<{ vente: Vente; paiement: IntentionPaiement | null }>(
        "/api/ventes",
        {
          client_id: clientId ? parseInt(clientId, 10) : null,
          montant_paye: paye,
          mode_paiement: modePaiement,
          telephone_client: telephoneClient,
          fedapay_identifiant: fedapayIdentifiant,
          repartition_frais: repartitionVersApi(repartitionFrais, part),
          lignes: panier.map((l) => ({ produit_id: l.produit.id, quantite: l.quantite })),
          echeances: versApi(echeances),
        },
      );

      setVenteCreee(reponse.vente);

      if (reponse.paiement) {
        setIntention(reponse.paiement);
      } else {
        router.replace(`/ventes/${reponse.vente.id}`);
      }
    } catch (e) {
      setErreur(t(messageErreur(e, "Enregistrement impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  if (!produits) return <Chargement />;

  const disponibles = produits.filter((p) => p.stock > 0);
  const passerelle = modePaiement !== "especes";

  // Partage des frais de transaction : les trois raccourcis ne sont que des
  // pourcentages particuliers, d'où un calcul unique quel que soit le choix.
  const part = partVendeurPourcent(repartitionFrais, parseInt(partVendeurSaisie, 10) || 0);
  const frais = calculerFrais(paye, tauxPour(modePaiement), part);
  const fraisApplicables = passerelle && paye > 0;

  return (
    <>
      <Ecran>
        {erreur ? <Alerte>{erreur}</Alerte> : null}

        <Carte>
          <TitreSection>{t("Produits")}</TitreSection>

          {disponibles.length === 0 ? (
            <Alerte type="info">
              {t("Aucun produit en stock. Ajoutez du stock avant d'enregistrer une vente.")}
            </Alerte>
          ) : (
            <ChampSelect
              label={t("Ajouter un produit")}
              valeur=""
              placeholder={t("Choisir un produit…")}
              onChange={ajouterProduit}
              options={disponibles.map((p) => ({
                valeur: String(p.id),
                label: p.nom,
                note: `${formaterMontant(p.prix_vente)} · ${nombre(p.stock)} en stock`,
              }))}
            />
          )}

          {panier.map((ligne) => (
            <View key={ligne.produit.id} style={styles.lignePanier}>
              <View style={styles.lignePanierEntete}>
                <View style={styles.lignePanierTextes}>
                  <Text style={styles.lignePanierNom} numberOfLines={1}>
                    {ligne.produit.nom}
                  </Text>
                  <Text style={styles.lignePanierMeta}>
                    {formaterMontant(ligne.produit.prix_vente)} · stock{" "}
                    {nombre(ligne.produit.stock)}
                  </Text>
                </View>

                <LienTexte
                  couleur={couleurs.danger}
                  onPress={() =>
                    setPanier((p) => p.filter((l) => l.produit.id !== ligne.produit.id))
                  }
                >
                  {t("Retirer")}
                </LienTexte>
              </View>

              <View style={styles.lignePanierPied}>
                <View style={styles.compteur}>
                  <Bouton
                    variante="neutre"
                    compact
                    onPress={() => changerQuantite(ligne.produit.id, ligne.quantite - 1)}
                  >
                    −
                  </Bouton>
                  <Text style={styles.compteurValeur}>{ligne.quantite}</Text>
                  <Bouton
                    variante="neutre"
                    compact
                    onPress={() => changerQuantite(ligne.produit.id, ligne.quantite + 1)}
                    disabled={ligne.quantite >= ligne.produit.stock}
                  >
                    +
                  </Bouton>
                </View>

                <Text style={styles.lignePanierTotal}>
                  {formaterMontant(ligne.quantite * ligne.produit.prix_vente)}
                </Text>
              </View>
            </View>
          ))}
        </Carte>

        <Carte>
          <TitreSection>{t("Règlement")}</TitreSection>

          <ChampSelect
            label={t("Client (optionnel)")}
            valeur={clientId}
            onChange={setClientId}
            placeholder={t("Client de passage")}
            options={[
              { valeur: "", label: t("Client de passage") },
              ...clients.map((c) => ({
                valeur: String(c.id),
                label: c.nom_complet,
                note: c.telephone,
              })),
            ]}
          />

          <ChampSelect
            label={t("Mode de paiement")}
            valeur={modePaiement}
            onChange={setModePaiement}
            options={[
              { valeur: "especes", label: t("💵 Espèces") },
              { valeur: "mobile_money", label: t("📱 Mobile Money (KkiaPay)") },
              { valeur: "fedapay", label: t("💳 Agrégateur") },
            ]}
          />

          <Champ
            label={t("Montant payé (FCFA)")}
            value={montantPaye}
            onChangeText={setMontantPaye}
            keyboardType="numeric"
            placeholder="0"
            aide={`Total : ${formaterMontant(total)} — laissez vide pour une vente entièrement à crédit`}
          />

          {modePaiement === "mobile_money" && paye > 0 ? (
            <Champ
              label={t("Numéro Mobile Money du client")}
              value={telephoneClient}
              onChangeText={setTelephoneClient}
              keyboardType="phone-pad"
            />
          ) : null}

          {modePaiement === "fedapay" && paye > 0 ? (
            <Champ
              label={t("Téléphone ou email de l'agrégateur")}
              value={fedapayIdentifiant}
              onChangeText={setFedapayIdentifiant}
              autoCapitalize="none"
            />
          ) : null}

          {fraisApplicables ? (
            <View style={styles.frais}>
              <ChampSelect
                label={t("Partage des frais de transaction")}
                valeur={repartitionFrais}
                onChange={(v) => setRepartitionFrais(v as Repartition)}
                options={OPTIONS_REPARTITION.map((o) => ({
                  valeur: o.valeur,
                  label: o.label,
                }))}
              />

              {repartitionFrais === "personnalise" ? (
                <ChampSelect
                  label={t("Part à ma charge")}
                  valeur={partVendeurSaisie}
                  onChange={setPartVendeurSaisie}
                  options={PALIERS_PART_VENDEUR.map((p) => ({
                    valeur: String(p),
                    label: `${p} % pour moi`,
                    note: `${100 - p} % pour le client`,
                  }))}
                />
              ) : null}

              <LigneInfo
                libelle={`Frais de la passerelle (${(tauxPour(modePaiement) * 100).toFixed(1)} %)`}
              >
                {formaterMontant(frais.fraisTotal)}
              </LigneInfo>
              <LigneInfo libelle={t("À la charge du client")}>
                {formaterMontant(frais.fraisClient)}
              </LigneInfo>
              <LigneInfo libelle={t("À ma charge")} couleur={couleurs.attente}>
                {formaterMontant(frais.fraisVendeur)}
              </LigneInfo>
              <LigneInfo libelle={t("Le client est débité de")} fort>
                {formaterMontant(frais.montantWidget)}
              </LigneInfo>
            </View>
          ) : null}
        </Carte>

        {reste > 0 ? (
          <Carte>
            <Echeancier
              titre={t("Échéances du reste à payer")}
              echeances={echeances}
              onChange={setEcheances}
              montantDu={reste}
            />
          </Carte>
        ) : null}

        <Carte>
          <TitreSection>{t("Récapitulatif")}</TitreSection>

          <LigneInfo libelle={t("Articles")}>{panier.length}</LigneInfo>
          <LigneInfo libelle={t("Total")}>{formaterMontant(total)}</LigneInfo>
          <LigneInfo libelle={t("Payé")} couleur={couleurs.succes}>
            {formaterMontant(paye)}
          </LigneInfo>
          {fraisApplicables ? (
            <LigneInfo libelle={t("Frais à ma charge")} couleur={couleurs.attente}>
              {formaterMontant(frais.fraisVendeur)}
            </LigneInfo>
          ) : null}
          <LigneInfo
            libelle={t("Reste à payer")}
            fort
            couleur={reste > 0 ? couleurs.attente : couleurs.succes}
          >
            {formaterMontant(reste)}
          </LigneInfo>

          <View style={styles.action}>
            <Bouton onPress={soumettre} disabled={envoi || panier.length === 0} pleineLargeur>
              {envoi ? t("Enregistrement…") : t("Enregistrer la vente")}
            </Bouton>
          </View>
        </Carte>
      </Ecran>

      {intention && venteCreee ? (
        <PaiementMobile
          intention={intention}
          onSucces={() => router.replace(`/ventes/${venteCreee.id}`)}
          onAnnuler={() => router.replace(`/ventes/${venteCreee.id}`)}
        />
      ) : null}
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  frais: {
    backgroundColor: couleurs.fond,
    borderRadius: rayons.md,
    padding: espacement.md,
    marginTop: espacement.xs,
  },
  lignePanier: {
    backgroundColor: couleurs.fond,
    borderRadius: rayons.md,
    padding: espacement.md,
    marginTop: espacement.sm,
  },
  lignePanierEntete: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  lignePanierTextes: {
    flex: 1,
  },
  lignePanierNom: {
    fontSize: 14,
    fontWeight: "700",
    color: couleurs.texte,
  },
  lignePanierMeta: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  lignePanierPied: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: espacement.md,
  },
  compteur: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
  },
  compteurValeur: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  lignePanierTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: couleurs.texte,
  },
  action: {
    marginTop: espacement.lg,
  },
});
