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
# It must be public-origin + /api/auth (not bare origin, not loopback):
#   bare origin          → pathname "/"         → fetches /session → recursion
#   loopback + /api/auth → OAuth redirect_uri becomes http://127.0.0.1/... (Google 400)
#   public + /api/auth   → pathname "/api/auth" → internal /api/auth/session + correct OAuth ✓
# Session $fetch uses pathname only (no public hairpin). Auth.js host uses the full URL.
PORT="${PORT:-3000}"
PUBLIC_ORIGIN="${NUXT_AUTH_ORIGIN:-${NUXT_PUBLIC_SITE_URL:-}}"
PUBLIC_ORIGIN="${PUBLIC_ORIGIN%/}"
if [ -n "$PUBLIC_ORIGIN" ]; then
  export NUXT_AUTH_ORIGIN_UNUSED="${PUBLIC_ORIGIN}/api/auth"
else
  export NUXT_AUTH_ORIGIN_UNUSED="http://127.0.0.1:${PORT}/api/auth"
fi
echo "auth baseURL (Sidebase): $NUXT_AUTH_ORIGIN_UNUSED"

echo "        Starting application..."
exec node .output/server/index.mjs
