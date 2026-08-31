# Posh Pal API — DigitalOcean (Path C) Provisioning Runbook

Author: agent-engineer · Date: 2026-08-31
Owner-approved: domain **posh-pal.com** (registering); consent to place shared DB
creds (`TEAM_DB_URL` + `TEAM_DB_AUTH_TOKEN`) on the droplet.

Secrets referenced below by name only — full values live in the platform
Secrets store and the local repo `.env`. Never commit or paste raw values.

---

## 1. Verify the DO API token

The owner saved `DIGITALOCEAN_API_TOKEN` in platform Secrets. On this machine
it is injected under the env var name **`DigitalOceanAPI`** (prefix `dop_v1_...`)
rather than the literal `DIGITALOCEAN_API_TOKEN`. Verify presence by masked prefix:

```bash
echo "${DigitalOceanAPI:0:8}..."          # => dop_v1_f...
curl -s -H "Authorization: Bearer ${DigitalOceanAPI}" https://api.digitalocean.com/v2/account
```

If it is unset/injectable, STOP and report to the lead — do not fabricate provisioning.

## 2. Provision the droplet (DO API)

SSH key generated and registered via API:

```bash
ssh-keygen -t ed25519 -f do_poshpal_key -N '' -C "posh-pal-droplet"
PUB=$(cat do_poshpal_key.pub)
curl -s -X POST -H "Authorization: Bearer ${DigitalOceanAPI}" -H "Content-Type: application/json" \
  -d "{\"name\":\"posh-pal-ssh\",\"public_key\":\"$PUB\"}" \
  https://api.digitalocean.com/v2/account/keys
# => ssh key id 58999179
```

Create droplet (Basic `s-1vcpu-1gb` = $6/mo, Ubuntu 24.04, nyc1):

```bash
curl -s -X POST -H "Authorization: Bearer ${DigitalOceanAPI}" -H "Content-Type: application/json" \
  -d '{"name":"posh-pal-api","region":"nyc1","size":"s-1vcpu-1gb","image":"ubuntu-24-04-x64",
       "ssh_keys":[58999179],"backups":false,"tags":["posh-pal"],"monitoring":true,"ipv6":true}' \
  https://api.digitalocean.com/v2/droplets
```

Poll until `active`:
```bash
curl -s -H "Authorization: Bearer ${DigitalOceanAPI}" https://api.digitalocean.com/v2/droplets/596656025
```

- **Droplet id:** `596656025`
- **Public IP:** `159.89.80.50`
- **Size:** `s-1vcpu-1gb` (1 vCPU / 1 GB / 25 GB, $6/mo), region `nyc1`
- **SSH:** `ssh -i do_poshpal_key root@159.89.80.50`

## 3. Install runtime on the droplet

```bash
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get install -y ca-certificates curl gnupg git build-essential unzip
# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
# Bun (for team-db CLI)
curl -fsSL https://bun.sh/install | bash
ln -sf /root/.bun/bin/bun /usr/local/bin/bun
# Caddy
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -y && apt-get install -y caddy
```

> Gotcha: `bun.sh/install` fails with `error: unzip is required` — install `unzip`
> first (above). Verified versions: node v20.20.2, bun 1.4.0, caddy v2.11.4.

## 4. Deploy the app

```bash
# Copy app bundle (server.js, package.json, package-lock.json, dist/, public/, deploy/) + team-db CLI tree
scp -r /opt/team-skills/team-db root@<IP>:/opt/team-skills/team-db   # 70M; tar it for speed
mkdir -p /opt/posh-pal /var/lib/posh-pal
id -u poshpal || useradd -m -s /bin/bash poshpal
cd /opt/posh-pal && tar xzf /root/app.tar.gz
npm install --omit=dev
chown -R poshpal:poshpal /opt/posh-pal /var/lib/posh-pal

# team-db CLI
ln -sf /opt/team-skills/team-db/cli.ts /usr/local/bin/team-db
chmod +x /opt/team-skills/team-db/cli.ts
```

## 5. Secrets — /etc/posh-pal/env (mode 600)

Create the directory first (`scp` cannot create parents):

