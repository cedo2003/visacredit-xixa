/**
 * Identité de la plateforme, en un seul endroit.
 *
 * Le logo est chargé ici plutôt que dans chaque écran : les chemins relatifs
 * vers `assets/` varient selon la profondeur du fichier appelant, et un seul
 * `require` évite d'avoir à les recalculer à chaque déplacement de fichier.
 */

/** Nom affiché de la plateforme. */
export const NOM_PLATEFORME = "Visacredit XIXA";

/** Logo complet : pictogramme, mot-symbole et XIXA. */
export const LOGO = require("../assets/logo-xixa.png");
