"use client";

import { useT } from "@/lib/i18n";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { date, dateHeure, montant } from "@/lib/format";
import type { Creance, User, Vente } from "@/lib/types";
import { Alerte, Badge, Bouton, Carte, Chargement } from "@/components/ui";

interface Recu {
  vente: Vente;
  echeances: Creance[];
  vendeur: User;
}

/** Port de pages/ventes/recu.php — impression via la boîte d'impression du navigateur. */
export default function RecuVente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
  const { id } = use(params);
  const [recu, setRecu] = useState<Recu | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<Recu>(`/api/ventes/${id}`)
      .then(setRecu)
      .catch((e) => setErreur(e.message));
  }, [id]);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!recu) return <Chargement />;

  const { vente, echeances, vendeur } = recu;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/ventes" className="text-sm font-medium text-doux hover:underline">
          {t("← Retour aux ventes")}
        </Link>
        <Bouton onClick={() => window.print()}>{t("Imprimer le reçu")}</Bouton>
      </div>

      <Carte className="print:shadow-none print:ring-0">
        <div className="border-b border-bordure pb-6 text-center">
          <h1 className="text-3xl font-bold text-accent">{vendeur.nom_boutique}</h1>
          <p className="mt-1 text-sm text-faible">{vendeur.telephone}</p>
          <p className="mt-4 font-mono text-sm font-semibold">{vente.numero_facture}</p>
          <p className="text-xs text-faible">{dateHeure(vente.date_vente)}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-bordure py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-faible">{t("Client")}</p>
            <p className="mt-1 font-medium">
              {vente.client?.nom_complet ?? "Client de passage"}
            </p>
            {vente.client?.telephone && (
              <p className="text-sm text-faible">{vente.client.telephone}</p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-wide text-faible">{t("Mode de paiement")}</p>
            <p className="mt-1 font-medium">
              {t(
                {
                  especes: "💵 Espèces",
                  mobile_money: "📱 Mobile Money",
                  fedapay: "💳 Agrégateur",
                }[vente.mode_paiement] ?? vente.mode_paiement,
              )}
            </p>
            <Badge
              classe={
                vente.statut_paiement === "paye"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-orange-100 text-orange-700"
              }
            >
              {vente.statut_paiement === "paye" ? t("Encaissé") : t("En attente de confirmation")}
            </Badge>
          </div>
        </div>

        <table className="w-full py-4 text-sm">
          <thead>
            <tr className="border-b border-bordure">
              <th className="px-0">{t("Article")}</th>
              <th className="px-0 text-center">{t("Qté")}</th>
              <th className="px-0 text-right">{t("P.U.")}</th>
              <th className="px-0 text-right">{t("Total")}</th>
            </tr>
          </thead>
          <tbody>
            {vente.lignes?.map((ligne) => (
              <tr key={ligne.id}>
                <td className="px-0 font-medium">{ligne.produit_nom}</td>
                <td className="px-0 text-center">{ligne.quantite}</td>
                <td className="px-0 text-right">{montant(ligne.prix_unitaire)}</td>
                <td className="px-0 text-right font-semibold">{montant(ligne.sous_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="space-y-2 border-t border-bordure pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-doux">{t("Montant total")}</dt>
            <dd className="font-semibold">{montant(vente.montant_total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-doux">{t("Montant payé")}</dt>
            <dd className="font-semibold text-emerald-600">{montant(vente.montant_paye)}</dd>
          </div>
          {vente.frais_client > 0 && (
            <div className="flex justify-between text-xs text-faible">
              <dt>{t("Frais à la charge du client")}</dt>
              <dd>{montant(vente.frais_client)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-bordure pt-3 text-base">
            <dt className="font-semibold">{t("Reste à payer")}</dt>
            <dd
              className={`font-bold ${vente.reste > 0 ? "text-orange-600" : "text-emerald-600"}`}
            >
              {montant(vente.reste)}
            </dd>
          </div>
        </dl>

        {echeances.length > 0 && (
          <div className="mt-6 rounded-2xl bg-orange-50 p-5">
            <p className="mb-3 text-sm font-semibold text-orange-800">
              Échéancier ({echeances.length})
            </p>
            <ul className="space-y-2 text-sm">
              {echeances.map((echeance) => (
                <li key={echeance.id} className="flex justify-between">
                  <span className="text-orange-700">
                    Échéance {echeance.numero_echeance}/{echeance.nb_echeances_total} —{" "}
                    {date(echeance.date_limite)}
                  </span>
                  <span className="font-semibold text-orange-900">
                    {montant(echeance.montant_restant)}
                    {echeance.statut === "payee" && " ✓"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-estompe">
          {t("Merci de votre confiance — Visacredit XIXA")}
        </p>
      </Carte>
    </div>
  );
}
