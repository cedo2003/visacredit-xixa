import type { Metadata } from "next";
import { Vitrine } from "@/components/accueil/Vitrine";

export const metadata: Metadata = {
  title: "Visacredit XIXA — Votre boutique, tenue au clair",
  description:
    "La plateforme qui relie grossistes et détaillants : stock, ventes, créances, commandes B2B et crédits fournisseurs, sur le web comme sur le téléphone.",
};


/**
 * Vitrine publique — première page du site.
 *
 * Coquille serveur : elle ne porte que les métadonnées, que Next exige d'un
 * composant serveur. Le contenu vit dans `Vitrine`, côté client, parce que la
 * traduction et le thème passent par des hooks.
 */
export default function Accueil() {
  return <Vitrine />;
}
