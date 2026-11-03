import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export const DEFAULT_NAME = 'Adli Syahmi';
const listeners = new Set<() => void>();
export async function getItem<T>(k: string, d: T): Promise<T> {
  try { const r = await AsyncStorage.getItem(k); return r == null ? d : (JSON.parse(r) as T); } catch (e) { return d; }
}
export async function setItem(k: string, v: unknown) {
  try { await AsyncStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  listeners.forEach((f) => f());
}
export async function clearMine(keepName: boolean) {
  try {
    const ks = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('ml_') && !(keepName && k === 'ml_name'));
    await AsyncStorage.multiRemove(ks);
  } catch (e) {}
  listeners.forEach((f) => f());
}
export function useStored<T>(k: string, d: T): [T, (v: T) => void, boolean] {
  const [v, setV] = useState<T>(d); const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = () => getItem<T>(k, d).then((x) => { if (alive) { setV(x); setOk(true); } });
    load(); listeners.add(load);
    return () => { alive = false; listeners.delete(load); };
  }, [k]);
  return [v, (x: T) => { setV(x); setItem(k, x); }, ok];
}
export const useName = () => { const [n] = useStored<string>('ml_name', DEFAULT_NAME); return n; };
