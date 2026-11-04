import React, { useState } from 'react';
import { PageIn } from '../../components/PageIn';
import { navScroll } from '../../lib/navbar';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '../../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Glass } from '../../components/Glass';
import { Blob } from '../../components/Bg';
import { ROUTES } from '../../lib/routes';
import { TOP } from '../../lib/layout';

const TIPS = [
  { title: 'Drink 2 more glasses of water', sub: 'You are at 3 of 8. Log it in Habit Tracker.', href: 'Habit.dc.html', c: ['#5ee7df', '#7c9cff'] },
  { title: "Read evening Al-Ma'thurat", sub: 'Best read after Asar. It takes about 10 minutes.', href: 'Mathurat.dc.html', c: ['#ffc46b', '#ff8f5a'] },
  { title: "Add this month's odometer reading", sub: 'Keep your mileage and suggestions in My Record up to date.', href: 'Record.dc.html', c: ['#ff8fab', '#b794ff'] },
];

export default function Insights() {
  const router = useRouter();
  const [week, setWeek] = useState(false);
  const [toast, setToast] = useState('');
  const score = week ? 74 : 82;
  const R = 54, C = 2 * Math.PI * R;
  const metrics = week
    ? [['Steps', '44,100 this week', 79, '#34d399'], ['Water goal', '5 of 7 days', 71, '#5ee7df'], ['Spending', 'RM 310', 52, '#ffc46b'], ['Habit streak', '4 days', 57, '#ff8fab']]
    : [['Steps', '4,200 of 8,000', 53, '#34d399'], ['Water', '3 of 8 glasses', 38, '#5ee7df'], ['Spending', 'RM 18', 30, '#ffc46b'], ['Habit streak', '4 days', 57, '#ff8fab']];
  const src = week ? [64, 72, 58, 80, 76, 70, 82] : [66, 71, 74, 78];
  const lab = week ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['W1', 'W2', 'W3', 'W4'];

  const go = (href: string) => {
    const r = ROUTES[href];
    if (r) router.push(r as any);
    else { setToast('This screen is being built.'); setTimeout(() => setToast(''), 1800); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <PageIn i={2}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView onScroll={navScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 + TOP, paddingBottom: 130 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>Insights</Text>
            <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)' }}>
              {[false, true].map((w) => (
                <Pressable key={String(w)} onPress={() => setWeek(w)}>
                  {week === w ? (
                    <LinearGradient colors={['#7c9cff', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999 }}><Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>{w ? 'Week' : 'Today'}</Text></LinearGradient>
                  ) : (<View style={{ paddingVertical: 6, paddingHorizontal: 14 }}><Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>{w ? 'Week' : 'Today'}</Text></View>)}
                </Pressable>
              ))}
            </View>
          </View>

          <Glass radius={28} style={{ marginTop: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <LinearGradient colors={['rgba(124,156,255,.3)', 'rgba(183,148,255,.18)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: -1 }} />
            <View style={{ width: 124, height: 124 }}>
              <View style={{ transform: [{ rotate: '-90deg' }] }}>
                <Svg width={124} height={124} viewBox="0 0 124 124">
                  <Defs><SvgGrad id="rg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#8fe9e2" /><Stop offset="1" stopColor="#7c9cff" /></SvgGrad></Defs>
                  <Circle cx={62} cy={62} r={R} stroke="rgba(255,255,255,.14)" strokeWidth={10} fill="none" />
                  <Circle cx={62} cy={62} r={R} stroke="url(#rg)" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={`${C}`} strokeDashoffset={C - (C * score) / 100} />
                </Svg>
              </View>
              <View style={{ position: 'absolute', left: 0, top: 0, width: 124, height: 124, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', lineHeight: 36 }}>{score}</Text>
                <Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, marginTop: 2 }}>out of 100</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#8fe9e2', fontSize: 11, fontWeight: '700', letterSpacing: 1.4 }}>LIFE SCORE</Text>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 4, lineHeight: 21 }}>{week ? 'A steady week' : 'You are doing well today'}</Text>
              <Text style={{ color: 'rgba(255,255,255,.78)', fontSize: 12, lineHeight: 17, marginTop: 6 }}>{week ? 'Steps are on track. Water intake dipped midweek.' : 'Your steps are on track. A little more water would lift your score.'}</Text>
            </View>
          </Glass>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            {metrics.map(([l, v, p, c]) => (
              <Glass key={l as string} radius={22} style={{ width: '47.8%', flexGrow: 1, paddingVertical: 13, paddingHorizontal: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, fontWeight: '600' }}>{l}</Text>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c as string }} />
                </View>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 4 }}>{v}</Text>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.14)', marginTop: 8, overflow: 'hidden' }}>
                  <View style={{ width: `${p}%`, height: 6, borderRadius: 3, backgroundColor: c as string }} />
                </View>
              </Glass>
            ))}
          </View>

          <Glass style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{week ? 'Score this week' : 'Score this month'}</Text>
              <Text style={{ color: 'rgba(255,255,255,.65)', fontSize: 11.5 }}>Sample</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: week ? 8 : 16, height: 84, marginTop: 12 }}>
              {src.map((v, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 5 }}>
                  <LinearGradient colors={i === src.length - 1 ? ['#8fe9e2', '#7c9cff'] : ['rgba(255,255,255,.4)', 'rgba(255,255,255,.14)']} style={{ width: '100%', height: Math.round(v * 0.74) * 0.75, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
                  <Text style={{ color: 'rgba(255,255,255,.65)', fontSize: 10 }}>{lab[i]}</Text>
                </View>
              ))}
            </View>
          </Glass>

          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8, marginHorizontal: 4 }}>Smart suggestions</Text>
          <View style={{ gap: 10 }}>
            {TIPS.map((t) => (
              <Pressable key={t.title} onPress={() => go(t.href)}>
                <Glass radius={22} style={{ paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <LinearGradient colors={t.c as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 13.5, fontWeight: '700' }}>{t.title}</Text>
                    <Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5, marginTop: 2, lineHeight: 15 }}>{t.sub}</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 20 }}>›</Text>
                </Glass>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, lineHeight: 17, marginTop: 14, marginHorizontal: 4 }}>Preview only. In the real app, Insights will be calculated from your own steps, water, sleep, spending and records.</Text>
        </ScrollView>
        {toast ? (
          <View pointerEvents="none" style={{ position: 'absolute', bottom: 110, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.7)' }}>
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '600' }}>{toast}</Text>
          </View>
        ) : null}
      </SafeAreaView>
      </PageIn>
    </View>
  );
}
