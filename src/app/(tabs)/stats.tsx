import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from '../../components/Glass';
import { Blob } from '../../components/Bg';
import { useUsage } from '../../lib/usage';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Blob size={320} color="rgba(124,156,255,.5)" style={{ right: -100, top: -40 }} />
      <Blob size={340} color="rgba(94,231,223,.3)" style={{ left: -120, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 130 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>Stats</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 120, marginTop: 14 }}>
              {arr.map((v, i) => (
                <LinearGradient key={i} colors={i === arr.length - 1 ? ['#8fe9e2', '#7c9cff'] : ['rgba(255,255,255,.3)', 'rgba(255,255,255,.3)']} style={{ flex: 1, height: Math.max(6, Math.round((v / max) * 116)), borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 }} />
              ))}
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

          <Glass style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Most used</Text>
            <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, lineHeight: 19, marginTop: 8 }}>Your most used modules will show here once the modules are open and in use.</Text>
          </Glass>
          <Text style={{ color: 'rgba(255,255,255,.62)', fontSize: 12, lineHeight: 18, marginTop: 12, marginHorizontal: 4 }}>Counted on this device and kept for 30 days.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
