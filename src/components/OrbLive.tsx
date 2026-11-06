import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { OrbPart } from './Orb';

const SP = 'M0 -1L.28 -.28L1 0L.28 .28L0 1L-.28 .28L-1 0L-.28 -.28Z';
const loop = (v: Animated.Value, ms: number, delay = 0, yoyo = true) => {
  const seq = yoyo
    ? Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])
    : Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true })]);
  const l = Animated.loop(seq); l.start(); return l;
};
function Spark({ x, y, s, c, ms, delay, drift = 6 }: any) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = loop(t, ms, delay); return () => l.stop(); }, []);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x - s, top: y - s, width: s * 2, height: s * 2, opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.95] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [drift, -drift] }) }, { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] }) }, { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '20deg'] }) }] }}>
      <Svg width={s * 2} height={s * 2} viewBox="-1 -1 2 2"><Path d={SP} fill={c} /></Svg>
    </Animated.View>
  );
}
function Dot({ x, y, r, c, ms, delay }: any) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = loop(t, ms, delay); return () => l.stop(); }, []);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: c, opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.8] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [4, -8] }) }] }} />;
}
function Orbit({ radius, ms, start = 0, children, rev }: any) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = Animated.loop(Animated.timing(t, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true })); l.start(); return () => l.stop(); }, []);
  const a = rev ? ['360deg', '0deg'] : ['0deg', '360deg'];
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: start + 'deg' }] }}>
      <Animated.View style={{ position: 'absolute', width: radius * 2, height: radius * 2, alignItems: 'center', transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: a }) }] }}>{children}</Animated.View>
    </Animated.View>
  );
}
function Pulse({ size, delay }: any) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = loop(t, 2800, delay, false); return () => l.stop(); }, []);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: 'rgba(143,233,226,.7)', opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }] }} />;
}

// The assistant orb, alive: the four colour lights swirl inside while the star stays still, small sparkles float and orbit around it.
export function OrbLive({ size = 92 }: { size?: number }) {
  const W = size * 3.1, H = size * 2.1, cx = W / 2, cy = H / 2;
    const swirl = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const b = Animated.loop(Animated.timing(swirl, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }));
    b.start();
    return () => { b.stop(); };
  }, []);
  const deg = (v: Animated.Value, rev = false) => v.interpolate({ inputRange: [0, 1], outputRange: rev ? ['360deg', '0deg'] : ['0deg', '360deg'] });
  const R = size / 2;
  return (
    <View style={{ width: W, height: H, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
      <Pulse size={size * 1.05} delay={0} />
      <Pulse size={size * 1.05} delay={1400} />
      <Orbit radius={R * 1.45} ms={11000}>
        <Svg width={12} height={12} viewBox="-1 -1 2 2"><Path d={SP} fill="#8fe9e2" /></Svg>
      </Orbit>
      <Orbit radius={R * 1.75} ms={17000} start={120} rev>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff8fe0' }} />
      </Orbit>
      <Orbit radius={R * 1.3} ms={8000} start={240}>
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#ffd27a' }} />
      </Orbit>
      <View style={{ width: size, height: size }}>
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, transform: [{ rotate: deg(swirl) }] }}><OrbPart size={size} uid="lv-a" part="base" /></Animated.View>
        <View style={{ position: 'absolute', left: 0, top: 0 }}><OrbPart size={size} uid="lv-z" part="top2" /></View>
        <View style={{ position: 'absolute', left: 0, top: 0 }}><OrbPart size={size} uid="lv-s" part="star" /></View>
      </View>
      <Spark x={cx - size * 1.15} y={cy - size * 0.55} s={6} c="#8fe9e2" ms={1900} delay={0} />
      <Spark x={cx + size * 1.2} y={cy - size * 0.7} s={8} c="#fff" ms={2300} delay={400} />
      <Spark x={cx + size * 1.0} y={cy + size * 0.6} s={5} c="#ff8fe0" ms={2000} delay={900} />
      <Spark x={cx - size * 0.95} y={cy + size * 0.75} s={7} c="#ffd27a" ms={2500} delay={200} />
      <Spark x={cx - size * 0.2} y={cy - size * 0.98} s={4} c="#b794ff" ms={1700} delay={700} />
      <Spark x={cx + size * 0.35} y={cy + size * 0.95} s={4} c="#8fe9e2" ms={2100} delay={1100} />
      <Dot x={cx - size * 1.4} y={cy + size * 0.1} r={2} c="#fff" ms={2600} delay={300} />
      <Dot x={cx + size * 1.45} y={cy + size * 0.15} r={2.5} c="#8fe9e2" ms={2200} delay={800} />
      <Dot x={cx - size * 0.6} y={cy - size * 0.9} r={2} c="#ff8fe0" ms={2800} delay={500} />
      <Dot x={cx + size * 0.7} y={cy - size * 0.85} r={1.8} c="#ffd27a" ms={2400} delay={1200} />
      <Dot x={cx + size * 0.55} y={cy + size * 0.85} r={2} c="#fff" ms={3000} delay={100} />
    </View>
  );
}
