// src/index.js
//
// One Worker, three jobs:
//   1. Serve everything in dist/ as static assets (the ASSETS binding).
//   2. Answer /api/collection from Workers KV. Requests NEVER call Discogs
//      directly (apart from a one-time bootstrap when KV is still empty), so
//      site traffic can't burn through Discogs' rate limit.
//   3. On a cron schedule (see "triggers" in wrangler.jsonc), refresh the
//      collection from Discogs into KV. If a refresh fails, the previous
//      data stays in place and keeps being served.

const KV_KEY = 'collection:v1';
const PER_PAGE = 100;
const MAX_PAGES = 20; // safety cap: ~2,000 records

// Browsers may reuse a response this long before asking again. KV's own edge
// cache adds up to ~60s on top, so a fresh refresh shows up within minutes.
const BROWSER_MAX_AGE_SECONDS = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/collection') {
      return handleCollection(env);
    }

    return env.ASSETS.fetch(request);
  },

  // Runs on the cron schedule. Throwing marks the run as failed in the
  // dashboard/observability, which is what we want when Discogs is down.
  async scheduled(controller, env, ctx) {
    const { count } = await refreshCollection(env, { attempts: 3 });
    console.log(`Collection refreshed: ${count} records`);
  }
};

// ---------- request path: read only ----------

async function handleCollection(env) {
  if (!env.COLLECTION) {
    return json({ error: 'KV binding COLLECTION is not configured on this Worker.' }, 500);
  }

  let body = await env.COLLECTION.get(KV_KEY, 'text');

  // First deploy: nothing in KV yet and the cron hasn't fired. Fill it once.
  if (!body) {
    body = await bootstrap(env);
  }

  if (!body) {
    return json(
      { error: 'The collection is not available yet. It refreshes automatically; try again shortly.' },
      503,
      { 'Retry-After': '60', 'Cache-Control': 'no-store' }
    );
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${BROWSER_MAX_AGE_SECONDS}`,
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Best-effort guard for the empty-KV case: concurrent requests in one isolate
// share a single refresh, and after a failure we back off for a minute rather
// than hammering Discogs on every visit. (Separate isolates can each try once;
// that's bounded and only happens before the first successful refresh.)
const BOOTSTRAP_COOLDOWN_MS = 60_000;
let bootstrapInFlight = null;
let bootstrapFailedAt = 0;

function bootstrap(env) {
  if (Date.now() - bootstrapFailedAt < BOOTSTRAP_COOLDOWN_MS) return Promise.resolve(null);

  if (!bootstrapInFlight) {
    // One attempt only: a visitor is waiting, so fail fast instead of backing off.
    bootstrapInFlight = refreshCollection(env, { attempts: 1 })
      .then(({ body }) => body)
      .catch((err) => {
        console.error('Bootstrap refresh failed:', String(err));
        bootstrapFailedAt = Date.now();
        return null;
      })
      .finally(() => {
        bootstrapInFlight = null;
      });
  }
  return bootstrapInFlight;
}

// ---------- refresh path: the only code that talks to Discogs ----------

async function refreshCollection(env, { attempts }) {
  const { DISCOGS_USERNAME, DISCOGS_TOKEN } = env;
  if (!DISCOGS_USERNAME || !DISCOGS_TOKEN) {
    throw new Error('Missing DISCOGS_USERNAME or DISCOGS_TOKEN environment variable.');
  }
  if (!env.COLLECTION) {
    throw new Error('KV binding COLLECTION is not configured on this Worker.');
  }

  const releases = [];
  let page = 1;

  while (true) {
    const data = await fetchPage(DISCOGS_USERNAME, DISCOGS_TOKEN, page, attempts);
    releases.push(...data.releases.map(simplify));

    const pages = data.pagination?.pages ?? 1;
    if (page >= pages || page >= MAX_PAGES) break;
    page++;
  }

  // Only reached if every page succeeded, so KV never holds a partial list.
  const body = JSON.stringify({
    count: releases.length,
    releases,
    generatedAt: new Date().toISOString()
  });
  await env.COLLECTION.put(KV_KEY, body);

  return { count: releases.length, body };
}

async function fetchPage(username, token, page, attempts) {
  const url =
    `https://api.discogs.com/users/${encodeURIComponent(username)}` +
    `/collection/folders/0/releases?page=${page}&per_page=${PER_PAGE}` +
    `&sort=added&sort_order=desc`;

  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Discogs token=${token}`,
        // Discogs requires a descriptive User-Agent on every request.
        'User-Agent': 'DiscogsCollectionShowcase/1.0 (+cloudflare-workers)'
      }
    });

    if (res.ok) return res.json();

    const retriable = res.status === 429 || res.status >= 500;
    if (!retriable || attempt >= attempts) {
      const detail = (await res.text()).trim().slice(0, 300);
      throw new Error(`Discogs API responded ${res.status}${detail ? `: ${detail}` : ''}`);
    }

    // Back off, honouring Retry-After if Discogs sends one. Discogs' limit is
    // a rolling one-minute window, so the default waits are deliberately long.
    const retryAfter = Number(res.headers.get('Retry-After'));
    const waitSeconds =
      Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 60) : 15 * attempt;
    await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
  }
}

function simplify(item) {
  const info = item.basic_information;
  return {
    id: item.instance_id,
    releaseId: info.id,
    title: info.title,
    artist: (info.artists || [])
      .map((a) => a.name.replace(/\s\(\d+\)$/, '')) // strip Discogs disambiguation numbers, e.g. "Rush (2)"
      .join(', '),
    year: info.year || null,
    label: info.labels?.[0]?.name || null,
    genres: info.genres || [],
    styles: info.styles || [],
    coverImage: info.cover_image || info.thumb,
    dateAdded: item.date_added
  };
}

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
  });
}
