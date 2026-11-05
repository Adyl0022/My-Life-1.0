import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as LG, RadialGradient, Stop, G, Ellipse } from 'react-native-svg';

const loop = (v: Animated.Value, a: number, b: number, d: number, delay = 0) => {
  const l = Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: b, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(v, { toValue: a, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true })]));
  l.start(); return l;
};
function useLoop(a: number, b: number, d: number, delay = 0) {
  const v = useRef(new Animated.Value(a)).current;
  useEffect(() => { const l = loop(v, a, b, d, delay); return () => l.stop(); }, []);
  return v;
}

export function Star({ x, y, s, i }: { x: string; y: string; s: number; i: number }) {
  const v = useLoop(0.15, 1, 1200 + s * 400, i * 230);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x as any, top: y as any, width: s, height: s, borderRadius: s, backgroundColor: '#fff', opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0.15, 1], outputRange: [0.7, 1.25] }) }] }} />;
}
const STARS: [string, string, number][] = [['8%', '6%', 3], ['22%', '14%', 2], ['41%', '5%', 3], ['58%', '12%', 2], ['76%', '4%', 3], ['91%', '15%', 2], ['14%', '27%', 2], ['50%', '24%', 3], ['86%', '31%', 2], ['32%', '36%', 2], ['68%', '40%', 3], ['6%', '47%', 2], ['94%', '52%', 2]];

export function Skyline({ w = 390, h = 120, color = 'rgba(8,14,40,.55)' }: { w?: number; h?: number; color?: string }) {
  return (
    <Svg width="100%" height={h} viewBox="0 0 390 120" preserveAspectRatio="xMidYMax slice">
      <Path d="M0 120V92h22V78l6-8 6 8v14h18V100h14V84l8-18 8 18v16h20V96h16V70l4-8 4 8v26h14V88h18V72c0-9 8-16 18-16s18 7 18 16v16h18V60l4-12 4 12v28h8V30l3-10 3 10v58h8V60l4-12 4 12v40h22V84h14V92h20V70l8-14 8 14v22h16V80h18V96h22V74l5-9 5 9v22h18V84h14V120z" fill={color} />
      <Circle cx={184} cy={50} r={13} fill={color} /><Path d="M184 30c-2 8-2 8 0 14 2-6 2-6 0-14z" fill={color} />
    </Svg>
  );
}
export function PuasaSky() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      {STARS.map(([x, y, s], i) => <Star key={i} x={x} y={y} s={s} i={i} />)}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}><Skyline /></View>
    </View>
  );
}

export function Crescent({ size = 90 }: { size?: number }) {
  const g = useLoop(0.55, 1, 2200);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: size * 1.15, height: size * 1.15, borderRadius: size, backgroundColor: 'rgba(255,224,150,.2)', opacity: g, transform: [{ scale: g.interpolate({ inputRange: [0.55, 1], outputRange: [0.85, 1.1] }) }] }} />
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs><LG id="cr" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#fff3c4" /><Stop offset="1" stopColor="#ffc46b" /></LG></Defs>
        <Path d="M68 14A38 38 0 1 0 86 66 31 31 0 1 1 68 14z" fill="url(#cr)" />
        <Path d="M78 22l2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="#fff3c4" />
      </Svg>
    </View>
  );
}

