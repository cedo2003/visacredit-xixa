"use client";

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { date, montant } from "@/lib/format";
import { BADGES_CREANCE } from "@/lib/format";
import type { Creance, IntentionPaiement } from "@/lib/types";
import PaiementMobile from "@/components/PaiementMobile";
import {
  Alerte,
  Badge,
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
  creances: Creance[];
  total_en_cours: number;
  montant_en_cours: number;
}

/** Port de pages/creances/{index,paiement}.php. */
export default function Creances() {
  const t = useT();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [enPaiement, setEnPaiement] = useState<Creance | null>(null);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);

  const charger = useCallback(async () => {
    try {
      setDonnees(await api.get<Reponse>("/api/creances"));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (erreur && !donnees) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  const enCours = donnees.creances.filter((c) => c.statut !== "payee");
  const soldees = donnees.creances.filter((c) => c.statut === "payee");

  return (
    <div>
      <TitrePage titre={t("Créances")} sousTitre={t("Sommes restant dues par vos clients")} />

      {erreur && <Alerte>{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCarte
          valeur={donnees.total_en_cours}
          libelle={t("Créances en cours")}
          couleur="text-orange-600"
        />
        <StatCarte
          valeur={montant(donnees.montant_en_cours)}
          libelle={t("Montant total dû")}
          couleur="text-red-600"
        />
        <StatCarte
          valeur={enCours.filter((c) => c.en_retard).length}
          libelle={t("Échéances en retard")}
          couleur="text-red-700"
        />
      </div>

      {enCours.length === 0 ? (
        <EtatVide
          titre={t("Aucune créance en cours")}
          description={t("Toutes vos ventes à crédit sont soldées.")}
        />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("Client")}</th>
              <th>{t("Facture")}</th>
              <th className="text-center">{t("Échéance")}</th>
              <th>{t("Date limite")}</th>
              <th className="text-right">{t("Reste dû")}</th>
              <th className="text-right">{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {enCours.map((creance) => (
              <tr key={creance.id}>
                <td className="font-medium text-titre">
                  {creance.client?.nom_complet ?? "Client de passage"}
                </td>
                <td className="font-mono text-xs">{creance.vente?.numero_facture ?? "—"}</td>
                <td className="text-center text-faible">
                  {creance.numero_echeance}/{creance.nb_echeances_total}
                </td>
                <td>
                  <span className={creance.en_retard ? "font-semibold text-red-600" : ""}>
                    {date(creance.date_limite)}
                  </span>
                  {creance.en_retard && (
                    <Badge classe="ml-2 bg-red-100 text-red-700">{t("En retard")}</Badge>
                  )}
                </td>
                <td className="text-right font-bold text-orange-600">
                  {montant(creance.montant_restant)}
                </td>
                <td className="text-right">
                  <Bouton onClick={() => setEnPaiement(creance)}>{t("Encaisser")}</Bouton>
                </td>
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}

      {soldees.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-corps">
            Créances soldées ({soldees.length})
          </h2>
          <Tableau>
            <thead className="bg-surface-douce">
              <tr>
                <th>{t("Client")}</th>
                <th>{t("Facture")}</th>
                <th>{t("Date limite")}</th>
                <th className="text-center">{t("Statut")}</th>
              </tr>
            </thead>
            <tbody>
              {soldees.map((creance) => (
                <tr key={creance.id} className="opacity-70">
                  <td>{creance.client?.nom_complet ?? "Client de passage"}</td>
                  <td className="font-mono text-xs">
                    {creance.vente?.numero_facture ?? "—"}
                  </td>
                  <td className="text-faible">{date(creance.date_limite)}</td>
                  <td className="text-center">
                    <Badge classe={BADGES_CREANCE.payee.classe}>
                      {t(BADGES_CREANCE.payee.label)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tableau>
        </div>
      )}

      {enPaiement && (
        <ModalePaiement
          creance={enPaiement}
          onFermer={() => setEnPaiement(null)}
          onEspeces={async (message) => {
            setEnPaiement(null);
            setSucces(message);
            await charger();
          }}
          onPasserelle={(paiement) => {
            setEnPaiement(null);
            setIntention(paiement);
          }}
        />
      )}

      {intention && (
        <PaiementMobile
          intention={intention}
          onSucces={async () => {
            setIntention(null);
            setSucces(t("Paiement confirmé et imputé sur la créance."));
            await charger();
          }}
          onAnnuler={() => setIntention(null)}
        />
      )}
    </div>
  );
}

function ModalePaiement({
  creance,
  onFermer,
  onEspeces,
  onPasserelle,
}: {
  creance: Creance;
  onFermer: () => void;
  onEspeces: (message: string) => void;
  onPasserelle: (paiement: IntentionPaiement) => void;
}) {
  const t = useT();
  const [montantSaisi, setMontantSaisi] = useState(String(Math.round(creance.montant_restant)));
  const [mode, setMode] = useState("espece");
  const [telephone, setTelephone] = useState(creance.client?.telephone ?? "");
  const [identifiant, setIdentifiant] = useState("");
  const [repartition, setRepartition] = useState("client");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      const reponse = await api.post<{ paiement: IntentionPaiement | null }>(
        `/api/creances/${creance.id}/paiement`,
        {
          montant: parseFloat(montantSaisi) || 0,
          mode_paiement: mode,
          telephone,
          fedapay_identifiant: identifiant,
          repartition_frais: repartition,
        },
      );

      if (reponse.paiement) {
        onPasserelle(reponse.paiement);
      } else {
        onEspeces(`Paiement de ${montant(parseFloat(montantSaisi))} enregistré.`);
      }
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Paiement impossible."));
      setEnvoi(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <Carte className="w-full max-w-md">
        <h2 className="text-xl font-bold">{t("Encaisser une créance")}</h2>
        <p className="mt-1 text-sm text-faible">
          {creance.client?.nom_complet ?? t("Client de passage")} — reste{" "}
          {montant(creance.montant_restant)}
        </p>

        {erreur && <Alerte>{erreur}</Alerte>}

        <form onSubmit={soumettre} className="mt-5 space-y-4">
          <Champ
            label={t("Montant encaissé (FCFA)")}
            type="number"
            min="1"
            max={creance.montant_restant}
            required
            value={montantSaisi}
            onChange={(e) => setMontantSaisi(e.target.value)}
          />

          <ChampSelect
            label={t("Mode de paiement")}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="espece">{t("💵 Espèces")}</option>
            <option value="mobile_money">{t("📱 Mobile Money (KkiaPay)")}</option>
            <option value="fedapay">{t("💳 Agrégateur")}</option>
          </ChampSelect>

          {mode === "mobile_money" && (
            <Champ
              label={t("Numéro Mobile Money")}
              type="tel"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          )}

          {mode === "fedapay" && (
            <Champ
              label={t("Téléphone ou email de l'agrégateur")}
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
            />
          )}

          {mode !== "espece" && (
            <ChampSelect
              label={t("Répartition des frais")}
              value={repartition}
              onChange={(e) => setRepartition(e.target.value)}
            >
              <option value="client">{t("Le client paie les frais")}</option>
              <option value="vendeur">{t("Je paie les frais")}</option>
              <option value="50_50">{t("Moitié-moitié")}</option>
            </ChampSelect>
          )}

          <div className="flex gap-3 pt-2">
            <Bouton type="button" variante="neutre" className="flex-1" onClick={onFermer}>
              {t("Annuler")}
            </Bouton>
            <Bouton type="submit" disabled={envoi} className="flex-1">
              {envoi ? t("Traitement…") : t("Valider")}
            </Bouton>
          </div>
        </form>
      </Carte>
    </div>
  );
}
