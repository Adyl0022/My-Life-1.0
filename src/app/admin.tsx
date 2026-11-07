import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Share, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from '../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Glass } from '../components/Glass';
import { Drift, Sky, Wallpaper } from '../components/AuthScreen';
import { Inp, W } from '../components/Ui';
import { TOP } from '../lib/layout';
import { adminCall, useIsAdmin } from '../lib/admin';

const dim = 'rgba(255,255,255,.62)';
const GR = ['#7c9cff', '#b794ff'] as [string, string];
const day = (s?: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
type Ov = { users: number; active: number; codes_unused: number; codes_used: number; new_7d: number; income: number; income_month: number; sold_month: number; free_total: number };
type U = { id: string; email: string; name?: string; created_at: string; last_sign_in_at?: string; active: boolean; confirmed: boolean };
type C = { code: string; note?: string; price?: number | null; method?: string | null; free?: boolean; created_at: string; redeemed_at?: string; used_by?: string };
const METHODS = ['DuitNow', 'Bank', 'Cash', 'Other'];
const rm = (n: number) => 'RM ' + (Number(n) || 0).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const Pill = ({ t, on, onPress, c }: { t: string; on: boolean; onPress: () => void; c?: string }) => (
  <Pressable onPress={onPress} style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1, borderColor: on ? 'transparent' : 'rgba(255,255,255,.22)', backgroundColor: on ? (c || '#7c9cff') : 'rgba(255,255,255,.06)' }}>
    <Text style={{ color: on ? '#0a0f2c' : W, fontSize: 12.5, fontWeight: '800' }}>{t}</Text>
  </Pressable>
);

