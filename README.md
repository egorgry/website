# gregory-marchese.com

A personal site deployed as a single Cloudflare **Worker**: one launchpad
page at the root, a couple of small apps under subpaths, and one Worker
script that serves everything and handles the Discogs API proxy.

```
.
├── sites/
│   └── launchpad/               → deploys to  /            (plain HTML, no build)
├── apps/
│   ├── record-collection/       → deploys to  /RecordCollection/  (Vite + React)
│   └── resume/                   → deploys to  /resume/     (Vite + React)
├── src/
│   └── index.js                  → the Worker: serves static assets + runs /api/collection
├── scripts/
│   └── build.mjs                 → builds each app and assembles everything into dist/
├── wrangler.jsonc                 → Worker config: entry point, assets binding, plain vars
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
`src/index.js` checks the request path: `/api/collection` runs the
Discogs proxy directly; everything else falls through to
`env.ASSETS.fetch(request)`.

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
including the Worker and the Discogs proxy:

```bash
npm run build
npx wrangler dev
```

This needs a `.dev.vars` file at the repo root (never commit this one):

```
DISCOGS_TOKEN=your-real-token
```

Then visit `http://localhost:8787` (Wrangler will print the exact port).
The launchpad, `/resume/`, `/RecordCollection/`, and `/api/collection`
all behave exactly as they will once deployed.

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

### Every deploy after that

Just push to your production branch. Cloudflare Workers Builds runs
`npm run build` then `npx wrangler deploy` automatically. No manual steps
needed unless you're changing credentials (see above) or build settings.

### Verifying a deploy worked

Check the build log's final lines. A healthy deploy shows all three
bindings:

```
Your Worker has access to the following bindings:
Binding                Resource
env.ASSETS              Assets
env.DISCOGS_USERNAME    Environment Variable
env.DISCOGS_TOKEN       Secret
```

If `DISCOGS_TOKEN` is missing from that list, it either isn't set, or
isn't set as type Secret — see "Environment variables" above.

## Troubleshooting

**`/api/collection` returns a plain Cloudflare 404 (no JSON body)**
The Worker never received the request — `wrangler.jsonc` is either
missing or wasn't picked up. Confirm it's committed at the repo root
with `"main": "src/index.js"` and an `"assets"` block, and check the
build log for a bindings list at the end (see above).

**`{"error":"Missing DISCOGS_USERNAME or DISCOGS_TOKEN environment variable."}`**
One of the two isn't bound. Check the build log's bindings list to see
which is actually missing, then fix per "Environment variables" above.

**`{"error":"Discogs API responded 401", ...}`**
The token is invalid, revoked, or was pasted with a stray space/newline.
Regenerate it and re-add it as a Secret.

**`{"error":"Discogs API responded 404", "detail":"User does not exist..."}`**
`DISCOGS_USERNAME` doesn't match a real Discogs account. Double-check the
exact, case-sensitive username in the profile URL and update it in
`wrangler.jsonc` (not the dashboard — see why above).

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
