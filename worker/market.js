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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS, ...extra } });

// ---------- /identify: watch recognition with Gemini ----------
// POST { image: <base64 JPEG, no data: prefix> } -> { isWatch, brand, model, reference, confidence, alternatives }
// Secret: GEMINI_API_KEY. Optional var: GEMINI_MODEL (default below).
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const MAX_IMAGE_B64 = 2_000_000; // ~1.5 MB JPEG; the app sends ~600 px images (~80 KB)

const PROMPT = `You identify wristwatches from a photo of the dial.
Reply with JSON only, in this exact shape:
{"isWatch": boolean, "brand": string, "model": string, "reference": string, "confidence": number, "alternatives": [{"brand": string, "model": string, "reference": string}]}
Rules:
- "isWatch" is false if the photo does not clearly show a wristwatch dial; then leave the other fields empty.
- "model" is the collection name as the brand writes it, e.g. "Submariner Date", "Speedmaster Moonwatch".
- "reference" is the manufacturer reference number if you can tell it from the dial, bezel and case (e.g. "126610LN"); otherwise "".
- "confidence" is 0-100: how sure you are about brand + model + reference together. Use below 80 when several references look alike.
- "alternatives": up to 3 other likely references when confidence is below 80, otherwise [].
- Never guess a brand that is not visible or strongly implied by the design. Do not judge whether the watch is genuine.`;

async function identify(req, env) {
  if (!env.GEMINI_API_KEY) return json({ error: 'not-configured' }, 503);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad-json' }, 400); }
  const image = typeof body?.image === 'string' ? body.image.replace(/^data:image\/\w+;base64,/, '') : '';
  if (!image || image.length > MAX_IMAGE_B64) return json({ error: 'bad-image' }, 400);
  const model = env.GEMINI_MODEL || GEMINI_MODEL;
  const call = () => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: image } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 400 },
    }),
  });
  let r = await call();
  // the free tier is sometimes briefly overloaded: try once more
  if (r.status === 429 || r.status >= 500) { await new Promise(res => setTimeout(res, 1200)); r = await call(); }
  if (!r.ok) return json({ error: 'gemini ' + r.status }, 502);
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  let out;
  try { out = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '')); } catch { return json({ error: 'unreadable-answer' }, 502); }
  const str = v => (typeof v === 'string' ? v.trim().slice(0, 80) : '');
  return json({
    isWatch: !!out.isWatch,
    brand: str(out.brand),
    model: str(out.model),
    reference: str(out.reference),
    confidence: Math.max(0, Math.min(100, Math.round(Number(out.confidence) || 0))),
    alternatives: Array.isArray(out.alternatives) ? out.alternatives.slice(0, 3).map(a => ({ brand: str(a?.brand), model: str(a?.model), reference: str(a?.reference) })) : [],
  });
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (url.pathname === '/identify' && req.method === 'POST') {
      try { return await identify(req, env); } catch (e) { return json({ error: String(e.message || e) }, 500); }
    }
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
