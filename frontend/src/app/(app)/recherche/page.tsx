"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { montant } from "@/lib/format";
import type { Produit } from "@/lib/types";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Champ,
  EtatVide,
  Tableau,
  TitrePage,
} from "@/components/ui";

/**
 * Port de pages/commandes/rechercher_produits.php.
 * Réservé aux détaillants (l'API renvoie 403 pour un grossiste).
 */
export default function RechercheProduits() {
  const t = useT();
  const router = useRouter();
  const [terme, setTerme] = useState("");
  const [resultats, setResultats] = useState<Produit[] | null>(null);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (terme.trim().length < 2) {
      setResultats(null);
      return;
    }

    setRecherche(true);
    const timer = setTimeout(async () => {
      try {
        setResultats(
          await api.get<Produit[]>(
            `/api/produits/recherche-grossistes?q=${encodeURIComponent(terme.trim())}`,
          ),
        );
        setErreur("");
      } catch (e) {
        setErreur(e instanceof Error ? t(e.message) : t("Recherche impossible."));
      } finally {
        setRecherche(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [terme, t]);

  /** Pré-remplit le formulaire de commande avec le produit choisi. */
  function commander(produit: Produit) {
    const params = new URLSearchParams({
      telephone: produit.fournisseur?.telephone ?? "",
      produit: produit.nom,
      prix: String(Math.round(produit.prix_achat)),
    });
    router.push(`/commandes/nouvelle?${params.toString()}`);
  }

  return (
    <div>
      <TitrePage
        titre={t("🔍 Chercher des produits")}
        sousTitre={t("Trouvez les produits des grossistes et commandez directement")}
      />

      {erreur && <Alerte>{erreur}</Alerte>}

      <Carte className="mb-6">
        <Champ
          label={t("Nom du produit")}
          placeholder={t("Ex : riz, sucre, farine…")}
          autoFocus
          value={terme}
          onChange={(e) => setTerme(e.target.value)}
          aide={t("Tapez au moins 2 caractères")}
        />
      </Carte>

      {recherche && <p className="py-6 text-center text-sm text-faible">{t("Recherche…")}</p>}

      {resultats !== null && !recherche && resultats.length === 0 && (
        <EtatVide
          titre={t("Aucun produit trouvé")}
          description={`Aucun grossiste n'a « ${terme} » en stock actuellement.`}
        />
      )}

      {resultats !== null && resultats.length > 0 && (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("Produit")}</th>
              <th>{t("Fournisseur")}</th>
              <th className="text-center">{t("Stock")}</th>
              <th className="text-right">{t("Prix d'achat")}</th>
              <th className="text-right">{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {resultats.map((produit) => (
              <tr key={produit.id}>
                <td className="font-semibold text-titre">{produit.nom}</td>
                <td>
                  <div className="font-medium">
                    {produit.fournisseur?.nom_boutique ?? "—"}
                  </div>
                  <div className="text-xs text-faible">
                    {produit.fournisseur?.nom_complet}
                  </div>
                  <div className="text-xs text-estompe">
                    📞 {produit.fournisseur?.telephone}
                  </div>
                  {produit.fournisseur && (
                    <Link
                      href={`/notations/fournisseur/${produit.fournisseur.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      {t("⭐ Voir ses avis")}
                    </Link>
                  )}
                </td>
                <td className="text-center">
                  <Badge classe="bg-blue-100 text-blue-700">{produit.stock} u.</Badge>
                </td>
                <td className="text-right font-bold text-orange-600">
                  {montant(produit.prix_achat)}
                </td>
                <td className="text-right">
                  <Bouton onClick={() => commander(produit)}>{t("Commander")}</Bouton>
                </td>
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}
    </div>
  );
}
