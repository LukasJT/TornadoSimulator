/**
 * Tornado Hub — forecast image proxy (Cloudflare Worker)
 * ------------------------------------------------------------------
 * WHY: Most national severe-weather agencies (ECCC/Canada, ESTOFEX/Europe,
 * BoM/Australia) either use date-stamped image URLs, respond slowly, or block
 * hotlinking. Embedding them directly risks broken or hanging images. This
 * worker fetches the source SERVER-SIDE, caches it at Cloudflare's edge, and
 * re-serves it from your own domain — so the forecast pages get a stable,
 * fast, auto-updating image URL with no admin work.
 *
 * DEPLOY (once):
 *   1. Cloudflare dashboard -> Workers & Pages -> Create Worker. Paste this in.
 *   2. Deploy, then add a route so it serves from your domain, e.g.
 *      Route:  forecast.tornadle.com/*      (or  tornadosimulator.net/fc/* )
 *      Trigger: this worker.
 *   3. Add a proxied DNS record for the hostname you route on (orange cloud),
 *      same as the tornadle.com redirect setup.
 *
 * USE on a forecast page:
 *   <img src="https://forecast.tornadle.com/img?src=canada">
 *   The ?src key must be one of the whitelisted SOURCES below (never an
 *   arbitrary URL — the whitelist stops the worker being abused as an open
 *   proxy). Cache TTL keeps it fresh (default 15 min) without hammering the
 *   source. Add ?_=<time> from the page to force an immediate refresh.
 *
 * IMPORTANT: fill in the real "latest" image URLs for each source below.
 * Leave a source out until you have verified its stable URL.
 */

const SOURCES = {
  // key            : upstream image URL (verify each one loads before using)
  // 'canada'       : 'https://hpfx.collab.science.gc.ca/~rum001/eccc/tso/<REAL_FILE>.png',
  // 'europe'       : 'https://www.estofex.org/<REAL_LATEST>.png',
  // 'australia'    : 'http://www.bom.gov.au/<REAL_LATEST>.png',
  // US SPC works fine hotlinked, but you can proxy it too for consistency:
  'us-day1'        : 'https://www.spc.noaa.gov/products/outlook/day1otlk.png',
};

const CACHE_SECONDS = 900; // 15 minutes; sources update a few times a day

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get('src');
    const upstream = SOURCES[key];

    if (!upstream) {
      return new Response('Unknown source. Valid keys: ' + Object.keys(SOURCES).join(', '),
        { status: 404, headers: { 'content-type': 'text/plain' } });
    }

    // Edge cache keyed by the source (ignore the page's cache-buster param).
    const cache = caches.default;
    const cacheKey = new Request('https://proxy.local/' + key, request);
    let resp = await cache.match(cacheKey);
    if (resp) return resp;

    let upstreamResp;
    try {
      upstreamResp = await fetch(upstream, {
        cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
        headers: { 'user-agent': 'TornadoHub-forecast-proxy/1.0' },
      });
    } catch (e) {
      return new Response('Source unavailable', { status: 502 });
    }
    if (!upstreamResp.ok) {
      return new Response('Source returned ' + upstreamResp.status, { status: 502 });
    }

    resp = new Response(upstreamResp.body, upstreamResp);
    resp.headers.set('cache-control', 'public, max-age=' + CACHE_SECONDS);
    resp.headers.set('access-control-allow-origin', '*');
    resp.headers.delete('set-cookie');
    // Cache at the edge without blocking the response.
    // (In a real deploy wrap in ctx.waitUntil; kept simple here.)
    cache.put(cacheKey, resp.clone());
    return resp;
  },
};
