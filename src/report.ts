// Insurance report: one printable HTML document, turned into a PDF on the phone
// (expo-print) or opened in the browser's print dialog on the web ("Save as PDF").
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Answers, byId, change12, ownedValue } from './data';
import { fmtDate, t } from './i18n';
import { money } from './theme';
import type { Owned } from './store';

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const round50 = (n: number) => Math.round(n / 50) * 50;
const papersLabel = (p: Answers['papers']) => (p === 'Yes' ? t('Full box and papers') : p === 'Some' ? t('some box and papers') : t('no box or papers'));

export type ReportOptions = { collection: Owned[]; papers: Answers['papers']; owner: string; includePaid: boolean; includePhotos: boolean };

export function reportTotals(o: ReportOptions) {
  const vals = o.collection.map(w => ownedValue(w, o.papers));
  return { count: o.collection.length, low: vals.reduce((s, v) => s + v.low, 0), mid: vals.reduce((s, v) => s + v.mid, 0), high: vals.reduce((s, v) => s + v.high, 0) };
}

export function buildReportHtml(o: ReportOptions) {
  const now = new Date();
  const id = 'CR-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-' + String(now.getTime()).slice(-4);
  const tot = reportTotals(o);
  const date = fmtDate(now, { day: 'numeric', month: 'long', year: 'numeric' });
  const row = (k: string, v?: string) => (v ? `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>` : '');

  const watches = o.collection.map((w, i) => {
    const m = byId(w.modelId);
    const v = ownedValue(w, o.papers);
    const ch = change12(m);
    const photo = o.includePhotos && w.photo ? `<img class="photo" src="${w.photo}" alt="">` : `<div class="photo none">${esc(m.brand.slice(0, 1))}</div>`;
    return `
      <section class="watch">
        <div class="head">
          ${photo}
          <div>
            <div class="num">${i + 1} / ${tot.count}</div>
            <div class="brand">${esc(m.brand)}</div>
            <h2>${esc(m.name)}</h2>
            <div class="value">${money(round50(v.mid))}</div>
            <div class="range">${esc(t('Value range'))}: ${money(round50(v.low))} – ${money(round50(v.high))}</div>
          </div>
        </div>
        <table>
          ${row(t('Identification'), t('From a photo, chosen by the owner'))}
          ${row(t('Reference'), m.ref)}
          ${row(t('Serial number (entered by the owner)'), w.serial || t('Not stated'))}
          ${row(t('Case'), `${m.size} · ${t(m.material)}`)}
          ${row(t('Condition (declared by the owner)'), w.condition ? t(w.condition) : t('Not stated'))}
          ${row(t('Box and papers (declared by the owner)'), papersLabel(w.papers ?? o.papers))}
          ${o.includePaid && w.paid ? row(t('Purchase price (declared by the owner)'), money(w.paid)) : ''}
          ${row(t('In collection since'), fmtDate(new Date(w.addedAt), { day: 'numeric', month: 'short', year: 'numeric' }))}
          ${w.lastService ? row(t('Last service (declared by the owner)'), fmtDate(new Date(w.lastService), { month: 'short', year: 'numeric' })) : ''}
          ${row(t('Authenticity'), t('Not checked by Crown'))}
          ${row(t('12-month change'), `${ch >= 0 ? '+' : '−'}${Math.abs(ch).toFixed(1)}%`)}
        </table>
      </section>`;
  }).join('');

  const summary = o.collection.map((w, i) => {
    const m = byId(w.modelId), v = ownedValue(w, o.papers);
    return `<tr><td>${i + 1}</td><td>${esc(m.brand)} ${esc(m.name)}</td><td>${esc(m.ref)}</td><td>${esc(w.serial || '—')}</td><td class="r">${money(round50(v.mid))}</td></tr>`;
  }).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t('Collection inventory'))} ${id}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #15140F; margin: 0; font-size: 12px; }
  .sans, table, .num, .brand, .range, .meta, .note { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }
  header { border-bottom: 2px solid #C79A4B; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 26px; letter-spacing: 6px; }
  h1 { font-size: 24px; font-weight: normal; margin: 4px 0 0; }
  .meta { color: #7D776B; font-size: 11px; text-align: right; line-height: 1.6; }
  .total { background: #F3EFE6; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
  .total .big { font-size: 28px; }
  .total .sub { font-family: Arial, sans-serif; color: #7D776B; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  th, td { text-align: left; padding: 6px 4px; border-bottom: 1px solid #E2DCCF; vertical-align: top; }
  th { color: #7D776B; font-weight: 600; width: 38%; }
  .summary th { width: auto; }
  .r { text-align: right; }
  .watch { page-break-inside: avoid; border: 1px solid #E2DCCF; border-radius: 12px; padding: 14px; margin-bottom: 14px; }
  .head { display: flex; gap: 16px; margin-bottom: 10px; }
  .photo { width: 110px; height: 110px; border-radius: 10px; object-fit: cover; flex: none; }
  .photo.none { background: #E8E1D2; color: #8A6524; font-size: 44px; display: flex; align-items: center; justify-content: center; }
  .num { color: #7D776B; font-size: 10px; }
  .brand { color: #8A6524; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
  h2 { font-size: 20px; font-weight: normal; margin: 2px 0 6px; }
  .value { font-size: 22px; }
  .range { color: #7D776B; font-size: 11px; }
  h3 { font-size: 15px; font-weight: normal; margin: 22px 0 8px; }
  .banner { font-family: Arial, sans-serif; background: #F6E3DE; color: #8A2E1C; border-radius: 8px; padding: 8px 12px; font-size: 11px; margin-bottom: 14px; }
  .note { color: #7D776B; font-size: 10px; line-height: 1.5; margin-top: 18px; border-top: 1px solid #E2DCCF; padding-top: 10px; }
</style></head><body>
<div class="banner">${esc(t('This is not an official document. It is a price analysis to help you.'))}</div>
<header>
  <div><div class="logo">CROWN</div><h1>${esc(t('Collection inventory'))}</h1><div class="sub sans" style="color:#7D776B;font-size:11px">${esc(t('For your insurer'))}</div></div>
  <div class="meta">${esc(t('Report'))} ${id}<br>${esc(date)}${o.owner ? `<br>${esc(t('Owner'))}: ${esc(o.owner)}` : ''}</div>
</header>
<div class="total">
  <div><div class="sub">${esc(t('Collection value'))}</div><div class="big">${money(round50(tot.mid))}</div></div>
  <div class="sub r">${esc(t('{n} watches', { n: tot.count }))}<br>${esc(t('Value range'))}: ${money(round50(tot.low))} – ${money(round50(tot.high))}</div>
</div>
${watches}
<h3>${esc(t('Summary'))}</h3>
<table class="summary">
  <tr><th>#</th><th>${esc(t('Watch'))}</th><th>${esc(t('Reference'))}</th><th>${esc(t('Serial number'))}</th><th class="r">${esc(t('Value'))}</th></tr>
  ${summary}
  <tr><td></td><td colspan="3"><b>${esc(t('Total'))}</b></td><td class="r"><b>${money(round50(tot.mid))}</b></td></tr>
</table>
<p class="note">${esc(t("This is not an official document. It is a price analysis to help you. Details marked 'declared by the owner' were entered by the owner and were not checked by Crown. Crown does not check whether a watch is genuine; values assume it is. Values are estimates from listed market prices, not an appraisal. Your insurer may ask for an appraisal by a watch expert. Prices in this version of Crown are demo data."))}</p>
</body></html>`;
}

// Creates the PDF. Phone: real PDF file + share sheet. Web: print dialog in a new window (Save as PDF).
export async function exportReport(o: ReportOptions): Promise<'shared' | 'printed' | 'blocked'> {
  const html = buildReportHtml(o);
  if (Platform.OS === 'web') {
    const w = window.open('', '_blank');
    if (!w) return 'blocked';
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
    return 'printed';
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: t('Collection inventory') });
  return 'shared';
}
