// src/index.js
//
// A single Worker script, replacing the old Pages Functions convention
// (functions/api/collection.js), which Cloudflare's build no longer picks
// up automatically for this project. This does the same two jobs:
//   1. Serve everything in dist/ as static assets (via the ASSETS binding).
//   2. Handle /api/collection with the Discogs proxy + edge cache.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/collection') {
      return handleCollection(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleCollection(request, env, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).origin + '/api/collection', request);

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const { DISCOGS_USERNAME, DISCOGS_TOKEN } = env;
  if (!DISCOGS_USERNAME || !DISCOGS_TOKEN) {
    return json(
      { error: 'Missing DISCOGS_USERNAME or DISCOGS_TOKEN environment variable.' },
      500
    );
  }

  try {
    const releases = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const discogsUrl =
        `https://api.discogs.com/users/${encodeURIComponent(DISCOGS_USERNAME)}` +
        `/collection/folders/0/releases?page=${page}&per_page=${perPage}` +
        `&sort=added&sort_order=desc`;

      const res = await fetch(discogsUrl, {
        headers: {
          Authorization: `Discogs token=${DISCOGS_TOKEN}`,
          'User-Agent': 'DiscogsCollectionShowcase/1.0 (+cloudflare-workers)'
        }
      });

      if (!res.ok) {
        const detail = await res.text();
        return json({ error: `Discogs API responded ${res.status}`, detail }, 502);
      }

      const data = await res.json();
      releases.push(...data.releases.map(simplify));

      const pages = data.pagination?.pages ?? 1;
      if (page >= pages || page >= 20) break; // 20-page safety cap (~2,000 records)
      page++;
    }

    const body = JSON.stringify({
      count: releases.length,
      releases,
      generatedAt: new Date().toISOString()
    });

    const response = new Response(body, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return json({ error: 'Unexpected error fetching collection.', detail: String(err) }, 500);
  }
}

function simplify(item) {
  const info = item.basic_information;
  return {
    id: item.instance_id,
    releaseId: info.id,
    title: info.title,
    artist: (info.artists || [])
      .map((a) => a.name.replace(/\s\(\d+\)$/, ''))
      .join(', '),
    year: info.year || null,
    label: info.labels?.[0]?.name || null,
    genres: info.genres || [],
    styles: info.styles || [],
    coverImage: info.cover_image || info.thumb,
    dateAdded: item.date_added
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
