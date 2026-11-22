// Crown market proxy (Cloudflare Worker).
// GET /market?q=<brand + reference>&ref=<reference>&name=<model name>
// Searches live eBay listings with the official Browse API, removes replicas, straps, parts and
// outliers, and returns the typical asking price plus a few listings to show in the app.
// Secrets (set with `wrangler secret put`): EBAY_CLIENT_ID, EBAY_CLIENT_SECRET.
// Optional: EBAY_CAMPAIGN_ID (eBay Partner Network) for affiliate links.

const WRISTWATCHES = '31387'; // eBay category: Wristwatches
const CACHE_SECONDS = 3600; // one eBay search per watch per hour at most

// Listings whose title contains any of these are not a complete, genuine watch.
const EXCLUDE = [
  'replica', 'fake', 'homage', 'clone', 'aaa', '1:1', 'inspired', 'lookalike', 'look alike',
  'strap only', 'band only', 'bracelet only', 'strap for', 'band for', 'nato strap', 'rubber strap for', 'buckle only', 'clasp only', 'end links only', 'link only', 'links only',
  'box only', 'empty box', 'papers only', 'booklet only', 'manual only', 'card only', 'tag only', 'winder', 'display stand',
  'dial only', 'hands only', 'bezel insert', 'bezel only', 'crystal only', 'crown only', ' stem only', 'caseback only', 'case back only', 'movement only', 'for parts', 'parts only', 'not working', 'needs repair',
  'for rolex', 'fits rolex', 'for omega', 'fits omega', 'for tudor', 'fits tudor', 'for seiko', 'fits seiko', 'for cartier', 'fits cartier', 'compatible with', 'sticker', 'poster', 'keychain', 'cufflink',
];

let token = { value: '', expires: 0 };
async function ebayToken(env) {
  if (token.value && Date.now() < token.expires - 60_000) return token.value;
  const r = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`),
    },
    body: 'grant_type=client_credentials&scope=' + encodeURIComponent('https://api.ebay.com/oauth/api_scope'),
  });
  if (!r.ok) throw new Error('ebay-auth ' + r.status);
  const j = await r.json();
  token = { value: j.access_token, expires: Date.now() + j.expires_in * 1000 };
  return token.value;
}

const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)))];

export function clean(items, ref, name) {
  const r = norm(ref);
  const words = (name || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let list = items
    .map(i => ({
      id: i.itemId,
      title: i.title || '',
      price: Number(i.price?.value),
      currency: i.price?.currency,
      image: i.image?.imageUrl || i.thumbnailImages?.[0]?.imageUrl || '',
      url: i.itemAffiliateWebUrl || i.itemWebUrl,
      condition: i.condition || '',
    }))
    .filter(i => i.currency === 'USD' && i.price > 50)
    .filter(i => { const t = ' ' + i.title.toLowerCase() + ' '; return !EXCLUDE.some(x => t.includes(x)); });
  // the reference number is the most reliable match; fall back to the model name if too few have it
  const byRef = r ? list.filter(i => norm(i.title).includes(r)) : [];
  list = byRef.length >= 5 ? byRef : list.filter(i => words.every(w => i.title.toLowerCase().includes(w)));
  if (list.length < 3) return { count: list.length, listings: list };
  // genuine examples of one reference sit close together: drop anything far from the median
  let prices = list.map(i => i.price).sort((a, b) => a - b);
  const med = pct(prices, 0.5);
  list = list.filter(i => i.price >= med * 0.6 && i.price <= med * 1.6);
  prices = list.map(i => i.price).sort((a, b) => a - b);
  const median = pct(prices, 0.5);
  const listings = [...list].sort((a, b) => Math.abs(a.price - median) - Math.abs(b.price - median)).slice(0, 8);
  return { count: list.length, median, p25: pct(prices, 0.25), p75: pct(prices, 0.75), low: prices[0], high: prices[prices.length - 1], listings };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS, ...extra } });

export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (url.pathname !== '/market') return json({ error: 'not-found' }, 404);
    const q = (url.searchParams.get('q') || '').trim();
    const ref = (url.searchParams.get('ref') || '').trim();
    const name = (url.searchParams.get('name') || '').trim();
    if (!q || q.length > 120) return json({ error: 'bad-query' }, 400);

    const cache = caches.default;
    const key = new Request(url.toString(), { method: 'GET' });
    const hit = await cache.match(key);
    if (hit) return hit;

    try {
      const api = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
      api.searchParams.set('q', q);
      api.searchParams.set('category_ids', WRISTWATCHES);
      api.searchParams.set('limit', '100');
      api.searchParams.set('filter', 'buyingOptions:{FIXED_PRICE},priceCurrency:USD');
      const headers = { Authorization: 'Bearer ' + (await ebayToken(env)), 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' };
      if (env.EBAY_CAMPAIGN_ID) headers['X-EBAY-C-ENDUSERCTX'] = `affiliateCampaignId=${env.EBAY_CAMPAIGN_ID}`;
      const r = await fetch(api, { headers });
      if (!r.ok) return json({ error: 'ebay ' + r.status }, 502);
      const data = await r.json();
      const result = { source: 'ebay', query: q, checkedAt: new Date().toISOString(), ...clean(data.itemSummaries || [], ref, name) };
      const res = json(result, 200, { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` });
      ctx.waitUntil(cache.put(key, res.clone()));
      return res;
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  },
};
