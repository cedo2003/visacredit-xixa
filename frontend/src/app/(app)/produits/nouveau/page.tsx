"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { montant } from "@/lib/format";
import type { Categorie } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  ChampTexte,
  TitrePage,
} from "@/components/ui";

/**
 * Port de pages/produits/create.php.
 *
 * Le mode d'approvisionnement initial conditionne la suite, exactement comme
 * avant : comptant → une dépense est générée, crédit → une dette fournisseur
 * apparaît dans « Crédits fournisseurs ».
 */
export default function NouveauProduit() {
  const t = useT();
  const router = useRouter();
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [form, setForm] = useState({
    nom: "",
    prix_achat: "",
    prix_vente: "",
    stock: "0",
    seuil_alerte: "10",
    categorie_id: "",
    description: "",
    mode_paiement: "comptant",
    notes: "",
    fournisseur_nom: "",
    fournisseur_telephone: "",
  });
  const [fournisseurTrouve, setFournisseurTrouve] = useState<string | null>(null);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get<Categorie[]>("/api/produits/categories").then(setCategories).catch(() => {});
  }, []);

  // Vérification du fournisseur, comme le champ à la volée de l'ancien formulaire.
  useEffect(() => {
    const tel = form.fournisseur_telephone.trim();
    if (form.mode_paiement !== "credit" || tel.length < 8) {
      setFournisseurTrouve(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const r = await api.post<{ trouve: boolean; nom_boutique: string }>(
          "/api/commandes/verifier-fournisseur",
          { telephone: tel },
        );
        setFournisseurTrouve(r.trouve ? r.nom_boutique : null);
      } catch {
        setFournisseurTrouve(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.fournisseur_telephone, form.mode_paiement]);

  function maj(champ: keyof typeof form, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  const montantAppro =
    (parseFloat(form.prix_achat) || 0) * (parseInt(form.stock, 10) || 0);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (!form.categorie_id) {
      setErreur(t("Choisissez la catégorie du produit."));
      return;
    }

    setEnvoi(true);

    try {
      await api.post("/api/produits", {
        ...form,
        prix_achat: parseFloat(form.prix_achat) || 0,
        prix_vente: parseFloat(form.prix_vente) || 0,
        stock: parseInt(form.stock, 10) || 0,
        seuil_alerte: parseInt(form.seuil_alerte, 10) || 0,
        categorie_id: parseInt(form.categorie_id, 10),
      });
      router.push("/produits");
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Enregistrement impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div>
      <TitrePage titre={t("Nouveau produit")} sousTitre={t("Ajoutez un article à votre stock")} />

      <Carte className="max-w-2xl">
        {erreur && <Alerte>{erreur}</Alerte>}

        <form onSubmit={soumettre} className="space-y-5">
          <Champ
            label={t("Nom du produit")}
            required
            value={form.nom}
            onChange={(e) => maj("nom", e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ
              label={t("Prix d'achat (FCFA)")}
              type="number"
              min="0"
              step="0.01"
              required
              value={form.prix_achat}
              onChange={(e) => maj("prix_achat", e.target.value)}
            />
            <Champ
              label={t("Prix de vente (FCFA)")}
              type="number"
              min="0"
              step="0.01"
              required
              value={form.prix_vente}
              onChange={(e) => maj("prix_vente", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ
              label={t("Stock initial")}
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => maj("stock", e.target.value)}
            />
            <Champ
              label={t("Seuil d'alerte")}
              type="number"
              min="0"
              required
              value={form.seuil_alerte}
              onChange={(e) => maj("seuil_alerte", e.target.value)}
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-corps">
              {t("Mode de paiement de l'approvisionnement initial")}
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  valeur: "comptant",
                  titre: t("💵 Comptant"),
                  note: t("Une dépense est générée automatiquement"),
                },
                {
                  valeur: "credit",
                  titre: t("📅 À crédit"),
                  note: t("Enregistré dans les crédits fournisseurs"),
                },
              ].map((option) => (
                <label
                  key={option.valeur}
                  className={`cursor-pointer rounded-2xl border-2 px-4 py-3 transition ${
                    form.mode_paiement === option.valeur
                      ? "border-marque-500 bg-marque-50"
                      : "border-bordure hover:bg-surface-douce"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode_paiement"
                    className="sr-only"
                    checked={form.mode_paiement === option.valeur}
                    onChange={() => maj("mode_paiement", option.valeur)}
                  />
                  <span className="block text-sm font-semibold">{option.titre}</span>
                  <span className="mt-0.5 block text-xs text-faible">{option.note}</span>
                </label>
              ))}
            </div>
          </div>

          {form.mode_paiement === "comptant" && montantAppro > 0 && (
            <Alerte type="succes">
              Une dépense de <strong>{montant(montantAppro)}</strong> {t("sera créée automatiquement.")}
            </Alerte>
          )}

          {form.mode_paiement === "credit" && (
            <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-800">
                {t("Informations du fournisseur")}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Champ
                  label={t("Nom du fournisseur")}
                  value={form.fournisseur_nom}
                  onChange={(e) => maj("fournisseur_nom", e.target.value)}
                />
                <Champ
                  label={t("Téléphone du fournisseur")}
                  type="tel"
                  value={form.fournisseur_telephone}
                  onChange={(e) => maj("fournisseur_telephone", e.target.value)}
                />
              </div>
              {fournisseurTrouve && (
                <p className="rounded-xl bg-emerald-100 px-4 py-2 text-sm text-emerald-800">
                  Fournisseur <strong>{fournisseurTrouve}</strong> {t("trouvé sur Visacredit XIXA — paiement traçable via la plateforme.")}
                </p>
              )}
            </div>
          )}

          <ChampSelect
            label={t("Catégorie")}
            required
            value={form.categorie_id}
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
            value={form.description}
            onChange={(e) => maj("description", e.target.value)}
          />

          <Champ
            label={t("Notes")}
            placeholder={t("Ex : facture #123, lot spécial…")}
            value={form.notes}
            onChange={(e) => maj("notes", e.target.value)}
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
              {envoi ? t("Enregistrement…") : t("Enregistrer le produit")}
            </Bouton>
          </div>
        </form>
      </Carte>
    </div>
  );
}
