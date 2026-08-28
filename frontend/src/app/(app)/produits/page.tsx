"use client";

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { montant } from "@/lib/format";
import type { Produit } from "@/lib/types";
import {
  Alerte,
  Badge,
  Bouton,
  Champ,
  Chargement,
  EtatVide,
  Tableau,
  TitrePage,
} from "@/components/ui";

/** Port de pages/produits/index.php. */
export default function Produits() {
  const t = useT();
  const [produits, setProduits] = useState<Produit[] | null>(null);
  const [recherche, setRecherche] = useState("");
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async (q: string) => {
    try {
      const url = q ? `/api/produits?q=${encodeURIComponent(q)}` : "/api/produits";
      setProduits(await api.get<Produit[]>(url));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => void charger(recherche), 300);
    return () => clearTimeout(timer);
  }, [recherche, charger]);

  async function supprimer(produit: Produit) {
    if (!confirm(`Supprimer le produit « ${produit.nom} » ?`)) return;

    try {
      await api.delete(`/api/produits/${produit.id}`);
      setProduits((liste) => liste?.filter((p) => p.id !== produit.id) ?? null);
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Suppression impossible."));
    }
  }

  const enAlerte = produits?.filter((p) => p.stock_faible).length ?? 0;

  return (
    <div>
      <TitrePage
        titre={t("Stock & Produits")}
        sousTitre={
          enAlerte > 0
            ? `${enAlerte} produit(s) sous le seuil d'alerte`
            : "Votre catalogue"
        }
        action={
          <Link href="/produits/nouveau">
            <Bouton>{t("+ Nouveau produit")}</Bouton>
          </Link>
        }
      />

      {erreur && <Alerte>{erreur}</Alerte>}

      <div className="mb-5 max-w-md">
        <Champ
          placeholder={t("Rechercher un produit…")}
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {!produits ? (
        <Chargement />
      ) : produits.length === 0 ? (
        <EtatVide
          titre={t("Aucun produit")}
          description={
            recherche
              ? t("Aucun produit ne correspond à cette recherche.")
              : t("Ajoutez votre premier produit pour commencer à vendre.")
          }
          action={
            !recherche ? (
              <Link href="/produits/nouveau">
                <Bouton>{t("Ajouter un produit")}</Bouton>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("Produit")}</th>
              <th>{t("Catégorie")}</th>
              <th className="text-center">{t("Stock")}</th>
              <th className="text-right">{t("Prix d'achat")}</th>
              <th className="text-right">{t("Prix de vente")}</th>
              <th className="text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((produit) => (
              <tr key={produit.id}>
                <td className="font-medium text-titre">{produit.nom}</td>
                <td className="text-faible">{produit.categorie?.nom ?? "—"}</td>
                <td className="text-center">
                  <Badge
                    classe={
                      produit.stock === 0
                        ? "bg-red-100 text-red-700"
                        : produit.stock_faible
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }
                  >
                    {produit.stock} u.
                  </Badge>
                </td>
                <td className="text-right">{montant(produit.prix_achat)}</td>
                <td className="text-right font-semibold text-emerald-700">
                  {montant(produit.prix_vente)}
                </td>
                <td>
                  <div className="flex justify-end gap-3 text-sm">
                    <Link
                      href={`/produits/${produit.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {t("Modifier")}
                    </Link>
                    <button
                      onClick={() => supprimer(produit)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      {t("Supprimer")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}
    </div>
  );
}
