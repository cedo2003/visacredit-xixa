"use client";

/**
 * Gabarit des pages légales — confidentialité, cookies.
 *
 * Elles partagent le fond crème de la vitrine plutôt que celui des écrans de
 * gestion : on y arrive depuis le pied de page public, souvent sans compte.
 */

import Link from "next/link";
import type { ReactNode } from "react";

import { MarqueXixa } from "@/components/accueil/MarqueXixa";
import { useT } from "@/lib/i18n";

export function PageLegale({
  titre,
  miseAJour,
  children,
}: {
  titre: string;
  /** Date de dernière révision, en clair. */
  miseAJour: string;
  children: ReactNode;
}) {
  const t = useT();

  return (
    <main className="min-h-screen bg-vitrine px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-block">
          <MarqueXixa taille="sm" />
        </Link>

        <h1 className="mt-10 text-3xl font-black tracking-tight text-titre sm:text-4xl">
          {t(titre)}
        </h1>
        <p className="mt-2 text-sm text-faible">
          {t("Dernière mise à jour")} : {t(miseAJour)}
        </p>

        <div className="mt-10 space-y-8">{children}</div>

        <div className="mt-14 border-t border-marque-100 pt-6 text-sm">
          <Link href="/" className="font-medium text-accent hover:underline">
            ← {t("Retour à l'accueil")}
          </Link>
        </div>
      </div>
    </main>
  );
}

/** Une section de la page, titre et corps. */
export function SectionLegale({ titre, children }: { titre: string; children: ReactNode }) {
  const t = useT();
  return (
    <section>
      <h2 className="text-lg font-bold text-titre">{t(titre)}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-corps">{children}</div>
    </section>
  );
}

/*
 * Les textes passent par une prop `texte` plutôt qu'en enfants JSX : la chaîne
 * reste alors un littéral d'une seule pièce, sans les espaces et retours à la
 * ligne que JSX replierait, donc une clé de dictionnaire prévisible.
 *
 * ATTENTION : `scripts/verifier-i18n.mjs` ne voit PAS ces chaînes. Il repère
 * les propriétés d'objet (`texte: "…"`), pas les attributs JSX (`texte="…"`).
 * Les traductions des pages légales se tiennent donc à la main dans
 * `dictionnaire-en.ts` — le script ne signalera jamais un oubli ici.
 */

/** Paragraphe traduit. */
export function P({ texte }: { texte: string }) {
  const t = useT();
  return <p>{t(texte)}</p>;
}

/** Une puce de liste. */
export function Puce({ texte }: { texte: string }) {
  const t = useT();
  return <li>{t(texte)}</li>;
}

/** Liste à puces ; ses entrées sont des `Puce`. */
export function Liste({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}
