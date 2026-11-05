import { Platform } from 'react-native';
import { getText } from './store';

export type Sheet = { name: string; head: string[]; rows: (string | number)[][] };
export type Report = { sheets: Sheet[]; totals: [string, string][] };

export const MODS = [
  { k: 'planner', name: 'Planner and Notes', sub: 'Events, tasks and notes', keys: ['ml_planner', 'ml_notes'] },
  { k: 'islamic', name: 'Islamic Hub', sub: 'Fasting log, Tasbih counts, bookmarks and reading progress', keys: ['ml_islamic', 'ml_tasbih', 'ml_puasa'] },
  { k: 'finance', name: 'My Finance', sub: 'Income, spending and commitments', keys: ['ml_finance', 'ml_debts'] },
  { k: 'record', name: 'My Record', sub: 'Motorcycle mileage, fuel and services', keys: ['ml_record'] },
  { k: 'habit', name: 'Habit and Health', sub: 'Mood, sleep, water and steps', keys: ['ml_habit'] },
  { k: 'usage', name: 'App usage history', sub: 'Time spent and opens from Stats', keys: ['ml_usage_v1'] },
];

const pad = (n: number) => String(n).padStart(2, '0');
const rm = (n: number) => { const v = Math.round(n * 100) / 100; return 'RM ' + v.toLocaleString('en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
const num = (x: any) => (typeof x === 'number' && isFinite(x) ? x : Number(x) || 0);

export async function collect(sel: string[]) {
  const out: Record<string, any> = {};
  for (const m of MODS.filter((x) => sel.includes(x.k))) {
    out[m.k] = {};
    for (const k of m.keys) { try { const r = await getText(k); if (r != null) out[m.k][k] = JSON.parse(r); } catch (e) {} }
  }
  return out;
}

// Flattens any saved object into Item / Value rows, for data that has no special table.
function flat(v: any, limit = 400): [string, string][] {
  const rows: [string, string][] = [];
  const walk = (p: string, x: any) => {
    if (rows.length >= limit) return;
    if (x && typeof x === 'object') Object.keys(x).forEach((k) => walk(p ? p + ' / ' + k : k, x[k]));
    else rows.push([p, String(x)]);
  };
  walk('', v); return rows;
}

export async function buildReport(sel: string[], per: number): Promise<Report> {
  const raw = await collect(sel);
  const now = new Date();
  const ym = now.getFullYear() + '-' + pad(now.getMonth() + 1);
  const from = per === 0 ? ym : per === 1 ? (() => { const d = new Date(now.getFullYear(), now.getMonth() - 2, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); })() : '';
  const inP = (date?: string) => !from || !date || String(date).slice(0, 7) >= from;
  const sheets: Sheet[] = []; const totals: [string, string][] = [];
  const g = (m: string, k: string) => (raw[m] && raw[m][k]) || null;

  if (sel.includes('planner')) {
    const pl = g('planner', 'ml_planner'); const nt = g('planner', 'ml_notes');
    const tasks = ((pl && pl.tasks) || []).filter((t: any) => inP(t.due));
    const events = ((pl && pl.events) || []).filter((e: any) => inP(e.date));
    const notes = ((nt && nt.notes) || []).filter((n: any) => !from || !n.u || inP(new Date(n.u).toISOString().slice(0, 10)));
    if (tasks.length) sheets.push({ name: 'Tasks', head: ['Task', 'Category', 'Priority', 'Due', 'Status', 'Note'], rows: tasks.map((t: any) => [t.name || '', t.cat || '', t.prio || '', t.due || '', t.status || '', t.note || '']) });
    if (events.length) sheets.push({ name: 'Events', head: ['Event', 'Date', 'Reminder', 'Done'], rows: events.map((e: any) => [e.name || '', e.date || '', e.remind || '', e.done ? 'Yes' : 'No']) });
    if (notes.length) sheets.push({ name: 'Notes', head: ['Title', 'Text', 'Pinned'], rows: notes.map((n: any) => [n.t || '', typeof n.s === 'string' ? n.s : JSON.stringify(n.s ?? ''), n.pin ? 'Yes' : 'No']) });
    totals.push(['Notes', String(notes.length)], ['Tasks', String(tasks.length)], ['Events', String(events.length)]);
  }
  if (sel.includes('finance')) {
    const f = g('finance', 'ml_finance'); const d = g('finance', 'ml_debts');
    const sp = ((f && f.spends) || []).filter((s: any) => inP(s.date));
    const inc: [string, string, number][] = [];
    Object.keys((f && f.inc) || {}).sort().forEach((m) => { if (inP(m)) Object.keys(f.inc[m] || {}).forEach((s) => inc.push([m, s, num(f.inc[m][s])])); });
    const tin = inc.reduce((a, r) => a + r[2], 0); const tsp = sp.reduce((a: number, s: any) => a + num(s.amt), 0);
    if (sp.length) sheets.push({ name: 'Spending', head: ['Date', 'Item', 'Category', 'Amount (RM)'], rows: sp.map((s: any) => [s.date || '', s.name || '', s.cat || '', num(s.amt)]) });
    if (inc.length) sheets.push({ name: 'Income', head: ['Month', 'Source', 'Amount (RM)'], rows: inc });
    const debts = (d && d.debts) || [];
    if (debts.length) sheets.push({ name: 'Commitments', head: ['Name', 'Balance (RM)', 'Monthly (RM)', 'Due day', 'Since'], rows: debts.map((x: any) => [x.name || '', num(x.bal), num(x.monthly), num(x.due), x.since || '']) });
    totals.push(['Total income', rm(tin)], ['Total spending', rm(tsp)], ['Net balance', rm(tin - tsp)]);
  }
  if (sel.includes('record')) {
    const r = g('record', 'ml_record'); const rows: (string | number)[][] = []; let km = 0;
    Object.keys((r && r.data) || {}).forEach((veh) => {
      const v = r.data[veh] || {};
      (v.readings || []).filter((x: any) => inP(x.date)).forEach((x: any) => rows.push([veh, 'Mileage', x.date || '', '', '', num(x.odo)]));
      (v.exps || []).filter((x: any) => inP(x.date)).forEach((x: any) => rows.push([veh, 'Expense', x.date || '', x.name || '', num(x.amt), '']));
      (v.fuel || []).filter((x: any) => inP(x.date)).forEach((x: any) => rows.push([veh, 'Fuel', x.date || '', num(x.liters) + ' L', num(x.amt), num(x.odo) || '']));
      const odos = (v.readings || []).map((x: any) => num(x.odo)).filter((n: number) => n > 0); if (odos.length) km += Math.max(...odos) - Math.min(...odos);
    });
    if (rows.length) sheets.push({ name: 'Record', head: ['Vehicle', 'Type', 'Date', 'Detail', 'Amount (RM)', 'Odometer (km)'], rows });
    totals.push(['Record entries', String(rows.length)]);
  }
  if (sel.includes('habit')) {
    const h = g('habit', 'ml_habit'); const days = (h && h.days) || {};
    const rows = Object.keys(days).sort().filter((k) => inP(k)).map((k) => { const x = days[k] || {}; return [k, num(x.steps), num(x.sleep), x.mood >= 0 ? ['Awful', 'Low', 'Okay', 'Good', 'Great'][x.mood] || '' : '', num(x.cups)]; });
    if (rows.length) sheets.push({ name: 'Habit and Health', head: ['Date', 'Steps', 'Sleep (hours)', 'Mood', 'Water (cups)'], rows });
    const kg = ((h && h.kg) || []).filter((x: any) => inP(x.d));
    if (kg.length) sheets.push({ name: 'Weight', head: ['Date', 'Weight (kg)'], rows: kg.map((x: any) => [x.d, num(x.v)]) });
    totals.push(['Habit days', String(rows.length)]);
  }
  if (sel.includes('islamic')) {
    const p = g('islamic', 'ml_puasa'); const t = g('islamic', 'ml_tasbih'); const i = g('islamic', 'ml_islamic');
    const fd = Object.keys((p && p.days) || {}).sort().filter((k) => inP(k)).map((k) => [k, String(p.days[k])]);
    if (fd.length) sheets.push({ name: 'Fasting', head: ['Date', 'Kind'], rows: fd });
    if (t) sheets.push({ name: 'Tasbih', head: ['Day', 'Total'], rows: [[t.day || '', num(t.total)]] });
    const fl = i ? flat(i) : []; if (fl.length) sheets.push({ name: 'Islamic Hub', head: ['Item', 'Value'], rows: fl });
    totals.push(['Fasting days', String(fd.length)]);
  }
  if (sel.includes('usage')) {
    const u = g('usage', 'ml_usage_v1'); const fl = u ? flat(u) : [];
    if (fl.length) sheets.push({ name: 'App usage', head: ['Item', 'Value'], rows: fl });
  }
  return { sheets, totals };
}

export const toCsv = (r: Report) => {
  const q = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const out: string[] = ['Totals'];
  r.totals.forEach(([a, b]) => out.push([a, b].map(q).join(',')));
  r.sheets.forEach((s) => { out.push('', s.name, s.head.map(q).join(',')); s.rows.forEach((x) => out.push(x.map(q).join(','))); });
  return '﻿' + out.join('\r\n');
};

const esc = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function toHtml(r: Report, per: string) {
  const tiles = r.totals.map(([a, b]) => '<div class="t"><b>' + esc(b) + '</b><span>' + esc(a) + '</span></div>').join('');
  const tabs = r.sheets.map((s) => '<h2>' + esc(s.name) + '</h2><table><tr>' + s.head.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr>' +
    s.rows.slice(0, 600).map((x) => '<tr>' + x.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</table>' + (s.rows.length > 600 ? '<p class="m">Showing the first 600 of ' + s.rows.length + ' rows. Use Excel for everything.</p>' : '')).join('');
  return '<html><head><meta charset="utf-8"><style>body{font-family:Helvetica,Arial,sans-serif;color:#1b2140;padding:24px}h1{margin:0}h2{margin:22px 0 6px;color:#3b4ea8;font-size:15px}.m{color:#667;font-size:11px}.g{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.t{background:#eef1ff;border-radius:10px;padding:8px 12px;min-width:110px}.t b{display:block;font-size:16px}.t span{font-size:11px;color:#556}table{border-collapse:collapse;width:100%;font-size:11px}th{background:#3b4ea8;color:#fff;text-align:left;padding:5px}td{border-bottom:1px solid #dde;padding:4px 5px}</style></head><body><h1>My Life 1.0</h1><div class="m">Report: ' + esc(per) + ' · created ' + new Date().toLocaleDateString('en-GB') + '</div><div class="g">' + tiles + '</div>' + (tabs || '<p>No data saved yet for this period.</p>') + '</body></html>';
}

export async function toXlsxBase64(r: Report): Promise<string> {
  const X: any = await import('xlsx');
  const wb = X.utils.book_new();
  const t = X.utils.aoa_to_sheet([['Totals', ''], ...r.totals]); t['!cols'] = [{ wch: 22 }, { wch: 18 }];
  X.utils.book_append_sheet(wb, t, 'Totals');
  r.sheets.forEach((s) => {
    const ws = X.utils.aoa_to_sheet([s.head, ...s.rows]);
    ws['!cols'] = s.head.map((h, i) => ({ wch: Math.min(40, Math.max(h.length + 2, ...s.rows.slice(0, 80).map((x) => String(x[i] ?? '').length + 2))) }));
    X.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  });
  return X.write(wb, { bookType: 'xlsx', type: 'base64' });
}

// Saves the file and opens the phone's share sheet (or downloads it on the web).
export async function deliver(name: string, mime: string, body: string, base64 = false): Promise<boolean> {
  if (Platform.OS === 'web') {
    let part: any = body;
    if (base64) { const bin = atob(body); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); part = u; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new (globalThis as any).Blob([part], { type: mime })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); return true;
  }
  const FS = await import('expo-file-system/legacy'); const Sh = await import('expo-sharing');
  const uri = (FS.cacheDirectory || '') + name;
  await FS.writeAsStringAsync(uri, body, { encoding: base64 ? FS.EncodingType.Base64 : FS.EncodingType.UTF8 });
  if (!(await Sh.isAvailableAsync())) return false;
  await Sh.shareAsync(uri, { mimeType: mime, dialogTitle: name });
  return true;
}
export async function deliverPdf(html: string): Promise<boolean> {
  const Print = await import('expo-print');
  if (Platform.OS === 'web') { await Print.printAsync({ html }); return true; }
  const r = await Print.printToFileAsync({ html }); const Sh = await import('expo-sharing');
  if (!(await Sh.isAvailableAsync())) return false;
  await Sh.shareAsync(r.uri, { mimeType: 'application/pdf', dialogTitle: 'My Life report' }); return true;
}
