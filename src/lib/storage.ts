import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setItem } from './store';
import { MODS } from './exporter';

export const fmtBytes = (n: number) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB' : (n / 1048576).toFixed(1) + ' MB');

async function dirSize(FS: any, uri: string): Promise<number> {
  try {
    const info = await FS.getInfoAsync(uri);
    if (!info.exists) return 0;
    if (!info.isDirectory) return info.size || 0;
    let t = 0; const names: string[] = await FS.readDirectoryAsync(uri);
    for (const n of names) t += await dirSize(FS, uri.replace(/\/?$/, '/') + n);
    return t;
  } catch (e) { return 0; }
}

// "Your data" is what you saved (entries, notes, receipt photos). "Temporary files" are exports and other leftovers that are safe to delete.
export async function storageInfo(): Promise<{ data: number; temp: number }> {
  let data = 0, temp = 0;
  try {
    const ks = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('ml_'));
    const rows = await AsyncStorage.multiGet(ks);
    rows.forEach(([, v]) => { data += (v || '').length; });
  } catch (e) {}
  if (Platform.OS !== 'web') {
    try {
      const FS: any = await import('expo-file-system/legacy');
      data += await dirSize(FS, (FS.documentDirectory || '') + 'receipts/');
      temp = await dirSize(FS, FS.cacheDirectory || '');
    } catch (e) {}
  }
  return { data, temp };
}

export async function clearTemp(): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const FS: any = await import('expo-file-system/legacy');
  const root: string = FS.cacheDirectory || ''; if (!root) return 0;
  const before = await dirSize(FS, root);
  try { for (const n of await FS.readDirectoryAsync(root)) await FS.deleteAsync(root.replace(/\/?$/, '/') + n, { idempotent: true }); } catch (e) {}
  return Math.max(0, before - (await dirSize(FS, root)));
}

export async function pickText(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return new Promise((res) => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
      i.onchange = async () => { const f = i.files && i.files[0]; res(f ? await f.text() : null); };
      i.click();
    });
  }
  const DP = await import('expo-document-picker');
  const r: any = await DP.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
  if (r.canceled || !r.assets || !r.assets[0]) return null;
  const FS: any = await import('expo-file-system/legacy');
  return FS.readAsStringAsync(r.assets[0].uri);
}

export type Backup = { created: string; parts: string[]; data: Record<string, Record<string, any>> };
// Reads a backup file made by Export. Only the known My Life keys are accepted, anything else in the file is ignored.
export function parseBackup(text: string): Backup | null {
  try {
    const j = JSON.parse(text.replace(/^﻿/, ''));
    if (!j || typeof j !== 'object' || !/^My Life/.test(String(j.app || '')) || !j.data || typeof j.data !== 'object') return null;
    const data: Record<string, Record<string, any>> = {}; const parts: string[] = [];
    for (const m of MODS) {
      const src = j.data[m.k]; if (!src || typeof src !== 'object') continue;
      const keep: Record<string, any> = {};
      m.keys.forEach((k) => { if (src[k] != null && typeof src[k] === 'object') keep[k] = src[k]; });
      if (Object.keys(keep).length) { data[m.k] = keep; parts.push(m.name); }
    }
    if (!parts.length) return null;
    return { created: String(j.created || j.createdAt || ''), parts, data };
  } catch (e) { return null; }
}
export async function applyBackup(b: Backup) {
  for (const m of Object.keys(b.data)) for (const k of Object.keys(b.data[m])) await setItem(k, b.data[m][k]);
}
