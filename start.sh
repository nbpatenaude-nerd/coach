#!/bin/sh

# Exit on error
set -e

if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://dummy:dummy@localhost:5432/dummy" ]; then
  echo "🚀 Running database migrations..."
  ./node_modules/.bin/prisma migrate deploy || npx prisma migrate deploy
else
  echo "⚠️ Skipping migrations: DATABASE_URL is not set or is dummy."
fi

# Sidebase's originEnvKey (NUXT_AUTH_ORIGIN_UNUSED) REPLACES auth.baseURL entirely.
# It must be origin + /api/auth (not bare origin):
#   http://127.0.0.1:PORT        → pathname "/"     → fetches /session  → recursion
#   http://127.0.0.1:PORT/api/auth → pathname "/api/auth" → /api/auth/session ✓
# Use loopback so server-side session resolution never hairpins the public proxy.
# Public OAuth / links still use NUXT_AUTH_ORIGIN + NUXT_PUBLIC_SITE_URL.
PORT="${PORT:-3000}"
export NUXT_AUTH_ORIGIN_UNUSED="http://127.0.0.1:${PORT}/api/auth"
echo "auth origin (internal): $NUXT_AUTH_ORIGIN_UNUSED"

echo "        Starting application..."
exec node .output/server/index.mjs
