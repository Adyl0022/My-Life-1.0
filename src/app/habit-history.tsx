import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Glass } from '../components/Glass';
import { Blob } from '../components/Bg';
import { W } from '../components/Ui';
import { useStored } from '../lib/store';
import { TOP } from '../lib/layout';
import { HData, HEMPTY, MOODS, MON, WD, dateOf, getDay, keyOfDate, scoreOf, actOf, cupsGoal, HDay } from '../lib/habit';
import { Inp } from '../components/Ui';
import { Face } from '../components/HabitIcons';

const SH = ['rgba(255,255,255,.1)', 'rgba(94,231,223,.28)', 'rgba(94,231,223,.5)', 'rgba(94,231,223,.75)', '#5ee7df'];
const Lbl = ({ t }: { t: string }) => <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: '600' }}>{t}</Text>;
const Stat = ({ l, v, u }: { l: string; v: string; u: string }) => (
  <Glass radius={20} style={{ flex: 1, padding: 12 }}><Lbl t={l} /><Text style={{ color: W, fontSize: 20, fontWeight: '800', marginTop: 3 }}>{v}</Text><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>{u}</Text></Glass>
);

export default function HabitHistory() {
  const router = useRouter();
  const [h, setH] = useStored<HData>('ml_habit', HEMPTY);
  const [ed, setEd] = useState(false);
  const cg = cupsGoal(h);
  const goal = h.goal || 8000;
  const [sel, setSel] = useState(29);
  const days = Array.from({ length: 30 }, (_, i) => { const off = i - 29; const x = getDay(h, off); return { i, d: dateOf(off), x, sc: scoreOf(x, goal, cg) }; });
  const lead = (days[0].d.getDay() + 6) % 7;
  let best = 0, run = 0; days.forEach((x) => { if (x.sc >= 3) { run++; best = Math.max(best, run); } else run = 0; });
  const logged = days.filter((x) => x.x.cups > 0 || x.x.sleep > 0);
  const avg = (f: (d: typeof days[0]['x']) => number) => logged.length ? (logged.reduce((a, x) => a + f(x.x), 0) / logged.length).toFixed(1) : '0.0';
  const s = days[sel]; const cells: (typeof days[0] | null)[] = [...Array(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const rows: (typeof days[0] | null)[][] = []; for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  const Box = ({ l, v }: { l: string; v: string }) => <View style={{ flex: 1, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,.08)' }}><Lbl t={l} /><Text style={{ color: W, fontSize: 15, fontWeight: '800', marginTop: 2 }}>{v}</Text></View>;
  return (
    <View style={{ flex: 1, backgroundColor: '#0d1030' }}>
      <LinearGradient colors={['#0d1030', '#1d1250', '#0f2b55']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Blob size={320} color="rgba(183,148,255,.5)" style={{ right: -100, top: -40 }} />
      <Blob size={340} color="rgba(94,231,223,.3)" style={{ left: -120, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 + TOP, paddingBottom: 50 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => router.back()} accessibilityLabel="Back"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 24, marginTop: -3 }}>‹</Text></Glass></Pressable>
            <Text style={{ flex: 1, color: W, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>30-Day History</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Stat l="Avg water" v={avg((x) => x.cups)} u="glasses" /><Stat l="Avg sleep" v={avg((x) => x.sleep)} u="hours" /><Stat l="Best streak" v={String(best)} u="days" />
          </View>
          <Glass radius={24} style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><Text style={{ color: W, fontSize: 15, fontWeight: '800' }}>Last 30 days</Text><Lbl t="Tap a day for details" /></View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((x) => <Text key={x} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,.6)' }}>{x}</Text>)}</View>
            {rows.map((r, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                {r.map((c, ci) => c ? (
                  <Pressable key={ci} accessibilityLabel={c.d.getDate() + ' ' + MON[c.d.getMonth()]} onPress={() => setSel(c.i)} style={{ flex: 1, height: 38, borderRadius: 11, backgroundColor: SH[c.sc], borderWidth: sel === c.i ? 2 : 1, borderColor: sel === c.i ? W : 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: c.sc >= 3 ? '#0d1030' : W, fontSize: 11, fontWeight: '700' }}>{c.d.getDate()}</Text>
                  </Pressable>
                ) : <View key={ci} style={{ flex: 1, height: 38 }} />)}
              </View>
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>Less</Text>
              {SH.map((c, i) => <View key={i} style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: c }} />)}
              <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>More</Text>
            </View>
          </Glass>
          <Glass radius={24} style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: W, fontSize: 15, fontWeight: '800' }}>{WD[s.d.getDay()] + ', ' + s.d.getDate() + ' ' + MON[s.d.getMonth()]}</Text>
              <Pressable onPress={() => setEd(!ed)} style={{ paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: ed ? '#5ee7df' : 'rgba(255,255,255,.14)' }}><Text style={{ color: ed ? '#0d1030' : W, fontSize: 12, fontWeight: '800' }}>{ed ? 'Done' : 'Edit'}</Text></Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}><Box l="Mood" v={s.x.mood >= 0 ? MOODS[s.x.mood][0] : '—'} /><Box l="Water" v={s.x.cups + ' of ' + cg} /></View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}><Box l="Sleep" v={s.x.sleep.toFixed(1) + ' h'} /><Box l="Activity" v={actOf(s.x, goal) + ' of 5'} /></View>
            {!!s.x.note && !ed && <Text style={{ color: 'rgba(255,255,255,.8)', fontSize: 12.5, marginTop: 10, fontStyle: 'italic' }}>“{s.x.note}”</Text>}
            {!!s.x.fast && !ed && <Text style={{ color: '#5ee7df', fontSize: 12, fontWeight: '700', marginTop: 8 }}>Fasting day</Text>}
            {ed && (() => {
              const key = keyOfDate(s.d); const put = (p: Partial<HDay>) => setH({ ...h, days: { ...h.days, [key]: { ...s.x, ...p } } });
              const Stp = ({ l, v, onM, onP }: { l: string; v: string; onM: () => void; onP: () => void }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>{l}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable onPress={onM} style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 18 }}>−</Text></Pressable>
                    <Text style={{ color: W, fontWeight: '800', minWidth: 62, textAlign: 'center', fontSize: 13 }}>{v}</Text>
                    <Pressable onPress={onP} style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 18 }}>+</Text></Pressable>
                  </View>
                </View>);
              return (
                <View style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingHorizontal: 6 }}>
                    {MOODS.map((m, i) => <Pressable key={m[0]} accessibilityLabel={m[0]} onPress={() => put({ mood: s.x.mood === i ? -1 : i })} style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: s.x.mood === i ? 2.5 : 0, borderColor: W }}><Face i={i} size={36} on={s.x.mood === i} /></Pressable>)}
                  </View>
                  <Stp l="Water" v={s.x.cups + ' / ' + cg} onM={() => put({ cups: Math.max(0, s.x.cups - 1) })} onP={() => put({ cups: s.x.cups + 1 })} />
                  <Stp l="Sleep" v={s.x.sleep.toFixed(1) + ' h'} onM={() => put({ sleep: Math.max(0, s.x.sleep - 0.5) })} onP={() => put({ sleep: Math.min(14, s.x.sleep + 0.5) })} />
                  <Stp l="Steps" v={s.x.steps.toLocaleString('en-MY')} onM={() => put({ steps: Math.max(0, s.x.steps - 500) })} onP={() => put({ steps: s.x.steps + 500 })} />
                  <Pressable onPress={() => put({ fast: !s.x.fast })} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: s.x.fast ? '#5ee7df' : 'rgba(255,255,255,.4)', backgroundColor: s.x.fast ? '#5ee7df' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{s.x.fast && <Text style={{ color: '#0d1030', fontWeight: '800' }}>✓</Text>}</View>
                    <Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>Fasting</Text>
                  </Pressable>
                  <Inp value={s.x.note || ''} onChangeText={(v: string) => put({ note: v })} placeholder="Note for this day" style={{ marginTop: 10 }} />
                </View>);
            })()}
          </Glass>
          <Text style={{ color: 'rgba(255,255,255,.62)', fontSize: 12, lineHeight: 18, marginTop: 12, marginHorizontal: 4 }}>Days fill in as you log them on the Habit page. Forgot to log? Pick a day and tap Edit.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
