#!/usr/bin/env bash
set -Eeuo pipefail

REPO_URL="https://github.com/koditra/lost-signal.git"
APP_DIR="${APP_DIR:-$HOME/lost-signal-rsvp-api}"
PORT="${PORT:-8123}"
RSVP_CAPACITY="${RSVP_CAPACITY:-120}"
CORS_ORIGINS="${CORS_ORIGINS:-https://koditra.github.io,http://localhost:5500,http://127.0.0.1:5500}"
PUBLIC_URL="${PUBLIC_URL:-https://app.dermvision.tech}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js 20 or later, then rerun this script." >&2
  exit 1
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if (( node_major < 20 )); then
  echo "Node.js 20 or later is required; found $(node --version)." >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" fetch origin main
  git -C "$APP_DIR" reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone --branch main --single-branch "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR/backend"
npm ci
npm run build
npm test

if command -v pm2 >/dev/null 2>&1; then
  PM2=(pm2)
else
  npm install --global pm2 || true
  if command -v pm2 >/dev/null 2>&1; then
    PM2=(pm2)
  else
    PM2=(npx --yes pm2)
  fi
fi

"${PM2[@]}" delete lost-signal-rsvp-api >/dev/null 2>&1 || true

PORT="$PORT" RSVP_CAPACITY="$RSVP_CAPACITY" \
CORS_ORIGINS="$CORS_ORIGINS" RSVP_CACHE_TTL_MS="300000" RSVP_TIMEOUT_MS="10000" \
"${PM2[@]}" start dist/main.js --name lost-signal-rsvp-api --update-env
"${PM2[@]}" save

local_url="http://127.0.0.1:$PORT/api/lost-signal/stats"
for attempt in {1..20}; do
  if response="$(curl --fail --silent --show-error --max-time 12 "$local_url" 2>/dev/null)"; then
    printf '\nDeployment successful.\n'
    printf 'Local endpoint: %s\n' "$local_url"
    printf 'Public endpoint: %s/api/lost-signal/stats\n' "$PUBLIC_URL"
    printf 'Response: %s\n\n' "$response"
    "${PM2[@]}" status
    exit 0
  fi
  sleep 1
done

printf '\nThe API did not become healthy locally after 20 seconds.\n' >&2
"${PM2[@]}" logs lost-signal-rsvp-api --lines 40 --nostream >&2 || true
exit 1
