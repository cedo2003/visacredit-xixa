/**
 * Frais des passerelles mobile money, côté affichage.
 *
 * Transposition de App\Service\FraisPaiementService — mêmes taux, même arrondi,
 * pour que le récapitulatif montré avant l'encaissement soit exactement ce que
 * le serveur enregistrera. Le calcul reste évidemment refait côté API : ce
 * fichier ne sert qu'à ne pas faire de promesse que le serveur démentira.
 */

export const TAUX_KKIAPAY = 0.019;
export const TAUX_FEDAPAY = 0.018;

export type Repartition = "client" | "vendeur" | "50_50" | "personnalise";

export const OPTIONS_REPARTITION: { valeur: Repartition; label: string }[] = [
  { valeur: "client", label: "Le client paie la totalité des frais" },
  { valeur: "vendeur", label: "Je paie la totalité des frais" },
  { valeur: "50_50", label: "Moitié-moitié" },
  { valeur: "personnalise", label: "Partage personnalisé…" },
];

/** Taux appliqué selon le mode de paiement choisi sur l'écran de vente. */
export function tauxPour(modePaiement: string): number {
  return modePaiement === "fedapay" ? TAUX_FEDAPAY : TAUX_KKIAPAY;
}

/** Part du vendeur en pourcentage, quelle que soit la forme de la répartition. */
export function partVendeurPourcent(repartition: Repartition, partSaisie: number): number {
  switch (repartition) {
    case "vendeur":
      return 100;
    case "50_50":
      return 50;
    case "personnalise":
      return Math.max(0, Math.min(100, Math.round(partSaisie)));
    default:
      return 0;
  }
}

export interface DetailFrais {
  fraisTotal: number;
  fraisClient: number;
  fraisVendeur: number;
  /** Ce que la passerelle prélève au client. */
  montantWidget: number;
}

export function calculerFrais(
  montant: number,
  taux: number,
  partVendeur: number,
): DetailFrais {
  if (montant <= 0) {
    return { fraisTotal: 0, fraisClient: 0, fraisVendeur: 0, montantWidget: 0 };
  }

  const fraisTotal = Math.ceil(montant * taux);
  // Le franc indivisible va au client, comme côté serveur.
  const fraisClient = Math.ceil((fraisTotal * (100 - partVendeur)) / 100);
  const fraisVendeur = fraisTotal - fraisClient;

  return {
    fraisTotal,
    fraisClient,
    fraisVendeur,
    montantWidget: montant - fraisVendeur,
  };
}

/** Valeur envoyée à l'API dans `repartition_frais`. */
export function versApi(repartition: Repartition, partSaisie: number): string {
  const part = partVendeurPourcent(repartition, partSaisie);

  if (part === 0) return "client";
  if (part === 100) return "vendeur";
  if (part === 50) return "50_50";

  return `personnalise:${part}`;
}

/** Paliers proposés quand le partage est personnalisé — le curseur n'existe pas ici. */
export const PALIERS_PART_VENDEUR = [10, 20, 25, 30, 40, 60, 70, 75, 80, 90];
