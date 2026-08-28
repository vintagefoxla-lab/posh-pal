# Posh Pal API — Hetzner VPS Deploy Runbook (Path C)

Execution-ready runbook. **Nothing here provisions a server or spends money** — it spells
out exactly what to run and what values to wire in the moment the owner returns with Hetzner
access. Read `README.md` for the strategy; this is the "do it fast" checklist.

---

## 1. team-db feasibility — VERDICT: runs on any Linux x86_64 → Path C avoids the refactor ✅

`server.js` routes **every** query through `team-db` (a Bun TypeScript CLI that syncs the
team's **shared Turso SQLite DB** to a local file). The question that decides whether Path C
truly avoids a data refactor is: *can that CLI run on an arbitrary host?*

**Yes.** Investigated the CLI source (`/opt/team-skills/team-db/cli.ts`, `lockRetry.ts`,
`package.json`, `node_modules`) and confirmed:

| Dependency | Requirement | On the VPS |
|---|---|---|
| Runtime | `bun` (shebang `#!/usr/bin/env bun`) | `provision-vps.sh` installs bun |
| CLI source | `cli.ts` + `lockRetry.ts` + `node_modules/` (`@tursodatabase/sync@^0.5.1`, ships native `sync-linux-x64-gnu`) | copy dir via `scp -r` → `/opt/team-skills/team-db` |
| Turso reachability | public `libsql://...turso.io` (not IP-bound) | works from anywhere with the token |
| Secrets | `TEAM_DB_URL`, `TEAM_DB_AUTH_TOKEN` | from team env, placed in `/etc/posh-pal/env` (mode 600) |
| Optional | `TEAM_DB_EVENTS_URL`/`TOKEN` (best-effort notification) | safe to omit; DB sync unaffected |

**Consequence:** the VPS becomes another **synced replica of the same shared Turso DB**.
There is **no migration** of data and **no refactor** of the 90 `runQuery()` call sites —
we just point `TEAM_DB_BIN_PATH` at the VPS's `team-db` (already supported via the
`server.js` env fallback introduced in this PR). This is the crux that makes Path C clean.

### Data / persistence consideration (the one thing to get right)
- `team-db` writes a local replica (`.db`, `-wal`, `-shm`). On the VPS that lives at
  **`/var/lib/posh-pal/team.db`** (the `DATA_DIR`), which the systemd unit keeps persistent.
- **Do NOT put `TEAM_DB_PATH` under `/tmp` or the app dir** — it must survive reboots and
  deploys or the replica re-syncs from scratch each time.
- The sandbox's own live replica can keep running in parallel; Turso sync handles two
  replicas of the same DB (last-writer-wins per row). For this single-owner/demo workload
  that's more than sufficient.

---

## 2. Run these the moment owner returns

1. Owner creates **Hetzner Cloud** (or DO/Lightsail) server: **CX22, Ubuntu 24.04 x86_64,
   2 vCPU/4GB/40GB**, adds our SSH key, hands us the **API token** + a **domain**
   (e.g. `api.poshpal.com`) with DNS control.
2. `scp -r /opt/team-skills/team-db <vps>:/opt/team-skills/team-db`   (carry the CLI + native binary)
3. Clone this repo to `/opt/posh-pal` on the VPS.
4. `DOMAIN=api.poshpal.com sudo bash /opt/posh-pal/deploy/provision-vps.sh`
5. Populate `/etc/posh-pal/env` (mode 600) — see **exact values** below.
6. `systemctl start posh-pal-api && systemctl reload caddy`
7. Add DNS `A` record: `api.poshpal.com → <VPS public IP>`.
8. Verify → cut over (sections 4 & 5).

---

## 3. Exact `/etc/posh-pal/env` values (the two team-held secrets are the hold-up)

```
TEAM_DB_BIN_PATH=/usr/local/bin/team-db
TEAM_DB_URL=libsql://agent-team-991b4115-cto.aws-us-west-2.turso.io   # team-held
TEAM_DB_AUTH_TOKEN=<team-held Turso token, from this sandbox env>    # team-held
TEAM_DB_PATH=/var/lib/posh-pal/team.db
PORT=3001
STRIPE_SECRET_KEY=sk_live_<masked>                                   # copy from .env
STRIPE_WEBHOOK_SECRET=whsec_<masked>                                 # see §5 repoint flow
VITE_STRIPE_PUBLIC_KEY=pk_live_<masked>                              # copy from .env
VITE_API_URL=https://api.poshpal.com
```

`TEAM_DB_URL` + `TEAM_DB_AUTH_TOKEN` are the two non-obvious secrets that must move from
this sandbox's env onto the owner's VPS. Without them the VPS `team-db` starts **empty**
and the API loses all data. Mask prefixes only in any log/report.

---

## 4. Cut over the live pointers (change last, reversible)

### 4a. Live site proxy → stable API URL
In `/home/team/shared/site/serve.ts` set:
```
POSH_PAL_API_URL=https://api.poshpal.com
```
Then re-publish (`publish_site`). This replaces the current ephemeral tunnel default
(`https://alcohol-hawaiian-creator-ringtones.trycloudflare.com`) — note that ephemeral URL
is a moving target that must be re-set + republished after every cloudflared restart, which
is exactly the flakiness Path C eliminates.

### 4b. Live Stripe webhook → new stable host (fresh `whsec_` flow, per the skill)
Follow `stripe-webhook-public-delivery` skill. Sequence:
1. In Stripe dashboard create a **new** webhook endpoint pointing at
   `https://api.poshpal.com/api/stripe/webhook`, events = production set
   (`checkout.session.completed`, `customer.subscription.updated/deleted`,
   `invoice.payment_failed`).
2. Capture the **fresh** `whsec_...` it returns → put in **both**
   `/etc/posh-pal/env` and the sandbox `.env` (masked prefixes in reports; never print raw).
3. `systemctl restart posh-pal-api`.
4. Trigger a **real** `customer.created` (payment-free) and confirm the log shows
   signature-verified (no `No signatures found`), i.e. delivery + verification proven.
5. **Delete the old** webhook endpoint (was pointing at the live cto.new domain via the
   tunnel) to avoid double deliveries.
6. Real `checkout.session.completed` remains **not** exercised (no real card under the
   guardrail) — its handler path is already signature-verified from prior work.

### 4c. Verify
- `curl https://api.poshpal.com/api/inventory` → JSON (proves team-db sync + routing + TLS).
- `POST https://api.poshpal.com/api/stripe/webhook` with a bogus `Stripe-Signature` → `400`
  (proves the handler is reachable and raw-body signature passthrough works through Caddy).
- `curl https://api.poshpal.com/` → `200`.

---

## 5. Owner still must provide (submit-blocking)

1. **Provider access**: Hetzner Cloud (or approved alt) API token + a provisioned CX22.
2. **Domain**: `api.poshpal.com` (or approved alternative) + DNS control for the `A` record.
3. **Consent to place team secrets** `TEAM_DB_URL` + `TEAM_DB_AUTH_TOKEN` on the VPS.
   (This is the one decision that is the team's/owner's to make — moving group-held DB
   credentials to an external host.)

**Not needed from anyone:** Stripe keys are already live in `.env`; no new account; no new app.

---

## 6. Rollback
Reversible at every step. Until §4 runs, the existing ephemeral-tunnel chain
(`serve.ts` → `*.trycloudflare.com` → localhost:3001) keeps serving the live domain's `/api/*`
and the Stripe endpoint. Old webhook endpoint deleted in §4b.2 only after the new one
verifies.
