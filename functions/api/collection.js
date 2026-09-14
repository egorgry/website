// functions/api/collection.js
//
// Cloudflare Pages Function — runs server-side, so your Discogs token
// never reaches the browser. Deployed automatically when this file
// lives at /functions/api/collection.js in a Pages project.
//
// Required environment variables (set in Cloudflare Pages > Settings > Environment variables):
//   DISCOGS_USERNAME  – your Discogs username
//   DISCOGS_TOKEN     – a personal access token from
//                       https://www.discogs.com/settings/developers
//
// The response is cached at the edge for an hour, so refreshing your
// site doesn't hammer the Discogs API or blow through its rate limit.

export async function onRequestGet(context) {
  const { request, env } = context;

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
      const url =
        `https://api.discogs.com/users/${encodeURIComponent(DISCOGS_USERNAME)}` +
        `/collection/folders/0/releases?page=${page}&per_page=${perPage}` +
        `&sort=added&sort_order=desc`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Discogs token=${DISCOGS_TOKEN}`,
          // Discogs requires a descriptive User-Agent on every request.
          'User-Agent': 'DiscogsCollectionShowcase/1.0 (+cloudflare-pages)'
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

    context.waitUntil(cache.put(cacheKey, response.clone()));
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

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
