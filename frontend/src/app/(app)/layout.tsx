"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";
import { Chargement } from "@/components/ui";

/**
 * Enveloppe des pages authentifiées.
 * Le garde de session remplace le `if (!isLoggedIn()) redirect(...)` qui
 * ouvrait chaque page PHP ; l'API vérifie de son côté chaque requête.
 */
export default function LayoutApplication({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useT();
  const { user, chargement } = useAuth();
  const router = useRouter();
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    if (!chargement && !user) router.replace("/connexion");
  }, [user, chargement, router]);

  if (chargement || !user) {
    return <Chargement />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar ouvert={menuOuvert} fermer={() => setMenuOuvert(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-bordure bg-surface px-4 lg:hidden">
          <button
            onClick={() => setMenuOuvert(true)}
            aria-label={t("Ouvrir le menu")}
            className="rounded-lg p-2 text-corps hover:bg-surface-forte"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Image
            src="/logo-xixa.png"
            alt={t("Visacredit XIXA")}
            width={100}
            height={73}
            priority
            className="h-auto w-auto dark:rounded-lg dark:bg-white dark:p-1.5"
          />
        </header>

        {/*
          Rappel d'IFU : persistant tant que le champ est vide, mais non
          bloquant — une boutique déjà en activité doit pouvoir continuer à
          travailler pendant qu'elle rassemble ses papiers. Il vit dans le
          layout pour suivre l'utilisateur sur toutes les pages.
        */}
        {user.ifu_manquant && (
          <Link
            href="/parametres"
            className="block border-b border-amber-200 bg-amber-50 px-5 py-3 transition hover:bg-amber-100 sm:px-8"
          >
            <p className="text-sm font-semibold text-amber-900">{t("⚠️ IFU manquant")}</p>
            <p className="mt-0.5 text-xs text-amber-800">
              {t("Votre Identifiant Fiscal Unique est obligatoire. Cliquez ici pour le renseigner dans Paramètres.")}
            </p>
          </Link>
        )}

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
