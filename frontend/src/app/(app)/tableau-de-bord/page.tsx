"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateLongue, montant, nombre } from "@/lib/format";
import type { DashboardStats } from "@/lib/types";
import { Alerte, Carte, Chargement, StatCarte } from "@/components/ui";

/** Port de dashboard.php. */
export default function TableauDeBord() {
  const t = useT();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<DashboardStats>("/api/dashboard")
      .then(setStats)
      .catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!stats) return <Chargement />;

  const estGrossiste = stats.role === "grossiste";

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {t("Bonjour, {prenom} 👋", { prenom: stats.prenom })}
          </h1>
          <p className="mt-1 text-sm text-faible">
            {estGrossiste
              ? t("Fournisseur en gros — vous recevez et validez les commandes des détaillants")
              : t("Fournisseur en détail — vous commandez chez les grossistes et vendez à vos clients")}
          </p>
        </div>
        <div className="text-sm text-faible">
          {dateLongue(new Date())}
        </div>
      </div>

      {/*
        Le bandeau de rôle du dashboard PHP a été retiré : la barre latérale
        porte déjà le nom de la boutique et l'étiquette Grossiste/Détaillant, et
        il repoussait les chiffres sous la ligne de flottaison.
      */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCarte
          valeur={montant(stats.solde)}
          libelle={t("Solde actuel")}
          couleur="text-emerald-600"
          note={
            stats.commandes_attente_paiement > 0
              ? `+ ${stats.commandes_attente_paiement} commande(s) en attente de paiement`
              : undefined
          }
        />
        <StatCarte
          valeur={nombre(stats.total_clients)}
          libelle={t("Clients")}
          couleur="text-blue-600"
        />
        <StatCarte
          valeur={montant(stats.ventes_jour)}
          libelle={t("Ventes aujourd'hui")}
          couleur="text-purple-600"
        />
        <StatCarte
          valeur={nombre(stats.creances_en_cours)}
          libelle={t("Créances en cours")}
          couleur="text-orange-600"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCarte
          valeur={montant(stats.ventes_mois)}
          libelle={t("Ventes du mois")}
          couleur="text-indigo-600"
        />
        <StatCarte
          valeur={nombre(stats.produits_alerte)}
          libelle={t("Produits en alerte de stock")}
          couleur="text-amber-600"
        />
        <StatCarte
          valeur={montant(stats.montant_creances)}
          libelle={t("Montant total des créances")}
          couleur="text-red-600"
        />
      </div>

      {/* Raccourci propre au rôle */}
      <div className="mt-8">
        {estGrossiste ? (
          <Link href="/commandes" className="block">
            <Carte className="border border-amber-200 bg-amber-50 transition hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-amber-800">
                    {t("📦 Commandes reçues")}
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    {t("Gérer les commandes des détaillants")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-600">
                    {stats.commandes_attente_paiement}
                  </div>
                  <div className="text-xs text-amber-500">en attente de paiement</div>
                </div>
              </div>
            </Carte>
          </Link>
        ) : (
          <Link href="/recherche" className="block">
            <Carte className="border border-blue-200 bg-blue-50 transition hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-800">
                    {t("🔍 Chercher des produits")}
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    {t("Trouver un grossiste et passer une commande")}
                  </p>
                </div>
                <div className="text-3xl text-blue-400">→</div>
              </div>
            </Carte>
          </Link>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Raccourci href="/clients/nouveau" icone="👤" titre={t("Nouveau client")} note={t("Ajouté rapidement")} />
        <Raccourci
          href="/ventes/nouvelle"
          icone="🛒"
          titre={t("Nouvelle vente")}
          note={t("Enregistrer une transaction")}
          principal
        />
        <Raccourci href="/retraits" icone="💸" titre={t("Nouveau retrait")} note={t("Retirer de la caisse")} />
      </div>
    </div>
  );
}

function Raccourci({
  href,
  icone,
  titre,
  note,
  principal = false,
}: {
  href: string;
  icone: string;
  titre: string;
  note: string;
  principal?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-5 rounded-3xl p-6 transition hover:shadow-lg ${
        principal
          ? "bg-marque-600 text-white"
          : "bg-surface shadow-sm ring-1 ring-bordure-douce"
      }`}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
          principal ? "bg-white/20" : "bg-surface-forte"
        }`}
      >
        {icone}
      </span>
      <span>
        <span className="block text-lg font-semibold">{titre}</span>
        <span className={`block text-sm ${principal ? "text-marque-100" : "text-faible"}`}>
          {note}
        </span>
      </span>
    </Link>
  );
}
