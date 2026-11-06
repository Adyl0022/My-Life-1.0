// Month-by-month money figures for the Stats screen, built on the same calculation as Money Left.
import { calcLeft, commitFor, MONTHS } from './moneyLeft';
import { ymOf } from './debts';
import type { Core } from './insights';

export type MonthRow = { ym: string; label: string; income: number; commit: number; spent: number; savings: number; left: number; has: boolean };

export function monthRows(c: Core, n = 6): MonthRow[] {
  const out: MonthRow[] = []; const now = new Date(); const sp = ((c.fin && c.fin.spends) || []) as any[];
  for (let b = n - 1; b >= 0; b--) {
    const d = new Date(now.getFullYear(), now.getMonth() - b, 1); const ym = ymOf(d);
    const income = Object.values((c.fin && c.fin.inc && c.fin.inc[ym]) || {}).reduce((a: number, x: any) => a + (x || 0), 0) as number;
    const commit = income > 0 || sp.some((x) => (x.date || '').slice(0, 7) === ym) ? commitFor(c.debts, ym) : 0;
    const L = calcLeft({ ym, income, commit, spends: sp });
    out.push({ ym, label: MONTHS[d.getMonth()], income, commit, spent: L.spent, savings: L.savings, left: L.left, has: income > 0 || L.spent > 0 || L.savings > 0 });
  }
  return out;
}
