"use client";

/** Briques d'interface communes, dans l'esprit visuel de l'ancien assets/css/style.css. */

import { useT } from "@/lib/i18n";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Carte({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-bordure-douce ${className}`}>
      {children}
    </div>
  );
}

export function TitrePage({
  titre,
  sousTitre,
  action,
}: {
  titre: string;
  sousTitre?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-titre sm:text-3xl">{titre}</h1>
        {sousTitre && <p className="mt-1 text-sm text-faible">{sousTitre}</p>}
      </div>
      {action}
    </div>
  );
}

type VarianteBouton = "primaire" | "secondaire" | "succes" | "danger" | "neutre";

/**
 * L'orange de la marque et le rouge de `danger` se ressemblent trop pour opposer
 * deux actions contraires : « Valider » et « Refuser » côte à côte se lisaient
 * comme deux boutons de la même famille. Les accords se font donc en vert, les
 * refus en rouge — deux couleurs qu'on ne confond pas, même en plein soleil.
 */
const VARIANTES: Record<VarianteBouton, string> = {
  primaire: "bg-marque-600 text-white hover:bg-marque-700",
  secondaire: "bg-action-encre text-white hover:bg-action-encre-vif",
  succes: "bg-action-succes text-white hover:bg-action-succes-vif",
  danger: "bg-action-danger text-white hover:bg-action-danger-vif",
  neutre: "border border-bordure-forte bg-surface text-corps hover:bg-surface-douce",
};

/**
 * `ref` est déclarée explicitement : React 19 accepte une ref comme simple
 * prop d'un composant fonction, mais ButtonHTMLAttributes ne la contient pas.
 * Elle sert notamment à placer le focus dans les modales de confirmation.
 */
export function Bouton({
  variante = "primaire",
  className = "",
  children,
  ref,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBouton;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      {...props}
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Champ({
  label,
  aide,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; aide?: string }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-corps">{label}</span>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border border-bordure-forte px-4 py-2.5 text-sm outline-none transition focus:border-marque-500 focus:ring-2 focus:ring-marque-100 ${className}`}
      />
      {aide && <span className="mt-1 block text-xs text-faible">{aide}</span>}
    </label>
  );
}

export function ChampSelect({
  label,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-corps">{label}</span>
      )}
      <select
        {...props}
        className={`w-full rounded-xl border border-bordure-forte bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-marque-500 focus:ring-2 focus:ring-marque-100 ${className}`}
      >
        {children}
      </select>
    </label>
  );
}

export function ChampTexte({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-corps">{label}</span>
      )}
      <textarea
        {...props}
        className={`w-full rounded-xl border border-bordure-forte px-4 py-2.5 text-sm outline-none transition focus:border-marque-500 focus:ring-2 focus:ring-marque-100 ${className}`}
      />
    </label>
  );
}

export function Alerte({
  type = "erreur",
  children,
}: {
  type?: "erreur" | "succes" | "info";
  children: ReactNode;
}) {
  const styles = {
    erreur: "bg-red-50 text-red-700 ring-red-200",
    succes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    info: "bg-blue-50 text-blue-700 ring-blue-200",
  }[type];

  return (
    <div className={`mb-5 rounded-2xl px-4 py-3 text-sm ring-1 ${styles}`}>{children}</div>
  );
}

export function Badge({
  children,
  classe = "bg-surface-forte text-corps",
}: {
  children: ReactNode;
  classe?: string;
}) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${classe}`}>
      {children}
    </span>
  );
}

export function Chargement({ texte }: { texte?: string }) {
  const t = useT();
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-faible">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-marque-500 border-t-transparent" />
      {texte ?? t("Chargement…")}
    </div>
  );
}

export function EtatVide({
  titre,
  description,
  action,
}: {
  titre: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Carte className="py-14 text-center">
      <p className="text-lg font-semibold text-corps">{titre}</p>
      {description && <p className="mt-2 text-sm text-faible">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Carte>
  );
}

/** Enveloppe de tableau : garde le défilement horizontal dans le conteneur. */
export function Tableau({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-bordure-douce">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">{children}</table>
      </div>
    </div>
  );
}

export function StatCarte({
  valeur,
  libelle,
  couleur = "text-titre",
  note,
}: {
  valeur: ReactNode;
  libelle: string;
  couleur?: string;
  note?: ReactNode;
}) {
  return (
    <Carte>
      <div className={`text-2xl font-bold sm:text-3xl ${couleur}`}>{valeur}</div>
      <div className="mt-1 text-sm text-doux">{libelle}</div>
      {note && <div className="mt-2 text-xs text-amber-600">{note}</div>}
    </Carte>
  );
}
