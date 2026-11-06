import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getItem, setItem } from './store';
import { DEBT_EMPTY } from './debts';
import { calcLeft, commitFor, ymKey } from './moneyLeft';

export type BudgetCfg = { on: boolean; sent: Record<string, number> };
export const BUDGET_EMPTY: BudgetCfg = { on: true, sent: {} };
const rm = (n: number) => 'RM ' + Math.round(n).toLocaleString('en-MY');

// Looks at this month after any spending or income is saved and sends one alert for each warning, once.
export async function checkBudget(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const cfg = await getItem<BudgetCfg>('ml_budget', BUDGET_EMPTY); if (!cfg.on) return;
    const fin: any = await getItem('ml_finance', { inc: {}, spends: [] }); const debts: any = await getItem('ml_debts', DEBT_EMPTY);
    const now = new Date(); const ym = ymKey(now);
    const income = Object.keys((fin.inc || {})[ym] || {}).reduce((a, k) => a + (fin.inc[ym][k] || 0), 0); if (!(income > 0)) return;
    const c = calcLeft({ ym, income, commit: commitFor(debts, ym), spends: fin.spends || [], now });
    const dk = ym + '-' + String(now.getDate()).padStart(2, '0');
    const out: [string, string, string][] = [];
    if (c.over) out.push(['over:' + ym, 'Over budget this month', 'You are ' + rm(-c.left) + ' past what is left of your income. Hold off on non-essential spending.']);
    else {
      if (c.used >= 0.8) out.push(['80:' + ym, 'You have used ' + Math.round(c.used * 100) + '% of your income', rm(c.left) + ' left for ' + c.daysLeft + ' days, about ' + rm(c.allowance) + ' a day.']);
      if (c.daysLeft > 1 && c.allowance > 0 && c.today > c.allowance) out.push(['day:' + dk, 'Over today\'s limit', 'You spent ' + rm(c.today) + ' today. Your limit is about ' + rm(c.allowance) + ' a day to stay on track.']);
    }
    const todo = out.filter((x) => !cfg.sent[x[0]]); if (!todo.length) return;
    const p = await Notifications.getPermissionsAsync(); if (p.status !== 'granted') return;
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('budget', { name: 'Budget alerts', importance: Notifications.AndroidImportance.HIGH, lightColor: '#ffc46b' });
    const sent: Record<string, number> = {}; Object.keys(cfg.sent).forEach((k) => { if (k.indexOf(ym) >= 0) sent[k] = 1; });
    for (const [k, title, body] of todo) {
      await Notifications.scheduleNotificationAsync({ content: { title, body, sound: true }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, channelId: 'budget' } as any });
      sent[k] = 1;
    }
    await setItem('ml_budget', { ...cfg, sent });
  } catch (e) { /* ignore */ }
}
