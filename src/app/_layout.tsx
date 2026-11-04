import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { usePrayer } from '../lib/prayer';
import { useStored } from '../lib/store';

// Keeps prayer alerts scheduled after the user has opened Prayer Times once (never asks for location on first launch).
function Runner() { usePrayer(); return null; }
function PrayerSync() {
  const [last] = useStored<{ lat: number; lon: number; zone: string } | null>('ml_prayer_last', null);
  return Platform.OS !== 'web' && last ? <Runner /> : null;
}
export default function Root() {
  return (<><StatusBar style="light" />{Platform.OS === 'android' ? <NavigationBar hidden style="light" /> : null}<PrayerSync /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f2c' }, animation: 'slide_from_right' }} /></>);
}
