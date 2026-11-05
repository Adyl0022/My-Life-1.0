import React, { useState } from 'react';
import { View, ScrollView, Pressable, Platform, Share } from 'react-native';
import { Text } from '../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Glass } from '../components/Glass';
import { Blob } from '../components/Bg';
import { TOP } from '../lib/layout';

const W = '#fff';
const MODS = [
  { k: 'planner', name: 'Planner and Notes', sub: 'Events, tasks and notes', c: 'rgba(124,156,255,.4)', keys: ['ml_planner', 'ml_notes'] },
  { k: 'islamic', name: 'Islamic Hub', sub: 'Prayers, zikir, bookmarks, reading progress and Tasbih counts', c: 'rgba(94,231,181,.35)', keys: ['ml_islamic', 'ml_tasbih', 'ml_puasa'] },
  { k: 'finance', name: 'My Finance', sub: 'Income, spending and categories', c: 'rgba(255,196,107,.4)', keys: ['ml_finance'] },
  { k: 'record', name: 'My Record', sub: 'Motorcycle mileage and services', c: 'rgba(255,143,171,.4)', keys: ['ml_record'] },
  { k: 'habit', name: 'Habit and Health', sub: 'Mood, sleep, water and steps', c: 'rgba(183,148,255,.4)', keys: ['ml_habit'] },
  { k: 'usage', name: 'App usage history', sub: 'Time spent and opens from Stats', c: 'rgba(94,231,223,.4)', keys: ['ml_usage_v1'] },
];
const BASE: Record<string, [string, number][]> = {
  planner: [['Notes', 5], ['Tasks', 24], ['Events', 6]], islamic: [['Prayers logged', 118]], finance: [['Income', 3500], ['Spending', 1240]], record: [['Records', 12]], habit: [['Habit days', 30]], usage: [],
};
const FMT = [
  { k: 'xlsx', name: 'Excel', sub: '.xlsx, one sheet per module plus a Totals sheet' },
  { k: 'pdf', name: 'PDF', sub: '.pdf report with a summary and totals' },
  { k: 'csv', name: 'CSV', sub: '.csv, opens in any spreadsheet app' },
  { k: 'json', name: 'Backup (JSON)', sub: 'One file with everything, to restore later or move phones' },
];
const PER = ['This month', '3 months', 'All time'];
const rm = (n: number) => 'RM ' + n.toLocaleString('en-US');

async function collect(sel: string[]) {
  const out: Record<string, any> = {};
  for (const m of MODS.filter((x) => sel.includes(x.k))) {
    out[m.k] = {};
    for (const k of m.keys) { try { const r = await AsyncStorage.getItem(k); if (r != null) out[m.k][k] = JSON.parse(r); } catch (e) {} }
  }
  return out;
}
function toCsv(data: Record<string, any>) {
  const q = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = ['module,key,field,value'];
  const walk = (m: string, k: string, p: string, v: any) => {
    if (v && typeof v === 'object') Object.keys(v).forEach((x) => walk(m, k, p ? p + '.' + x : x, v[x]));
    else rows.push([m, k, p, v].map(q).join(','));
  };
  Object.keys(data).forEach((m) => Object.keys(data[m]).forEach((k) => walk(m, k, '', data[m][k])));
  return rows.join('\n');
}
async function deliver(name: string, mime: string, text: string) {
  if (Platform.OS === 'web') {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new (globalThis as any).Blob([text], { type: mime })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); return;
  }
  await Share.share({ title: name, message: text });
}

