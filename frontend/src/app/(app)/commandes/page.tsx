"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { badgeCommande, date, montant } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import type { Commande, Role } from "@/lib/types";
import {
  Alerte,
  Badge,
  Bouton,
  Chargement,
  EtatVide,
  Tableau,
  TitrePage,
} from "@/components/ui";

interface Reponse {
  commandes: Commande[];
  stats: Record<string, number>;
  role: Role;
}

/** Port de pages/commandes/index.php. */
export default function Commandes() {
  const t = useT();
  const { estDetaillant } = useAuth();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<Reponse>("/api/commandes")
      .then(setDonnees)
      .catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  const estGrossiste = donnees.role === "grossiste";

  return (
    <div>
      <TitrePage
        titre={estGrossiste ? t("Commandes reçues") : t("Mes commandes")}
        sousTitre={
          estGrossiste
            ? t("Commandes passées par vos clients détaillants")
            : t("Commandes passées auprès de vos fournisseurs")
        }
        action={
          estDetaillant ? (
            <Link href="/commandes/nouvelle">
              <Bouton>{t("+ Nouvelle commande")}</Bouton>
            </Link>
          ) : undefined
        }
      />

      {donnees.commandes.length === 0 ? (
        <EtatVide
          titre={t("Aucune commande")}
          description={
            estGrossiste
              ? t("Vos clients détaillants n'ont pas encore passé de commande.")
              : t("Cherchez des produits chez un grossiste pour passer votre première commande.")
          }
          action={
            estDetaillant ? (
              <Link href="/recherche">
                <Bouton>{t("Chercher des produits")}</Bouton>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("N° Commande")}</th>
              <th>{estGrossiste ? t("Détaillant") : t("Fournisseur")}</th>
              <th>{t("Date")}</th>
              <th className="text-center">{t("Mode")}</th>
              <th className="text-right">{t("Montant")}</th>
              <th className="text-center">{t("Statut")}</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {donnees.commandes.map((commande) => {
              const badge = badgeCommande(commande.statut);

              return (
                <tr key={commande.id}>
                  <td className="font-mono text-xs font-medium text-titre">
                    {commande.numero_commande}
                  </td>
                  <td>
                    <div className="font-medium">
                      {estGrossiste
                        ? (commande.detaillant?.nom_boutique ?? "—")
                        : (commande.fournisseur_nom ?? "—")}
                    </div>
                    <div className="text-xs text-faible">
                      {estGrossiste
                        ? commande.detaillant?.telephone
                        : commande.fournisseur_telephone}
                    </div>
                  </td>
                  <td className="text-faible">{date(commande.date_commande)}</td>
                  <td className="text-center">
                    <Badge
                      classe={
                        commande.mode_paiement === "credit"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-emerald-100 text-emerald-700"
                      }
                    >
                      {commande.mode_paiement === "credit" ? t("Crédit") : t("Comptant")}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="font-semibold">{montant(commande.montant_total)}</div>
                    {commande.reste > 0 && (
                      <div className="text-xs text-orange-600">
                        {t("reste {montant}", { montant: montant(commande.reste) })}
                      </div>
                    )}
                  </td>
                  <td className="text-center">
                    <Badge classe={badge.classe}>{t(badge.label)}</Badge>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/commandes/${commande.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {t("Détails")}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Tableau>
      )}
    </div>
  );
}
