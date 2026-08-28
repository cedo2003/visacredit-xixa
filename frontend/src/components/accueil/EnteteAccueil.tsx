"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { MarqueXixa } from "./MarqueXixa";

const LIENS = [
  { href: "#fonctionnement", libelle: "Comment ça marche" },
  { href: "#fonctions", libelle: "Fonctions" },
  { href: "#roles", libelle: "Grossiste & détaillant" },
  { href: "#telecharger", libelle: "Télécharger" },
  { href: "#questions", libelle: "Questions" },
];

/**
 * Barre de navigation de la vitrine.
 *
 * Elle connaît la session : une boutique déjà connectée qui repasse par
 * l'accueil ne doit pas se voir proposer « Se connecter » mais un retour direct
 * vers son tableau de bord. Tant que `/api/auth/me` répond, aucun des deux n'est
 * affiché — annoncer « Se connecter » puis le remplacer serait pire que
 * d'attendre.
 */
export function EnteteAccueil() {
  const t = useT();
  const { user, chargement } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-marque-100 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-5">
        <Link
          href="/"
          aria-label={t("Visacredit XIXA, accueil")}
          className="shrink-0"
        >
          <MarqueXixa />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LIENS.map((lien) => (
            <a
              key={lien.href}
              href={lien.href}
              className="text-sm font-medium text-doux transition hover:text-accent"
            >
              {t(lien.libelle)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {chargement ? (
            <span
              className="h-10 w-32 rounded-full bg-surface-forte"
              aria-hidden="true"
            />
          ) : user ? (
            <Link
              href="/tableau-de-bord"
              className="whitespace-nowrap rounded-full bg-marque-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-marque-600/25 transition hover:bg-marque-700"
            >
              <span className="sm:hidden">{t("Tableau de bord")}</span>
              <span className="hidden sm:inline">{t("Mon tableau de bord")}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/connexion"
                className="hidden rounded-full border border-bordure px-5 py-2.5 text-sm font-semibold text-titre transition hover:border-marque-300 hover:text-accent sm:block"
              >
                {t("Se connecter")}
              </Link>
              <Link
                href="/inscription"
                className="whitespace-nowrap rounded-full bg-marque-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-marque-600/25 transition hover:bg-marque-700"
              >
                <span className="sm:hidden">{t("S'inscrire")}</span>
                <span className="hidden sm:inline">{t("Créer un compte")}</span>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
            aria-expanded={menuOuvert}
            aria-label={t("Ouvrir le menu")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-bordure text-titre lg:hidden"
          >
            {menuOuvert ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOuvert && (
        <nav className="border-t border-marque-100 bg-surface px-5 py-3 lg:hidden">
          {LIENS.map((lien) => (
            <a
              key={lien.href}
              href={lien.href}
              onClick={() => setMenuOuvert(false)}
              className="block rounded-lg px-2 py-2.5 text-sm font-medium text-corps hover:bg-marque-50 hover:text-accent"
            >
              {t(lien.libelle)}
            </a>
          ))}
          {!chargement && !user && (
            <Link
              href="/connexion"
              onClick={() => setMenuOuvert(false)}
              className="mt-1 block rounded-lg px-2 py-2.5 text-sm font-semibold text-accent sm:hidden"
            >
              {t("Se connecter")}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
