# gregory-marchese.com

One Cloudflare Pages project, several sections, assembled by one build script.

```
.
├── sites/
│   ├── launchpad/            → deploys to  /            (plain HTML, no build)
│   └── record-collection/    → deploys to  /RecordCollection/  (plain HTML, no build)
├── apps/
│   └── resume/                → deploys to  /resume/     (Vite app — you bring this)
├── src/
│   └── index.js               → the Worker: serves static assets + runs /api/collection
├── scripts/
│   └── build.mjs              → assembles everything above into dist/
├── wrangler.jsonc              → tells Cloudflare about src/index.js and the assets dir
└── package.json
```

## How it fits together

This deploys as a single Cloudflare **Worker** with a static-assets binding
(the modern replacement for the old Pages + `/functions` pattern, which
Cloudflare's build no longer picks up automatically for new projects).

`npm run build` does three things:
1. Builds `apps/resume` with Vite, if it's set up.
2. Copies `sites/launchpad` to the root of `dist/`.
3. Copies `sites/record-collection` to `dist/RecordCollection/`.
4. Copies the built resume app to `dist/resume/`.

Then `wrangler deploy` (which Cloudflare runs automatically after the
build) reads `wrangler.jsonc`, bundles `src/index.js` as the Worker, and
tells it to serve everything else out of `dist/` via the `ASSETS` binding.
`src/index.js` checks the request path first: `/api/collection` runs the
Discogs proxy logic directly; everything else falls through to
`env.ASSETS.fetch(request)`. That fetch call in the front end uses an
absolute path (`/api/collection`), so it works the same regardless of
which section of the site calls it.

**Important:** `wrangler.jsonc` must stay committed to the repo. If it's
missing, Cloudflare's build silently generates a bare-bones one that
serves assets only, with no Worker code and no `/api/collection` route —
which is what happens if you ever delete or `.gitignore` it by mistake.

Adding a new section later (a blog, a project page, whatever) means:
put it somewhere under this repo, add one line to the `copies` array in
`scripts/build.mjs`, add a tile to `sites/launchpad/index.html`. Nothing
else changes.

## Moving your resume in

1. Copy your existing Vite resume project's contents into `apps/resume/`
   (its `package.json`, `src/`, `vite.config.js`, etc. — same as it is
   today, just relocated).
2. In `apps/resume/vite.config.js`, set the base path so its built asset
   URLs resolve correctly under `/resume/`:

   ```js
   export default defineConfig({
     base: '/resume/',
     // ...your existing config
   });
   ```

   Without this, the built `index.html` will look for its JS/CSS at the
   domain root instead of `/resume/`, and you'll get a blank page.

3. That's it — `npm run build` at the repo root now builds it as part of
   the whole site.

## Local development

Each section can be worked on independently:

- **Launchpad / Record Collection** — just open the HTML file directly,
  or run a static server if you want to click between tiles realistically.
- **Resume** — `cd apps/resume && npm run dev` for Vite's normal fast
  refresh loop. (Paths will be off by the `/resume/` prefix in this mode;
  that only matters once it's built into the full site.)
- **Full site with the Worker** — from the repo root:

  ```
  npm run build
  npx wrangler dev
  ```

  Add a `.dev.vars` file at the repo root first with:

  ```
  DISCOGS_USERNAME=yourusername
  DISCOGS_TOKEN=yourtoken
  ```

  Then visit `http://localhost:8788` — the launchpad, `/resume/`,
  `/RecordCollection/`, and `/api/collection` all work exactly as they
  will in production.

## Deploying

Connect this repo to Cloudflare (Workers & Pages → Create → Workers →
Connect to Git), with git integration:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (this is Cloudflare's default for
  Worker projects — you shouldn't need to set it explicitly)
- Environment variables: `DISCOGS_USERNAME`, `DISCOGS_TOKEN`, set on the
  Worker (Settings → Variables and Secrets)

Push to your production branch and Cloudflare rebuilds and redeploys
automatically.
