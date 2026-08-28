"use client";

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { MENTION_FONDS, dateHeure, montant } from "@/lib/format";
import type { Retrait } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  Chargement,
  EtatVide,
  StatCarte,
  Tableau,
  TitrePage,
} from "@/components/ui";

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

/**
 * Port de pages/retraits/{index,create,save_retrait}.php.
 * Le solde affiché est celui du tableau de bord : c'est aussi celui que l'API
 * contrôle avant d'autoriser un retrait.
 */
export default function Retraits() {
  const t = useT();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [frequence, setFrequence] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const reponse = await api.get<Reponse>("/api/retraits");
      setDonnees(reponse);
      setFrequence(reponse.frequence);
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function retirer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setEnvoi(true);

    try {
      await api.post("/api/retraits", {
        montant: parseFloat(montantSaisi) || 0,
        frequence,
      });
      setSucces(`Retrait de ${montant(parseFloat(montantSaisi))} enregistré.`);
      setMontantSaisi("");
      await charger();
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Retrait impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  if (erreur && !donnees) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  return (
    <div>
      <TitrePage titre={t("Retraits")} sousTitre={t("Sorties de caisse")} />

      {erreur && <Alerte>{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCarte
          valeur={montant(donnees.solde)}
          libelle={t("Solde disponible")}
          couleur="text-emerald-600"
        />
        <StatCarte
          valeur={montant(donnees.total)}
          libelle={t("Total déjà retiré")}
          couleur="text-red-600"
        />
      </div>

      <p className="-mt-4 mb-6 text-xs text-estompe">{t(MENTION_FONDS)}</p>

      {/*
        Sans registre du commerce déclaré, le rythme quotidien s'impose : la
        règle est rappelée ici, avec le lien qui permet de la lever.
      */}
      {donnees.registre_commerce_manquant && (
        <Alerte type="info">
          {t(
            "Votre registre du commerce (RCCM) n'est pas enregistré : vos retraits sont limités à la fréquence",
          )}{" "}
          <strong>{donnees.frequence_imposee}</strong>.{" "}
          <Link href="/parametres" className="font-semibold underline">
            {t("Renseignez-le dans Paramètres")}
          </Link>{" "}
          {t("pour débloquer les autres rythmes.")}
        </Alerte>
      )}

      <Carte className="mb-6 max-w-lg">
        <h2 className="mb-4 text-lg font-bold">{t("Nouveau retrait")}</h2>
        <form onSubmit={retirer} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <Champ
              label={t("Montant (FCFA)")}
              type="number"
              min="1"
              max={donnees.solde}
              required
              value={montantSaisi}
              onChange={(e) => setMontantSaisi(e.target.value)}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <ChampSelect
              label={t("Fréquence")}
              value={frequence}
              onChange={(e) => setFrequence(e.target.value)}
              disabled={donnees.registre_commerce_manquant}
            >
              {donnees.frequences_autorisees.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </ChampSelect>
          </div>
          <Bouton type="submit" disabled={envoi || donnees.solde <= 0}>
            {envoi ? t("Traitement…") : t("Retirer")}
          </Bouton>
        </form>
        {donnees.solde <= 0 && (
          <p className="mt-3 text-sm text-faible">
            {t("Votre solde est nul : aucun retrait n'est possible pour l'instant.")}
          </p>
        )}
      </Carte>

      {donnees.retraits.length === 0 ? (
        <EtatVide titre={t("Aucun retrait")} description={t("Vos retraits apparaîtront ici.")} />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("Date")}</th>
              <th>{t("Fréquence")}</th>
              <th className="text-right">{t("Montant")}</th>
            </tr>
          </thead>
          <tbody>
            {donnees.retraits.map((retrait) => (
              <tr key={retrait.id}>
                <td className="text-faible">{dateHeure(retrait.date_retrait)}</td>
                <td className="text-faible">{retrait.frequence ?? "—"}</td>
                <td className="text-right font-bold text-red-600">
                  {montant(retrait.montant)}
                </td>
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}
    </div>
  );
}
