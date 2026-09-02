"use client";

/**
 * Gabarit des pages légales — CGU, mentions légales, confidentialité, cookies.
 *
 * Elles partagent le fond crème de la vitrine plutôt que celui des écrans de
 * gestion : on y arrive depuis le pied de page public, souvent sans compte.
 *
 * Le contenu de ces pages reproduit les documents officiels fournis par
 * Visacredit. Il n'est pas reformulé : un texte juridique engage son éditeur,
 * et le réécrire — même pour le rapprocher du comportement réel du logiciel —
 * relève de sa décision, pas de celle du développeur.
 */

import Link from "next/link";
import type { ReactNode } from "react";

import { MarqueXixa } from "@/components/accueil/MarqueXixa";
import { useT } from "@/lib/i18n";

/** Les quatre documents, listés au bas de chacun d'eux. */
const DOCUMENTS: [string, string][] = [
  ["/cgu", "Conditions Générales d'Utilisation"],
  ["/mentions-legales", "Mentions Légales"],
  ["/confidentialite", "Politique de Confidentialité"],
  ["/cookies", "Politique de Cookies"],
];

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
        <p className="mt-3 text-sm text-faible">
          {t(
            "Édité par le groupe Visacredit — exploité localement par l'entité applicable à chaque pays",
          )}
        </p>
        <p className="mt-1 text-sm text-faible">
          {t("Dernière mise à jour")} : {t(miseAJour)}
        </p>

        <div className="mt-10 space-y-9">{children}</div>

        <nav className="mt-14 border-t border-marque-100 pt-6 text-sm">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {DOCUMENTS.map(([href, libelle]) => (
              <LienLegal key={href} href={href} libelle={libelle} />
            ))}
          </div>
          <Link href="/" className="mt-5 inline-block font-medium text-accent hover:underline">
            ← {t("Retour à l'accueil")}
          </Link>
        </nav>
      </div>
    </main>
  );
}

function LienLegal({ href, libelle }: { href: string; libelle: string }) {
  const t = useT();
  return (
    <Link href={href} className="text-doux hover:text-accent hover:underline">
      {t(libelle)}
    </Link>
  );
}

/** Une section numérotée du document. */
export function SectionLegale({ titre, children }: { titre: string; children: ReactNode }) {
  const t = useT();
  return (
    <section>
      <h2 className="text-lg font-bold text-titre">{t(titre)}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-corps">{children}</div>
    </section>
  );
}

/** Sous-section, pour les articles à plusieurs points (3.1, 3.2…). */
export function SousSection({ titre, children }: { titre: string; children: ReactNode }) {
  const t = useT();
  return (
    <div className="pt-1">
      <h3 className="text-sm font-bold text-accent">{t(titre)}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

/*
 * Les textes passent par une prop `texte` plutôt qu'en enfants JSX : la chaîne
 * reste alors un littéral d'une seule pièce, sans les espaces et retours à la
 * ligne que JSX replierait, donc une clé de dictionnaire prévisible.
 *
 * ATTENTION : `scripts/verifier-i18n.mjs` ne voit PAS ces chaînes. Il repère
 * les propriétés d'objet (`texte: "…"`), pas les attributs JSX (`texte="…"`).
 * Le script ne signalera donc jamais un oubli de traduction sur ces pages.
 */

/** Paragraphe traduit. */
export function P({ texte }: { texte: string }) {
  const t = useT();
  return <p>{t(texte)}</p>;
}

/** Paragraphe en retrait, pour les précisions secondaires du document. */
export function Note({ texte }: { texte: string }) {
  const t = useT();
  return (
    <p className="border-l-2 border-marque-200 pl-3 text-xs italic text-faible">{t(texte)}</p>
  );
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

/**
 * Tableau — notamment celui des entités exploitantes, présent dans trois des
 * quatre documents.
 *
 * `overflow-x-auto` est indispensable : trois colonnes de texte juridique ne
 * tiennent pas dans la largeur d'un téléphone, et sans conteneur défilant c'est
 * la page entière qui déborderait latéralement.
 */
export function Tableau({ entetes, lignes }: { entetes: string[]; lignes: string[][] }) {
  const t = useT();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
        <thead>
          <tr className="bg-encre-600 text-white">
            {entetes.map((entete) => (
              <th key={entete} className="px-3 py-2 font-semibold">
                {t(entete)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne) => (
            <tr key={ligne.join("|")} className="border-b border-bordure odd:bg-surface-douce">
              {ligne.map((cellule) => (
                <td key={cellule} className="px-3 py-2 align-top">
                  {t(cellule)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
