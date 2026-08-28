"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateHeure, montant } from "@/lib/format";
import type { Vente } from "@/lib/types";
import {
  Alerte,
  Badge,
  Bouton,
  Chargement,
  EtatVide,
  Tableau,
  TitrePage,
} from "@/components/ui";

/** Port de pages/ventes/liste_vente.php. */
export default function Ventes() {
  const t = useT();
  const [ventes, setVentes] = useState<Vente[] | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<Vente[]>("/api/ventes")
      .then(setVentes)
      .catch((e) => setErreur(e.message));
  }, []);

  return (
    <div>
      <TitrePage
        titre={t("Ventes")}
        sousTitre={t("Historique de vos transactions")}
        action={
          <Link href="/ventes/nouvelle">
            <Bouton>{t("+ Nouvelle vente")}</Bouton>
          </Link>
        }
      />

      {erreur && <Alerte>{erreur}</Alerte>}

      {!ventes ? (
        <Chargement />
      ) : ventes.length === 0 ? (
        <EtatVide
          titre={t("Aucune vente")}
          description={t("Enregistrez votre première vente pour suivre votre chiffre d'affaires.")}
          action={
            <Link href="/ventes/nouvelle">
              <Bouton>{t("Enregistrer une vente")}</Bouton>
            </Link>
          }
        />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("N° Facture")}</th>
              <th>{t("Client")}</th>
              <th>{t("Date")}</th>
              <th className="text-right">{t("Total")}</th>
              <th className="text-right">{t("Payé")}</th>
              <th className="text-center">{t("Statut")}</th>
              <th className="text-right">{t("Reçu")}</th>
            </tr>
          </thead>
          <tbody>
            {ventes.map((vente) => (
              <tr key={vente.id}>
                <td className="font-mono text-xs font-medium text-titre">
                  {vente.numero_facture}
                </td>
                <td>{vente.client?.nom_complet ?? "Client de passage"}</td>
                <td className="text-faible">{dateHeure(vente.date_vente)}</td>
                <td className="text-right font-semibold">{montant(vente.montant_total)}</td>
                <td className="text-right text-emerald-700">{montant(vente.montant_paye)}</td>
                <td className="text-center">
                  <Badge
                    classe={
                      vente.statut === "solde"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  >
                    {vente.statut === "solde"
                      ? t("Soldée")
                      : `Reste ${montant(vente.reste)}`}
                  </Badge>
                </td>
                <td className="text-right">
                  <Link
                    href={`/ventes/${vente.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {t("Voir le reçu")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}
    </div>
  );
}
