"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";

/**
 * Navigation latérale — port de includes/sidebar.php.
 *
 * Le lien « Chercher des produits » reste réservé aux détaillants, comme dans
 * la version PHP (le contrôle correspondant existe aussi côté API).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface Lien {
  href: string;
  libelle: string;
  icone: string;
  reserve?: "grossiste" | "detaillant";
}

const LIENS: Lien[] = [
  { href: "/tableau-de-bord", libelle: "Tableau de bord", icone: "🏠" },
  { href: "/clients", libelle: "Clients", icone: "👥" },
  { href: "/produits", libelle: "Stock & Produits", icone: "📦" },
  { href: "/ventes", libelle: "Ventes", icone: "🛒" },
  { href: "/creances", libelle: "Créances", icone: "💰" },
  { href: "/depenses", libelle: "Dépenses", icone: "🧾" },
  { href: "/retraits", libelle: "Retraits", icone: "💸" },
  { href: "/credits", libelle: "Crédits fournisseurs", icone: "📄" },
  { href: "/recherche", libelle: "Chercher des produits", icone: "🔍", reserve: "detaillant" },
  { href: "/commandes", libelle: "Commandes", icone: "📥" },
  { href: "/notations", libelle: "Mes notations", icone: "⭐" },
  { href: "/parametres", libelle: "Paramètres", icone: "⚙️" },
];

export default function Sidebar({
  ouvert,
  fermer,
}: {
  ouvert: boolean;
  fermer: () => void;
}) {
  const t = useT();
  const { user, deconnexion, estDetaillant } = useAuth();
  const chemin = usePathname();
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    api
      .get<{ non_lues: number }>("/api/notifications/non-lues")
      .then((r) => setNonLues(r.non_lues))
      .catch(() => setNonLues(0));
  }, [chemin]);

  const liens = LIENS.filter(
    (l) => !l.reserve || (l.reserve === "detaillant" && estDetaillant),
  );

  return (
    <>
      {ouvert && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
          onClick={fermer}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-bordure bg-surface transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-bordure px-6 py-6">
          <Image
            src="/logo-xixa.png"
            alt={t("Visacredit XIXA")}
            width={118}
            height={86}
            priority
            className="h-auto w-auto dark:rounded-2xl dark:bg-white dark:p-3"
          />
          <p className="mt-0.5 truncate text-xs text-faible">
            {user?.nom_boutique ?? "Ma Boutique"}
          </p>
          <span className="mt-2 inline-block rounded-full bg-surface-forte px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-doux">
            {user?.role === "grossiste" ? t("Grossiste") : t("Détaillant")}
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {liens.map((lien) => {
            const actif =
              chemin === lien.href || chemin.startsWith(`${lien.href}/`);

            return (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={fermer}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition ${
                  actif
                    ? "bg-marque-50 font-semibold text-accent"
                    : "text-doux hover:bg-surface-forte"
                }`}
              >
                <span className="w-5 text-center">{lien.icone}</span>
                <span>{t(lien.libelle)}</span>
              </Link>
            );
          })}

          <Link
            href="/notifications"
            onClick={fermer}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition ${
              chemin.startsWith("/notifications")
                ? "bg-marque-50 font-semibold text-accent"
                : "text-doux hover:bg-surface-forte"
            }`}
          >
            <span className="w-5 text-center">🔔</span>
            <span className="flex-1">{t("Notifications")}</span>
            {nonLues > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                {nonLues}
              </span>
            )}
          </Link>
        </nav>

        <div className="border-t border-bordure p-3">
          <button
            onClick={deconnexion}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            <span className="w-5 text-center">↩</span>
            <span>{t("Déconnexion")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
