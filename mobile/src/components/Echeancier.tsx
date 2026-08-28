/**
 * Saisie d'un échéancier.
 *
 * Trois écrans en ont besoin — nouvelle vente, nouvelle commande, révision de
 * l'échéancier d'une commande — et l'API leur impose partout la même règle :
 * au moins une échéance valide, et une somme égale au montant à couvrir (avec
 * une tolérance de 1 FCFA sur l'arrondi). La règle est donc portée ici, une
 * seule fois, plutôt que recopiée dans chaque écran.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ajouterJours, aujourdHui, montant as formaterMontant } from "../lib/format";
import { couleurs, espacement, type Palette } from "../theme";
import { useCouleurs, useStyles } from "../theme-contexte";
import { Bouton, Champ, ChampDate, ChampSelect, LienTexte, TitreSection } from "./ui";

export interface EcheanceSaisie {
  montant: string;
  date_limite: string;
}

/** Tolérance acceptée par l'API entre la somme saisie et le montant dû. */
const TOLERANCE = 1;

/** Périodicités proposées par le planificateur, en jours. */
const PERIODICITES = [
  { valeur: "7", label: "Chaque semaine" },
  { valeur: "15", label: "Tous les 15 jours" },
  { valeur: "30", label: "Chaque mois" },
  { valeur: "90", label: "Chaque trimestre" },
];

/** Demain — première date acceptable pour un paiement planifié. */
export function demain(): string {
  return ajouterJours(aujourdHui(), 1);
}

/**
 * Échéance unique couvrant tout le montant, proposée par défaut.
 * Datée à un mois : l'API refuse une date déjà passée, et « aujourd'hui »
 * créait une créance en retard le jour même.
 */
export function echeanceInitiale(montantDu: number): EcheanceSaisie {
  return { montant: String(Math.round(montantDu)), date_limite: ajouterJours(aujourdHui(), 30) };
}

/**
 * Répartit un montant sur `nombre` échéances régulières.
 * L'arrondi est absorbé par la dernière : la somme retombe exactement sur le
 * montant dû, seule condition que l'API contrôle.
 */
export function planifier(
  montantDu: number,
  nombre: number,
  periodiciteJours: number,
  premiereDate: string,
): EcheanceSaisie[] {
  const total = Math.round(montantDu);
  const nb = Math.max(1, Math.min(36, Math.round(nombre)));
  const part = Math.floor(total / nb);

  return Array.from({ length: nb }, (_, index) => ({
    montant: String(index === nb - 1 ? total - part * (nb - 1) : part),
    date_limite: ajouterJours(premiereDate, index * periodiciteJours),
  }));
}

/** Échéances datées dans le passé — refusées par l'API. */
export function echeancesDepassees(echeances: EcheanceSaisie[]): number {
  const jour = aujourdHui();

  return echeances.filter((e) => e.date_limite && e.date_limite < jour).length;
}

export function sommeEcheances(echeances: EcheanceSaisie[]): number {
  return echeances.reduce((total, e) => total + (parseFloat(e.montant) || 0), 0);
}

export function echeancierValide(echeances: EcheanceSaisie[], montantDu: number): boolean {
  return Math.abs(sommeEcheances(echeances) - montantDu) <= TOLERANCE;
}

/** Corps de requête attendu par l'API. */
export function versApi(echeances: EcheanceSaisie[]) {
  return echeances.map((e) => ({
    montant: parseFloat(e.montant) || 0,
    date_limite: e.date_limite,
  }));
}

