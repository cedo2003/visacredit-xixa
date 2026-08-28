"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { badgeCommande, date, dateHeure, montant } from "@/lib/format";
import type { Commande } from "@/lib/types";
import { Alerte, Badge, Bouton, Carte, Chargement } from "@/components/ui";

/** Port de pages/commandes/recu_commande.php — reçu imprimable d'une commande. */
export default function RecuCommande({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
  const { id } = use(params);
  const [commande, setCommande] = useState<Commande | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<Commande>(`/api/commandes/${id}`)
      .then(setCommande)
      .catch((e) => setErreur(e.message));
  }, [id]);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!commande) return <Chargement />;

  const badge = badgeCommande(commande.statut);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/commandes/${commande.id}`}
          className="text-sm font-medium text-doux hover:underline"
        >
          {t("← Retour à la commande")}
        </Link>
        <Bouton onClick={() => window.print()}>{t("Imprimer le reçu")}</Bouton>
      </div>

      <Carte className="print:shadow-none print:ring-0">
        <div className="border-b border-bordure pb-6 text-center">
          <Image
            src="/logo-xixa.png"
            alt={t("Visacredit XIXA")}
            width={160}
            height={116}
            priority
            className="h-auto w-auto"
          />
          <p className="mt-1 text-sm text-faible">{t("Reçu de commande")}</p>
          <p className="mt-4 font-mono text-sm font-semibold">
            {commande.numero_commande}
          </p>
          <p className="text-xs text-faible">{dateHeure(commande.date_commande)}</p>
          <div className="mt-3">
            <Badge classe={badge.classe}>{t(badge.label)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-bordure py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-faible">{t("Détaillant")}</p>
            <p className="mt-1 font-medium">{commande.detaillant?.nom_boutique ?? "—"}</p>
            <p className="text-sm text-faible">{commande.detaillant?.telephone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-wide text-faible">{t("Fournisseur")}</p>
            <p className="mt-1 font-medium">{commande.fournisseur_nom ?? "—"}</p>
            <p className="text-sm text-faible">{commande.fournisseur_telephone}</p>
          </div>
        </div>

        <table className="w-full py-4 text-sm">
          <thead>
            <tr className="border-b border-bordure">
              <th className="px-0">{t("Produit")}</th>
              <th className="px-0 text-center">{t("Qté")}</th>
              <th className="px-0 text-right">{t("P.U.")}</th>
              <th className="px-0 text-right">{t("Montant")}</th>
            </tr>
          </thead>
          <tbody>
            {commande.lignes?.map((ligne) => (
              <tr key={ligne.id}>
                <td className="px-0 font-medium">{ligne.produit_nom}</td>
                <td className="px-0 text-center">{ligne.quantite}</td>
                <td className="px-0 text-right">{montant(ligne.prix_unitaire)}</td>
                <td className="px-0 text-right font-semibold">{montant(ligne.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="space-y-2 border-t border-bordure pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-doux">{t("Mode de paiement")}</dt>
            <dd className="font-medium">
              {commande.mode_paiement === "credit" ? t("📅 Crédit") : t("💵 Comptant")}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-doux">{t("Montant total")}</dt>
            <dd className="font-semibold">{montant(commande.montant_total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-doux">{t("Montant payé")}</dt>
            <dd className="font-semibold text-emerald-600">
              {montant(commande.montant_paye)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-bordure pt-3 text-base">
            <dt className="font-semibold">{t("Reste à payer")}</dt>
            <dd
              className={`font-bold ${
                commande.reste > 0 ? "text-orange-600" : "text-emerald-600"
              }`}
            >
              {montant(commande.reste)}
            </dd>
          </div>
        </dl>

        {(commande.echeances?.length ?? 0) > 0 && (
          <div className="mt-6 rounded-2xl bg-orange-50 p-5">
            <p className="mb-3 text-sm font-semibold text-orange-800">{t("Échéancier")}</p>
            <ul className="space-y-2 text-sm">
              {commande.echeances?.map((echeance) => (
                <li key={echeance.id} className="flex justify-between">
                  <span className="text-orange-700">
                    Échéance {echeance.numero_echeance}/{echeance.nb_echeances_total} —{" "}
                    {date(echeance.date_limite)}
                  </span>
                  <span className="font-semibold text-orange-900">
                    {montant(echeance.montant)}
                    {echeance.statut === "payee" && " ✓"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-estompe">
          {t("Document généré par Visacredit XIXA")}
        </p>
      </Carte>
    </div>
  );
}
