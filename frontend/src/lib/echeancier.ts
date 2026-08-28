/**
 * Planification des paiements à venir.
 *
 * Une créance ne se saisit plus échéance par échéance : on annonce combien de
 * versements, à quel rythme et à partir de quand, et le plan se déduit. C'est le
 * geste réel du commerçant (« tu me règles en trois fois, tous les 15 jours »),
 * et cela évite les échéanciers dont la somme ne retombe pas sur le montant dû.
 *
 * L'API refuse une date déjà passée : le plan démarre donc toujours dans le futur.
 */

export interface EcheanceSaisie {
  montant: string;
  date_limite: string;
}

/** Périodicités proposées, en jours. */
export const PERIODICITES = [
  { valeur: 7, label: "Chaque semaine" },
  { valeur: 15, label: "Tous les 15 jours" },
  { valeur: 30, label: "Chaque mois" },
  { valeur: 90, label: "Chaque trimestre" },
] as const;

function iso(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${mois}-${jour}`;
}

/** Date du jour décalée de `jours`, au format attendu par un <input type="date">. */
export function dansNJours(jours: number): string {
  const date = new Date();
  date.setDate(date.getDate() + jours);

  return iso(date);
}

export function ajouterJours(depart: string, jours: number): string {
  const date = new Date(`${depart}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dansNJours(jours);

  date.setDate(date.getDate() + jours);

  return iso(date);
}

/** Demain — première date acceptable pour un paiement planifié. */
export function demain(): string {
  return dansNJours(1);
}

/**
 * Répartit un montant sur `nombre` échéances régulières.
 *
 * L'arrondi est absorbé par la dernière : la somme retombe exactement sur le
 * montant dû, seule condition que l'API contrôle.
 */
export function planifier(
  montantDu: number,
  nombre: number,
  periodiciteJours: number,
  premiereDate: string,
): EcheanceSaisie[] {
  const total = Math.round(montantDu);
  const nb = Math.max(1, Math.min(36, Math.round(nombre)));
  const part = Math.floor(total / nb);

  return Array.from({ length: nb }, (_, index) => ({
    montant: String(index === nb - 1 ? total - part * (nb - 1) : part),
    date_limite: ajouterJours(premiereDate, index * periodiciteJours),
  }));
}

export function sommeEcheances(echeances: EcheanceSaisie[]): number {
  return echeances.reduce((total, e) => total + (parseFloat(e.montant) || 0), 0);
}

/** Échéances dont la date limite est déjà passée — refusées par l'API. */
export function echeancesDepassees(echeances: EcheanceSaisie[]): number {
  const aujourdHui = iso(new Date());

  return echeances.filter((e) => e.date_limite && e.date_limite < aujourdHui).length;
}
