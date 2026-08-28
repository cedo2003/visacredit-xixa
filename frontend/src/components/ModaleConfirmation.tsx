"use client";

/**
 * Demande de confirmation avant une action irréversible.
 *
 * Remplace le `confirm()` natif : celui-ci bloque le fil d'exécution, ne peut
 * pas être mis en forme, et certains navigateurs mobiles l'affichent de manière
 * inattendue. Ici la modale suit le style de l'application et gère le clavier.
 */

import { useT } from "@/lib/i18n";
import { useEffect, useRef } from "react";
import { Bouton, Carte } from "@/components/ui";

export interface DemandeConfirmation {
  titre: string;
  message: string;
  /** Texte du bouton de validation. Par défaut « Supprimer ». */
  libelleConfirmer?: string;
  /** Précision affichée en encadré : conséquence de l'action. */
  avertissement?: string;
  onConfirmer: () => void | Promise<void>;
}

export default function ModaleConfirmation({
  demande,
  enCours = false,
  onAnnuler,
}: {
  demande: DemandeConfirmation;
  enCours?: boolean;
  onAnnuler: () => void;
}) {
  const t = useT();
  const boutonAnnuler = useRef<HTMLButtonElement>(null);

  // Le focus part sur « Annuler » : sur une action destructive, l'option sûre
  // doit être celle qu'on déclenche par réflexe avec Entrée.
  useEffect(() => {
    boutonAnnuler.current?.focus();
  }, []);

  useEffect(() => {
    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape" && !enCours) onAnnuler();
    }

    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [onAnnuler, enCours]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={() => {
        if (!enCours) onAnnuler();
      }}
    >
      {/* Le clic sur la modale elle-même ne doit pas la fermer. */}
      <Carte className="w-full max-w-md" >
        <div onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              ⚠️
            </span>
            <div className="min-w-0">
              <h2 id="titre-confirmation" className="text-lg font-bold text-titre">
                {demande.titre}
              </h2>
              <p className="mt-1 text-sm text-doux">{demande.message}</p>
            </div>
          </div>

          {demande.avertissement && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
              {demande.avertissement}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Bouton
              ref={boutonAnnuler}
              type="button"
              variante="neutre"
              className="flex-1"
              disabled={enCours}
              onClick={onAnnuler}
            >
              {t("Annuler")}
            </Bouton>
            <Bouton
              type="button"
              variante="danger"
              className="flex-1"
              disabled={enCours}
              onClick={() => void demande.onConfirmer()}
            >
              {enCours ? t("Suppression…") : t(demande.libelleConfirmer ?? "Supprimer")}
            </Bouton>
          </div>
        </div>
      </Carte>
    </div>
  );
}
