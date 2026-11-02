# gregory-marchese.com

A personal site deployed as a single Cloudflare **Worker**: one launchpad
page at the root, a couple of small apps under subpaths, and one Worker
script that serves everything and keeps a cached copy of your Discogs
collection fresh.

```
.
├── sites/
│   └── launchpad/               → deploys to  /            (plain HTML, no build)
├── apps/
│   ├── record-collection/       → deploys to  /RecordCollection/  (Vite + React)
│   └── resume/                   → deploys to  /resume/     (Vite + React)
├── src/
│   └── index.js                  → the Worker: static assets, /api/collection (reads KV), cron refresh
├── scripts/
│   └── build.mjs                 → builds each app and assembles everything into dist/
├── wrangler.jsonc                 → Worker config: assets, plain vars, KV binding, cron schedule
└── package.json
```

## How it fits together

`npm run build` (`scripts/build.mjs`) does the following, in order:

1. Builds `apps/record-collection` with Vite, if its `package.json` is present.
2. Builds `apps/resume` with Vite, if its `package.json` is present.
3. Copies `sites/launchpad/` to the root of `dist/`.
4. Copies the built record collection app to `dist/RecordCollection/`.
5. Copies the built resume app to `dist/resume/`.

Each step is skipped gracefully (with a warning, not a failure) if that
piece isn't set up yet, so any one section can be worked on independently.

`wrangler deploy` then reads `wrangler.jsonc`, bundles `src/index.js` as
the Worker, and binds `dist/` to it as static assets (`env.ASSETS`).
`src/index.js` checks the request path: `/api/collection` is answered from
KV (see below); everything else falls through to
`env.ASSETS.fetch(request)`.

### How the collection stays fresh (and why it can't hit Discogs' rate limit)

Visitors never trigger Discogs calls. Instead:

1. A **cron trigger** (`"triggers"` in `wrangler.jsonc`, every 6 hours by
   default) runs the Worker's `scheduled()` handler, which pages through
   your Discogs collection and writes the result to **Workers KV**
   (binding `COLLECTION`, key `collection:v1`).
2. `/api/collection` just reads that KV value. Discogs sees roughly two
   requests per refresh, however much traffic the site gets.
3. If a refresh fails (Discogs down, rate limited, bad token), the
   handler retries with backoff, then gives up **without touching KV**, so
   the site keeps serving the last good copy. The failed run shows up in
   the Worker's logs.
4. Only on the very first deploy, when KV is still empty, the first
   request fills it once (concurrent visitors share that one fetch). If
   that fails, the API returns `503` with `Retry-After` and the front end
   shows sample data until the next successful refresh.

To change how often it refreshes, edit the cron expression in
`wrangler.jsonc` (e.g. `"0 * * * *"` for hourly) and push. New records
show up after the next refresh plus up to ~6 minutes of browser/edge
caching.

**`wrangler.jsonc` must stay committed.** If it's ever missing, Cloudflare
generates a bare-bones one at build time that serves assets only — no
Worker code, no `/api/collection` route, and any request to it 404s with
no JSON body at all (a sign this has happened, if you ever see it again).

## Prerequisites

- Node.js 18+
- A Cloudflare account, with this repo connected as a Worker project
  (Workers & Pages → Create → Workers → Connect to Git)
- A Discogs personal access token (see "Discogs credentials" below)

## Local development

Each piece can be run on its own while you're working on it:

```bash
# Launchpad — just open the file, no server needed
open sites/launchpad/index.html

# Record collection — Vite's normal fast-refresh loop
cd apps/record-collection && npm install && npm run dev

# Resume — same idea
cd apps/resume && npm install && npm run dev
```

In these per-app dev modes, `/api/collection` isn't reachable (there's no
Worker running), so the record collection page falls back to sample data
automatically — that's expected, not a bug.

To run the **whole site** as it will actually behave in production,
including the Worker, KV and the refresh job:

```bash
npm install
npm run preview     # = npm run build && npx wrangler dev --test-scheduled
```

This needs a `.dev.vars` file at the repo root (never commit this one):

```
DISCOGS_TOKEN=your-real-token
```

Then visit `http://localhost:8787` (Wrangler will print the exact port).
The launchpad, `/resume/`, `/RecordCollection/`, and `/api/collection`
all behave exactly as they will once deployed.

Locally, KV is a simulated store that is separate from production. The
first request to `/api/collection` fills it, same as a fresh deploy. To
run the cron job on demand while `wrangler dev` is running:

```bash
curl "http://localhost:8787/__scheduled?cron=0+*/6+*+*+*"
```

## Environment variables — read this before touching them

There are **two different places** variables can live, and they behave
very differently. Getting this backwards is the single most common
source of "I set it, why doesn't it work" here:

| | Where it lives | Survives a redeploy? |
|---|---|---|
| `DISCOGS_USERNAME` | Committed in `wrangler.jsonc`, under `"vars"` | Yes — it's baked into the deploy itself |
| `DISCOGS_TOKEN` | Cloudflare dashboard → Worker → Settings → Variables and Secrets, added as type **Secret** | Yes, *only* if it's type Secret |

The rule, straight from Cloudflare's own Wrangler docs: plain
(non-secret) variables set in the dashboard get **overridden** by
whatever's in `wrangler.jsonc` on every deploy. Secrets are never
touched by a deploy, regardless.

What this means in practice:

- To change your Discogs **username**, edit the `"vars"` block in
  `wrangler.jsonc` directly and push the commit. Changing it in the
  dashboard instead does nothing useful — the next deploy overwrites it
  back to whatever's in the file.
