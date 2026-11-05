import { getItem, setItem } from './store';

export type ModCount = Record<string, Record<string, number>>;
export const MODS: { k: string; name: string; c: string }[] = [
  { k: 'planner', name: 'Daily Planner', c: '#7c9cff' },
  { k: 'islamic', name: 'Islamic Hub', c: '#34d399' },
  { k: 'finance', name: 'My Finance', c: '#ffc46b' },
  { k: 'record', name: 'My Record', c: '#ff8fab' },
  { k: 'habit', name: 'Habit & Health', c: '#b794ff' },
];
export const modOf = (path: string): string => {
  if (path.startsWith('/planner') || path.startsWith('/notes')) return 'planner';
  if (['/islamic', '/prayer', '/mathurat', '/tasbih', '/puasa', '/tahlil', '/surah'].some((p) => path.startsWith(p))) return 'islamic';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/record')) return 'record';
  if (path.startsWith('/habit')) return 'habit';
  return '';
};
const dk = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
let prev = '';
export async function trackModule(path: string) {
  const m = modOf(path);
  const was = prev; prev = m;
  if (!m || m === was) return;
  const all = await getItem<ModCount>('ml_modules', {});
  const k = dk(new Date());
  all[k] = all[k] || {};
  all[k][m] = (all[k][m] || 0) + 1;
  const cut = new Date(); cut.setDate(cut.getDate() - 31);
  Object.keys(all).forEach((x) => { if (x < dk(cut)) delete all[x]; });
  await setItem('ml_modules', all);
  const hrs = await getItem<number[]>('ml_hours', new Array(24).fill(0));
  const hh = Array.isArray(hrs) && hrs.length === 24 ? hrs : new Array(24).fill(0);
  hh[new Date().getHours()] += 1;
  await setItem('ml_hours', hh);
}