```bash
mkdir -p /etc/posh-pal
scp -i do_poshpal_key /tmp/poshpal_env root@<IP>:/etc/posh-pal/env
ssh root@<IP> 'chmod 600 /etc/posh-pal/env; chown root:root /etc/posh-pal/env'
```

Keys written (values not shown; source = platform Secrets + repo `.env`):
```
TEAM_DB_URL=libsql://<redacted>          # from Secrets store (consented)
TEAM_DB_AUTH_TOKEN=<redacted>            # from Secrets store (consented)
TEAM_DB_BIN_PATH=/usr/local/bin/team-db
TEAM_DB_PATH=/var/lib/posh-pal/team.db
STRIPE_SECRET_KEY=sk_live_<redacted>     # from repo .env (live)
STRIPE_WEBHOOK_SECRET=whsec_<redacted>   # from repo .env (live)
VITE_STRIPE_PUBLIC_KEY=pk_live_<redacted>
VITE_API_URL=https://api.posh-pal.com    # placeholder; update at DNS cutover
PORT=3001
```

## 6. systemd unit + Caddy

```bash
cp /opt/posh-pal/deploy/posh-pal-api.service /etc/systemd/system/posh-pal-api.service
systemctl daemon-reload && systemctl enable posh-pal-api
systemctl start posh-pal-api
systemctl is-active posh-pal-api            # expect active
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/   # expect 200
```

Caddy interim config (public IP, plain HTTP on :80 — **before DNS**). The repo
`deploy/Caddyfile` uses `__DOMAIN__` for auto-HTTPS; swap to it at DNS cutover:

```
/etc/caddy/Caddyfile
http://159.89.80.50 {
    reverse_proxy 127.0.0.1:3001 {
        header_up Host {host}
        header_up X-Forwarded-Proto {scheme}
    }
    handle /healthz { respond "ok" }
}
```

```bash
systemctl restart caddy
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:80/healthz   # expect 200
```

## 7. Verification results (2026-08-31)

Confirmed on the live droplet after placing `/etc/posh-pal/env`:

```
SVC=active
LOCAL_3001_ROOT: 200      (curl http://127.0.0.1:3001/)
THRU_CADDY_ROOT: 200      (curl http://159.89.80.50/)
```

- `posh-pal-api.service` = active; logs show `Server running on port 3001` + serving dist/index.html
- The env file at `/etc/posh-pal/env` (mode 600) contains all 9 keys
- Caddy config validated (`caddy validate` = Valid configuration) and reloaded;
  the interim config is a simple `reverse_proxy 127.0.0.1:3001` on the public IP (plain HTTP, pre-DNS)

### Rebuild + final verified state (2026-08-31, revision pass)

After placing `/etc/posh-pal/env`:
- `dist/` was rebuilt from the current working tree (`bun run build`, vite build OK)
  and deployed to the droplet (`/opt/posh-pal/dist`, owned by poshpal).
- Service restarted; **no restart-loop**:

```
SVC=active  NRestarts=0
LOCAL3001:          200   (curl http://127.0.0.1:3001/)
THRU_CADDY_ROOT:    200   (curl http://159.89.80.50/)
THRU_CADDY_HEALTHZ: 200   (curl http://159.89.80.50/healthz)
```

- `/etc/posh-pal/env` confirmed present (mode 600, root:root, all 9 keys).
- Root cause of the earlier restart-loop was the missing env file
  (`Failed to load environment files`); resolved by `mkdir -p /etc/posh-pal`
  before scp-ing the env file.

## 8. STOP before cutover

Do NOT proceed to: posh-pal.com DNS cutover, Stripe webhook repointing to this
host, or live-site proxy swap. Domain is still registering. No real paid checkout.

## Outstanding / next steps

- Rebuild `dist/` from the current working tree before production cutover (the
  deployed `dist/` is the Aug-21 build).
- At DNS cutover: point `api.posh-pal.com` A record at `159.89.80.50`, switch
  Caddy to the `__DOMAIN__` auto-HTTPS config (repo `deploy/Caddyfile`), point
  the Stripe webhook endpoint here, and update `VITE_API_URL`.
