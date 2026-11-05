// Fasting (puasa) maths: tabular Hijri calendar, Ramadan, qadha and sunnah fasts. Pure functions, no storage.
export type FKind = 'r' | 's' | 'q' | 'x'; // r Ramadan, s sunnah, q qadha, x excused in Ramadan
export type PuasaData = { off: number; start: Record<string, string>; len: Record<string, number>; days: Record<string, FKind>; qBase: number };
export const PUASA_EMPTY: PuasaData = { off: 0, start: {}, len: {}, days: {}, qBase: 0 };
export const HMON = ['Muharram', 'Safar', 'Rabiulawal', 'Rabiulakhir', 'Jamadilawal', 'Jamadilakhir', 'Rejab', 'Syaaban', 'Ramadan', 'Syawal', 'Zulkaedah', 'Zulhijjah'];
export const DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dayMs = 86400000;
export const keyD = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const parseK = (k: string) => { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); };
export const addDays = (d: Date, n: number) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0); x.setDate(x.getDate() + n); return x; };
export const noon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
export const diffDays = (a: Date, b: Date) => Math.round((noon(a).getTime() - noon(b).getTime()) / dayMs);

const gToJd = (y: number, m: number, d: number) => { const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3; return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045; };
const jdToG = (jd: number) => { const a = jd + 32044, b = Math.floor((4 * a + 3) / 146097), c = a - Math.floor((146097 * b) / 4), d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor((1461 * d) / 4), m = Math.floor((5 * e + 2) / 153); return new Date(100 * b + d - 4800 + Math.floor(m / 10), ((m + 2) % 12), e - Math.floor((153 * m + 2) / 5) + 1, 12, 0, 0); };
const hToJd = (y: number, m: number, d: number) => d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439;
const jdToH = (jd: number) => { const y = Math.floor((30 * (jd - 1948440) + 10646) / 10631); const m = Math.min(12, Math.ceil((jd - 29 - hToJd(y, 1, 1)) / 29.5) + 1); return { y, m, d: jd - hToJd(y, m, 1) + 1 }; };

// off moves the Hijri date by whole days so it can match the official announcement.
export const hijriOf = (date: Date, off = 0) => jdToH(gToJd(date.getFullYear(), date.getMonth() + 1, date.getDate()) + off);
export const hijriStart = (y: number, m: number, d: number, off = 0) => jdToG(hToJd(y, m, d) - off);
export const hijriText = (date: Date, off = 0) => { const h = hijriOf(date, off); return h.d + ' ' + HMON[h.m - 1] + ' ' + h.y; };

export function ramadanOf(y: number, p: PuasaData) {
  const k = String(y);
  const start = p.start[k] ? parseK(p.start[k]) : hijriStart(y, 9, 1, p.off || 0);
  const auto = Math.round((hToJd(y, 10, 1) - hToJd(y, 9, 1)));
  const len = p.len[k] === 29 || p.len[k] === 30 ? p.len[k] : (auto === 29 ? 29 : 30);
  return { y, start, len, end: addDays(start, len - 1) };
}
const countIn = (p: PuasaData, from: Date, len: number, kinds: FKind[]) => { let n = 0; for (let i = 0; i < len; i++) { const v = p.days[keyD(addDays(from, i))]; if (v && kinds.indexOf(v) >= 0) n++; } return n; };

