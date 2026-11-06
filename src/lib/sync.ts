import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { supabase } from './supabase';
import { getSession } from './auth';
import { getText, applyRemote, clearMine } from './store';

// Data that follows the account. Lock/PIN, keys, caches and per-phone switches stay on the phone.
export const SYNC_KEYS = ['ml_planner', 'ml_notes', 'ml_islamic', 'ml_tasbih', 'ml_puasa', 'ml_finance', 'ml_debts', 'ml_savings', 'ml_record', 'ml_habit', 'ml_name', 'ml_budget', 'ml_mean'];
const META = 'ml_sync_meta', UID = 'ml_sync_uid';
type Meta = Record<string, number>;
let meta: Meta | null = null; let dirty = new Set<string>(); let timer: any = null; let busy = false; let again = false;
export const syncState = { last: 0, err: '' };

async function loadMeta(): Promise<Meta> {
  if (meta) return meta;
  try { meta = JSON.parse((await AsyncStorage.getItem(META)) || '{}'); } catch (e) { meta = {}; }
  return meta!;
}
async function saveMeta() { try { await AsyncStorage.setItem(META, JSON.stringify(meta || {})); } catch (e) {} }

// Called by setItem after every local save.
export async function markDirty(k: string) {
  if (!SYNC_KEYS.includes(k) || !getSession()) return;
  const m = await loadMeta(); m[k] = Date.now(); dirty.add(k); await saveMeta();
  clearTimeout(timer); timer = setTimeout(() => { syncNow(); }, 2500);
}

async function pushKeys(uid: string, keys: string[]) {
  const m = await loadMeta(); const rows: any[] = [];
  for (const k of keys) {
    const t = await getText(k); if (t == null) continue;
    let v: any; try { v = JSON.parse(t); } catch (e) { continue; }
    rows.push({ user_id: uid, key: k, value: v, updated_at: new Date(m[k] || Date.now()).toISOString() });
  }
  if (!rows.length) return;
  const { error } = await supabase.from('user_data').upsert(rows, { onConflict: 'user_id,key' });
  if (error) throw error;
}

// Two-way merge per key: the newest edit wins. Safe to call often; it quietly does nothing when offline or signed out.
export async function syncNow(): Promise<boolean> {
  const s = getSession(); if (!s) return false;
  if (busy) { again = true; return false; }
  busy = true;
  try {
    const uid = s.user.id;
    const prev = await AsyncStorage.getItem(UID);
    if (prev && prev !== uid) { await clearMine(false); meta = {}; dirty = new Set(); await saveMeta(); }
    await AsyncStorage.setItem(UID, uid);
    const m = await loadMeta();
    const { data, error } = await supabase.from('user_data').select('key,value,updated_at').eq('user_id', uid);
    if (error) throw error;
    const remote = new Map<string, { v: any; t: number }>();
    (data || []).forEach((r: any) => { if (SYNC_KEYS.includes(r.key)) remote.set(r.key, { v: r.value, t: new Date(r.updated_at).getTime() }); });
    const toPush: string[] = [];
    for (const k of SYNC_KEYS) {
      const r = remote.get(k); const lt = m[k] || 0;
      if (r && r.t > lt) { await applyRemote(k, r.v); m[k] = r.t; dirty.delete(k); }
      else if (r && lt > r.t) toPush.push(k);
      else if (!r && (dirty.has(k) || (await getText(k)) != null)) { if (!m[k]) m[k] = Date.now(); toPush.push(k); }
    }
    await saveMeta();
    if (toPush.length) { await pushKeys(uid, toPush); toPush.forEach((k) => dirty.delete(k)); }
    syncState.last = Date.now(); syncState.err = '';
    return true;
  } catch (e: any) { syncState.err = e?.message || 'sync failed'; return false; }
  finally { busy = false; if (again) { again = false; setTimeout(syncNow, 1500); } }
}

let started = false;
export function startSync() {
  if (started) return; started = true;
  AppState.addEventListener('change', (s) => { if (s === 'active') syncNow(); });
}
export async function forgetSyncState() { meta = {}; dirty = new Set(); try { await AsyncStorage.multiRemove([META, UID]); } catch (e) {} }
// Removes this account's saved copy from the cloud (used by "Reset all data").
export async function wipeCloud(): Promise<boolean> {
  const s = getSession(); if (!s) return true;
  const { error } = await supabase.from('user_data').delete().eq('user_id', s.user.id);
  return !error;
}
