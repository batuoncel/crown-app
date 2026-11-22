// Watch recognition through the Crown proxy (worker/market.js -> /identify -> Gemini).
// The photo goes to the proxy; the API key never ships in the app.
import { MODELS, Model } from './data';
import { API_BASE } from './market';

// Turned on once GEMINI_API_KEY is stored on the proxy and tested. Until then scans use the demo matcher.
export const LIVE_SCAN = true;

export type Identified = {
  isWatch: boolean;
  brand: string;
  model: string;
  reference: string;
  confidence: number;
  alternatives: { brand: string; model: string; reference: string }[];
};

export async function identifyPhoto(photo: string): Promise<Identified> {
  const r = await fetch(`${API_BASE}/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: photo }),
  });
  if (!r.ok) throw new Error('identify ' + r.status);
  return r.json();
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Finds the catalogue model for an answer: exact reference first, then brand + model name.
export function matchModel(x: { brand: string; model: string; reference: string }): Model | undefined {
  const ref = norm(x.reference);
  if (ref) {
    const byRef = MODELS.find(m => norm(m.ref) === ref || (ref.length >= 6 && norm(m.ref).startsWith(ref)));
    if (byRef) return byRef;
  }
  const brand = norm(x.brand), name = norm(x.model);
  if (!brand || !name) return undefined;
  const sameBrand = MODELS.filter(m => norm(m.brand) === brand);
  return sameBrand.find(m => norm(m.name) === name) ?? sameBrand.find(m => norm(m.name).includes(name) || name.includes(norm(m.name)));
}
