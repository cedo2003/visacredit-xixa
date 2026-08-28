# ── Visacredit XIXA — backend Symfony (FrankenPHP) ───────────────────────────
# Image unique : FrankenPHP sert public/ sur :80. Le TLS est assuré en amont par
# Traefik (Dokploy), d'où l'absence de certificat ici.
#
# Calquée sur le backend epargne-africaVR déployé sur le même serveur, moins la
# pile Python/OCR dont cette application n'a pas besoin.
#
# ATTENTION : le contexte de build est la RACINE du dépôt, pas backend/.
# C'est ce qui permet d'embarquer boutiq.sql — le schéma et les données de
# démonstration — sans en garder une seconde copie dans backend/.
#     docker build -f backend/Dockerfile .

FROM dunglas/frankenphp:1-php8.3

ENV APP_ENV=prod \
    APP_DEBUG=0 \
    SERVER_NAME=:80

WORKDIR /app

# git/unzip pour Composer ; mariadb-client pour l'import initial du schéma.
RUN apt-get update && apt-get install -y --no-install-recommends \
      git unzip mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# Extensions PHP requises par Symfony, Doctrine et l'API.
RUN install-php-extensions pdo_mysql intl opcache gd zip bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Dépendances d'abord : la couche est réutilisée tant que composer.lock ne bouge pas.
COPY backend/composer.json backend/composer.lock backend/symfony.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-progress --no-interaction --optimize-autoloader

# Code applicatif
COPY backend/ ./

# Symfony/Dotenv exige un fichier .env, meme reduit : sans lui, bootEnv() leve
# une PathException et le conteneur ne sert plus qu'une erreur 500.
#
# Celui du poste de developpement n'est PAS versionne (il contient les cles
# KkiaPay et FedaPay) et le .dockerignore l'ecarte du contexte de build : aucun
# secret n'entre donc dans l'image. On en pose un ici, limite a APP_ENV.
#
# Les vraies valeurs arrivent par l'environnement du conteneur, saisi dans
# Dokploy. Dotenv ne surcharge jamais une variable deja definie : ce fichier ne
# peut donc pas prendre le pas sur elles.
RUN echo "APP_ENV=prod" > .env
# Schéma + données de démonstration, importés au premier démarrage seulement.
COPY boutiq.sql /app/install/boutiq.sql

RUN composer dump-autoload --no-dev --optimize --classmap-authoritative --no-interaction \
    && mkdir -p var config/jwt && chmod -R 777 var config/jwt

COPY backend/Caddyfile /etc/caddy/Caddyfile

COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 80
ENTRYPOINT ["docker-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
