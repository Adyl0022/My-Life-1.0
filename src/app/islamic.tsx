import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Glass } from '../components/Glass';
import { IslamicBg, Header } from '../components/IslamicUi';
import { W } from '../components/Ui';
import { useIslamic, SURAH } from '../lib/islamic';
import { usePrayer } from '../lib/prayer';

const Item = ({ t, s, c, onPress }: { t: string; s: string; c: string; onPress: () => void }) => (
  <Pressable onPress={onPress}><Glass radius={22} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} /></View>
    <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 15, fontWeight: '700' }}>{t}</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12, marginTop: 2 }}>{s}</Text></View>
    <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 20 }}>›</Text>
  </Glass></Pressable>
);

export default function IslamicHub() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [isl] = useIslamic();
  const pr = usePrayer();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const h = now.getHours();
  const z = h >= 5 && h < 12 ? ['GOOD MORNING', "Morning zikir · Al-Ma'thurat", 'Best read after Subuh'] : h >= 12 && h < 15 ? ['COMING UP', "Evening zikir · Al-Ma'thurat", 'Opens after Asar'] : ['GOOD EVENING', "Evening zikir · Al-Ma'thurat", 'Best read after Asar'];
  const lk = isl.lastKey && SURAH[isl.lastKey] ? isl.lastKey : 'kahfi';
  const lv = isl.last[lk];
  const go = (p: string) => router.push(p as any);
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <IslamicBg />
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="Islamic Hub" />
        <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)', marginHorizontal: 20, marginTop: 14 }}>
          {['Today', 'Quran', 'Zikir'].map((n, i) => (
            <Pressable key={n} onPress={() => setTab(i)} style={{ flex: 1 }}>
              {tab === i ? <LinearGradient colors={['#34d399', '#5ee7df']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 8, borderRadius: 999, alignItems: 'center' }}><Text style={{ color: '#06281c', fontSize: 13, fontWeight: '800' }}>{n}</Text></LinearGradient>
                : <View style={{ paddingVertical: 8, alignItems: 'center' }}><Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>{n}</Text></View>}
            </Pressable>
          ))}
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 36, paddingBottom: 50, gap: 12 }}>
          {tab === 0 && (<>
            <Pressable onPress={() => go('/prayer')}>
              <Glass radius={26} style={{ padding: 18 }}>
                <LinearGradient colors={['rgba(52,211,153,.3)', 'rgba(94,231,223,.15)']} pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: -1 }} />
                <Text style={{ color: '#8fe9e2', fontSize: 11, fontWeight: '700', letterSpacing: 1.4 }}>NEXT PRAYER</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
                  <Text style={{ color: W, fontSize: 30, fontWeight: '800' }}>{pr.nextSolat ? pr.nextSolat.name : '—'}</Text>
                  <Text style={{ color: W, fontSize: 22, fontWeight: '700' }}>{pr.nextSolat ? pr.nextSolat.time12 : ''}</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,.78)', fontSize: 12.5, marginTop: 6 }}>{pr.status === 'ready' ? 'Assalamualaikum · tap for all prayer times' : pr.status === 'loading' ? 'Loading prayer times…' : 'Tap to open prayer times'}</Text>
              </Glass>
            </Pressable>
            <Pressable onPress={() => go('/mathurat')}><Glass radius={22} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,196,107,.4)' }} />
              <View style={{ flex: 1 }}><Text style={{ color: '#ffd593', fontSize: 10.5, fontWeight: '800', letterSpacing: 1.2 }}>{z[0]}</Text><Text style={{ color: W, fontSize: 14.5, fontWeight: '700', marginTop: 2 }}>{z[1]}</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12, marginTop: 1 }}>{z[2]}</Text></View>
              <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 20 }}>›</Text>
            </Glass></Pressable>
            <Pressable onPress={() => go('/surah/' + lk)}><Glass radius={22} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(94,231,181,.4)' }} />
              <View style={{ flex: 1 }}><Text style={{ color: '#8fe9e2', fontSize: 10.5, fontWeight: '800', letterSpacing: 1.2 }}>CONTINUE READING</Text><Text style={{ color: W, fontSize: 14.5, fontWeight: '700', marginTop: 2 }}>{SURAH[lk].title}</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12, marginTop: 1 }}>{lv ? 'Last read: verse ' + lv : 'Start reading'}</Text></View>
              <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 20 }}>›</Text>
            </Glass></Pressable>
          </>)}
          {tab === 1 && (['fatihah', 'mulk', 'kahfi', 'yasin'] as const).map((k) => <Item key={k} t={SURAH[k].title} s={SURAH[k].sub + (isl.bm[k] ? ' · Saved' : '')} c="rgba(94,231,181,.4)" onPress={() => go('/surah/' + k)} />)}
          {tab === 2 && (<>
            <Item t="Tasbih Counter" s="Count your zikir" c="rgba(255,196,107,.4)" onPress={() => go('/tasbih')} />
            <Item t="Tahlil Arwah" s="Standard reading · 26 parts" c="rgba(124,156,255,.4)" onPress={() => go('/tahlil')} />
            <Item t="Al-Ma'thurat" s="Sughra · 28 parts" c="rgba(255,143,171,.4)" onPress={() => go('/mathurat')} />
            <Item t="Prayer Times" s="Alerts & Qibla" c="rgba(94,231,223,.4)" onPress={() => go('/prayer')} />
          </>)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
