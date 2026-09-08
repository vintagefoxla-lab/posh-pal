#!/usr/bin/env bash
# =============================================================================
# team-db install for Posh Pal on the API VPS (install-team-db.sh)
#
# team-db is a Bun TypeScript CLI that uses @tursodatabase/sync to replicate the
# team's SHARED Turso SQLite DB to a local file. server.js shells out to a
# `team-db "<SQL>"` binary for every query. Installing the SAME CLI on the VPS
# lets the API read/write the SAME data the team uses — NO refactor and NO data
# migration (the VPS is just another synced replica of the same Turso DB).
#
# SOURCE OF THE CLI: it is NOT part of this repo. At deploy time you copy the
# CLI tree from a team machine onto the VPS, e.g.:
#   scp -r /opt/team-skills/team-db <vps>:/opt/team-skills/team-db
# (it includes node_modules with a native binary — not something to git-commit).
#
# Runtime needed (installed by this script):
#   - bun  (real binary at /usr/local/bin/bun — see "bun install" below)
#   - the CLI tree under $DEST below
#   - env: TEAM_DB_URL, TEAM_DB_AUTH_TOKEN, TEAM_DB_PATH
# =============================================================================
set -euo pipefail

DEST="${DEST:-/opt/team-skills/team-db}"
SERVICE_USER="${SERVICE_USER:-poshpal}"

# ── bun install ───────────────────────────────────────────────────────────────
# NEVER symlink bun into a root-only home dir (e.g. /usr/local/bin/bun ->
# /root/.bun/bin/bun): non-root service users cannot traverse /root, so every
# `team-db` invocation fails with `/usr/bin/env: 'bun': Permission denied` and
# the API returns 500s on all DB-backed endpoints. Install a REAL, world-readable
# binary instead, and verify it runs AS THE SERVICE USER.
BUN_SRC="${BUN_SRC:-$(command -v bun || echo /root/.bun/bin/bun)}"
if [ ! -x "$BUN_SRC" ]; then
  if command -v curl >/dev/null 2>&1; then
    echo "bun not found; installing via bun.sh into ~/.bun ..."
    curl -fsSL https://bun.sh/install | bash
    BUN_SRC="$HOME/.bun/bin/bun"
  else
    echo "ERROR: bun not found at $BUN_SRC (install it first, see header)"; exit 1
  fi
fi
install -o root -g root -m 0755 "$BUN_SRC" /usr/local/bin/bun

[ -f "$DEST/cli.ts" ] || { echo "ERROR: team-db CLI not present at $DEST/cli.ts (scp it first, see header)"; exit 1; }
mkdir -p /usr/local/bin
ln -sf "$DEST/cli.ts" /usr/local/bin/team-db
chmod +x "$DEST/cli.ts"
# Node/yarn node_modules must be present for @tursodatabase/sync (copied with scp);
# verify quickly:
[ -d "$DEST/node_modules/@tursodatabase/sync" ] || { echo "WARNING: node_modules missing under $DEST — team-db will fail until restored."; }

echo "bun installed at /usr/local/bin/bun (REAL binary, world-readable)."
# Service-user check — MUST print a version, not 'Permission denied':
if id "$SERVICE_USER" >/dev/null 2>&1; then
  if ! su -s /bin/bash "$SERVICE_USER" -c '/usr/local/bin/bun --version'; then
    echo "ERROR: service user $SERVICE_USER cannot execute bun — investigate before proceeding."; exit 1
  fi
else
  echo "WARNING: user $SERVICE_USER does not exist — create the service user before starting the API."
fi
echo "team-db installed at /usr/local/bin/team-db (symlink -> $DEST/cli.ts)"
echo "It will sync the shared Turso DB once TEAM_DB_URL / TEAM_DB_AUTH_TOKEN / TEAM_DB_PATH are set (systemd env file /etc/posh-pal/env)."
echo "Smoke test (AS THE SERVICE USER, from a service-user-readable env copy):"
echo "  install -o $SERVICE_USER -g $SERVICE_USER -m 600 /etc/posh-pal/env /tmp/pp-env-test"
echo "  su -s /bin/bash $SERVICE_USER -c 'set -a; source /tmp/pp-env-test; set +a; /usr/local/bin/team-db \"SELECT COUNT(*) FROM agents\"'"
echo "  rm -f /tmp/pp-env-test"