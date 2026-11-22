// Live market prices from eBay listings, through the Crown market proxy (worker/market.js).
// Until the proxy is deployed (MARKET_API empty) the app shows clearly labelled sample listings
// that do not change any values.
import { Model } from './data';

// The deployed Crown proxy (worker/). Live eBay prices are switched on once the eBay keys are stored there.
export const API_BASE = 'https://crown-market.crownaiwatchvaluescanner.workers.dev';
export const LIVE_MARKET = false;
const MARKET_API = LIVE_MARKET ? API_BASE : '';

export type Listing = { id: string; title: string; price: number; image: string; url: string; condition: string };
export type Market = {
  source: 'ebay' | 'sample';
  checkedAt: string;
  count: number;
  median?: number;
  p25?: number;
  p75?: number;
  listings: Listing[];
};

const searchUrl = (m: Model) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${m.brand} ${m.ref}`)}&_sacat=31387`;

function sample(m: Model): Market {
  if (!m.history.length) return { source: 'sample', checkedAt: new Date().toISOString(), count: 0, listings: [] };
  const base = m.history[m.history.length - 1];
  const offsets = [-0.04, -0.02, -0.01, 0, 0.01, 0.03, 0.05];
  const listings = offsets.map((o, i) => ({
    id: `sample-${i}`,
    title: `${m.brand} ${m.name} ${m.ref}${i % 2 ? ' full set' : ''}`,
    price: Math.round((base * (1 + o)) / 50) * 50,
    image: '',
    url: searchUrl(m),
    condition: i === 6 ? 'New' : 'Pre-owned',
  }));
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  return { source: 'sample', checkedAt: new Date().toISOString(), count: listings.length, median: prices[3], p25: prices[1], p75: prices[5], listings };
}

export async function fetchMarket(m: Model): Promise<Market> {
  if (!MARKET_API) return sample(m);
  const u = `${MARKET_API}/market?q=${encodeURIComponent(`${m.brand} ${m.ref}`)}&ref=${encodeURIComponent(m.ref)}&name=${encodeURIComponent(m.name.replace(/"[^"]*"/g, '').trim())}`;
  const r = await fetch(u);
  if (!r.ok) throw new Error('market ' + r.status);
  const j = await r.json();
  return { source: 'ebay', checkedAt: j.checkedAt, count: j.count, median: j.median, p25: j.p25, p75: j.p75, listings: j.listings ?? [] };
}

export const ebaySearchUrl = searchUrl;
