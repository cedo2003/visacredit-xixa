/**
 * Nouvelle commande B2B — port de frontend/src/app/(app)/commandes/nouvelle/page.tsx.
 *
 * Les quatre étapes de l'original PHP (fournisseur → mode → produits →
 * confirmation), reliées par $_SESSION['temp_commande'], tiennent ici sur un
 * seul écran et partent en une requête.
 *
 * L'écran accepte des paramètres d'URL (`telephone`, `produit`, `prix`) : la
 * recherche de produits chez les grossistes s'en sert pour préremplir la
 * commande d'un article trouvé.
 */

import { useT } from "@/i18n";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChoixCartes,
  LienTexte,
  LigneInfo,
  TitreSection,
} from "@/components/ui";
import Echeancier, {
  echeanceInitiale,
  echeancierValide,
  versApi,
  type EcheanceSaisie,
} from "@/components/Echeancier";
import { api, messageErreur } from "@/lib/api";
import { montant as formaterMontant } from "@/lib/format";
import type { Commande, VerificationFournisseur } from "@/lib/types";
import { couleurs, espacement, rayons, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface LigneSaisie {
  nom: string;
  quantite: string;
  prix_unitaire: string;
}

export default function NouvelleCommande() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();
  const params = useLocalSearchParams<{
    telephone?: string;
    produit?: string;
    prix?: string;
  }>();

  const [telephone, setTelephone] = useState(params.telephone ?? "");
  const [fournisseur, setFournisseur] = useState<VerificationFournisseur | null>(null);
  const [modePaiement, setModePaiement] = useState<"comptant" | "credit">("comptant");
  const [notes, setNotes] = useState("");
  const [lignes, setLignes] = useState<LigneSaisie[]>([
    {
      nom: params.produit ?? "",
      quantite: "1",
      prix_unitaire: params.prix ?? "",
    },
  ]);
  const [echeances, setEcheances] = useState<EcheanceSaisie[]>([]);

  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Vérification du fournisseur à la volée (ancien check_grossiste.php).
  useEffect(() => {
    const tel = telephone.replace(/\D/g, "");

    if (tel.length < 8) {
      setFournisseur(null);
      return;
    }

    const minuterie = setTimeout(async () => {
      try {
        setFournisseur(
          await api.post<VerificationFournisseur>("/api/commandes/verifier-fournisseur", {
            telephone: tel,
          }),
        );
      } catch {
        setFournisseur(null);
      }
    }, 400);

    return () => clearTimeout(minuterie);
  }, [telephone]);

  const total = useMemo(
    () =>
      lignes.reduce(
        (s, l) => s + (parseInt(l.quantite, 10) || 0) * (parseFloat(l.prix_unitaire) || 0),
        0,
      ),
    [lignes],
  );

  // Le crédit impose un échéancier : l'API refuse la commande sans lui.
  useEffect(() => {
    if (modePaiement === "credit") {
      setEcheances((liste) => (liste.length === 0 ? [echeanceInitiale(total)] : liste));
    } else {
      setEcheances([]);
    }
    // `total` est exclu : seul le passage au crédit doit amorcer l'échéancier.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modePaiement]);

  function majLigne(index: number, champ: keyof LigneSaisie, valeur: string) {
    setLignes((l) => l.map((x, i) => (i === index ? { ...x, [champ]: valeur } : x)));
  }

  async function soumettre() {
    setErreur("");

    const valides = lignes.filter(
      (l) => l.nom.trim() && parseInt(l.quantite, 10) > 0 && parseFloat(l.prix_unitaire) > 0,
    );

    if (valides.length === 0) {
      setErreur(t("Ajoutez au moins un produit avec une quantité et un prix valides."));
      return;
    }
    if (modePaiement === "credit" && !echeancierValide(echeances, total)) {
      setErreur(
        `Le total des échéances ne correspond pas au montant de la commande (${formaterMontant(total)}).`,
      );
      return;
    }

    setEnvoi(true);

    try {
      const commande = await api.post<Commande>("/api/commandes", {
        fournisseur_telephone: telephone,
        mode_paiement: modePaiement,
        notes,
        produits: valides.map((l) => ({
          nom: l.nom.trim(),
          quantite: parseInt(l.quantite, 10),
          prix_unitaire: parseFloat(l.prix_unitaire),
        })),
        echeances: versApi(echeances),
      });

      router.replace(`/commandes/${commande.id}`);
    } catch (e) {
      setErreur(t(messageErreur(e, "Création impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Ecran>
      {erreur ? <Alerte>{erreur}</Alerte> : null}

      <Carte>
        <TitreSection>{t("Fournisseur")}</TitreSection>

        <Champ
          label={t("Numéro de téléphone du fournisseur")}
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
          placeholder={t("Ex : 22901020304")}
          aide={t("S'il est inscrit sur Visacredit XIXA, il sera reconnu automatiquement")}
        />

        {fournisseur ? (
          <View
            style={[
              styles.verdict,
              fournisseur.trouve ? styles.verdictTrouve : styles.verdictExterne,
            ]}
          >
            <Text
              style={[
                styles.verdictTexte,
                fournisseur.trouve ? styles.verdictTexteTrouve : styles.verdictTexteExterne,
              ]}
            >
              {fournisseur.trouve
                ? `✅ Grossiste « ${fournisseur.nom_boutique} » trouvé sur Visacredit XIXA — il validera la commande et le stock sera transféré automatiquement.`
                : "⚠️ Fournisseur externe — vous gérerez vous-même la réception et le paiement de cette commande."}
            </Text>
          </View>
        ) : null}
      </Carte>

      <Carte>
        <TitreSection
          action={
            <Bouton
              variante="neutre"
              compact
              onPress={() =>
                setLignes((l) => [...l, { nom: "", quantite: "1", prix_unitaire: "" }])
              }
            >
              {t("+ Produit")}
            </Bouton>
          }
        >
          {t("Produits")}
        </TitreSection>

        {lignes.map((ligne, index) => (
          <View key={index} style={styles.bloc}>
            <View style={styles.blocEntete}>
              <Text style={styles.blocTitre}>Produit {index + 1}</Text>
              {lignes.length > 1 ? (
                <LienTexte
                  couleur={couleurs.danger}
                  onPress={() => setLignes((l) => l.filter((_, i) => i !== index))}
                >
                  {t("Retirer")}
                </LienTexte>
              ) : null}
            </View>

            <Champ
              label={t("Nom")}
              value={ligne.nom}
              onChangeText={(v) => majLigne(index, "nom", v)}
              placeholder={t("Ex : Riz parfumé 25 kg")}
            />

            <View style={styles.duo}>
              <View style={styles.duoChamp}>
                <Champ
                  label={t("Quantité")}
                  value={ligne.quantite}
                  onChangeText={(v) => majLigne(index, "quantite", v)}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.duoChamp}>
                <Champ
                  label={t("Prix unitaire")}
                  value={ligne.prix_unitaire}
                  onChangeText={(v) => majLigne(index, "prix_unitaire", v)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </View>
        ))}
      </Carte>

      <Carte>
        <TitreSection>{t("Mode de paiement")}</TitreSection>

        <ChoixCartes<"comptant" | "credit">
          valeur={modePaiement}
          onChange={setModePaiement}
          options={[
            {
              valeur: "comptant",
              titre: t("💵 Comptant"),
              note: t("Paiement immédiat (espèces ou mobile money)"),
            },
            {
              valeur: "credit",
              titre: t("📅 À crédit"),
              note: t("Vous définissez les échéances ci-dessous"),
            },
          ]}
        />

        {modePaiement === "credit" ? (
          <Echeancier echeances={echeances} onChange={setEcheances} montantDu={total} />
        ) : null}
      </Carte>

      <Carte>
        <TitreSection>{t("Récapitulatif")}</TitreSection>

        <LigneInfo libelle={t("Fournisseur")}>{fournisseur?.nom_boutique ?? "—"}</LigneInfo>
        <LigneInfo libelle={t("Lignes")}>{lignes.filter((l) => l.nom.trim()).length}</LigneInfo>
        <LigneInfo libelle={t("Mode")}>
          {modePaiement === "credit" ? t("Crédit") : t("Comptant")}
        </LigneInfo>
        <LigneInfo libelle={t("Montant total")} fort couleur={couleurs.primaire}>
          {formaterMontant(total)}
        </LigneInfo>

        <View style={styles.notes}>
          <Champ
            label={t("Notes (optionnel)")}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <Bouton onPress={soumettre} disabled={envoi || !telephone.trim()} pleineLargeur>
          {envoi ? t("Création…") : t("Créer la commande")}
        </Bouton>
      </Carte>
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  verdict: {
    borderRadius: rayons.md,
    paddingVertical: espacement.md,
    paddingHorizontal: espacement.lg,
  },
  verdictTrouve: {
    backgroundColor: couleurs.succesClair,
  },
  verdictExterne: {
    backgroundColor: couleurs.alerteClair,
  },
  verdictTexte: {
    fontSize: 13,
    lineHeight: 19,
  },
  verdictTexteTrouve: {
    color: couleurs.succesSombre,
  },
  verdictTexteExterne: {
    color: couleurs.alerteSombre,
  },

  bloc: {
    backgroundColor: couleurs.fond,
    borderRadius: 14,
    padding: espacement.md,
    marginBottom: espacement.md,
  },
  blocEntete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: espacement.sm,
  },
  blocTitre: {
    fontSize: 13,
    fontWeight: "700",
    color: couleurs.texteDoux,
  },
  duo: {
    flexDirection: "row",
    gap: espacement.md,
  },
  duoChamp: {
    flex: 1,
  },
  notes: {
    marginTop: espacement.lg,
  },
});
