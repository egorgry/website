# gregory-marchese.com

One Cloudflare Pages project, several sections, assembled by one build script.

```
.
├── sites/
│   ├── launchpad/            → deploys to  /            (plain HTML, no build)
│   └── record-collection/    → deploys to  /RecordCollection/  (plain HTML, no build)
├── apps/
│   └── resume/                → deploys to  /resume/     (Vite app — you bring this)
├── functions/
│   └── api/
│       └── collection.js     → runs at     /api/collection  (Discogs proxy)
├── scripts/
│   └── build.mjs             → assembles everything above into dist/
└── package.json
```

## How it fits together

`npm run build` does three things:
1. Builds `apps/resume` with Vite, if it's set up.
2. Copies `sites/launchpad` to the root of `dist/`.
3. Copies `sites/record-collection` to `dist/RecordCollection/`.
4. Copies the built resume app to `dist/resume/`.

Cloudflare Pages then deploys `dist/` as the site, and separately picks up
`functions/` (which must stay at the repo root, not inside `dist/`) to run
`/api/collection` as an edge Function. That fetch call already uses an
absolute path (`/api/collection`), so it works the same regardless of
which section of the site calls it.

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
- **Full site with the Function** — from the repo root:

  ```
  npm run build
  npx wrangler pages dev dist
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

Connect this repo to a Cloudflare Pages project (git integration):

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: (leave blank — repo root)
- Environment variables: `DISCOGS_USERNAME`, `DISCOGS_TOKEN`

Push to your production branch and Cloudflare rebuilds and redeploys
automatically.
