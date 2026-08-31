# Deploying the Posh Pal API to a Hetzner VPS (Path C)

Decision support / execution plan for hosting `server.js` durably on a small Hetzner
Cloud VPS with `team-db` + Caddy, giving a stable `https://api.SOMEDOMAIN` URL that the
live site's `/api` proxy and the Stripe webhook endpoint can rely on permanently
(instead of today's ephemeral `*.trycloudflare.com` quick tunnel).

**Status: PREP ONLY — no server provisioned, no spend run.** Blocked on owner inputs (below).

---

## What the owner must provide (to unblock)
Two things (lead will route from owner):

1. **A Hetzner Cloud account + API token** (scoped: `read`, `write` for servers + SSH keys).
   Alternative approved providers are fine (DigitalOcean droplet / AWS Lightsail) — the
   plan is provider-agnostic; only the provisioning trivialities differ.
2. **A domain** for the stable API hostname, e.g. `api.poshpal.com` (and DNS control so we
   can add an `A` record `api.poshpal.com → <VPS public IP>`). Caddy issues the free TLS
   cert automatically.

**Critical dependency the owner must be aware of — `team-db` Turso credential.**
`server.js` runs **every** query through the `team-db` CLI, which syncs the team's **shared
Turso SQLite DB** to a local file. For the VPS to serve the API **without a data refactor**
AND against the **same data**, the VPS needs the team's
`TEAM_DB_URL` (`libsql://...turso.io`) + `TEAM_DB_AUTH_TOKEN`. These are team-held secrets
(already in this sandbox's env) — we provision them onto the owner's VPS verbatim
(masked in any log). Without them, `team-db` on the VPS would just create an empty local DB
and the app would lose all data. This is the non-obvious requirement that makes Path C's
"install team-db to avoid refactor" actually work.

> Verified from the current sandbox: `team-db` is a **Bun** TypeScript CLI
> (`/opt/team-skills/team-db/cli.ts`, uses `@tursodatabase/sync`). It's portable to an
> x86_64 Linux VPS via bun — copy the CLI dir + set the Turso env secrets.

---

## Target architecture
```
Internet → api.poshpal.com (Caddy :443, auto Let's Encrypt TLS)
              │  reverse_proxy (raw body preserved → Stripe sig intact)
              ▼
         127.0.0.1:3001  →  Express server.js (systemd: posh-pal-api.service)
                                    │ runQuery() → `team-db "..."`
                                    ▼
              local SQLite replica (/var/lib/posh-pal/team.db) ↔ 🔄 sync ↔ Turso (shared DB)
```

## Files (this `deploy/` dir)
| File | Purpose |
|---|---|
| `provision-vps.sh` | Installs Node/bun/Caddy, app user, copies code, creates env/systemd/Caddy config. |
| `install-team-db.sh` | Installs the `team-db` CLI on the VPS (after it's carried over via `scp -r`). |
| `Caddyfile` | Reverse proxy (TLS + raw-body passthrough for webhook signature). |
| `posh-pal-api.service` | systemd unit (auto-restart, env from `/etc/posh-pal/env`). |
| `DEPLOY-RUNBOOK.md` | **Execution-ready** checklist: team-db feasibility verdict, data/persistence, exact env values, cut-over steps, owner-blocking inputs. Start here. |

## team-db feasibility (the crux)
**`team-db` runs on any Linux x86_64 host → Path C avoids the data refactor.** It is a Bun
TypeScript CLI (`/opt/team-skills/team-db/cli.ts`) using `@tursodatabase/sync` (bundled
native `sync-linux-x64-gnu` binary) that syncs the shared Turso DB to a local file. Reach the
DB from anywhere via `TEAM_DB_URL` + `TEAM_DB_AUTH_TOKEN`; `TEAM_DB_EVENTS_URL/TOKEN` are
optional. The VPS becomes another replica of the **same** DB, so no migration — the only
pitfall is keeping `TEAM_DB_PATH` on persistent storage. Full analysis in `DEPLOY-RUNBOOK.md` §1.

## Code change (this PR)
- `server.js`: `TEAM_DB_PATH` is now `process.env.TEAM_DB_BIN_PATH || '/home/agent-engineer/.local/bin/team-db'`
  so the VPS (where the binary path differs) can point at its own install. Default unchanged → zero behavior change in the sandbox.

## Setup steps (once unblocked)
1. **Provision the VPS** (Hetzner console or API with the owner's token):
   small CX22 (2 vCPU / 4GB / 40GB, ~€3.8/mo) — Ubuntu 24.04 x86_64; add SSH key.
2. **Copy files** to the box and run `provision-vps.sh` with `DOMAIN=api.poshpal.com`.
3. **Fill `/etc/posh-pal/env`** with: `TEAM_DB_BIN_PATH`, `TEAM_DB_URL`, `TEAM_DB_AUTH_TOKEN`,
   `TEAM_DB_PATH=/var/lib/posh-pal/team.db`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `VITE_STRIPE_PUBLIC_KEY`, `VITE_API_URL=https://api.poshpal.com`. (mode 600)
4. `systemctl start posh-pal-api` + `systemctl reload caddy`; add the DNS `A` record.
5. **Verify API + webhook signature delivery** on the new host:
   - `curl https://api.poshpal.com/api/inventory` returns data (proves team-db sync + routing).
   - Repoint the live **Stripe webhook endpoint** to `https://api.poshpal.com/api/stripe/webhook`,
     capture a fresh `whsec_…`, update `.env`; trigger a real `customer.created` and confirm it
     logs signature-verified (method in `stripe-webhook-public-delivery` skill).
6. **Point the live site proxy**: set `POSH_PAL_API_URL=https://api.poshpal.com` in
   `/home/team/shared/site/serve.ts` and re-publish the site.

## Final values to wire in
- **`POSH_PAL_API_URL`** (in `/home/team/shared/site/serve.ts`) = `https://api.poshpal.com`
  (or whichever domain the owner grants).
- **Stripe webhook URL** = `https://api.poshpal.com/api/stripe/webhook`
- **API listen** = `127.0.0.1:3001` behind Caddy (internal only).

## Cost (estimate — verify live)
- Hetzner CX22 ~ **€3.8/mo** (~$4.4); + domain ~$10/yr. Caddy + Cloudflare-free-plan (not
  needed here since Caddy terminates TLS) at no extra API cost. **No spend until owner
  confirms plan + provides token/domain.**

## Safety / rollback
- Fully reversible: current ephemeral-tunnel setup keeps working until we cut over; Stripe
  endpoint and `serve.ts` are the only two live pointers changed last.
- Secrets never committed; `.env`/`/etc/posh-pal/env` are gitignored + mode 600.
