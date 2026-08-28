"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { date } from "@/lib/format";
import type { Notation, Role } from "@/lib/types";
import { Alerte, Carte, Chargement, EtatVide, StatCarte, TitrePage } from "@/components/ui";

interface Reponse {
  role: Role;
  emises: Notation[];
  recues: Notation[];
  moyenne_recue: { moyenne: number; total: number };
}

/** Port de pages/notations/mes_notations.php. */
export default function Notations() {
  const t = useT();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [onglet, setOnglet] = useState<"recues" | "emises">("recues");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<Reponse>("/api/notations")
      .then(setDonnees)
      .catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  const liste = onglet === "recues" ? donnees.recues : donnees.emises;

  return (
    <div>
      <TitrePage titre={t("Mes notations")} sousTitre={t("Avis échangés avec vos partenaires")} />

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCarte
          valeur={
            donnees.moyenne_recue.total > 0
              ? `${donnees.moyenne_recue.moyenne.toFixed(1)} ★`
              : "—"
          }
          libelle={t("Note moyenne reçue")}
          couleur="text-yellow-500"
        />
        <StatCarte
          valeur={donnees.moyenne_recue.total}
          libelle={t("Avis reçus")}
          couleur="text-blue-600"
        />
        <StatCarte
          valeur={donnees.emises.length}
          libelle={t("Avis que j'ai laissés")}
          couleur="text-purple-600"
        />
      </div>

      <div className="mb-5 flex gap-2">
        {(
          [
            ["recues", `Reçues (${donnees.recues.length})`],
            ["emises", `Émises (${donnees.emises.length})`],
          ] as const
        ).map(([valeur, libelle]) => (
          <button
            key={valeur}
            onClick={() => setOnglet(valeur)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              onglet === valeur
                ? "bg-marque-600 text-white"
                : "bg-surface text-doux ring-1 ring-bordure hover:bg-surface-douce"
            }`}
          >
            {libelle}
          </button>
        ))}
      </div>

      {liste.length === 0 ? (
        <EtatVide
          titre={onglet === "recues" ? t("Aucun avis reçu") : t("Aucun avis laissé")}
          description={
            onglet === "recues"
              ? t("Vos partenaires pourront vous noter après une commande réceptionnée.")
              : t("Vous pourrez noter vos partenaires après réception d'une commande.")
          }
        />
      ) : (
        <div className="space-y-4">
          {liste.map((notation) => {
            const partenaire = onglet === "recues" ? notation.auteur : notation.cible;

            return (
              <Carte key={`${notation.type}-${notation.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {partenaire ? (
                      <Link
                        href={`/notations/${partenaire.role === "grossiste" ? "fournisseur" : "client"}/${partenaire.id}`}
                        className="font-semibold text-titre hover:text-accent hover:underline"
                      >
                        {partenaire.nom_boutique}
                      </Link>
                    ) : (
                      <p className="font-semibold text-titre">{t("Partenaire")}</p>
                    )}
                    <p className="text-sm text-faible">{partenaire?.nom_complet}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-yellow-400">
                      {"★".repeat(notation.note)}
                      <span className="text-estompe">{"★".repeat(5 - notation.note)}</span>
                    </div>
                    <p className="text-xs text-faible">{date(notation.created_at)}</p>
                  </div>
                </div>

                {notation.commentaire && (
                  <p className="mt-3 rounded-2xl bg-surface-douce px-4 py-3 text-sm text-corps">
                    « {notation.commentaire} »
                  </p>
                )}

                {notation.commande && (
                  <Link
                    href={`/commandes/${notation.commande.id}`}
                    className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
                  >
                    Commande {notation.commande.numero_commande} →
                  </Link>
                )}
              </Carte>
            );
          })}
        </div>
      )}
    </div>
  );
}