const Tile = ({ l, v, c, ic }: { l: string; v: number | string; c: string; ic: string }) => (
  <View style={{ flexBasis: '47%', flexGrow: 1, borderRadius: 20, padding: 14, backgroundColor: '#2f2e6e', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', borderTopColor: 'rgba(255,255,255,.32)', overflow: 'hidden' }}>
    <View style={{ position: 'absolute', right: -14, top: -14, width: 64, height: 64, borderRadius: 32, backgroundColor: c, opacity: 0.18 }} />
    <Text style={{ fontSize: 17 }}>{ic}</Text>
    <Text style={{ color: c, fontSize: 30, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 }}>{v}</Text>
    <Text style={{ color: dim, fontSize: 11.5, marginTop: 1 }}>{l}</Text>
  </View>
);
const initial = (u: { name?: string; email: string }) => ((u.name || u.email || '?').trim()[0] || '?').toUpperCase();

export default function Admin() {
  const router = useRouter(); const isAdmin = useIsAdmin();
  const [ov, setOv] = useState<Ov | null>(null); const [users, setUsers] = useState<U[]>([]); const [codes, setCodes] = useState<C[]>([]);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [note, setNote] = useState(''); const [cnt, setCnt] = useState('1');
  const [fresh, setFresh] = useState<string[]>([]); const [tab, setTab] = useState<'users' | 'codes'>('users');
  const [free, setFree] = useState(false); const [price, setPrice] = useState(''); const [method, setMethod] = useState('DuitNow');
  const [q, setQ] = useState(''); const [open, setOpen] = useState(''); const [ask, setAsk] = useState('');
  const load = useCallback(async () => {
    setErr(''); setBusy(true);
    const [a, b, c] = await Promise.all([adminCall<Ov>('admin_overview'), adminCall<U[]>('admin_users'), adminCall<C[]>('admin_codes')]);
    setBusy(false);
    if (!a.ok) { setErr(a.err); return; }
    setOv(a.data); if (b.ok) setUsers(b.data); if (c.ok) setCodes(c.data);
  }, []);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);
  const make = async () => {
    const n = Math.max(1, Math.min(50, parseInt(cnt, 10) || 1));
    const pr = parseFloat(price.replace(',', '.'));
    if (!free && !(pr > 0)) { setErr('Enter the price, or switch to Free.'); return; }
    setBusy(true);
    const r = await adminCall<string[]>('admin_make_codes', { p_count: n, p_note: note, p_price: free ? null : pr, p_method: free ? null : method, p_free: free }); setBusy(false);
    if (!r.ok) { setErr(r.err); return; }
    setErr(''); setFresh(r.data); setNote(''); setPrice(''); load();
  };
  const act = async (fn: string, args: Record<string, unknown>, key: string) => {
    if (ask !== key) { setAsk(key); return; }   // tap twice to confirm
    setAsk(''); setBusy(true); const r = await adminCall<boolean>(fn, args); setBusy(false);
    if (!r.ok) { setErr(r.err.includes('cannot_revoke') ? 'You cannot remove your own access.' : r.err); return; }
    setErr(''); load();
  };
  const send = (code: string) => Share.share({ message: 'Your My Life activation code: ' + code + '\nOpen the app, sign in, then type the 8 characters after ML-.' });
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c', overflow: 'hidden' }}>
      <LinearGradient colors={['#0a0f2c', '#1b1466', '#0a0f2c']} locations={[0, 0.45, 1]} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Drift size={380} color="rgba(106,77,240,0.5)" x={-150} y={-100} dx={40} dy={30} dur={8000} />
      <Drift size={320} color="rgba(94,231,223,0.24)" x={160} y={420} dx={-40} dy={40} dur={10000} />
      <Wallpaper />
      <Sky />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={busy} onRefresh={load} tintColor="#fff" />} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 44 + TOP, paddingBottom: 80 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => router.back()} accessibilityLabel="Back"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 24, marginTop: -3 }}>‹</Text></Glass></Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ color: W, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 }}>Admin</Text>
              <Text style={{ color: '#8fe9e2', fontSize: 10.5, fontWeight: '700', letterSpacing: 2, marginTop: 2 }}>USERS AND ACTIVATION CODES</Text>
            </View>
            {busy ? <ActivityIndicator color="#fff" /> : null}
          </View>
          {!isAdmin ? <Text style={{ color: dim, marginTop: 24 }}>This page is only for the app owner.</Text> : <>
            {err ? <Text style={{ color: '#ffc2cc', marginTop: 14 }}>{err}</Text> : null}
            {ov ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              <Tile l="Total income" v={rm(ov.income)} c="#5ee7b5" ic="💰" /><Tile l="This month" v={rm(ov.income_month)} c="#8fe9e2" ic="📅" />
              <Tile l="Registered users" v={ov.users} c="#b7c4ff" ic="👥" /><Tile l="Activated" v={ov.active} c="#5ee7b5" ic="✅" />
              <Tile l="Sold this month" v={ov.sold_month} c="#ffc46b" ic="🛒" /><Tile l="Given free" v={ov.free_total} c="#ff9ecb" ic="🎁" />
              <Tile l="New this week" v={ov.new_7d} c="#8fe9e2" ic="✨" /><Tile l="Codes not used yet" v={ov.codes_unused} c="#ffc46b" ic="🔑" />
            </View> : null}

            <View style={{ marginTop: 22, borderRadius: 26, padding: 18, backgroundColor: '#3b3a7e', borderWidth: 1, borderColor: 'rgba(255,255,255,.2)', borderTopColor: 'rgba(255,255,255,.4)', borderBottomColor: 'rgba(0,0,0,.35)', borderBottomWidth: 2, overflow: 'hidden' }}>
              <LinearGradient colors={['rgba(255,255,255,.2)', 'rgba(255,255,255,0)']} pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 100 }} />
              <Text style={{ color: W, fontSize: 18, fontWeight: '800' }}>Make activation codes</Text>
              <Text style={{ color: dim, fontSize: 12, marginTop: 3, marginBottom: 14 }}>One code works for one person, once, for life.</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <Pill t="Paid" on={!free} onPress={() => setFree(false)} c="#5ee7b5" /><Pill t="Free (gift)" on={free} onPress={() => setFree(true)} c="#ff9ecb" />
              </View>
              <Inp value={note} onChangeText={setNote} placeholder="Who is it for? (optional)" />
              {!free ? <>
                <View style={{ marginTop: 8 }}><Inp value={price} onChangeText={(t: string) => setPrice(t.replace(/[^0-9.,]/g, '').slice(0, 7))} keyboardType="decimal-pad" placeholder="Price paid (RM)" /></View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>{METHODS.map((m) => <Pill key={m} t={m} on={method === m} onPress={() => setMethod(m)} />)}</View>
              </> : <Text style={{ color: '#ffc2dd', fontSize: 12, marginTop: 8 }}>Free codes are not counted in your income.</Text>}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' }}>
                <View style={{ width: 80 }}><Inp value={cnt} onChangeText={(t: string) => setCnt(t.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" placeholder="How many" /></View>
                <Pressable onPress={make} disabled={busy} style={{ flex: 1 }}><LinearGradient colors={GR} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 15, fontWeight: '800' }}>Make code</Text></LinearGradient></Pressable>
              </View>
              {fresh.map((c) => (
                <View key={c} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 12, borderRadius: 14, backgroundColor: 'rgba(94,231,181,.14)', borderWidth: 1, borderColor: 'rgba(94,231,181,.4)' }}>
                  <Text selectable style={{ flex: 1, color: '#bff5df', fontSize: 18, fontWeight: '800', letterSpacing: 1.5 }}>{c}</Text>
                  <Pressable onPress={() => send(c)} hitSlop={8}><Text style={{ color: '#8fe9e2', fontWeight: '800' }}>Send</Text></Pressable>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 26 }}>
              {(['users', 'codes'] as const).map((t) => (
                <Pressable key={t} onPress={() => setTab(t)} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: tab === t ? '#7c9cff' : 'rgba(255,255,255,.1)' }}>
                  <Text style={{ color: tab === t ? '#0a0f2c' : W, fontWeight: '800', fontSize: 13 }}>{t === 'users' ? 'Users (' + users.length + ')' : 'Codes (' + codes.length + ')'}</Text>
                </Pressable>
              ))}
            </View>
            {tab === 'users' ? <View style={{ marginTop: 12 }}><Inp value={q} onChangeText={setQ} placeholder="Search by name or email" autoCapitalize="none" /></View> : null}
            {tab === 'users' ? users.filter((u) => !q.trim() || (u.email + ' ' + (u.name || '')).toLowerCase().includes(q.trim().toLowerCase())).map((u) => (
              <Pressable key={u.id} onPress={() => { setOpen(open === u.id ? '' : u.id); setAsk(''); }} style={{ marginTop: 10, padding: 12, borderRadius: 18, backgroundColor: '#2f2e6e', borderWidth: 1, borderColor: open === u.id ? 'rgba(143,233,226,.5)' : 'rgba(255,255,255,.14)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <LinearGradient colors={GR} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 18, fontWeight: '800' }}>{initial(u)}</Text></LinearGradient>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ flex: 1, color: W, fontWeight: '700' }} numberOfLines={1}>{u.name || u.email}</Text>
                      <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999, backgroundColor: u.active ? 'rgba(94,231,181,.18)' : 'rgba(255,196,107,.18)' }}><Text style={{ color: u.active ? '#5ee7b5' : '#ffc46b', fontSize: 10.5, fontWeight: '800' }}>{u.active ? 'ACTIVE' : 'NOT ACTIVE'}</Text></View>
                    </View>
                    <Text style={{ color: dim, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{u.email}</Text>
                    <Text style={{ color: dim, fontSize: 11.5, marginTop: 1 }}>{'Joined ' + day(u.created_at) + '  ·  Last sign in ' + day(u.last_sign_in_at)}</Text>
                    {!u.confirmed ? <Text style={{ color: '#ffc46b', fontSize: 11.5, fontWeight: '700', marginTop: 2 }}>Email not confirmed</Text> : null}
                  </View>
                </View>
                {open === u.id ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {u.active
                      ? <Pill t={ask === 'off' + u.id ? 'Tap again to remove access' : 'Remove access'} on={ask === 'off' + u.id} c="#ff8fa0" onPress={() => act('admin_set_license', { p_user: u.id, p_on: false }, 'off' + u.id)} />
                      : <Pill t={ask === 'on' + u.id ? 'Tap again to activate' : 'Activate without a code'} on={ask === 'on' + u.id} c="#5ee7b5" onPress={() => act('admin_set_license', { p_user: u.id, p_on: true }, 'on' + u.id)} />}
                    {!u.confirmed ? <Pill t={ask === 'cf' + u.id ? 'Tap again to confirm' : 'Confirm email'} on={ask === 'cf' + u.id} c="#ffc46b" onPress={() => act('admin_confirm_email', { p_user: u.id }, 'cf' + u.id)} /> : null}
                  </View>
                ) : null}
              </Pressable>
            )) : codes.map((c) => (
              <View key={c.code} style={{ marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: '#2c2b66', borderWidth: 1, borderColor: 'rgba(255,255,255,.12)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text selectable style={{ flex: 1, color: W, fontWeight: '800', letterSpacing: 1 }}>{c.code}</Text>
                  {c.redeemed_at ? <Text style={{ color: dim, fontSize: 11.5, fontWeight: '800' }}>USED</Text> : <Pressable onPress={() => send(c.code)} hitSlop={8}><Text style={{ color: '#8fe9e2', fontWeight: '800' }}>Send</Text></Pressable>}
                </View>
                <Text style={{ color: dim, fontSize: 12, marginTop: 2 }}>{(c.note ? c.note + '  ·  ' : '') + (c.free ? 'Free  ·  ' : c.price != null ? rm(c.price) + (c.method ? ' ' + c.method : '') + '  ·  ' : '') + (c.redeemed_at ? 'Used by ' + c.used_by + ' on ' + day(c.redeemed_at) : 'Made ' + day(c.created_at))}</Text>
              </View>
            ))}
          </>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
