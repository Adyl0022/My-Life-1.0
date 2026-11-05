import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { trackModule } from '../lib/modules';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { usePrayer } from '../lib/prayer';
import { useStored } from '../lib/store';
import { DEBT_EMPTY, DebtData, syncDebtAlerts } from '../lib/debts';

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
function Tracker() { const p = usePathname(); useEffect(() => { trackModule(p); }, [p]); return null; }
export default function Root() {
  return (<><Tracker /><StatusBar style="light" />{Platform.OS === 'android' ? <NavigationBar hidden style="light" /> : null}<PrayerSync /><DebtSync /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f2c' }, animation: 'slide_from_right' }} /></>);
}
