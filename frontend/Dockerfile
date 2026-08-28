# ── Visacredit XIXA — frontend Next.js (standalone) ──────────────────────────
# Calqué sur le frontend epargne-africaVR déployé sur le même serveur, avec npm
# à la place de pnpm (ce projet a un package-lock.json).
#
# `output: "standalone"` (next.config.ts) fait écrire à Next un serveur Node
# minimal et le sous-ensemble de node_modules qu'il utilise réellement : l'image
# finale ne contient ni les dépendances de build, ni le cache de compilation.
#
# ATTENTION : contrairement au backend, le contexte de build est frontend/ —
# pas la racine du dépôt.
#     docker build -f frontend/Dockerfile ./frontend
#
# Le TLS et le routage sont assurés en amont par Traefik (Dokploy) ; ce
# conteneur ne parle qu'en HTTP simple sur :3000.

# ── 1) Compilation ───────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Les variables NEXT_PUBLIC_* sont figées dans le bundle JavaScript AU MOMENT
# DU BUILD : les passer au conteneur à l'exécution n'aurait aucun effet. Changer
# le lien de l'APK impose donc de reconstruire l'image — même contrainte que
# EXPO_PUBLIC_API_URL pour l'APK.
ARG NEXT_PUBLIC_LIEN_APK=""
ENV NEXT_PUBLIC_LIEN_APK=$NEXT_PUBLIC_LIEN_APK \
    NEXT_TELEMETRY_DISABLED=1

# La cible du proxy `/api` est elle aussi figee au build, dans le manifeste de
# routes. `http://backend` est le nom du service dans docker-compose.prod.yml.
# On la pose explicitement plutot que de s'en remettre au defaut de
# next.config.ts : une vraie variable d'environnement prime sur .env.local, si
# bien qu'un .env.local echappant au .dockerignore ne pourrait pas figer
# `127.0.0.1:8000` dans une image de production -- panne silencieuse assuree.
ENV INTERNAL_API_URL=http://backend

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── 2) Exécution ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
# `standalone` embarque server.js et ses dépendances ; `static` doit être
# recopié à côté, Next ne l'inclut pas dans la sortie autonome.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
