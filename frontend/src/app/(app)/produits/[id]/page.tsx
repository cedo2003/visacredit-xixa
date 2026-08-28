"use client";

import { useT } from "@/lib/i18n";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Categorie, Produit } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  ChampTexte,
  Chargement,
  TitrePage,
} from "@/components/ui";

/** Port de pages/produits/edit.php. */
export default function ModifierProduit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
  const { id } = use(params);
  const router = useRouter();

  const [produit, setProduit] = useState<Produit | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Produit>(`/api/produits/${id}`),
      api.get<Categorie[]>("/api/produits/categories"),
    ])
      .then(([p, cats]) => {
        setProduit(p);
        setCategories(cats);
        setForm({
          nom: p.nom,
          prix_achat: String(p.prix_achat),
          prix_vente: String(p.prix_vente),
          stock: String(p.stock),
          seuil_alerte: String(p.seuil_alerte ?? 10),
          categorie_id: p.categorie ? String(p.categorie.id) : "",
          description: p.description ?? "",
        });
      })
      .catch((e) => setErreur(e.message));
  }, [id]);

  function maj(champ: string, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (!form.categorie_id) {
      setErreur(t("Choisissez la catégorie du produit."));
      return;
    }

    setEnvoi(true);

    try {
      await api.put(`/api/produits/${id}`, {
        nom: form.nom,
        prix_achat: parseFloat(form.prix_achat) || 0,
        prix_vente: parseFloat(form.prix_vente) || 0,
        stock: parseInt(form.stock, 10) || 0,
        seuil_alerte: parseInt(form.seuil_alerte, 10) || 0,
        categorie_id: parseInt(form.categorie_id, 10),
        description: form.description,
      });
      router.push("/produits");
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Enregistrement impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  if (erreur && !produit) return <Alerte>{erreur}</Alerte>;
  if (!produit) return <Chargement />;

  return (
    <div>
      <TitrePage titre={t("Modifier le produit")} sousTitre={produit.nom} />

      <Carte className="max-w-2xl">
        {erreur && <Alerte>{erreur}</Alerte>}

        <form onSubmit={soumettre} className="space-y-5">
          <Champ
            label={t("Nom du produit")}
            required
            value={form.nom ?? ""}
            onChange={(e) => maj("nom", e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ
              label={t("Prix d'achat (FCFA)")}
              type="number"
              min="0"
              step="0.01"
              required
              value={form.prix_achat ?? ""}
              onChange={(e) => maj("prix_achat", e.target.value)}
            />
            <Champ
              label={t("Prix de vente (FCFA)")}
              type="number"
              min="0"
              step="0.01"
              required
              value={form.prix_vente ?? ""}
              onChange={(e) => maj("prix_vente", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ
              label={t("Stock")}
              type="number"
              min="0"
              required
              value={form.stock ?? ""}
              onChange={(e) => maj("stock", e.target.value)}
            />
            <Champ
              label={t("Seuil d'alerte")}
              type="number"
              min="0"
              required
              value={form.seuil_alerte ?? ""}
              onChange={(e) => maj("seuil_alerte", e.target.value)}
            />
          </div>

          <ChampSelect
            label={t("Catégorie")}
            required
            value={form.categorie_id ?? ""}
            onChange={(e) => maj("categorie_id", e.target.value)}
          >
            <option value="">{t("Choisir une catégorie…")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </ChampSelect>

          <ChampTexte
            label={t("Description")}
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => maj("description", e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Bouton
              type="button"
              variante="neutre"
              className="flex-1"
              onClick={() => router.push("/produits")}
            >
              {t("Annuler")}
            </Bouton>
            <Bouton type="submit" disabled={envoi} className="flex-1">
              {envoi ? t("Enregistrement…") : t("Enregistrer")}
            </Bouton>
          </div>
        </form>
      </Carte>
    </div>
  );
}
