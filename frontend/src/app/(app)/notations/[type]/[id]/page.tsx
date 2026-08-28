"use client";

import { useT } from "@/lib/i18n";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { date } from "@/lib/format";
import type { Notation, UserResume } from "@/lib/types";
import { Alerte, Carte, Chargement, EtatVide } from "@/components/ui";

interface Reponse {
  type: "fournisseur" | "client";
  profil: UserResume;
  moyenne: number;
  total: number;
  avis: Notation[];
}

/** Port de pages/notations/afficher_notation.php — fiche publique d'un partenaire. */
export default function ProfilNotation({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const t = useT();
  const { type, id } = use(params);
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<Reponse>(`/api/notations/profil/${type}/${id}`)
      .then(setDonnees)
      .catch((e) => setErreur(e.message));
  }, [type, id]);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/notations"
        className="mb-4 inline-block text-sm font-medium text-doux hover:underline"
      >
        {t("← Retour aux notations")}
      </Link>

      <Carte className="mb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-4xl">
            {donnees.type === "fournisseur" ? "🏬" : "🏪"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{donnees.profil.nom_boutique}</h1>
            <p className="text-sm text-faible">
              {donnees.type === "fournisseur" ? t("Fournisseur") : t("Client")} ·{" "}
              {donnees.profil.telephone}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-xl text-yellow-400">
                {"★".repeat(Math.round(donnees.moyenne))}
                <span className="text-estompe">
                  {"★".repeat(5 - Math.round(donnees.moyenne))}
                </span>
              </span>
              <span className="text-lg font-bold">
                {donnees.total > 0 ? `${donnees.moyenne.toFixed(1)}/5` : "—"}
              </span>
              <span className="text-sm text-faible">({donnees.total} avis)</span>
            </div>
          </div>
        </div>
      </Carte>

      {donnees.avis.length === 0 ? (
        <EtatVide
          titre={t("Aucun avis pour le moment")}
          description={t("Les avis apparaissent après une commande réceptionnée.")}
        />
      ) : (
        <div className="space-y-4">
          {donnees.avis.map((avis) => (
            <Carte key={avis.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg text-yellow-400">
                    {"★".repeat(avis.note)}
                    <span className="text-estompe">{"★".repeat(5 - avis.note)}</span>
                    <span className="ml-2 text-sm font-bold text-corps">
                      {avis.note}/5
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-doux">
                    Par {avis.auteur?.nom_boutique ?? "un partenaire"}
                  </p>
                </div>
                <span className="text-xs text-faible">{date(avis.created_at)}</span>
              </div>

              {avis.commentaire && (
                <p className="mt-3 rounded-2xl bg-surface-douce px-4 py-3 text-sm text-corps">
                  « {avis.commentaire} »
                </p>
              )}

              {avis.commande && (
                <p className="mt-3 border-t border-bordure-douce pt-3 text-xs text-faible">
                  Commande {avis.commande.numero_commande}
                </p>
              )}
            </Carte>
          ))}
        </div>
      )}
    </div>
  );
}
