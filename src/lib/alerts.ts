import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { setup, cancelPrefix, inQuiet, Toggles } from './adhan';

export type PEvent = { id: number; name: string; date: string; remind: string; done: boolean };

// One reminder per Planner event, at 9 am on the day it is due (On the day), the day before, or a week before.
export async function syncEventAlerts(events: PEvent[], tg: Toggles): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await cancelPrefix('event-');
    if (!tg.ev) return;
    const now = Date.now(); const todo: { e: PEvent; at: Date; when: string }[] = [];
    for (const e of events || []) {
      if (e.done || !e.date || !e.remind || e.remind === 'None') continue;
      const [y, m, d] = e.date.split('-').map(Number); if (!y || !m || !d) continue;
      const back = e.remind === '1 week before' ? 7 : e.remind === '1 day before' ? 1 : 0;
      const at = new Date(y, m - 1, d - back, 9, 0, 0);
      if (at.getTime() <= now + 5000 || inQuiet(at, tg)) continue;
      todo.push({ e, at, when: back === 7 ? 'in 1 week' : back === 1 ? 'tomorrow' : 'today' });
    }
    if (!todo.length) return;
    if (!(await setup())) return;
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('events', { name: 'Event reminders', importance: Notifications.AndroidImportance.HIGH, lightColor: '#6a4df0' });
    for (const t of todo.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, 50)) {
      await Notifications.scheduleNotificationAsync({
        identifier: 'event-' + t.e.id + '-' + t.at.getTime(),
        content: { title: t.e.name, body: 'Event ' + t.when + '. Open Planner for details.', sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: t.at, channelId: 'events' } as any,
      });
    }
  } catch (e) { /* ignore */ }
}

// Al-Ma'thurat reminders, every morning and every evening. Only scheduled when notifications are already allowed.
export async function syncZikirAlerts(tg: Toggles): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await cancelPrefix('zikir-');
    if (!tg.zk) return;
    const p = await Notifications.getPermissionsAsync(); if (p.status !== 'granted') return;
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('zikir', { name: 'Daily zikir', importance: Notifications.AndroidImportance.DEFAULT, lightColor: '#6a4df0' });
    const slots: [string, number, number, string][] = [['morning', 6, 30, 'Al-Ma\'thurat pagi'], ['evening', 17, 30, 'Al-Ma\'thurat petang']];
    for (const [k, h, m, title] of slots) {
      if (inQuiet(new Date(2000, 0, 1, h, m), tg)) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: 'zikir-' + k,
        content: { title, body: 'Masa untuk zikir ' + (k === 'morning' ? 'pagi' : 'petang') + '. Buka Islamic Hub.', sound: false },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h, minute: m, channelId: 'zikir' } as any,
      });
    }
  } catch (e) { /* ignore */ }
}
