import React from 'react';
import { View, Text, ScrollView, Pressable, Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bg, Blob } from '../../components/Bg';
import { Glass } from '../../components/Glass';
import { PlannerArt, IslamicArt, FinanceArt, RecordArt, HabitArt, ChipIcon, CARDS } from '../../components/dashArt';
import { SkyArt } from '../../components/SkyArt';
import { Orb, OrbSvg } from '../../components/Orb';
import { useUsage } from '../../lib/usage';
import { useName } from '../../lib/store';
import { THEMES, LINES, periodOf } from '../../lib/theme';
import { TOP } from '../../lib/layout';

const ARTS: Record<string, () => React.ReactElement> = { Planner: PlannerArt, Islamic: IslamicArt, Finance: FinanceArt, Record: RecordArt, Habit: HabitArt };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Drift({ dur, delay = 0, children }: { dur: number; delay?: number; children: React.ReactNode }) {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const a = Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true })]));
    a.start(); return () => a.stop();
  }, [v, dur, delay]);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '24deg'] }) }] }}>{children}</Animated.View>;
}

let bannerShown = false;
function Banner() {
  const insets = useSafeAreaInsets();
  const v = React.useRef(new Animated.Value(0)).current;
  const [show] = React.useState(() => { const r = !bannerShown; bannerShown = true; return r; });
  React.useEffect(() => {
    if (!show) return;
    Animated.sequence([Animated.delay(900), Animated.timing(v, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }), Animated.delay(4600), Animated.timing(v, { toValue: 0, duration: 500, useNativeDriver: true })]).start();
  }, [v, show]);
  if (!show) return null;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: insets.top + TOP + 6, left: 0, right: 0, alignItems: 'center', zIndex: 8, opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-90, 0] }) }] }}>
      <LinearGradient colors={['rgba(124,156,255,.34)', 'rgba(10,16,40,.74)', 'rgba(94,231,223,.24)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6, paddingLeft: 8, paddingRight: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(143,233,226,.65)' }}>
        <OrbSvg size={26} uid="bn" />
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.3 }}>My Life Assistant</Text>
        <Text style={{ color: '#d9fff9', fontSize: 11.5, fontWeight: '500' }}>Ask about your data</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();
  const name = useName();
  const go = (k: string) => { const r = ({ Planner: '/planner', Islamic: '/islamic' } as Record<string, string>)[k]; if (r) router.push(r as any); };
  const usage = useUsage(16);
  const mins = Math.floor(usage.today.sec / 60);
  const maxM = Math.max(...usage.series, 1);
  const now = new Date();
  const period = periodOf(now);
  const t = THEMES[period];
  return (
    <Bg period={period}>
      <Blob size={320} color={t.a} style={{ left: -90, top: -60 }} />
      <Blob size={340} color={t.b} style={{ right: -110, top: 420 }} />
      <Blob size={260} color={t.c} style={{ left: -40, top: 520 }} />
      <SkyArt period={period} />
      <Drift dur={11000}><View style={{ position: 'absolute', left: 18, top: 214, width: 74, height: 74, borderRadius: 37, borderWidth: 2, borderColor: 'rgba(255,255,255,.32)' }} /></Drift>
      <Drift dur={13000} delay={1500}><LinearGradient colors={['rgba(255,255,255,.35)', 'rgba(255,255,255,.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', left: 316, top: 262, width: 58, height: 58, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.3)' }} /></Drift>
      <Drift dur={15000} delay={3000}><LinearGradient colors={['rgba(255,255,255,.28)', 'rgba(255,255,255,.03)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 150, top: 300, width: 88, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.25)' }} /></Drift>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 58 + TOP, paddingBottom: 104 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,.88)' }}>Good {period} · {DAYS[now.getDay()]}, {now.getDate()} {MON[now.getMonth()]}</Text>
              <Text style={{ marginTop: 5, fontSize: 21, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>Hi {name},</Text>
              <Text style={{ marginTop: 2, fontSize: 13, color: 'rgba(255,255,255,.88)' }}>{LINES[(now.getDate() - 1) % 31]}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <Pressable onPress={() => router.push('/assistant')} accessibilityLabel="Ask My Life assistant"><Orb size={42} /></Pressable>
              <Pressable onPress={() => router.push('/search')} accessibilityLabel="Search">
              <Glass radius={14} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <View><Svg width={20} height={20} viewBox="0 0 24 24"><Circle cx={11} cy={11} r={7} stroke="#fff" strokeWidth={1.8} fill="none" /><Path d="M20 20l-4-4" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" /></Svg></View>
              </Glass>
              </Pressable>
            </View>
          </View>
          <Text style={{ marginTop: 10, fontSize: 11.5, fontWeight: '700', letterSpacing: 1.6, color: '#d9fff9' }}>YOUR LIFE, ALL IN ONE PLACE</Text>
          <View style={{ flex: 1, gap: 10, marginTop: 10 }}>
            {(() => { const L = CARDS.filter((c) => c.k !== 'Habit'); return [L.slice(0, 2), L.slice(2)]; })().map((row, ri) => (
              <View key={ri} style={{ flex: 1, flexDirection: 'row', gap: 10, minHeight: 100 }}>
            {row.map((c) => (
              <Pressable key={c.k} onPress={() => go(c.k)} style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                <Glass style={{ flex: 1 }}>
                  <LinearGradient colors={[c.c1, c.c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 70 }}>
                    {ARTS[c.k]()}
                  </LinearGradient>
                  <View style={{ flex: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{c.title}</Text>
                      <Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12 }}>{c.sub}</Text>
                    </View>
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.35)', alignItems: 'center', justifyContent: 'center' }}><ChipIcon k={c.k} /></View>
                  </View>
                </Glass>
              </Pressable>
            ))}
              </View>
            ))}
            {(() => { const c = CARDS.find((x) => x.k === 'Habit')!; return (
              <Pressable onPress={() => go('Habit')} style={({ pressed }) => ({ flex: 1.1, minHeight: 100, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                <Glass style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1, paddingLeft: 22, paddingRight: 8, justifyContent: 'center' }}>
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><ChipIcon k="Habit" /></View>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{c.title}</Text>
                    <Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12, lineHeight: 18, marginTop: 6 }}>{c.sub}</Text>
                  </View>
                  <LinearGradient colors={[c.c1, c.c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 170 }}>{ARTS.Habit()}</LinearGradient>
                </Glass>
              </Pressable>); })()}
          </View>
          <Glass style={{ marginTop: 12, height: 90, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 16 }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>App Usage <Text style={{ fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,.65)' }}>· 30 days</Text></Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                <View><Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{mins} min</Text><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>Today</Text></View>
                <View><Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{usage.today.opens} {usage.today.opens === 1 ? 'open' : 'opens'}</Text><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>Today</Text></View>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 60 }}>
              {usage.series.map((m, i) => (
                <LinearGradient key={i} colors={m > 0 ? ['#8fe9e2', '#7c9cff'] : ['rgba(255,255,255,.25)', 'rgba(255,255,255,.25)']} style={{ flex: 1, height: m > 0 ? Math.max(8, Math.round((m / maxM) * 52)) : 4, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 }} />
              ))}
            </View>
          </Glass>
        </View>
      </SafeAreaView>
      <Banner />
    </Bg>
  );
}
