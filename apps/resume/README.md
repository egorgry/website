# Gregory Marchese — Resume Site

A single-page resume built with React + Vite. Content lives in `src/data/resume.js`
— edit that file to update roles, skills, or contact info without touching layout code.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs static files to `dist/`.

## Deploying to Cloudflare Pages

**Option A — Git integration (recommended)**

1. Push this project to a GitHub/GitLab repo.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo, then set:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. Every push to your main branch will auto-deploy; PRs get preview URLs.

**Option B — Direct upload via Wrangler CLI**

```bash
npm run build
npx wrangler pages deploy dist --project-name=gregory-marchese
```

You'll be prompted to log in to Cloudflare on first run.

**Custom domain (gregory-marchese.com)**

Once the Pages project is live, go to the project's **Custom domains** tab and add
`gregory-marchese.com` (and `www` if you use it). Cloudflare will walk you through
updating DNS — if the domain's nameservers are already on Cloudflare this is a couple
of clicks; if it's still on DreamHost's DNS, you'll add a CNAME record pointing to your
`*.pages.dev` address, or move the domain to Cloudflare DNS for the smoothest setup.

## Notes

- No backend, forms, or database — it's a static site, so Pages' free tier is plenty.
- Fonts (IBM Plex Sans/Mono) load from Google Fonts at runtime; no local font files needed.
