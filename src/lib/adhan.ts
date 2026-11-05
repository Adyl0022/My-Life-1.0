import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type Alert = { key: string; name: string; at: Date };
let ready = false;
export async function setup(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (!ready) {
      Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
      if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('prayer', { name: 'Prayer times', importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 150, 250], lightColor: '#34d399' });
      ready = true;
    }
    let p = await Notifications.getPermissionsAsync();
    if (p.status !== 'granted' && p.canAskAgain) p = await Notifications.requestPermissionsAsync();
    return p.status === 'granted';
  } catch (e) { return false; }
}
// Replaces every scheduled prayer alert with the given list.
export async function syncPrayerAlerts(list: Alert[], zoneName: string): Promise<void> {
  try {
    if (!(await setup())) return;
    await cancelExceptDebts();
    const now = Date.now();
    for (const a of list.filter((x) => x.at.getTime() > now + 5000).slice(0, 60)) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Waktu ' + a.name, body: 'Masuk waktu ' + a.name + (zoneName ? ' · ' + zoneName : ''), sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: a.at, channelId: 'prayer' } as any,
      });
    }
  } catch (e) {}
}
async function cancelExceptDebts() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) if (!String(n.identifier).startsWith('debt-')) await Notifications.cancelScheduledNotificationAsync(n.identifier);
}
export async function clearPrayerAlerts() { try { if (Platform.OS !== 'web') await cancelExceptDebts(); } catch (e) {} }
