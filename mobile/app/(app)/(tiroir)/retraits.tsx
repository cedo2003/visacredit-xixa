/**
 * Retraits de caisse — port de frontend/src/app/(app)/retraits/page.tsx.
 *
 * Le contrôle de solde est fait côté serveur par SoldeService ; le formulaire
 * se contente d'afficher le solde disponible pour éviter une saisie vouée à
 * l'échec.
 */

import { useT } from "@/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  Chargement,
  EtatVide,
  LigneInfo,
  TitreSection,
} from "@/components/ui";
import { api, messageErreur } from "@/lib/api";
import { useRequete } from "@/lib/requete";
import { MENTION_FONDS, dateHeure, montant as formaterMontant } from "@/lib/format";
import type { Retrait } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface Reponse {
  retraits: Retrait[];
  total: number;
  solde: number;
  frequence: string;
  frequences_autorisees: string[];
  /** Sans RCCM déclaré, seule la fréquence quotidienne reste ouverte. */
  registre_commerce_manquant: boolean;
  frequence_imposee: string | null;
}

export default function Retraits() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();
  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/retraits");

  const [montantSaisi, setMontantSaisi] = useState("");
  const [frequence, setFrequence] = useState("");
  const [erreurForm, setErreurForm] = useState("");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const solde = donnees?.solde ?? 0;
  const retraits = donnees?.retraits ?? [];
  const frequences = donnees?.frequences_autorisees ?? [];
  const sansRegistre = donnees?.registre_commerce_manquant ?? false;

  // La fréquence par défaut vient du serveur : sans RCCM, il n'en propose qu'une.
  useEffect(() => {
    if (donnees && frequence === "") setFrequence(donnees.frequence);
  }, [donnees, frequence]);

  async function soumettre() {
    setErreurForm("");
    setMessage("");
    setEnvoi(true);

    try {
      const reponse = await api.post<{ solde: number }>("/api/retraits", {
        montant: parseFloat(montantSaisi) || 0,
        frequence,
      });

      setMontantSaisi("");
      setMessage(`Retrait enregistré. Nouveau solde : ${formaterMontant(reponse.solde)}.`);
      await recharger();
    } catch (e) {
      setErreurForm(t(messageErreur(e, "Retrait impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Ecran
      titre={t("Retraits")}
      sousTitre={t("Prélèvements sur le solde de la boutique")}
      onRafraichir={recharger}
      rafraichissement={rafraichissement}
    >
      {erreur ? <Alerte>{erreur}</Alerte> : null}

      <Carte style={styles.carteSolde}>
        <Text style={styles.soldeLibelle}>{t("Solde disponible")}</Text>
        <Text style={styles.soldeValeur}>{formaterMontant(solde)}</Text>
        <Text style={styles.soldeNote}>
          {t("Ventes encaissées − dépenses − retraits déjà effectués")}
        </Text>
        <Text style={styles.soldeFonds}>{t(MENTION_FONDS)}</Text>
      </Carte>

      {/*
        Sans registre du commerce déclaré, le rythme quotidien s'impose : la
        règle est rappelée ici, avec le raccourci qui permet de la lever.
      */}
      {sansRegistre ? (
        <Pressable onPress={() => router.push("/parametres")}>
          <View style={styles.bandeauRegistre}>
            <Text style={styles.bandeauRegistreTitre}>
              {t("⚠️ Registre du commerce non enregistré")}
            </Text>
            <Text style={styles.bandeauRegistreTexte}>
              Vos retraits sont limités à la fréquence « {donnees?.frequence_imposee} ».
              Appuyez ici pour renseigner votre RCCM dans Paramètres et débloquer les
              autres rythmes.
            </Text>
          </View>
        </Pressable>
      ) : null}

      <Carte>
        <TitreSection>{t("Nouveau retrait")}</TitreSection>

        {erreurForm ? <Alerte>{erreurForm}</Alerte> : null}
        {message ? <Alerte type="succes">{message}</Alerte> : null}

        <Champ
          label={t("Montant à retirer (FCFA)")}
          value={montantSaisi}
          onChangeText={setMontantSaisi}
          keyboardType="numeric"
          placeholder="0"
          aide={`Maximum : ${formaterMontant(solde)}`}
        />

        <ChampSelect
          label={t("Fréquence habituelle")}
          valeur={frequence}
          onChange={setFrequence}
          disabled={sansRegistre}
          options={frequences.map((f) => ({ valeur: f, label: `Tous les ${f}` }))}
          aide={sansRegistre ? "Débloquée par l'enregistrement du RCCM" : undefined}
        />

        <Bouton
          onPress={soumettre}
          disabled={envoi || !montantSaisi || solde <= 0}
          pleineLargeur
        >
          {envoi ? t("Enregistrement…") : t("Effectuer le retrait")}
        </Bouton>
      </Carte>

      <Carte>
        <LigneInfo libelle={t("Retraits effectués")}>{retraits.length}</LigneInfo>
        <LigneInfo libelle={t("Total retiré")} fort couleur={couleurs.violet}>
          {formaterMontant(donnees?.total ?? 0)}
        </LigneInfo>
      </Carte>

      {chargement ? (
        <Chargement />
      ) : retraits.length === 0 ? (
        <EtatVide
          titre={t("Aucun retrait")}
          description={t("Les prélèvements que vous effectuerez sur votre caisse apparaîtront ici.")}
        />
      ) : (
        retraits.map((retrait) => (
          <Carte key={retrait.id}>
            <View style={styles.ligne}>
              <View style={styles.textes}>
                <Text style={styles.date}>{dateHeure(retrait.date_retrait)}</Text>
                {retrait.frequence ? (
                  <Text style={styles.frequence}>Fréquence : {retrait.frequence}</Text>
                ) : null}
              </View>

              <Text style={styles.montant}>−{formaterMontant(retrait.montant)}</Text>
            </View>
          </Carte>
        ))
      )}
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  bandeauRegistre: {
    borderWidth: 1,
    borderColor: couleurs.alerte,
    backgroundColor: couleurs.alerteClair,
    borderRadius: 16,
    padding: espacement.md,
  },
  bandeauRegistreTitre: {
    fontSize: 14,
    fontWeight: "800",
    color: couleurs.alerteSombre,
  },
  bandeauRegistreTexte: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: couleurs.alerteSombre,
  },
  carteSolde: {
    backgroundColor: couleurs.secondaire,
    borderColor: couleurs.secondaire,
    alignItems: "center",
    paddingVertical: espacement.xl,
  },
  soldeLibelle: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: couleurs.secondaireBordure,
  },
  soldeValeur: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
  },
  soldeFonds: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 14,
    color: couleurs.secondaireBordure,
    textAlign: "center",
    paddingHorizontal: espacement.md,
  },
  soldeNote: {
    marginTop: 8,
    fontSize: 11,
    color: couleurs.secondaireBordure,
    textAlign: "center",
  },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
  },
  textes: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
    color: couleurs.texte,
  },
  frequence: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  montant: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.violet,
  },
});
