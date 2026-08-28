"use client";

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { aujourdHui, date, LIBELLES_DEPENSE, montant } from "@/lib/format";
import type { Depense } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  ChampTexte,
  Chargement,
  EtatVide,
  Tableau,
  TitrePage,
} from "@/components/ui";

interface Reponse {
  depenses: Depense[];
  total: number;
  categories: string[];
}

/** Port de pages/depenses/{index,create}.php. */
export default function Depenses() {
  const t = useT();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [formOuvert, setFormOuvert] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    try {
      setDonnees(await api.get<Reponse>("/api/depenses"));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function supprimer(depense: Depense) {
    if (!confirm(t("Supprimer cette dépense ?"))) return;

    try {
      await api.delete(`/api/depenses/${depense.id}`);
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Suppression impossible."));
    }
  }

  if (erreur && !donnees) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  return (
    <div>
      <TitrePage
        titre={t("Dépenses")}
        sousTitre={`Total enregistré : ${montant(donnees.total)}`}
        action={
          <Bouton onClick={() => setFormOuvert((o) => !o)}>
            {formOuvert ? t("Fermer") : t("+ Nouvelle dépense")}
          </Bouton>
        }
      />

      {erreur && <Alerte>{erreur}</Alerte>}

      {formOuvert && (
        <FormulaireDepense
          categories={donnees.categories}
          onEnregistre={async () => {
            setFormOuvert(false);
            await charger();
          }}
        />
      )}

      {donnees.depenses.length === 0 ? (
        <EtatVide
          titre={t("Aucune dépense")}
          description={t("Les achats de marchandises réglés comptant sont ajoutés ici automatiquement.")}
        />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("Date")}</th>
              <th>{t("Catégorie")}</th>
              <th>{t("Description")}</th>
              <th className="text-right">{t("Montant")}</th>
              <th className="text-right">{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {donnees.depenses.map((depense) => (
              <tr key={depense.id}>
                <td className="text-faible">{date(depense.date_depense)}</td>
                <td className="font-medium">
                  {depense.categorie === "autres" && depense.autre_categorie
                    ? depense.autre_categorie
                    : t(LIBELLES_DEPENSE[depense.categorie] ?? depense.categorie)}
                </td>
                <td className="max-w-md truncate text-doux">
                  {depense.description ?? "—"}
                </td>
                <td className="text-right font-bold text-red-600">
                  {montant(depense.montant)}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => supprimer(depense)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    {t("Supprimer")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}
    </div>
  );
}

function FormulaireDepense({
  categories,
  onEnregistre,
}: {
  categories: string[];
  onEnregistre: () => void;
}) {
  const t = useT();
  const [form, setForm] = useState({
    categorie: "achat_marchandises",
    autre_categorie: "",
    montant: "",
    description: "",
    date_depense: aujourdHui(),
  });
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  function maj(champ: keyof typeof form, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      await api.post("/api/depenses", {
        ...form,
        montant: parseFloat(form.montant) || 0,
      });
      onEnregistre();
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Enregistrement impossible."));
      setEnvoi(false);
    }
  }

  return (
    <Carte className="mb-6">
      {erreur && <Alerte>{erreur}</Alerte>}

      <form onSubmit={soumettre} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChampSelect
          label={t("Catégorie")}
          value={form.categorie}
          onChange={(e) => maj("categorie", e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {t(LIBELLES_DEPENSE[c] ?? c)}
            </option>
          ))}
        </ChampSelect>

        <Champ
          label={t("Montant (FCFA)")}
          type="number"
          min="1"
          required
          value={form.montant}
          onChange={(e) => maj("montant", e.target.value)}
        />

        {form.categorie === "autres" && (
          <Champ
            label={t("Préciser la catégorie")}
            value={form.autre_categorie}
            onChange={(e) => maj("autre_categorie", e.target.value)}
          />
        )}

        <Champ
          label={t("Date")}
          type="date"
          required
          value={form.date_depense}
          onChange={(e) => maj("date_depense", e.target.value)}
        />

        <div className="sm:col-span-2">
          <ChampTexte
            label={t("Description")}
            rows={2}
            value={form.description}
            onChange={(e) => maj("description", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <Bouton type="submit" disabled={envoi} className="w-full">
            {envoi ? t("Enregistrement…") : t("Enregistrer la dépense")}
          </Bouton>
        </div>
      </form>
    </Carte>
  );
}
