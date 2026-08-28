#!/usr/bin/env bash
# =============================================================================
# team-db install for Posh Pal on the API host (install-team-db.sh)
#
# team-db is a Bun TypeScript CLI (/opt/team-skills/team-db/cli.ts) that uses
# @tursodatabase/sync to replicate the team's SHARED Turso SQLite DB to a local
# file. It exposes a `team-db "<SQL>"` binary that server.js shells out to for
# every query. We install the same CLI on the VPS so the data layer is unchanged
# (no refactor) AND it reaches the SAME database the team uses.
#
# This script needs three secrets from the team (NOT this repo):
#   TEAM_DB_URL          e.g. libsql://agent-team-.....turso.io
#   TEAM_DB_AUTH_TOKEN   the Turso auth token (rotatable, held by team)
#   TEAM_DB_PATH         persistent local SQLite file (e.g. /var/lib/posh-pal/team.db)
# =============================================================================
set -euo pipefail

# Locate the team-db CLI sources. On this dev box they live under /opt/team-skills.
# Copy the directory into the repo so the VPS can run the exact same CLI.
SRC_TEAM_DB="${SRC_TEAM_DB:-/opt/team-skills/team-db}"
DEST="${DEST:-/opt/team-skills/team-db}"
mkdir -p "$(dirname "$DEST")"
cp -r "$SRC_TEAM_DB" "$DEST" 2>/dev/null || { echo "team-db sources not found at $SRC_TEAM_DB"; exit 1; }
mkdir -p /usr/local/bin
ln -sf "$DEST/cli.ts" /usr/local/bin/team-db

echo "team-db installed at /usr/local/bin/team-db (symlink -> $DEST/cli.ts)"
echo "It will sync to the shared Turso DB once TEAM_DB_URL / TEAM_DB_AUTH_TOKEN are set."
echo "Verify:  TEAM_DB_URL=... TEAM_DB_AUTH_TOKEN=... TEAM_DB_PATH=... team-db \"SELECT * FROM agents LIMIT 1\""