export default function Echeancier({
  titre,
  echeances,
  onChange,
  montantDu,
}: {
  titre?: string;
  echeances: EcheanceSaisie[];
  onChange: (echeances: EcheanceSaisie[]) => void;
  montantDu: number;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const somme = sommeEcheances(echeances);
  const conforme = echeancierValide(echeances, montantDu);
  const depassees = echeancesDepassees(echeances);

  const [nombre, setNombre] = useState("1");
  const [periodicite, setPeriodicite] = useState("30");
  const [premiereDate, setPremiereDate] = useState(demain());

  function ajouter() {
    // La nouvelle échéance suit la dernière au rythme choisi : c'est le cas le
    // plus courant, et la date reste modifiable.
    const derniere = echeances[echeances.length - 1];
    const base = derniere?.date_limite ?? demain();
    const restant = Math.max(0, Math.round(montantDu - somme));

    onChange([
      ...echeances,
      {
        montant: restant > 0 ? String(restant) : "",
        date_limite: ajouterJours(base, parseInt(periodicite, 10) || 30),
      },
    ]);
  }

  function appliquerPlan() {
    onChange(
      planifier(
        montantDu,
        parseInt(nombre, 10) || 1,
        parseInt(periodicite, 10) || 30,
        premiereDate,
      ),
    );
  }

  function majEcheance(index: number, champ: keyof EcheanceSaisie, valeur: string) {
    onChange(echeances.map((e, i) => (i === index ? { ...e, [champ]: valeur } : e)));
  }

  function retirer(index: number) {
    onChange(echeances.filter((_, i) => i !== index));
  }

  return (
    <View>
      <TitreSection
        action={
          <Bouton variante="neutre" compact onPress={ajouter}>
            {t("+ Échéance")}
          </Bouton>
        }
      >
        {titre ?? t("Échéancier")}
      </TitreSection>

      {/*
        Planificateur : la saisie courante est « en N fois, tous les X jours ».
        Le détail reste modifiable échéance par échéance dessous, pour les
        arrangements qui ne tombent pas rond.
      */}
      <View style={styles.planificateur}>
        <Text style={styles.planificateurTitre}>{t("Planifier automatiquement")}</Text>

        <Champ
          label={t("Nombre de fois")}
          value={nombre}
          onChangeText={setNombre}
          keyboardType="number-pad"
        />

        <ChampSelect
          label={t("Rythme")}
          valeur={periodicite}
          onChange={setPeriodicite}
          options={PERIODICITES.map((p) => ({ valeur: p.valeur, label: p.label }))}
        />

        <ChampDate
          label={t("Premier paiement")}
          valeur={premiereDate}
          onChange={setPremiereDate}
        />

        <Bouton variante="secondaire" onPress={appliquerPlan} pleineLargeur>
          {t("Générer le plan")}
        </Bouton>
      </View>

      {echeances.map((echeance, index) => (
        <View key={index} style={styles.bloc}>
          <View style={styles.blocEntete}>
            <Text style={styles.blocTitre}>Échéance {index + 1}</Text>
            {echeances.length > 1 ? (
              <LienTexte couleur={couleurs.danger} onPress={() => retirer(index)}>
                {t("Retirer")}
              </LienTexte>
            ) : null}
          </View>

          <Champ
            label={t("Montant (FCFA)")}
            value={echeance.montant}
            onChangeText={(v) => majEcheance(index, "montant", v)}
            keyboardType="numeric"
            placeholder="0"
          />

          <ChampDate
            label={t("Date de paiement")}
            valeur={echeance.date_limite}
            onChange={(v) => majEcheance(index, "date_limite", v)}
          />
        </View>
      ))}

      <Text style={[styles.bilan, conforme ? styles.bilanOk : styles.bilanErreur]}>
        Somme des échéances : {formaterMontant(somme)} — à couvrir :{" "}
        {formaterMontant(montantDu)}
      </Text>

      {depassees > 0 ? (
        <Text style={[styles.bilan, styles.bilanErreur]}>
          {depassees === 1
            ? "Une échéance est datée dans le passé."
            : `${depassees} échéances sont datées dans le passé.`}{" "}
          Un paiement se planifie à une date à venir.
        </Text>
      ) : null}
    </View>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  planificateur: {
    backgroundColor: couleurs.surfaceDouce,
    borderRadius: 14,
    padding: espacement.md,
    marginBottom: espacement.md,
  },
  planificateurTitre: {
    fontSize: 13,
    fontWeight: "700",
    color: couleurs.texteDoux,
    marginBottom: espacement.sm,
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
  bilan: {
    fontSize: 13,
    fontWeight: "600",
  },
  bilanOk: {
    color: couleurs.succes,
  },
  bilanErreur: {
    color: couleurs.danger,
  },
});
