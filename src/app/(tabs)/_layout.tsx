import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { subscribeNav, setNavCollapsed } from '../../lib/navbar';
import { Text } from '../../components/Txt';
import { Tabs, useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
const ARect: any = Animated.createAnimatedComponent(Rect as any);
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
const BUB = [
  ['rgba(143,233,226,.46)', 'rgba(124,156,255,.2)'],
  ['rgba(183,148,255,.5)', 'rgba(124,156,255,.2)'],
  ['rgba(255,143,171,.5)', 'rgba(255,196,107,.2)'],
  ['rgba(150,185,255,.46)', 'rgba(143,233,226,.18)'],
];
const DOT = ['#8fe9e2', '#b794ff', '#ff8fab', '#9bb8ff'];
const PGLOW: Record<string, string> = { Morning: '255,210,122', Afternoon: '124,196,255', Evening: '255,140,107', Night: '124,156,255' };
function Bar({ state }: any) {
  const router = useRouter();
  const home = state.index === 0;
  const period = periodOf(new Date());
  const th = THEMES[period];
  const tint = (a: number) => { const h = th.colors[th.colors.length - 1]; return 'rgba(' + parseInt(h.slice(1, 3), 16) + ',' + parseInt(h.slice(3, 5), 16) + ',' + parseInt(h.slice(5, 7), 16) + ',' + a + ')'; };
  const [W, setW] = useState(0);
  const tw = W / ITEMS.length;
  const bw = tw + 14;
  const idx = state.index;
  const posOf = (i: number) => i * tw + tw / 2 - bw / 2;
  const tx = useRef(new Animated.Value(0)).current;
  const sx = useRef(new Animated.Value(1)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const [BS, setBS] = useState({ w: 0, h: 0 });
  const PER = 2 * (BS.w - 3 - 53) + 2 * (BS.h - 3 - 53) + 2 * Math.PI * 26.5;
  const orb = useRef(new Animated.Value(0)).current;
  const vis = useRef(new Animated.Value(1)).current;
  const LEN = PER * 0.12, WH = PER * 0.04;
  const offA = orb.interpolate({ inputRange: [0, 1], outputRange: [0, -PER] });
  const offAW = orb.interpolate({ inputRange: [0, 1], outputRange: [WH - LEN, WH - LEN - PER] });
  const offB = orb.interpolate({ inputRange: [0, 1], outputRange: [LEN - PER, LEN] });
  const rip = useRef(new Animated.Value(1)).current;
  const col = useRef(new Animated.Value(0)).current;
  const pops = useRef(ITEMS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const lastIdx = useRef(-1);
  useEffect(() => {
    if (!W) return;
    if (lastIdx.current === -1 || lastIdx.current === idx) { tx.setValue(posOf(idx)); }
    else {
      Animated.parallel([
        Animated.spring(tx, { toValue: posOf(idx), friction: 9, tension: 120, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(sx, { toValue: 1.32, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(sx, { toValue: 1, friction: 6, tension: 140, useNativeDriver: true }),
        ]),
      ]).start();
      rip.setValue(0);
      Animated.timing(rip, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
    lastIdx.current = idx;
  }, [idx, W]);
  useEffect(() => {
    orb.setValue(0); vis.setValue(1);
    const oa = Animated.sequence([
      Animated.timing(orb, { toValue: 0.38, duration: 2100, easing: Easing.in(Easing.quad), useNativeDriver: false }),
      Animated.timing(orb, { toValue: 0, duration: 2100, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(vis, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]);
    oa.start();
    pops.forEach((v, i) => Animated.spring(v, { toValue: i === idx ? 1 : 0, friction: 5, tension: 160, useNativeDriver: true }).start());
    setNavCollapsed(false);
    return () => oa.stop();
  }, [idx]);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(sheen, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(sheen, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    loop.start();

    const un = subscribeNav((c) => Animated.timing(col, { toValue: c ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start());
    return () => { loop.stop(); un(); };
  }, []);
  const press = (r: any, i: number) => {
    if (Platform.OS !== 'web') { try { Haptics.selectionAsync(); } catch {} }
    if (i !== idx) router.navigate((r.name === 'index' ? '/' : '/' + r.name) as any);
  };
  const side = col.interpolate({ inputRange: [0, 1], outputRange: [20, 48] });
  const lblH = col.interpolate({ inputRange: [0, 1], outputRange: [13, 0] });
  const lblO = col.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const padV = col.interpolate({ inputRange: [0, 1], outputRange: [10, 9] });
  const gc = PGLOW[period];
  return (
    <>
    <LinearGradient pointerEvents="none" colors={home ? ['rgba(10,15,44,0)', tint(.35), tint(.6)] : ['rgba(10,15,44,0)', 'rgba(10,15,44,.92)', 'rgba(10,15,44,.98)']} locations={[0, 0.55, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 104 }} />
    <Animated.View onLayout={(e) => setBS({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={{ position: 'absolute', left: side, right: side, bottom: 18 }}>
      <Glass radius={28} style={{ padding: 8, backgroundColor: home ? 'rgba(255,255,255,.2)' : 'rgba(24,28,72,.78)' }}>
        {BS.w > 0 && (
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: vis }}>
            <Svg width={BS.w} height={BS.h}>
              {[0, 1].map((k) => {
                const o = k === 0 ? offA : offB;
                const ow = k === 0 ? offAW : offB;
                return (
                  <React.Fragment key={k}>
                    <ARect x={1.5} y={1.5} width={BS.w - 3} height={BS.h - 3} rx={26.5} fill="none" stroke={DOT[idx]} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" strokeDasharray={[LEN, PER - LEN]} strokeDashoffset={o} />
                    <ARect x={1.5} y={1.5} width={BS.w - 3} height={BS.h - 3} rx={26.5} fill="none" stroke={DOT[idx]} strokeWidth={1.8} strokeLinecap="round" strokeDasharray={[LEN, PER - LEN]} strokeDashoffset={o} />
                    <ARect x={1.5} y={1.5} width={BS.w - 3} height={BS.h - 3} rx={26.5} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={1.2} strokeLinecap="round" strokeDasharray={[WH, PER - WH]} strokeDashoffset={ow} />
                  </React.Fragment>
                );
              })}
            </Svg>
          </Animated.View>
        )}
        <View style={{ flexDirection: 'row' }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          {W > 0 && (
            <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: -5, bottom: -5, width: bw, borderRadius: 27, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.45)', transform: [{ translateX: tx }, { scaleX: sx }] }}>
              <LinearGradient colors={['rgba(255,255,255,.26)', 'rgba(255,255,255,.1)']} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
              {BUB.map((c, i) => (
                <Animated.View key={i} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: pops[i] }}>
                  <LinearGradient colors={c as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
                </Animated.View>
              ))}
              <Animated.View style={{ position: 'absolute', left: '50%', top: '50%', width: bw * 1.3, height: bw * 1.3, marginLeft: -bw * 0.65, marginTop: -bw * 0.65, borderRadius: bw, backgroundColor: 'rgba(255,255,255,.55)', opacity: rip.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.5, 0] }), transform: [{ scale: rip.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }) }] }} />
              <Animated.View style={{ position: 'absolute', top: -10, bottom: -10, width: bw * 0.34, left: 0, transform: [{ translateX: sheen.interpolate({ inputRange: [0, 1], outputRange: [-bw * 0.5, bw * 1.2] }) }, { skewX: '-22deg' }] }}>
                <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,.55)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              </Animated.View>
              {DOT.map((c, i) => (
                <Animated.View key={i} style={{ position: 'absolute', bottom: 6, left: '50%', marginLeft: -11, width: 22, height: 3, borderRadius: 3, backgroundColor: c, opacity: pops[i] }} />
              ))}
            </Animated.View>
          )}
          {state.routes.map((r: any, i: number) => {
            const item = ITEMS.find((x) => x.name === r.name); if (!item) return null;
            const on = idx === i;
            const pop = pops[ITEMS.findIndex((x) => x.name === r.name)];
            return (
              <Pressable key={r.key} onPress={() => press(r, i)} accessibilityLabel={item.label} style={{ flex: 1, borderRadius: 22 }}>
                <Animated.View style={{ alignItems: 'center', paddingVertical: padV }}>
                  <Animated.View style={{ transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }, { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] }) }] }}>
                    <Icon name={r.name} color={on ? '#fff' : 'rgba(255,255,255,.65)'} />
                  </Animated.View>
                  <Animated.View style={{ height: lblH, opacity: lblO, overflow: 'hidden', marginTop: 2 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: on ? '#fff' : 'rgba(255,255,255,.65)' }}>{item.label}</Text>
                  </Animated.View>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </Animated.View>
    </>
  );
}
export default function TabsLayout() {
  return <Tabs tabBar={(p) => <Bar {...p} />} screenOptions={{ headerShown: false }}>{ITEMS.map((i) => <Tabs.Screen key={i.name} name={i.name} />)}</Tabs>;
}