export function ramadanState(p: PuasaData, today = new Date()) {
  const hy = hijriOf(today, p.off || 0).y;
  const cands = [hy - 1, hy, hy + 1].map((y) => ramadanOf(y, p));
  const cur = cands.find((r) => diffDays(today, r.start) >= 0 && diffDays(today, r.end) <= 0);
  if (cur) {
    const day = diffDays(today, cur.start) + 1;
    const fasted = countIn(p, cur.start, cur.len, ['r']), excused = countIn(p, cur.start, cur.len, ['x']);
    const past = day - 1; // full days before today
    let pastFasted = 0, pastExcused = 0; for (let i = 0; i < past; i++) { const v = p.days[keyD(addDays(cur.start, i))]; if (v === 'r') pastFasted++; else if (v === 'x') pastExcused++; }
    return { phase: 'during' as const, r: cur, day, left: cur.len - day, fasted, excused, unmarked: past - pastFasted - pastExcused, todayDone: p.days[keyD(today)] };
  }
  const next = cands.find((r) => diffDays(r.start, today) > 0)!;
  const last = cands.slice().reverse().find((r) => diffDays(today, r.end) > 0)!;
  const nd = diffDays(next.start, today), ld = diffDays(today, last.end);
  if (nd <= 100 || !last) return { phase: 'before' as const, r: next, daysTo: nd, last, fastedLast: countIn(p, last.start, last.len, ['r']), sinceLast: ld };
  return { phase: 'after' as const, r: last, daysTo: nd, next, fasted: countIn(p, last.start, last.len, ['r']), sinceLast: ld };
}

// Qadha still owed: opening balance + missed days of tracked Ramadans that have ended − qadha fasts logged.
export function qadhaOwed(p: PuasaData, today = new Date()) {
  const hy = hijriOf(today, p.off || 0).y; let owed = p.qBase || 0;
  for (let y = hy - 6; y <= hy; y++) {
    const r = ramadanOf(y, p);
    if (diffDays(today, r.end) <= 0) continue;
    const any = countIn(p, r.start, r.len, ['r', 'x']);
    if (any > 0) owed += r.len - countIn(p, r.start, r.len, ['r']);
  }
  const done = Object.keys(p.days).filter((k) => p.days[k] === 'q').length;
  return Math.max(0, owed - done);
}

// Days that must not be fasted: Eid al-Fitr, Eid al-Adha and the three days after it.
export const isHaram = (date: Date, off = 0) => { const h = hijriOf(date, off); return (h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13); };
export function sunatLabel(date: Date, off = 0): string {
  const h = hijriOf(date, off), w = date.getDay();
  if (h.m === 12 && h.d === 9) return 'Arafah (9 Zulhijjah)';
  if (h.m === 1 && (h.d === 10 || h.d === 9)) return 'Asyura (10 Muharram)';
  if (h.m !== 9 && h.d >= 13 && h.d <= 15) return 'White Days (13th to 15th)';
  if (h.m === 10 && h.d >= 2) return 'Six days of Syawal';
  if (w === 1 || w === 4) return 'Monday and Thursday';
  return 'Other sunnah';
}
export function sunatToday(date: Date, off = 0): string {
  const h = hijriOf(date, off), w = date.getDay();
  if (isHaram(date, off) || h.m === 9) return '';
  if (h.m === 12 && h.d === 9) return 'Arafah day';
  if (h.m === 1 && h.d === 10) return 'Asyura';
  if (h.m === 1 && h.d === 9) return 'Tasua';
  if (h.d >= 13 && h.d <= 15) return 'White Days fast (13th to 15th of the Hijri month)';
  if (h.m === 10) return 'Six days of Syawal';
  if (w === 1) return 'Monday sunnah fast';
  if (w === 4) return 'Thursday sunnah fast';
  return '';
}
export function sunatYear(p: PuasaData, today = new Date()) {
  const by: Record<string, number> = {}; let total = 0, qadha = 0; const months: number[] = [];
  for (let m = 11; m >= 0; m--) { const d0 = new Date(today.getFullYear(), today.getMonth() - m, 1, 12); let n = 0; const dim = new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate(); for (let i = 1; i <= dim; i++) { const k = keyD(new Date(d0.getFullYear(), d0.getMonth(), i, 12)); const v = p.days[k]; if (v === 's' || v === 'q' || v === 'r') n++; } months.push(n); }
  for (let o = 0; o < 365; o++) { const d = addDays(today, -o); const v = p.days[keyD(d)]; if (v === 's') { total++; const l = sunatLabel(d, p.off || 0); by[l] = (by[l] || 0) + 1; } else if (v === 'q') qadha++; }
  return { by, total, qadha, months };
}
