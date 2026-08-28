#!/bin/sh
# Préparation au démarrage du backend Visacredit XIXA, avant de passer la main
# à FrankenPHP. Le script est rejouable sans dommage à chaque redémarrage.
set -e

cd /app

# ── 1) Paire de clés JWT (Lexik) ─────────────────────────────────────────────
if [ ! -f config/jwt/private.pem ]; then
  echo "[entrypoint] génération de la paire de clés JWT…"
  php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction || \
    echo "[entrypoint] ATTENTION : génération JWT échouée (vérifier JWT_PASSPHRASE)"
fi

# ── 2) Schéma de base ────────────────────────────────────────────────────────
# Ce projet n'utilise pas les migrations Doctrine : son schéma vit dans
# boutiq.sql. L'import n'a donc lieu que si la base est vide, ce qui le rend
# sûr à chaque redémarrage — jamais il n'écrase des données de production.
if [ -n "$DATABASE_URL" ]; then
  # mysql://user:pass@host:port/base  →  extraction des morceaux
  SANS_SCHEMA="${DATABASE_URL#mysql://}"
  IDENTIFIANTS="${SANS_SCHEMA%%@*}"
  HOTE_ET_BASE="${SANS_SCHEMA#*@}"

  DB_USER="${IDENTIFIANTS%%:*}"
  DB_PASS="${IDENTIFIANTS#*:}"
  DB_HOTE_PORT="${HOTE_ET_BASE%%/*}"
  DB_HOTE="${DB_HOTE_PORT%%:*}"
  DB_PORT="${DB_HOTE_PORT#*:}"
  [ "$DB_PORT" = "$DB_HOTE" ] && DB_PORT=3306
  DB_NOM="${HOTE_ET_BASE#*/}"
  DB_NOM="${DB_NOM%%\?*}"

  echo "[entrypoint] base ciblée : $DB_NOM sur $DB_HOTE:$DB_PORT"

  # La table users fait foi : si elle existe, la base est déjà provisionnée.
  DEJA_INSTALLE=$(mysql -h "$DB_HOTE" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
      -N -B -e "SELECT COUNT(*) FROM information_schema.tables \
                WHERE table_schema='$DB_NOM' AND table_name='users';" 2>/dev/null || echo "erreur")

  if [ "$DEJA_INSTALLE" = "0" ]; then
    echo "[entrypoint] base vide → import de boutiq.sql (schéma + démonstration)…"
    mysql -h "$DB_HOTE" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
      --default-character-set=utf8mb4 "$DB_NOM" < /app/install/boutiq.sql \
      && echo "[entrypoint] import terminé." \
      || echo "[entrypoint] ATTENTION : import échoué."
  elif [ "$DEJA_INSTALLE" = "erreur" ]; then
    echo "[entrypoint] ATTENTION : base injoignable, import ignoré."
  else
    echo "[entrypoint] base déjà provisionnée, import ignoré."
  fi
else
  echo "[entrypoint] ATTENTION : DATABASE_URL absent, import ignoré."
fi

# ── 3) Cache de production ───────────────────────────────────────────────────
php bin/console cache:clear --no-interaction || true

echo "[entrypoint] démarrage de FrankenPHP…"
exec "$@"
