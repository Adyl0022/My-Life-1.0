import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Txt';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Glass } from './Glass';
import { Inp } from './Ui';
import { HData, GLASS, cupsGoal, latestKg, avgOf, keyOfDate, dateOf } from '../lib/habit';

const W = '#fff'; const T = '#5ee7df';
const dim = 'rgba(255,255,255,.65)';
const Stat = ({ l, v, c }: { l: string; v: string; c?: string }) => (
  <View style={{ flex: 1, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,.08)' }}>
    <Text style={{ color: 'rgba(255,255,255,.68)', fontSize: 10.5 }}>{l}</Text><Text style={{ color: c || W, fontSize: 15, fontWeight: '800', marginTop: 2 }}>{v}</Text>
  </View>
);
const r1 = (n: number) => Math.round(n * 10) / 10;
const daysAgoKey = (n: number) => keyOfDate(dateOf(-n));

export function WeightGoal({ h, setH }: { h: HData; setH: (v: HData) => void }) {
  const [rng, setRng] = useState<30 | 90>(30); const [gin, setGin] = useState(''); const [editing, setEditing] = useState(false);
  const list = (h.kg || []).slice().sort((a, b) => (a.d < b.d ? -1 : 1));
  const kg = latestKg(h); const m = (h.cm || 0) / 100;
  const lo = m ? 18.5 * m * m : 0, hi = m ? 24.9 * m * m : 0;
  const goal = h.goalKg || 0;
  const pts = list.filter((x) => x.d >= daysAgoKey(rng));
  const startW = list.length ? list[0].v : kg;
  const save = () => { const v = parseFloat(gin.replace(',', '.')); setH({ ...h, goalKg: v >= 20 && v <= 300 ? r1(v) : 0 }); setGin(''); setEditing(false); };
  // change over the last 30 days
  const cutK = daysAgoKey(30); const before = list.filter((x) => x.d <= cutK); const base30 = before.length ? before[before.length - 1].v : (list.length > 1 ? list[0].v : 0);
  const base30d = before.length ? 30 : list.length > 1 ? Math.max(1, Math.round((new Date(list[list.length - 1].d).getTime() - new Date(list[0].d).getTime()) / 86400000)) : 0;
  const ch = base30 > 0 ? r1(kg - base30) : 0;
  const perWeek = base30d >= 7 && base30 > 0 ? (kg - base30) / (base30d / 7) : 0;
  const toGo = goal > 0 && kg > 0 ? r1(goal - kg) : 0;
  const lowGoal = goal > 0 && lo > 0 && goal < lo - 0.05;
  const toward = toGo !== 0 && perWeek !== 0 && Math.sign(perWeek) === Math.sign(toGo) && Math.abs(perWeek) >= 0.05;
  const weeks = toward ? Math.ceil(Math.abs(toGo) / Math.abs(perWeek)) : 0;
  const eta = weeks > 0 && weeks < 200 ? new Date(Date.now() + weeks * 7 * 86400000) : null;
  const pct = goal > 0 && startW !== goal ? Math.max(0, Math.min(100, Math.round(((startW - kg) / (startW - goal)) * 100))) : 0;
  // chart
  const CW = 300, CH = 90;
  const vals = pts.map((x) => x.v).concat(goal > 0 ? [goal] : []);
  const mn = Math.min(...vals, kg || 1) - 0.5, mx = Math.max(...vals, kg || 1) + 0.5;
  const t0 = new Date(daysAgoKey(rng) + 'T12:00:00').getTime(), t1 = Date.now();
  const X = (d: string) => 8 + ((new Date(d + 'T12:00:00').getTime() - t0) / (t1 - t0)) * (CW - 16);
  const Y = (v: number) => 8 + (1 - (v - mn) / (mx - mn || 1)) * (CH - 16);
  const path = pts.map((x, i) => (i ? 'L' : 'M') + X(x.d).toFixed(1) + ' ' + Y(x.v).toFixed(1)).join(' ');
  return (
    <Glass radius={26} style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: W, fontSize: 15, fontWeight: '800' }}>Weight goal</Text>
        <Pressable onPress={() => { setEditing(!editing); setGin(goal > 0 ? String(goal) : ''); }} style={{ paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.12)' }}><Text style={{ color: W, fontSize: 12, fontWeight: '700' }}>{goal > 0 ? 'Target ' + goal + ' kg ✎' : '+ Set target'}</Text></Pressable>
      </View>
      {editing ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <Inp style={{ flex: 1 }} keyboardType="decimal-pad" value={gin} onChangeText={setGin} placeholder="Target weight (kg)" onSubmitEditing={save} />
          <Pressable onPress={save} style={{ paddingVertical: 11, paddingHorizontal: 16, borderRadius: 14, backgroundColor: T }}><Text style={{ color: '#0d1030', fontWeight: '800', fontSize: 13 }}>Save</Text></Pressable>
        </View>
      ) : null}
      {hi > 0 ? <Text style={{ color: dim, fontSize: 12, marginTop: 8 }}>Healthy range for your height: {r1(lo)} to {r1(hi)} kg</Text> : <Text style={{ color: dim, fontSize: 12, marginTop: 8 }}>Add your height in the weight card above to see your healthy range.</Text>}
      {lowGoal ? <Text style={{ color: '#ffc46b', fontSize: 12, marginTop: 6, lineHeight: 17 }}>This target is below the healthy range for your height. Please talk to a doctor before aiming this low.</Text> : null}
      {kg > 0 ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Stat l="Now" v={kg + ' kg'} />
          <Stat l="30-day change" v={base30 > 0 ? (ch > 0 ? '+' : '') + ch + ' kg' : '-'} c={base30 > 0 ? W : dim} />
          <Stat l={goal > 0 ? 'To target' : 'Target'} v={goal > 0 ? (toGo === 0 ? 'Reached' : (toGo > 0 ? '+' : '') + toGo + ' kg') : 'Not set'} c={goal > 0 && toGo === 0 ? '#7df0c6' : W} />
        </View>
      ) : <Text style={{ color: dim, fontSize: 12.5, marginTop: 12 }}>Log your weight above to see your trend.</Text>}
      {goal > 0 && kg > 0 && startW !== goal ? (
        <View style={{ marginTop: 12 }}>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.14)', overflow: 'hidden' }}><LinearGradient colors={['#b794ff', T]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 8, width: pct + '%' }} /></View>
          <Text style={{ color: dim, fontSize: 11.5, marginTop: 5 }}>{pct}% of the way from {startW} kg to {goal} kg</Text>
        </View>
      ) : null}
      {pts.length >= 2 ? (
        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end', padding: 2, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)' }}>
            {([30, 90] as const).map((n) => <Pressable key={n} onPress={() => setRng(n)} style={{ paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, backgroundColor: rng === n ? '#b794ff' : 'transparent' }}><Text style={{ color: W, fontSize: 11.5, fontWeight: '700' }}>{n} days</Text></Pressable>)}
          </View>
          <Svg width="100%" height={CH} viewBox={'0 0 ' + CW + ' ' + CH} preserveAspectRatio="none" style={{ marginTop: 6 }}>
            {goal > 0 ? <Line x1={8} x2={CW - 8} y1={Y(goal)} y2={Y(goal)} stroke="#7df0c6" strokeWidth={1.2} strokeDasharray="4 4" /> : null}
            <Path d={path} stroke="#b794ff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((x, i) => <Circle key={x.d} cx={X(x.d)} cy={Y(x.v)} r={i === pts.length - 1 ? 4 : 2.4} fill={i === pts.length - 1 ? T : '#b794ff'} />)}
          </Svg>
          {goal > 0 ? <Text style={{ color: '#7df0c6', fontSize: 11, marginTop: 2 }}>Dashed line is your target</Text> : null}
        </View>
      ) : kg > 0 ? <Text style={{ color: dim, fontSize: 11.5, marginTop: 12 }}>Log your weight at least twice to see the trend chart.</Text> : null}
      {goal > 0 && kg > 0 && toGo !== 0 && !lowGoal ? (
        <View style={{ marginTop: 12, padding: 11, borderRadius: 14, backgroundColor: 'rgba(124,156,255,.2)' }}>
          {eta ? <><Text style={{ color: W, fontSize: 13, fontWeight: '800' }}>About {weeks} {weeks === 1 ? 'week' : 'weeks'} to go</Text><Text style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 2 }}>At your pace of {r1(Math.abs(perWeek))} kg a week you reach {goal} kg around {eta.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}.</Text></>
            : <><Text style={{ color: W, fontSize: 13, fontWeight: '800' }}>No clear trend toward your target yet</Text><Text style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 2 }}>Weigh in weekly for a few weeks and an estimate will show here.</Text></>}
        </View>
      ) : null}
    </Glass>
  );
}

