import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { OrbPart } from './Orb';

const SP = 'M0 -1L.28 -.28L1 0L.28 .28L0 1L-.28 .28L-1 0L-.28 -.28Z';
const loop = (v: Animated.Value, ms: number, delay = 0, yoyo = true) => {
  const seq = yoyo
    ? Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])
    : Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true })]);
  const l = Animated.loop(seq); l.start(); return l;
};
function Spark({ x, y, s, c, ms, delay, drift = 6, flare }: any) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = loop(t, ms, delay); return () => l.stop(); }, []);
  const id = 'g' + Math.round(x * 7 + y * 13);
  const W = s * 4;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x - W / 2, top: y - W / 2, width: W, height: W, opacity: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1, 0.55] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [drift, -drift] }) }, { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.15] }) }, { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '25deg'] }) }] }}>
      <Svg width={W} height={W} viewBox="-2 -2 4 4">
        <Defs><RadialGradient id={id} cx="0" cy="0" r="2" gradientUnits="userSpaceOnUse"><Stop offset="0" stopColor={c} stopOpacity="0.75" /><Stop offset="0.45" stopColor={c} stopOpacity="0.22" /><Stop offset="1" stopColor={c} stopOpacity="0" /></RadialGradient></Defs>
        <Circle cx="0" cy="0" r="2" fill={`url(#${id})`} />
        {flare && (<><Path d="M-2 0H2" stroke="#fff" strokeOpacity={0.55} strokeWidth={0.05} /><Path d="M0 -2V2" stroke="#fff" strokeOpacity={0.55} strokeWidth={0.05} /></>)}
        <Path d={SP} fill="#fff" transform="scale(.8)" />
        <Path d={SP} fill={c} opacity={0.9} transform="scale(.5)" />
      </Svg>
    </Animated.View>
  );
}
function Dot({ x, y, r, c, ms, delay }: any) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = loop(t, ms, delay); return () => l.stop(); }, []);
  const h = r * 4;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x - h / 2, top: y - h / 2, width: h, height: h, alignItems: 'center', justifyContent: 'center', opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.9] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [5, -12] }) }] }}>
      <View style={{ position: 'absolute', width: h, height: h, borderRadius: h / 2, backgroundColor: c, opacity: 0.18 }} />
      <View style={{ width: r * 2, height: r * 2, borderRadius: r, backgroundColor: c }} />
    </Animated.View>
  );
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

function Comet({ radius, ms, start = 0, rev, color, size = 12, star }: any) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = Animated.loop(Animated.timing(t, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true })); l.start(); return () => l.stop(); }, []);
  const a = rev ? ['360deg', '0deg'] : ['0deg', '360deg'];
  const D = radius * 2;
  const tr = [1, 2, 3, 4, 5];
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', width: D, height: D, transform: [{ rotate: start + 'deg' }] }}>
      <Animated.View style={{ width: D, height: D, transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: a }) }] }}>
        {tr.map((n) => (
          <View key={n} style={{ position: 'absolute', width: D, height: D, alignItems: 'center', transform: [{ rotate: (rev ? n : -n) * (480 / radius) + 'deg' }] }}>
            <View style={{ marginTop: -size * 0.1 + (size / 2 - (size * (0.55 - n * 0.09)) / 2), width: size * (0.55 - n * 0.09), height: size * (0.55 - n * 0.09), borderRadius: size, backgroundColor: color, opacity: 0.5 - n * 0.08 }} />
          </View>
        ))}
        <View style={{ position: 'absolute', width: D, height: D, alignItems: 'center' }}>
          {star ? <Svg width={size} height={size} viewBox="-1 -1 2 2" style={{ marginTop: -size / 2 }}><Path d={SP} fill="#fff" /><Path d={SP} fill={color} opacity={0.55} transform="scale(.6)" /></Svg>
            : <View style={{ marginTop: -size / 2, width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff' }} />}
        </View>
      </Animated.View>
    </Animated.View>
  );
}
function Track({ radius, c = 'rgba(255,255,255,.07)' }: any) {
  return <View pointerEvents="none" style={{ position: 'absolute', width: radius * 2, height: radius * 2, borderRadius: radius, borderWidth: 1, borderColor: c }} />;
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
      <Track radius={R * 1.45} />
      <Track radius={R * 1.78} c="rgba(255,255,255,.045)" />
      <Comet radius={R * 1.45} ms={26000} color="#8fe9e2" size={13} star />
      <Comet radius={R * 1.78} ms={42000} start={140} rev color="#ff8fe0" size={7} />
      <Comet radius={R * 1.45} ms={26000} start={200} color="#ffd27a" size={6} />
      <View style={{ width: size, height: size }}>
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, transform: [{ rotate: deg(swirl) }] }}><OrbPart size={size} uid="lv-a" part="base" /></Animated.View>
        <View style={{ position: 'absolute', left: 0, top: 0 }}><OrbPart size={size} uid="lv-z" part="top2" /></View>
        <View style={{ position: 'absolute', left: 0, top: 0 }}><OrbPart size={size} uid="lv-s" part="star" /></View>
      </View>
      <Spark x={cx - size * 1.2} y={cy - size * 0.6} s={7} c="#8fe9e2" ms={2600} delay={0} flare />
      <Spark x={cx + size * 1.25} y={cy - size * 0.75} s={9} c="#c9b8ff" ms={3100} delay={500} flare />
      <Spark x={cx + size * 1.05} y={cy + size * 0.62} s={6} c="#ff8fe0" ms={2800} delay={1100} />
      <Spark x={cx - size * 1.0} y={cy + size * 0.78} s={8} c="#ffd27a" ms={3300} delay={300} flare />
      <Spark x={cx - size * 0.28} y={cy - size * 1.0} s={5} c="#b794ff" ms={2400} delay={900} />
      <Spark x={cx + size * 0.4} y={cy + size * 1.0} s={5} c="#8fe9e2" ms={2900} delay={1500} />
      <Spark x={cx + size * 0.55} y={cy - size * 0.95} s={4} c="#fff" ms={2200} delay={200} />
      <Spark x={cx - size * 0.62} y={cy + size * 0.98} s={4} c="#ff8fe0" ms={2700} delay={1300} />
      <Dot x={cx - size * 1.5} y={cy + size * 0.1} r={2} c="#fff" ms={3400} delay={300} />
      <Dot x={cx + size * 1.5} y={cy + size * 0.2} r={2.4} c="#8fe9e2" ms={3000} delay={800} />
      <Dot x={cx - size * 0.75} y={cy - size * 0.85} r={1.8} c="#ff8fe0" ms={3600} delay={500} />
      <Dot x={cx + size * 0.8} y={cy - size * 0.8} r={1.8} c="#ffd27a" ms={3200} delay={1200} />
      <Dot x={cx + size * 0.7} y={cy + size * 0.85} r={2} c="#fff" ms={3800} delay={100} />
      <Dot x={cx - size * 1.3} y={cy - size * 0.1} r={1.5} c="#c9b8ff" ms={3500} delay={1600} />
      <Dot x={cx + size * 1.3} y={cy + size * 0.5} r={1.5} c="#fff" ms={4000} delay={700} />
    </View>
  );
}
