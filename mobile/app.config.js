/**
 * Complète app.json au moment du build.
 *
 * Seul ajout : le fichier Firebase d'Android (google-services.json), sans
 * lequel le téléphone ne peut pas obtenir de jeton push. Il n'est branché que
 * s'il existe — dans le dossier mobile/, ou fourni par EAS via la variable
 * GOOGLE_SERVICES_JSON (variable d'environnement de type « fichier ») — pour
 * que le projet continue de se construire avant que Firebase soit configuré.
 * Voir README.md, section « Notifications push ».
 */

const fs = require("fs");
const path = require("path");

module.exports = ({ config }) => {
  const local = path.join(__dirname, "google-services.json");
  const fichier = process.env.GOOGLE_SERVICES_JSON ?? (fs.existsSync(local) ? "./google-services.json" : undefined);

  if (!fichier) return config;

  return {
    ...config,
    android: { ...config.android, googleServicesFile: fichier },
  };
};