export function DailyNeeds({ h, setH }: { h: HData; setH: (v: HData) => void }) {
  const [age, setAge] = useState(h.age ? String(h.age) : ''); const [ed, setEd] = useState(!(h.age && h.sex));
  const kg = latestKg(h); const cm = h.cm || 0; const a = h.age || 0; const sx = h.sex;
  const ok = kg > 0 && cm > 0 && a > 0 && !!sx;
  const saveAge = (sex: 'm' | 'f' | undefined, ag: string) => { const n = parseInt(ag, 10); setH({ ...h, sex: sex || h.sex, age: n >= 12 && n <= 100 ? n : h.age }); if (n >= 12 && n <= 100 && (sex || h.sex)) setEd(false); };
  let body: React.ReactNode = null;
  if (ok) {
    const bmr = 10 * kg + 6.25 * cm - 5 * a + (sx === 'm' ? 5 : -161);
    const st = avgOf(h, -6, 0, (x) => x.steps);
    const [lvl, mul] = st < 4000 ? ['Light activity', 1.2] : st < 8000 ? ['Moderate activity', 1.375] : st < 12000 ? ['Active', 1.55] : ['Very active', 1.725] as [string, number];
    const tdee = bmr * (mul as number);
    const g = h.goalKg || 0; const m = cm / 100; const bmi = kg / (m * m);
    const mode = g > 0 && g < kg - 0.5 && bmi >= 18.5 ? 'lose' : g > kg + 0.5 ? 'gain' : 'keep';
    const floor = Math.max(bmr, sx === 'm' ? 1500 : 1200);
    const cal = mode === 'lose' ? Math.max(floor, tdee - 400) : mode === 'gain' ? tdee + 300 : tdee;
    const pro = kg * (mode === 'lose' ? 1.6 : mode === 'gain' ? 1.6 : 1.2);
    body = (
      <>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Stat l={mode === 'lose' ? 'Calories to lose' : mode === 'gain' ? 'Calories to gain' : 'Calories to keep'} v={Math.round(cal / 10) * 10 + ' kcal'} />
          <Stat l="Protein" v={Math.round(pro / 5) * 5 + ' g'} />
          <Stat l="Water" v={(cupsGoal(h) * GLASS / 1000).toFixed(1) + ' L'} />
        </View>
        <Text style={{ color: dim, fontSize: 11.5, marginTop: 8, lineHeight: 17 }}>{'Based on ' + lvl.toLowerCase() + ' (about ' + Math.round(st).toLocaleString() + ' steps a day). Your body burns about ' + Math.round(tdee / 10) * 10 + ' kcal a day.' + (mode === 'lose' ? ' The target is a gentle 400 kcal below that, never under ' + Math.round(floor / 10) * 10 + '.' : mode === 'gain' ? ' The target adds a gentle 300 kcal.' : '')}</Text>
      </>
    );
  } else {
    body = <Text style={{ color: dim, fontSize: 12.5, lineHeight: 18, marginTop: 10 }}>{kg > 0 && cm > 0 ? 'Add your age and sex to see your estimate.' : 'Log your weight and height in the weight card, then add your age and sex here.'}</Text>;
  }
  return (
    <Glass radius={26} style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: W, fontSize: 15, fontWeight: '800' }}>Daily needs</Text>
        {ok ? <Pressable onPress={() => setEd(!ed)} style={{ paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.12)' }}><Text style={{ color: W, fontSize: 12, fontWeight: '700' }}>{(sx === 'm' ? 'Male' : 'Female') + ', ' + a + ' ✎'}</Text></Pressable> : null}
      </View>
      <Text style={{ color: dim, fontSize: 12, lineHeight: 17, marginTop: 4 }}>How much food energy and protein your body needs each day, so you can eat in line with your weight goal. Water is your daily drinking target.</Text>
      {ed ? (
        <View style={{ marginTop: 10, gap: 8 }}>
          <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)' }}>
            {([['m', 'Male'], ['f', 'Female']] as ['m' | 'f', string][]).map(([k, n]) => <Pressable key={k} onPress={() => saveAge(k, age)} style={{ flex: 1, paddingVertical: 7, borderRadius: 999, alignItems: 'center', backgroundColor: sx === k ? '#b794ff' : 'transparent' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '800' }}>{n}</Text></Pressable>)}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Inp style={{ flex: 1 }} keyboardType="number-pad" value={age} onChangeText={setAge} placeholder="Age (years)" onSubmitEditing={() => saveAge(undefined, age)} />
            <Pressable onPress={() => saveAge(undefined, age)} style={{ paddingVertical: 11, paddingHorizontal: 16, borderRadius: 14, backgroundColor: T }}><Text style={{ color: '#0d1030', fontWeight: '800', fontSize: 13 }}>Save</Text></Pressable>
          </View>
        </View>
      ) : null}
      {body}
      <Text style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, marginTop: 8, lineHeight: 15 }}>A rough estimate from a standard formula, not medical advice. Your age and sex stay on this device.</Text>
    </Glass>
  );
}
