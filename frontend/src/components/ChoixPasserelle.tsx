"use client";

import { useT } from "@/lib/i18n";
import { useState } from "react";
import { montant } from "@/lib/format";
import { Bouton, Carte } from "@/components/ui";

/**
 * Choix de la passerelle et de la répartition des frais avant d'ouvrir le widget.
 * Port de pages/commandes/selectionner_mode_paiement.php.
 */
export default function ChoixPasserelle({
  titre,
  montantDu,
  onValider,
  onFermer,
}: {
  titre: string;
  montantDu: number;
  onValider: (passerelle: "kkiapay" | "fedapay", repartition: string) => void;
  onFermer: () => void;
}) {
  const t = useT();
  const [passerelle, setPasserelle] = useState<"kkiapay" | "fedapay">("kkiapay");
  const [repartition, setRepartition] = useState("client");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <Carte className="w-full max-w-md">
        <h2 className="text-xl font-bold">{t("Demander le paiement")}</h2>
        <p className="mt-1 text-sm text-faible">{titre}</p>

        <div className="my-5 rounded-2xl bg-red-50 p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-red-700">{t("À recevoir")}</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{montant(montantDu)}</div>
        </div>

        <div className="space-y-3">
          <span className="block text-sm font-medium text-corps">{t("Passerelle")}</span>
          {(
            [
              { valeur: "kkiapay" as const, titre: t("📱 KkiaPay"), note: t("Mobile Money — frais 1,9 %") },
              { valeur: "fedapay" as const, titre: t("💳 Agrégateur"), note: t("Carte et mobile — frais 1,8 %") },
            ]
          ).map((option) => (
            <label
              key={option.valeur}
              className={`block cursor-pointer rounded-2xl border-2 px-4 py-3 transition ${
                passerelle === option.valeur
                  ? "border-marque-500 bg-marque-50"
                  : "border-bordure hover:bg-surface-douce"
              }`}
            >
              <input
                type="radio"
                name="passerelle"
                className="sr-only"
                checked={passerelle === option.valeur}
                onChange={() => setPasserelle(option.valeur)}
              />
              <span className="block text-sm font-semibold">{option.titre}</span>
              <span className="mt-0.5 block text-xs text-faible">{option.note}</span>
            </label>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-corps">
            {t("Répartition des frais")}
          </span>
          <select
            value={repartition}
            onChange={(e) => setRepartition(e.target.value)}
            className="w-full rounded-xl border border-bordure-forte bg-surface px-4 py-2.5 text-sm outline-none focus:border-marque-500"
          >
            <option value="client">{t("Le payeur supporte les frais")}</option>
            <option value="vendeur">{t("Je supporte les frais")}</option>
            <option value="50_50">{t("Moitié-moitié")}</option>
          </select>
        </label>

        <div className="mt-6 flex gap-3">
          <Bouton variante="neutre" className="flex-1" onClick={onFermer}>
            {t("Annuler")}
          </Bouton>
          <Bouton className="flex-1" onClick={() => onValider(passerelle, repartition)}>
            {t("Continuer")}
          </Bouton>
        </div>
      </Carte>
    </div>
  );
}
