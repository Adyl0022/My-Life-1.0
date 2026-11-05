import React, { useState } from 'react';
import { StatsBg } from '../../components/PageBg';
import { PageIn } from '../../components/PageIn';
import { navScroll } from '../../lib/navbar';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '../../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from '../../components/Glass';
import { Blob } from '../../components/Bg';
import { useUsage } from '../../lib/usage';
import { Rise, FillBar, GrowBar } from '../../components/Anim';
import { HeadIcon } from '../../components/HabitIcons';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useStored } from '../../lib/store';
import { MODS, ModCount } from '../../lib/modules';
import { HEMPTY, getDay, cupsGoal, dateOf, keyOfDate } from '../../lib/habit';
import { TOP } from '../../lib/layout';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MI = ({ k, s = 30 }: { k: string; s?: number }) => {
  const c = (MODS.find((m) => m.k === k) || MODS[0]).c;
  const p: any = { stroke: '#fff', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <View style={{ width: s, height: s, borderRadius: s * 0.32, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24">
        {k === 'planner' && <><Rect x={4} y={5} width={16} height={15} rx={3} {...p} /><Path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4" {...p} /></>}
        {k === 'islamic' && <Path d="M3 21v-7h4v7M17 21v-7h4v7M7 21v-6a5 5 0 0 1 10 0v6M12 10V7M2 21h20" {...p} />}
        {k === 'finance' && <Path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3M3 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5.5A2.5 2.5 0 0 1 3 7.5zM16 13.5h2" {...p} />}
        {k === 'record' && <><Circle cx={12} cy={13} r={8} {...p} /><Path d="M12 13l4-4M12 5v2M4.5 9l1.7 1" {...p} /></>}
        {k === 'habit' && <Path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...p} />}
      </Svg>
    </View>
  );
};
const Lbl = ({ t }: { t: string }) => <Text style={{ color: 'rgba(255,255,255,.65)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1.2 }}>{t.toUpperCase()}</Text>;

export default function Stats() {
  const u = useUsage(16);
  const [metric, setMetric] = useState<'time' | 'opens'>('time');
  const days = u.days;
  const arr = days.map((d) => (metric === 'time' ? Math.round(d.min) : d.opens));
  const max = Math.max(...arr, 1);
  const sum = arr.reduce((a, b) => a + b, 0);
  const todayMin = Math.floor(u.today.sec / 60);
  const yMin = Math.round(days[28].min);
  const diff = todayMin - yMin;
  const avgOpens = days.reduce((a, d) => a + d.opens, 0) / 30;
  const d0 = new Date(); d0.setDate(d0.getDate() - 29);
  const unit = metric === 'time' ? ' min' : '';
  const total = metric === 'time' ? Math.floor(sum / 60) + ' h ' + (sum % 60) + ' m' : String(sum);
  const hasData = sum > 0;
  const [hd] = useStored('ml_habit', HEMPTY);
  const [fin] = useStored<{ spends: { amt: number; date: string }[] }>('ml_finance', { spends: [] } as any);
  const [mc] = useStored<ModCount>('ml_modules', {});
  const cg = cupsGoal(hd);
  const last7 = [-6, -5, -4, -3, -2, -1, 0];
  const wd = last7.map((o) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dateOf(o).getDay()]);
  const spendOn = (o: number) => ((fin && fin.spends) || []).filter((x) => x.date === keyOfDate(dateOf(o))).reduce((a, b) => a + (b.amt || 0), 0);
  const trends = [
    { t: 'Steps', k: 'steps', c: '#34d399', v: last7.map((o) => getDay(hd, o).steps), fmt: (n: number) => Math.round(n).toLocaleString(), unit: 'a day' },
    { t: 'Water', k: 'water', c: '#5ee7df', v: last7.map((o) => getDay(hd, o).cups), fmt: (n: number) => String(Math.round(n * 10) / 10), unit: 'of ' + cg + ' glasses' },
    { t: 'Sleep', k: 'sleep', c: '#b794ff', v: last7.map((o) => getDay(hd, o).sleep), fmt: (n: number) => String(Math.round(n * 10) / 10), unit: 'hours a night' },
    { t: 'Spending', k: '', c: '#ffc46b', v: last7.map((o) => spendOn(o)), fmt: (n: number) => 'RM ' + Math.round(n).toLocaleString(), unit: 'a day' },
  ];
  const tot: Record<string, number> = {};
  Object.values(mc || {}).forEach((day) => Object.keys(day).forEach((m) => { tot[m] = (tot[m] || 0) + day[m]; }));
  const ranked = MODS.map((m) => ({ ...m, n: tot[m.k] || 0 })).filter((m) => m.n > 0).sort((a, b) => b.n - a.n);
  const topN = ranked.length ? ranked[0].n : 1;
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <StatsBg />
      <PageIn i={1}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView onScroll={navScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 + TOP, paddingBottom: 130 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>Stats</Text>
          <Rise i={0}>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
            <Glass radius={22} style={{ flex: 1, padding: 14 }}>
              <Lbl t="Time today" />
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 }}>{todayMin} <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,.7)' }}>min</Text></Text>
              <Text style={{ fontSize: 11.5, marginTop: 2, color: diff >= 0 ? '#7df0c6' : '#ffb3a0' }}>{diff >= 0 ? '+' : '-'}{Math.abs(diff)} min vs yesterday</Text>
            </Glass>
            <Glass radius={22} style={{ flex: 1, padding: 14 }}>
              <Lbl t="Opens today" />
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 }}>{u.today.opens} <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,.7)' }}>{u.today.opens === 1 ? 'time' : 'times'}</Text></Text>
              <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11.5, marginTop: 2 }}>Avg {avgOpens.toFixed(1)} a day</Text>
            </Glass>
          </View>
          </Rise>

          <Rise i={1}>
          <Glass style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Last 30 days</Text>
              <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)' }}>
                {(['time', 'opens'] as const).map((k) => (
                  <Pressable key={k} onPress={() => setMetric(k)}>
                    {metric === k ? (
                      <LinearGradient colors={['#7c9cff', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 }}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{k === 'time' ? 'Time' : 'Opens'}</Text></LinearGradient>
                    ) : (<View style={{ paddingVertical: 6, paddingHorizontal: 12 }}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{k === 'time' ? 'Time' : 'Opens'}</Text></View>)}
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ height: 120, marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 120 }}>
              {arr.map((v, i) => (
                <GrowBar key={i} h={Math.max(6, Math.round((v / max) * 116))} delay={i * 14} dep={metric} style={{ flex: 1 }}>
                  <LinearGradient colors={i === arr.length - 1 ? ['#8fe9e2', '#7c9cff'] : ['rgba(255,255,255,.3)', 'rgba(255,255,255,.3)']} style={{ flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 }} />
                </GrowBar>
              ))}
            </View>
            {!hasData && (
              <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 14, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <HeadIcon k="insight" size={34} />
                <Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 12.5, fontWeight: '700' }}>No activity yet</Text>
                <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5 }}>Your days will fill in as you use the app.</Text>
              </View>
            )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 10.5 }}>{d0.getDate()} {MON[d0.getMonth()]}</Text>
              <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 10.5 }}>Today</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {[[metric === 'time' ? Math.round(sum / 30) + unit : (sum / 30).toFixed(1), 'Daily average'], [max + unit, 'Busiest day'], [total, '30-day total']].map(([a, b]) => (
                <View key={b} style={{ flex: 1, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,.08)' }}>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>{hasData ? a : '-'}</Text>
                  <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>{b}</Text>
                </View>
              ))}
            </View>
          </Glass>
          </Rise>

          <Rise i={3}>
          <Glass style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Most used</Text>
            {ranked.length === 0 ? (
              <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, lineHeight: 19, marginTop: 8 }}>Your most used modules will show here once the modules are open and in use.</Text>
            ) : (
              <View style={{ gap: 12, marginTop: 12 }}>
                {ranked.map((m, i) => (
                  <View key={m.k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MI k={m.k} s={34} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{m.name}</Text>
                        <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{m.n} {m.n === 1 ? 'visit' : 'visits'}</Text>
                      </View>
                      <FillBar p={(m.n / topN) * 100} color={m.c} delay={i * 90} dep={m.n} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Glass>
          </Rise>

          <Rise i={4}>
          <Glass style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Your last 7 days</Text>
            <View style={{ gap: 16, marginTop: 14 }}>
              {trends.map((tr, ti) => {
                const mx = Math.max(...tr.v, 1); const avg = tr.v.reduce((a, b) => a + b, 0) / 7;
                return (
                  <View key={tr.t}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {tr.k ? <HeadIcon k={tr.k} size={24} /> : <MI k="finance" s={24} />}
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 }}>{tr.t}</Text>
                      <Text style={{ color: tr.c, fontSize: 13, fontWeight: '800' }}>{tr.fmt(avg)}</Text>
                      <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11 }}>{tr.unit}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 44 }}>
                      {tr.v.map((v, i) => (
                        <View key={i} style={{ flex: 1, height: 44, justifyContent: 'flex-end' }}>
                          <GrowBar h={Math.max(4, Math.round((v / mx) * 44))} delay={ti * 60 + i * 40} dep={tr.v.join()} style={{ width: '100%' }}>
                            <View style={{ flex: 1, borderRadius: 4, backgroundColor: tr.c, opacity: i === 6 ? 1 : 0.5 }} />
                          </GrowBar>
                        </View>
                      ))}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      {wd.map((d, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,.55)', fontSize: 9.5 }}>{d}</Text>)}
                    </View>
                  </View>
                );
              })}
            </View>
          </Glass>
          </Rise>
          <Text style={{ color: 'rgba(255,255,255,.62)', fontSize: 12, lineHeight: 18, marginTop: 12, marginHorizontal: 4 }}>Counted on this device and kept for 30 days.</Text>
        </ScrollView>
      </SafeAreaView>
      </PageIn>
    </View>
  );
}
