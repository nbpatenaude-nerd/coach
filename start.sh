#!/bin/sh

# Exit on error
set -e

if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://dummy:dummy@localhost:5432/dummy" ]; then
  echo "🚀 Running database migrations..."
  ./node_modules/.bin/prisma migrate deploy || npx prisma migrate deploy
else
  echo "⚠️ Skipping migrations: DATABASE_URL is not set or is dummy."
fi

# Sidebase originEnvKey (NUXT_AUTH_ORIGIN_UNUSED) REPLACES auth.baseURL entirely.
# Must be the *public* https origin + /api/auth (Auth.js builds Google redirect_uri from it).
# Session $fetch uses pathname only (/api/auth/session) — no public hairpin.
# Never use 127.0.0.1 here: the browser would be sent to the user's machine after OAuth.
PORT="${PORT:-3000}"
PUBLIC_ORIGIN="${NUXT_AUTH_ORIGIN:-${NUXT_PUBLIC_SITE_URL:-}}"
if [ -z "$PUBLIC_ORIGIN" ] && [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
  PUBLIC_ORIGIN="https://${RAILWAY_PUBLIC_DOMAIN}"
fi
PUBLIC_ORIGIN="${PUBLIC_ORIGIN%/}"
# Accept either bare origin or origin+/api/auth (prod often sets the latter).
case "$PUBLIC_ORIGIN" in
  */api/auth) PUBLIC_ORIGIN="${PUBLIC_ORIGIN%/api/auth}" ;;
esac
PUBLIC_ORIGIN="${PUBLIC_ORIGIN%/}"

case "$PUBLIC_ORIGIN" in
  http://127.0.0.1*|http://localhost*|https://127.0.0.1*|https://localhost*)
    echo "⚠️ Refusing loopback auth origin ($PUBLIC_ORIGIN); need a public https host for OAuth."
    PUBLIC_ORIGIN=""
    ;;
esac

if [ -z "$PUBLIC_ORIGIN" ]; then
  echo "❌ Set NUXT_AUTH_ORIGIN or NUXT_PUBLIC_SITE_URL to your public https origin (e.g. https://….up.railway.app)."
  exit 1
fi

export NUXT_AUTH_ORIGIN_UNUSED="${PUBLIC_ORIGIN}/api/auth"
echo "auth baseURL (Sidebase): $NUXT_AUTH_ORIGIN_UNUSED"

echo "        Starting application..."
exec node .output/server/index.mjs
