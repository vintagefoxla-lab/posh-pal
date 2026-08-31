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
# FEASIBILITY (verified): team-db runs on any Linux x86_64 with bun + this CLI
# tree + the two Turso env secrets. The bundled @tursodatabase/sync ships a
# native sync-linux-x64-gnu binary, matching an Ubuntu/Debian Hetzner CX. It
# needs no other team-specific service; TEAM_DB_EVENTS_URL/TOKEN are OPTIONAL
# (best-effort notification — safe to omit; the DB still syncs fine).
#
# SOURCE OF THE CLI: it is NOT part of this repo. At deploy time you copy the
# CLI tree from a team machine onto the VPS, e.g.:
#   scp -r /opt/team-skills/team-db <vps>:/opt/team-skills/team-db
# (it includes node_modules with a native binary — not something to git-commit).
#
# Runtime needed (already installed by provision-vps.sh):
#   - bun   (install: curl -fsSL https://bun.sh/install | bash; ln -sf ~/.bun/bin/bun /usr/local/bin/bun)
#   - the CLI tree under $DEST below
#   - env: TEAM_DB_URL, TEAM_DB_AUTH_TOKEN, TEAM_DB_PATH
# =============================================================================
set -euo pipefail

DEST="${DEST:-/opt/team-skills/team-db}"

command -v bun >/dev/null 2>&1 || { echo "ERROR: bun not found (install it first, see header)"; exit 1; }
[ -f "$DEST/cli.ts" ] || { echo "ERROR: team-db CLI not present at $DEST/cli.ts (scp it first, see header)"; exit 1; }

mkdir -p /usr/local/bin
ln -sf "$DEST/cli.ts" /usr/local/bin/team-db
chmod +x "$DEST/cli.ts"
# Node/yarn node_modules must be present for @tursodatabase/sync (copied with scp);
# verify quickly:
[ -d "$DEST/node_modules/@tursodatabase/sync" ] || { echo "WARNING: node_modules missing under $DEST — team-db will fail until restored."; }

echo "team-db installed at /usr/local/bin/team-db (symlink -> $DEST/cli.ts)"
echo "It will sync the shared Turso DB once TEAM_DB_URL / TEAM_DB_AUTH_TOKEN / TEAM_DB_PATH are set (systemd env file /etc/posh-pal/env)."
echo "Smoke test:"
echo "  TEAM_DB_URL=... TEAM_DB_AUTH_TOKEN=... TEAM_DB_PATH=/var/lib/posh-pal/team.db team-db \"SELECT COUNT(*) FROM agents\""
