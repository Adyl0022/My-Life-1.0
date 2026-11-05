import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { trackModule } from '../lib/modules';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { usePrayer } from '../lib/prayer';
import { useStored, encryptExisting } from '../lib/store';
import { useLockWatcher } from '../lib/lock';
import { LockScreen } from '../components/LockScreen';
import { DEBT_EMPTY, DebtData, syncDebtAlerts } from '../lib/debts';
import { syncEventAlerts, syncZikirAlerts, syncBackupAlert, PEvent } from '../lib/alerts';
import { TG_DEFAULT, Toggles } from '../lib/adhan';

// Keeps prayer alerts scheduled after the user has opened Prayer Times once (never asks for location on first launch).
function Runner() { usePrayer(); return null; }
function PrayerSync() {
  const [last] = useStored<{ lat: number; lon: number; zone: string } | null>('ml_prayer_last', null);
  return Platform.OS !== 'web' && last ? <Runner /> : null;
}
// Re-plans debt due reminders whenever the app opens or the debts change.
function DebtSync() {
  const [d, , ok] = useStored<DebtData>('ml_debts', DEBT_EMPTY);
  useEffect(() => { if (ok && Platform.OS !== 'web') syncDebtAlerts(d); }, [ok, JSON.stringify(d)]);
  return null;
}
// Re-plans Planner event and daily zikir reminders when the app opens, or when events or the switches in Settings change.
function AlertSync() {
  const [pl, , ok] = useStored<{ events: PEvent[] }>('ml_planner', { events: [] });
  const [tg, , ok2] = useStored<Partial<Toggles>>('ml_toggles', {});
  const t = { ...TG_DEFAULT, ...tg };
  useEffect(() => { if (ok && ok2 && Platform.OS !== 'web') syncEventAlerts(pl.events || [], t); }, [ok, ok2, JSON.stringify(pl.events || []), t.ev, t.qh]);
  useEffect(() => { if (ok2 && Platform.OS !== 'web') syncZikirAlerts(t); }, [ok2, t.zk, t.qh]);
  const [bk, , okb] = useStored<number>('ml_backup_last', 0);
  const [bo, , okc] = useStored<boolean>('ml_backup_rem', false);
  useEffect(() => { if (okb && okc && Platform.OS !== 'web') syncBackupAlert(!!bo, bk); }, [okb, okc, bk, bo]);
  return null;
}
function Tracker() { const p = usePathname(); useEffect(() => { trackModule(p); }, [p]); return null; }
export default function Root() {
  useLockWatcher();
  useEffect(() => { encryptExisting(); }, []);
  return (<><Tracker /><StatusBar style="light" />{Platform.OS === 'android' ? <NavigationBar hidden style="light" /> : null}<PrayerSync /><DebtSync /><AlertSync /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f2c' }, animation: 'slide_from_right' }} /><LockScreen /></>);
}
