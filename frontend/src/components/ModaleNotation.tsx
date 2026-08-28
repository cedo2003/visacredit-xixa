"use client";

import { useT } from "@/lib/i18n";
import { useState } from "react";
import { api } from "@/lib/api";
import { Alerte, Bouton, Carte, ChampTexte } from "@/components/ui";

/** Port de pages/notations/{noter_fournisseur,noter_client}.php. */
export default function ModaleNotation({
  type,
  commandeId,
  onFermer,
  onEnregistre,
}: {
  type: "fournisseur" | "client";
  commandeId: number;
  onFermer: () => void;
  onEnregistre: () => void;
}) {
  const t = useT();
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (note < 1) {
      setErreur(t("Choisissez une note entre 1 et 5 étoiles."));
      return;
    }

    setEnvoi(true);

    try {
      await api.post(`/api/notations/${type}/${commandeId}`, { note, commentaire });
      onEnregistre();
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Enregistrement impossible."));
      setEnvoi(false);
    }
  }

  const affichee = survol || note;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <Carte className="w-full max-w-md">
        <h2 className="text-xl font-bold">
          Noter {type === "fournisseur" ? "ce fournisseur" : "ce client"}
        </h2>
        <p className="mt-1 text-sm text-faible">
          {t("Votre avis aide les autres commerçants de la plateforme.")}
        </p>

        {erreur && <Alerte>{erreur}</Alerte>}

        <form onSubmit={soumettre} className="mt-6 space-y-5">
          <div>
            <span className="mb-3 block text-sm font-medium text-corps">{t("Votre note")}</span>
            <div
              className="flex justify-center gap-2"
              onMouseLeave={() => setSurvol(0)}
            >
              {[1, 2, 3, 4, 5].map((valeur) => (
                <button
                  key={valeur}
                  type="button"
                  aria-label={`${valeur} étoile${valeur > 1 ? "s" : ""}`}
                  onMouseEnter={() => setSurvol(valeur)}
                  onClick={() => setNote(valeur)}
                  className={`text-4xl transition ${
                    valeur <= affichee ? "text-yellow-400" : "text-estompe"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <ChampTexte
            label={t("Commentaire (optionnel)")}
            rows={3}
            placeholder={t("Partagez votre expérience…")}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />

          <div className="flex gap-3">
            <Bouton type="button" variante="neutre" className="flex-1" onClick={onFermer}>
              {t("Annuler")}
            </Bouton>
            <Bouton type="submit" disabled={envoi} className="flex-1">
              {envoi ? t("Envoi…") : t("Envoyer mon avis")}
            </Bouton>
          </div>
        </form>
      </Carte>
    </div>
  );
}
