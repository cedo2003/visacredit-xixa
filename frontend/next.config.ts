import type { NextConfig } from "next";

// Le navigateur ne parle qu'à UNE origine : ce frontend. Les appels `/api/*`
// sont relayés vers le backend Symfony par le réseau interne Docker — donc
// aucun CORS à régler, et l'API n'a pas besoin d'être exposée pour le web.
//
// En production, `http://backend` est le nom du service dans
// docker-compose.prod.yml. En développement, frontend/.env.local pointe
// INTERNAL_API_URL sur le serveur Symfony local.
//
// Même montage que epargne-africaVR sur le même serveur.
const INTERNAL_API = process.env.INTERNAL_API_URL || "http://backend";

const nextConfig: NextConfig = {
  // Sortie autonome : `next build` écrit .next/standalone/server.js avec le
  // strict nécessaire de node_modules. C'est ce que copie frontend/Dockerfile
  // pour produire une image de production légère. Sans effet en `next dev`.
  output: "standalone",

  async rewrites() {
    return [{ source: "/api/:path*", destination: `${INTERNAL_API}/api/:path*` }];
  },
};

export default nextConfig;
