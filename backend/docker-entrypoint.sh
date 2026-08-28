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
#
# Ce bloc échoue FRANCHEMENT (exit 1) si la base est inatteignable ou si
# l'import rate. La version précédente se contentait d'un avertissement et
# laissait démarrer un backend sans schéma : l'application répondait alors 500
# sur chaque route, sans que rien n'indique pourquoi. Un conteneur qui refuse de
# démarrer se voit ; une base vide, non.
if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] ERREUR : DATABASE_URL absent." >&2
  exit 1
fi

# Le paquet mariadb-client fournit `mariadb` ; `mysql` n'en est qu'un alias
# hérité, absent de certaines versions. On prend ce qui existe.
if command -v mariadb >/dev/null 2>&1; then
  CLIENT=mariadb
elif command -v mysql >/dev/null 2>&1; then
  CLIENT=mysql
else
  echo "[entrypoint] ERREUR : aucun client MySQL/MariaDB dans l'image." >&2
  exit 1
fi

# mysql://user:pass@host:port/base?options  →  extraction des morceaux
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

echo "[entrypoint] client $CLIENT → base $DB_NOM sur $DB_HOTE:$DB_PORT"

interroger() {
  "$CLIENT" -h "$DB_HOTE" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -N -B -e "$1"
}

# La dépendance `service_healthy` du compose couvre le cas normal, mais une base
# saine peut encore refuser les connexions le temps de finir son initialisation.
# On réessaie plutôt que de conclure trop vite à l'échec.
ESSAI=1
while [ "$ESSAI" -le 30 ]; do
  if interroger "SELECT 1;" >/dev/null 2>&1; then
    break
  fi
  [ "$ESSAI" = 1 ] && echo "[entrypoint] base pas encore prête, attente…"
  ESSAI=$((ESSAI + 1))
  sleep 2
done

if [ "$ESSAI" -gt 30 ]; then
  echo "[entrypoint] ERREUR : base injoignable après 60 s. Dernier message :" >&2
  interroger "SELECT 1;" >&2 || true
  exit 1
fi

# La table users fait foi : si elle existe, la base est déjà provisionnée.
DEJA_INSTALLE=$(interroger "SELECT COUNT(*) FROM information_schema.tables \
                            WHERE table_schema='$DB_NOM' AND table_name='users';")

if [ "$DEJA_INSTALLE" = "0" ]; then
  echo "[entrypoint] base vide → import de boutiq.sql (schéma + démonstration)…"
  if "$CLIENT" -h "$DB_HOTE" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
       --default-character-set=utf8mb4 "$DB_NOM" < /app/install/boutiq.sql; then
    echo "[entrypoint] import terminé."
  else
    echo "[entrypoint] ERREUR : import de boutiq.sql échoué." >&2
    exit 1
  fi
else
  echo "[entrypoint] base déjà provisionnée ($DEJA_INSTALLE table users), import ignoré."
fi

# ── 3) Cache de production ───────────────────────────────────────────────────
php bin/console cache:clear --no-interaction || true

echo "[entrypoint] démarrage de FrankenPHP…"
exec "$@"