export default function Export() {
  const router = useRouter();
  const [inc, setInc] = useState<Record<string, boolean>>({ planner: true, islamic: true, finance: true, record: true, habit: true, usage: true });
  const [per, setPer] = useState(0); const [fmt, setFmt] = useState(3);
  const [phase, setPhase] = useState(0); const [msg, setMsg] = useState('');
  const sel = MODS.filter((m) => inc[m.k]).map((m) => m.k);
  const any = sel.length > 0;
  const mult = [1, 3, 8][per]; const cm = [1, 2, 4][per];
  let inco = 0, sp = 0;
  const totals: [string, string][] = [];
  sel.forEach((k) => BASE[k].forEach(([l, v]) => {
    if (l === 'Income') { inco = v * mult; totals.push(['Total income', rm(inco)]); }
    else if (l === 'Spending') { sp = v * mult; totals.push(['Total spending', rm(sp)]); }
    else totals.push([l, String(Math.round(v * (['Notes', 'Tasks', 'Events', 'Records'].includes(l) ? cm : mult)))]);
  }));
  if (inc.finance) totals.push(['Net balance', rm(inco - sp)]);
  const d = new Date();
  const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const file = 'my-life-export-' + ds + '.' + FMT[fmt].k;
  const reset = () => { setPhase(0); setMsg(''); };

  const run = async () => {
    if (!any || phase === 1) return;
    setPhase(1);
    const k = FMT[fmt].k;
    try {
      if (k === 'xlsx' || k === 'pdf') { await new Promise((r) => setTimeout(r, 700)); setMsg('Excel and PDF files will be built once the modules hold your real data. Use CSV or Backup (JSON) for now.'); setPhase(3); return; }
      const data = await collect(sel);
      const body = k === 'json' ? JSON.stringify({ app: 'My Life', version: '1.0', exported: new Date().toISOString(), period: PER[per], data }, null, 2) : toCsv(data);
      await deliver(file, k === 'json' ? 'application/json' : 'text/csv', body);
      setMsg('Saved as ' + file); setPhase(2);
    } catch (e) { setMsg('Could not create the file. Please try again.'); setPhase(3); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Blob size={320} color="rgba(94,231,181,.35)" style={{ right: -100, top: -40 }} />
      <Blob size={340} color="rgba(124,156,255,.35)" style={{ left: -120, bottom: 40 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 + TOP, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => router.back()} accessibilityLabel="Back"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 24, marginTop: -3 }}>‹</Text></Glass></Pressable>
            <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>Export my data</Text><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Excel, PDF, CSV or a full backup</Text></View>
          </View>

          <Glass style={{ marginTop: 16, padding: 16 }}>
            <Text style={{ color: W, fontSize: 14, fontWeight: '700' }}>Totals in this export</Text>
            <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, marginTop: 1 }}>Sample figures</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {totals.length === 0 ? <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12.5 }}>Nothing selected.</Text> : totals.map(([l, v]) => (
                <View key={l} style={{ width: '31.5%', flexGrow: 1, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,.08)' }}>
                  <Text style={{ color: W, fontSize: 14.5, fontWeight: '800' }}>{v}</Text><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>{l}</Text>
                </View>
              ))}
            </View>
          </Glass>

          <Text style={{ color: W, fontSize: 14, fontWeight: '700', margin: 4, marginTop: 16 }}>What to include</Text>
          <View style={{ gap: 8 }}>
            {MODS.map((m) => (
              <Pressable key={m.k} onPress={() => { setInc({ ...inc, [m.k]: !inc[m.k] }); reset(); }}>
                <Glass radius={18} style={{ paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: m.c }} />
                  <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 13.5, fontWeight: '700' }}>{m.name}</Text><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11.5, marginTop: 1 }}>{m.sub}</Text></View>
                  <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: inc[m.k] ? '#5ee7df' : 'rgba(255,255,255,.45)', backgroundColor: inc[m.k] ? '#5ee7df' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{inc[m.k] ? <Text style={{ color: '#0a0f2c', fontSize: 13, fontWeight: '800' }}>✓</Text> : null}</View>
                </Glass>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: W, fontSize: 14, fontWeight: '700', margin: 4, marginTop: 16 }}>Period</Text>
          <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)' }}>
            {PER.map((n, i) => (
              <Pressable key={n} onPress={() => { setPer(i); reset(); }} style={{ flex: 1 }}>
                {per === i ? <LinearGradient colors={['#7c9cff', '#b794ff']} style={{ paddingVertical: 8, borderRadius: 999, alignItems: 'center' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '700' }}>{n}</Text></LinearGradient>
                  : <View style={{ paddingVertical: 8, alignItems: 'center' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '700' }}>{n}</Text></View>}
              </Pressable>
            ))}
          </View>
          <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, margin: 4, marginTop: 6 }}>Custom date range (from and to) arrives with the real data modules.</Text>

          <Text style={{ color: W, fontSize: 14, fontWeight: '700', margin: 4, marginTop: 12 }}>Format</Text>
          <View style={{ gap: 8 }}>
            {FMT.map((f, i) => (
              <Pressable key={f.k} onPress={() => { setFmt(i); reset(); }}>
                <View style={{ borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: fmt === i ? 'rgba(94,231,181,.22)' : 'rgba(255,255,255,.08)', borderWidth: fmt === i ? 1.5 : 1, borderColor: fmt === i ? '#5ee7df' : 'rgba(255,255,255,.2)' }}>
                  <Text style={{ color: W, fontSize: 14, fontWeight: '700' }}>{f.name}</Text><Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5, marginTop: 1 }}>{f.sub}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={run} disabled={!any} style={{ marginTop: 18 }}>
            <LinearGradient colors={!any ? ['rgba(255,255,255,.12)', 'rgba(255,255,255,.12)'] : phase === 2 ? ['#1d8f5a', '#34d399'] : ['#7c9cff', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 15, borderRadius: 18, alignItems: 'center' }}>
              <Text style={{ color: W, fontSize: 15, fontWeight: '800' }}>{!any ? 'Choose what to include' : phase === 1 ? 'Preparing your file...' : phase === 2 ? 'Done. Export again' : 'Export as ' + FMT[fmt].name}</Text>
            </LinearGradient>
          </Pressable>
          {msg ? <View style={{ marginTop: 10 }}><Text style={{ color: phase === 2 ? '#8fe9e2' : '#ffd593', fontSize: 12.5, lineHeight: 18 }}>{msg}</Text></View> : <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, marginTop: 8 }}>{file}</Text>}
          <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 11.5, lineHeight: 17, marginTop: 14 }}>The file is built on your device from your own data, and only you decide where it goes. Totals above are sample figures until the modules are connected.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