- To set your Discogs **token**, add it in the dashboard as type
  **Secret**, not Text. If it's added as Text, it'll quietly get wiped
  the next time anything triggers a deploy, since it isn't (and
  shouldn't be) declared in the committed config.

### Discogs credentials

- **Username**: your exact Discogs login username, case-sensitive — find
  it in the URL of your own profile page (`discogs.com/user/<this>`), not
  your display name.
- **Token**: a *personal access token*, not a Consumer Key/Secret pair.
  Generate one at
  [discogs.com/settings/developers](https://www.discogs.com/settings/developers)
  under "Personal Access Token" — copy it immediately, as Discogs won't
  show it again.
- Your Discogs collection privacy must be set to **public** (Discogs
  Settings → Privacy), or the API will 403/404 even with correct
  credentials.

## Production deployment

### First-time setup

1. In the Cloudflare dashboard: Workers & Pages → Create → Workers →
   Connect to Git → select this repo.
2. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy` (Cloudflare's default for a
     Worker project with a committed `wrangler.jsonc` — you shouldn't
     need to set this explicitly)
3. Add `DISCOGS_TOKEN` under Settings → Variables and Secrets, type
   **Secret**.
4. Confirm `DISCOGS_USERNAME` in `wrangler.jsonc` is correct, commit if not.
5. Attach your custom domain (gregory-marchese.com) under Settings →
   Domains & Routes.

The KV namespace needs no manual setup: `wrangler.jsonc` declares the
`COLLECTION` binding without an ID, and wrangler (4.45.0+) creates the
namespace on the first deploy. If your build log instead fails on the KV
binding, create it yourself and pin it:

```bash
npx wrangler kv namespace create COLLECTION
```

then add the `id` it prints to the binding in `wrangler.jsonc`:
`{ "binding": "COLLECTION", "id": "<that id>" }`.

### Every deploy after that

Just push to your production branch. Cloudflare Workers Builds runs
`npm run build` then `npx wrangler deploy` automatically. No manual steps
needed unless you're changing credentials (see above) or build settings.

### Verifying a deploy worked

Check the build log's final lines. Under "Your Worker has access to the
following bindings" a healthy deploy lists all four:

- `env.COLLECTION` (resource type **KV Namespace**)
- `env.ASSETS` (Assets)
- `env.DISCOGS_USERNAME` (Environment Variable)
- `env.DISCOGS_TOKEN` (Secret)

The deploy output should also mention the cron schedule, and it's visible
in the Worker's cron/trigger settings in the Cloudflare dashboard.

If `DISCOGS_TOKEN` is missing from the bindings, it either isn't set, or
isn't set as type Secret — see "Environment variables" above. If
`env.COLLECTION` is missing, see the KV note under "First-time setup".

## Troubleshooting

**`/api/collection` returns a plain Cloudflare 404 (no JSON body)**
The Worker never received the request — `wrangler.jsonc` is either
missing or wasn't picked up. Confirm it's committed at the repo root
with `"main": "src/index.js"` and an `"assets"` block, and check the
build log for a bindings list at the end (see above).

**`/api/collection` returns `503` — "The collection is not available yet"**
KV is empty and the first fill failed (it retries after a minute). This is
the expected state right after the first deploy if Discogs is unreachable
or the credentials are wrong. The reason is in the Worker's logs (Cloudflare
dashboard → the Worker → Observability → Logs); the entries below explain the usual ones.
Once any refresh succeeds the 503 goes away and stays away, because a
failed refresh never overwrites good data.

**`/api/collection` returns `500` mentioning the `COLLECTION` binding**
The KV binding isn't attached to the deployed Worker. Check the build log's
bindings list, and see the KV note under "First-time setup".

**Discogs errors now appear in the logs, not in the API response**
Since the API only reads KV, problems talking to Discogs show up as failed
cron runs (or a failed first fill) in the Worker's logs. The usual ones:

- `Missing DISCOGS_USERNAME or DISCOGS_TOKEN environment variable` — one of
  the two isn't bound. Check the build log's bindings list, then fix per
  "Environment variables" above.
- `Discogs API responded 401` — the token is invalid, revoked, or was pasted
  with a stray space/newline. Regenerate it and re-add it as a Secret.
- `Discogs API responded 404` / `User does not exist` — `DISCOGS_USERNAME`
  doesn't match a real Discogs account. Check the exact, case-sensitive
  username in the profile URL and update it in `wrangler.jsonc` (not the
  dashboard — see why above).
- `Discogs API responded 429` — rate limited. The job already retries with
  backoff; if it still fails, the previous data keeps being served and the
  next scheduled run tries again. Visitors can no longer cause this.

**The site shows sample records instead of mine**
The front end falls back to sample data whenever `/api/collection` isn't
returning records — see the `503` entry above.

**It worked once, then stopped after a later push**
Almost always: a plain variable in the dashboard got overwritten by what's
in `wrangler.jsonc`, or a secret was accidentally added as type Text
instead of Secret and got wiped on the next deploy.

## Adding a new section later

1. Build it as its own Vite app under `apps/<name>/`, or a plain static
   page under `sites/<name>/`.
2. Add one line to the `copies` array in `scripts/build.mjs` (and a
   `buildApp('<name>')` call if it needs a Vite build).
3. Add a tile linking to it in `sites/launchpad/index.html`.

Nothing else changes — same Worker, same deploy process.
