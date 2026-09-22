#!/bin/sh

# Exit on error
set -e

if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://dummy:dummy@localhost:5432/dummy" ]; then
  echo "🚀 Running database migrations..."
  ./node_modules/.bin/prisma migrate deploy || npx prisma migrate deploy
else
  echo "⚠️ Skipping migrations: DATABASE_URL is not set or is dummy."
fi

# Sidebase reads originEnvKey (NUXT_AUTH_ORIGIN_UNUSED) for server-side
# getSession fetches. That MUST be loopback — a public *.up.railway.app origin
# hairpins through the proxy and logs "Recursion detected at /session".
# Public OAuth / links still use NUXT_AUTH_ORIGIN + NUXT_PUBLIC_SITE_URL.
PORT="${PORT:-3000}"
export NUXT_AUTH_ORIGIN_UNUSED="http://127.0.0.1:${PORT}"
echo "auth origin (internal): $NUXT_AUTH_ORIGIN_UNUSED"

echo "        Starting application..."
exec node .output/server/index.mjs
