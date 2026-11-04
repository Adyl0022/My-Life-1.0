import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing } from 'react-native';
import { Text } from '../../components/Txt';
import { Tabs, useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { THEMES, periodOf } from '../../lib/theme';
import { Glass } from '../../components/Glass';

const ITEMS: { name: string; label: string }[] = [
  { name: 'index', label: 'Home' }, { name: 'stats', label: 'Stats' }, { name: 'insights', label: 'Insights' }, { name: 'settings', label: 'Settings' },
];
function Icon({ name, color }: { name: string; color: string }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {name === 'index' && <Path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" {...p} />}
      {name === 'stats' && <><Path d="M5 20V10M12 20V4M19 20v-7" {...p} /></>}
      {name === 'insights' && <><Path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" {...p} /><Path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" {...p} /></>}
      {name === 'settings' && <><Circle cx={12} cy={12} r={3} {...p} /><Path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" {...p} /></>}
    </Svg>
  );
}
function Bar({ state }: any) {
  const router = useRouter();
  const home = state.index === 0;
  const th = THEMES[periodOf(new Date())];
  const tint = (a: number) => { const h = th.colors[th.colors.length - 1]; return 'rgba(' + parseInt(h.slice(1, 3), 16) + ',' + parseInt(h.slice(3, 5), 16) + ',' + parseInt(h.slice(5, 7), 16) + ',' + a + ')'; };
  const routes = state.routes.filter((r: any) => ITEMS.find((x) => x.name === r.name));
  const n = routes.length || 4;
  const [W, setW] = useState(0);
  const tw = W / n;
  const bw = tw + 10;
  const idx = state.index;
  const posOf = (i: number) => i * tw + tw / 2 - bw / 2;
  const tx = useRef(new Animated.Value(0)).current;
  const sx = useRef(new Animated.Value(1)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const pops = useRef(ITEMS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const first = useRef(true);
  useEffect(() => {
    if (!W) return;
    if (first.current) { first.current = false; tx.setValue(posOf(idx)); }
    else {
      Animated.parallel([
        Animated.spring(tx, { toValue: posOf(idx), friction: 9, tension: 120, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(sx, { toValue: 1.32, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(sx, { toValue: 1, friction: 6, tension: 140, useNativeDriver: true }),
        ]),
      ]).start();
    }
    pops.forEach((v, i) => Animated.spring(v, { toValue: i === idx ? 1 : 0, friction: 5, tension: 160, useNativeDriver: true }).start());
  }, [idx, W]);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(sheen, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(sheen, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <>
    <LinearGradient pointerEvents="none" colors={home ? ['rgba(10,15,44,0)', tint(.35), tint(.6)] : ['rgba(10,15,44,0)', 'rgba(10,15,44,.92)', 'rgba(10,15,44,.98)']} locations={[0, 0.55, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 104 }} />
    <View style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
      <Glass radius={28} style={{ padding: 6, backgroundColor: home ? 'rgba(255,255,255,.2)' : 'rgba(24,28,72,.78)' }}>
        <View style={{ flexDirection: 'row' }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          {W > 0 && (
            <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: bw, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.45)', transform: [{ translateX: tx }, { scaleX: sx }] }}>
              <LinearGradient colors={['rgba(255,255,255,.36)', 'rgba(255,255,255,.14)']} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
              <Animated.View style={{ position: 'absolute', top: -10, bottom: -10, width: bw * 0.34, left: 0, transform: [{ translateX: sheen.interpolate({ inputRange: [0, 1], outputRange: [-bw * 0.5, bw * 1.2] }) }, { skewX: '-22deg' }] }}>
                <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,.55)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              </Animated.View>
              <View style={{ position: 'absolute', bottom: 3, left: '50%', marginLeft: -11, width: 22, height: 3, borderRadius: 3, backgroundColor: '#8fe9e2', opacity: 0.95 }} />
            </Animated.View>
          )}
          {state.routes.map((r: any, i: number) => {
            const item = ITEMS.find((x) => x.name === r.name); if (!item) return null;
            const on = idx === i;
            const pop = pops[ITEMS.findIndex((x) => x.name === r.name)];
            return (
              <Pressable key={r.key} onPress={() => router.navigate((r.name === 'index' ? '/' : '/' + r.name) as any)} accessibilityLabel={item.label} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 22 }}>
                <Animated.View style={{ transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }, { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] }) }] }}>
                  <Icon name={r.name} color={on ? '#fff' : 'rgba(255,255,255,.65)'} />
                </Animated.View>
                <Text style={{ fontSize: 10.5, fontWeight: '700', marginTop: 2, color: on ? '#fff' : 'rgba(255,255,255,.65)' }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </View>
    </>
  );
}
export default function TabsLayout() {
  return <Tabs tabBar={(p) => <Bar {...p} />} screenOptions={{ headerShown: false }}>{ITEMS.map((i) => <Tabs.Screen key={i.name} name={i.name} />)}</Tabs>;
}
