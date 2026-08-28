#!/usr/bin/env bash
# =============================================================================
# Posh Pal API — Hetzner VPS provisioning (Path C)
# Debian/Ubuntu x86_64 target. Run as root on a freshly-provisioned Hetzner
# Cloud server (or equivalent VPS). Idempotent-ish; safe to re-run.
#
# THIS SCRIPT DOES NOT CREATE THE SERVER OR PROVISION CREDENTIALS.
# It installs/runs the API once you have provisioned the box yourself
# (see README.md for the exact owner inputs this script needs first).
#
# Usage:  HETZNER_* and DOMAIN are set externally (see README). Then:
#         sudo bash provision-vps.sh
# =============================================================================
set -euo pipefail

# ---- Config (set these before running, or via env) ----
APP_USER="${APP_USER:-poshpal}"
APP_DIR="${APP_DIR:-/opt/posh-pal}"
DATA_DIR="${DATA_DIR:-/var/lib/posh-pal}"      # dir for the team-db SQLite replica (must be persistent)
DOMAIN="${DOMAIN:?Set DOMAIN (e.g. api.poshpal.com) for the stable API URL}"
API_PORT="${API_PORT:-3001}"

# ---- 1. Base packages + Node (LTS via NodeSource) + Caddy ----
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg git build-essential

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Bun (needed to run the team-db CLI, a Bun TypeScript script)
curl -fsSL https://bun.sh/install | bash
ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun

# Caddy (auto-HTTPS reverse proxy)
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -y
apt-get install -y caddy

# ---- 2. App user + directories ----
id -u "$APP_USER" 2>/dev/null || useradd -m -s /bin/bash "$APP_USER"
mkdir -p "$APP_DIR" "$DATA_DIR" "$(dirname "$DATA_DIR")"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR" "$DATA_DIR"

# ---- 3. team-db CLI (see install-team-db.sh for detail + secrets) ----
# Requires: TEAM_DB_URL, TEAM_DB_AUTH_TOKEN, and a persistent TEAM_DB_PATH.
# These are secrets held by the team — supply via systemd unit / env file.
bash "$APP_DIR/deploy/install-team-db.sh"

# ---- 4. Copy app code ----
# (In your repo this script is already in $APP_DIR. If provisioning fresh, do:
#   git clone https://github.com/vintagefoxla-lab/posh-pal.git "$APP_DIR"
#  then place deploy/ + src + server.js + package.json into $APP_DIR.)
cd "$APP_DIR"
npm install --omit=dev || npm install
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# ---- 5. Environment file for the systemd unit ----
# Secrets are NOT committed. Create /etc/posh-pal/env with these keys:
#   TEAM_DB_BIN_PATH=/usr/local/bin/team-db
#   TEAM_DB_URL=libsql://<db>.turso.io
#   TEAM_DB_AUTH_TOKEN=<secret>
#   TEAM_DB_PATH=<persistent db file, e.g. $DATA_DIR/team.db>
#   STRIPE_SECRET_KEY=sk_live_...
#   STRIPE_WEBHOOK_SECRET=whsec_...
#   VITE_STRIPE_PUBLIC_KEY=pk_live_...
#   VITE_API_URL=https://$DOMAIN
mkdir -p /etc/posh-pal
if [ ! -f /etc/posh-pal/env ]; then
  touch /etc/posh-pal/env
  chmod 600 /etc/posh-pal/env
  echo "# Populate /etc/posh-pal/env with TEAM_DB_* and STRIPE_* secrets (see README)." >> /etc/posh-pal/env
fi

# ---- 6. systemd unit + Caddyfile ----
cp "$APP_DIR/deploy/posh-pal-api.service" /etc/systemd/system/posh-pal-api.service
systemctl daemon-reload
systemctl enable posh-pal-api.service

sed "s/__DOMAIN__/$DOMAIN/g; s/__PORT__/$API_PORT/g" \
  "$APP_DIR/deploy/Caddyfile" > /etc/caddy/Caddyfile
chown root:root /etc/caddy/Caddyfile

echo "Provisioning complete. Next steps (see README):"
echo "  1. Fill /etc/posh-pal/env with team-db + Stripe secrets."
echo "  2. systemctl start posh-pal-api"
echo "  3. systemctl reload caddy"
echo "  4. Point DOMAIN's public DNS A record at this server's IP."
echo "  5. Verify webhook delivery; point live site POSH_PAL_API_URL + Stripe endpoint here."