export function Lantern({ h = 74, color = '#ffc46b', delay = 0 }: { h?: number; color?: string; delay?: number }) {
  const sw = useLoop(-1, 1, 1900, delay);
  const glow = useLoop(0.6, 1, 1400, delay);
  const w = h * 0.55;
  return (
    <Animated.View style={{ width: w, height: h + 26, alignItems: 'center', transform: [{ translateY: -(h + 26) / 2 }, { rotate: sw.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] }) }, { translateY: (h + 26) / 2 }] }}>
      <View style={{ width: 1.5, height: 26, backgroundColor: 'rgba(255,255,255,.55)' }} />
      <Svg width={w} height={h} viewBox="0 0 40 74">
        <Defs><RadialGradient id={'lg' + delay} cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#fff6cf" stopOpacity="1" /><Stop offset="1" stopColor={color} stopOpacity="0.85" /></RadialGradient></Defs>
        <Circle cx={20} cy={5} r={3.2} fill="none" stroke={color} strokeWidth={1.6} />
        <Path d="M12 12h16l-3 7H15z" fill={color} />
        <Path d="M15 19h10c6 6 8 14 8 22 0 7-3 13-8 17H15c-5-4-8-10-8-17 0-8 2-16 8-22z" fill={'url(#lg' + delay + ')'} stroke={color} strokeWidth={1.4} />
        <Path d="M20 19v39M14 22c-3 8-3 26 1 36M26 22c3 8 3 26-1 36" stroke={color} strokeOpacity={0.8} strokeWidth={1} fill="none" />
        <Rect x={13} y={58} width={14} height={4} rx={1.5} fill={color} />
        <Path d="M16 62l1 8M20 62v10M24 62l-1 8" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </Svg>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 26 + h * 0.3, width: w * 1.6, height: w * 1.6, borderRadius: w, backgroundColor: 'rgba(255,214,120,.28)', opacity: glow }} />
    </Animated.View>
  );
}

export function RamadanHero({ height = 150 }: { height?: number }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, height, overflow: 'hidden', borderRadius: 24 }}>
      {STARS.slice(0, 8).map(([x, y, s], i) => <Star key={i} x={x} y={y} s={s} i={i} />)}
      <View style={{ position: 'absolute', right: 14, top: 6 }}><Crescent size={66} /></View>
      <View style={{ position: 'absolute', right: 96, top: -4 }}><Lantern h={40} delay={300} color="#ff9db5" /></View>
      <View style={{ position: 'absolute', right: 128, top: -4 }}><Lantern h={32} delay={900} color="#8fe9e2" /></View>
    </View>
  );
}

export function TipIcon({ n, size = 38 }: { n: string; size?: number }) {
  const p: any = { stroke: '#fff', strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {n === 'sahur' && <><Path d="M6 22h28a14 14 0 0 1-28 0z" {...p} /><Path d="M12 18c0-3 3-3 3-6M20 18c0-3 3-3 3-6M27 18c0-3 3-3 3-6" {...p} /></>}
      {n === 'dates' && <><Ellipse cx={14} cy={22} rx={6} ry={9} {...p} transform="rotate(-25 14 22)" /><Ellipse cx={26} cy={22} rx={6} ry={9} {...p} transform="rotate(25 26 22)" /><Path d="M14 10l1-4M26 10l-1-4" {...p} /></>}
      {n === 'water' && <><Path d="M20 5c6 8 10 12 10 18a10 10 0 0 1-20 0c0-6 4-10 10-18z" {...p} /><Path d="M15 24a5 5 0 0 0 5 5" {...p} /></>}
      {n === 'fried' && <><Path d="M8 14h24l-3 20H11z" {...p} /><Path d="M13 14V8M20 14V6M27 14V8" {...p} /></>}
      {n === 'sleep' && <><Path d="M30 24A12 12 0 1 1 17 8a9 9 0 0 0 13 16z" {...p} /><Path d="M28 8h6l-6 6h6" {...p} /></>}
      {n === 'walk' && <><Circle cx={22} cy={8} r={3.5} {...p} /><Path d="M22 13l-3 8 5 4-2 10M19 21l-6 3M24 17l5 4" {...p} /></>}
      {n === 'calendar' && <><Rect x={6} y={9} width={28} height={25} rx={5} {...p} /><Path d="M6 17h28M13 5v7M27 5v7" {...p} /><Path d="M14 24h4M22 24h4M14 29h4" {...p} /></>}
      {n === 'heart' && <Path d="M20 34s-13-7.5-13-17a7 7 0 0 1 13-3.5A7 7 0 0 1 33 17c0 9.500-13 17-13 17z" {...p} />}
    </Svg>
  );
}

export function Bob({ children, d = 2600, amp = 6 }: { children: React.ReactNode; d?: number; amp?: number }) {
  const v = useLoop(0, 1, d);
  return <Animated.View style={{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amp] }) }] }}>{children}</Animated.View>;
}
