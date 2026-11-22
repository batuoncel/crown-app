import { Answers, byId, ownedValue } from './data';
import type { Owned } from './store';

export type AwardCtx = { scans: number; collection: Owned[]; papers: Answers['papers']; shared: number; read: number; wishes: number };

export type Award = {
  id: string;
  group: 'Scanning' | 'Collection' | 'Value' | 'Market sense';
  name: string;
  desc: string;
  icon: string;
  goal: number;
  value: (c: AwardCtx) => number;
};

const count = (c: AwardCtx) => c.collection.length;
const total = (c: AwardCtx) => c.collection.reduce((s, o) => s + ownedValue(o, c.papers).mid, 0);
const brands = (c: AwardCtx) => new Set(c.collection.map(o => byId(o.modelId).brand)).size;

export const AWARDS: Award[] = [
  { id: 'scan1', group: 'Scanning', name: 'First Look', desc: 'Scan your first watch', icon: 'scan', goal: 1, value: c => c.scans },
  { id: 'scan5', group: 'Scanning', name: 'Regular', desc: 'Scan 5 watches', icon: 'scan', goal: 5, value: c => c.scans },
  { id: 'scan25', group: 'Scanning', name: 'Loupe Master', desc: 'Scan 25 watches', icon: 'eye', goal: 25, value: c => c.scans },
  { id: 'photo3', group: 'Scanning', name: 'Photographer', desc: '3 watches with your own photo', icon: 'image', goal: 3, value: c => c.collection.filter(o => o.photo).length },

  { id: 'own1', group: 'Collection', name: 'First Piece', desc: 'Add a watch to your collection', icon: 'watch', goal: 1, value: count },
  { id: 'own3', group: 'Collection', name: 'Watch Box', desc: 'Own 3 watches', icon: 'box', goal: 3, value: count },
  { id: 'own10', group: 'Collection', name: 'Collector', desc: 'Own 10 watches', icon: 'box', goal: 10, value: count },
  { id: 'brand2', group: 'Collection', name: 'Two Houses', desc: 'Watches from 2 brands', icon: 'tag', goal: 2, value: brands },
  { id: 'brand4', group: 'Collection', name: 'Globetrotter', desc: 'Watches from 4 brands', icon: 'tag', goal: 4, value: brands },

  { id: 'val10k', group: 'Value', name: 'Five Figures', desc: 'Collection worth $10,000', icon: 'chart', goal: 10000, value: total },
  { id: 'val50k', group: 'Value', name: 'Serious Wrist', desc: 'Collection worth $50,000', icon: 'chart', goal: 50000, value: total },
  { id: 'val100k', group: 'Value', name: 'Six Figures', desc: 'Collection worth $100,000', icon: 'chart', goal: 100000, value: total },
  { id: 'fullset', group: 'Value', name: 'Full Set', desc: 'A watch with box and papers', icon: 'box', goal: 1, value: c => c.collection.filter(o => (o.papers ?? c.papers) === 'Yes').length },

  { id: 'paid1', group: 'Market sense', name: 'Know Your Numbers', desc: 'Add what you paid for a watch', icon: 'edit', goal: 1, value: c => c.collection.filter(o => o.paid).length },
  { id: 'green', group: 'Market sense', name: 'In the Green', desc: 'A watch worth more than you paid', icon: 'chart', goal: 1, value: c => c.collection.filter(o => o.paid && ownedValue(o, c.papers).mid > o.paid).length },
  { id: 'read3', group: 'Market sense', name: 'Student of the Craft', desc: "Read 3 collector's guides", icon: 'medal', goal: 3, value: c => c.read },
  { id: 'wish1', group: 'Market sense', name: 'Dreamer', desc: 'Add a watch to your wishlist', icon: 'heart', goal: 1, value: c => c.wishes },
  { id: 'share1', group: 'Market sense', name: 'Show-off', desc: 'Share a value card', icon: 'share', goal: 1, value: c => c.shared },
];

export const progress = (a: Award, c: AwardCtx) => Math.min(a.value(c), a.goal);
export const unlocked = (c: AwardCtx) => AWARDS.filter(a => a.value(c) >= a.goal).map(a => a.id);
