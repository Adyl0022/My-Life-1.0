import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Path, Rect, LinearGradient as SvgLG } from 'react-native-svg';
import { Period } from '../lib/theme';

function loop(v: Animated.Value, duration: number, from = 0, to = 1, easing = Easing.linear, yoyo = false) {
  const seq = yoyo
    ? Animated.sequence([Animated.timing(v, { toValue: to, duration: duration / 2, easing, useNativeDriver: true }), Animated.timing(v, { toValue: from, duration: duration / 2, easing, useNativeDriver: true })])
    : Animated.sequence([Animated.timing(v, { toValue: to, duration, easing, useNativeDriver: true }), Animated.timing(v, { toValue: from, duration: 0, useNativeDriver: true })]);
  return Animated.loop(seq);
}

export function Glow({ size, stops, style }: { size: number; stops: [number, string][]; style?: any }) {
  const id = 'g' + Math.abs(Math.round(size * 7 + stops.length * 13 + (style?.left ?? 0)));
  return (
    <View style={[{ position: 'absolute', width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs><RadialGradient id={id} cx="50%" cy="50%" r="50%">{stops.map(([o, c], i) => <Stop key={i} offset={o} stopColor={c} />)}</RadialGradient></Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function Pulse({ children, style }: { children: React.ReactNode; style?: any }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = loop(v, 6000, 0, 1, Easing.inOut(Easing.ease), true); a.start(); return () => a.stop(); }, [v]);
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }]}>{children}</Animated.View>;
}

function Cloud({ top, w, h, opacity, dur, delay, color = '#fff' }: { top: number; w: number; h: number; opacity: number; dur: number; delay: number; color?: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(delay);
    const a = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: dur * (1 - delay), easing: Easing.linear, useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true })]));
    a.start(); return () => a.stop();
  }, [v, dur, delay]);
  const s = w / 80;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top, left: 0, opacity, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-170, 560] }) }] }}>
      <View style={{ width: w, height: h, borderRadius: 999, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 26 * s - 4, top: -14 * s - 4, width: w * 0.55 + 8, height: h + 8, borderRadius: 999, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 54 * s, top: -4 * s, width: w * 0.4, height: h, borderRadius: 999, backgroundColor: color }} />
    </Animated.View>
  );
}

function Disc({ size, left, top, colors, glow }: { size: number; left: number; top: number; colors: [string, string, string]; glow: string }) {
  const id = 'd' + size + left;
  return (
    <>
      <Glow size={size * 2.4} style={{ left: left - size * 0.7, top: top - size * 0.7 }} stops={[[0, glow], [1, 'rgba(0,0,0,0)']]} />
      <View style={{ position: 'absolute', left, top, width: size, height: size }} pointerEvents="none">
        <Svg width={size} height={size}>
          <Defs><RadialGradient id={id} cx="35%" cy="35%" r="70%"><Stop offset="0" stopColor={colors[0]} /><Stop offset="0.6" stopColor={colors[1]} /><Stop offset="1" stopColor={colors[2]} /></RadialGradient></Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
        </Svg>
      </View>
    </>
  );
}

function Stars() {
  const pts = useRef(Array.from({ length: 26 }, (_, i) => ({ x: (i * 97 + 36) % 380, y: (i * 53 + 28) % 250, r: 1.1 + ((i * 7) % 8) / 10, d: (i % 6) * 0.4 }))).current;
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = loop(v, 2400, 0, 1, Easing.inOut(Easing.ease), true); a.start(); return () => a.stop(); }, [v]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }}>
      <Svg width={390} height={260}>{pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#fff" />)}</Svg>
    </Animated.View>
  );
}

function Moon() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = loop(v, 4000, 0, 1, Easing.inOut(Easing.ease), true); a.start(); return () => a.stop(); }, [v]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 262, top: 92, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
      <Svg width={76} height={76} viewBox="0 0 76 76"><Path d="M44 10a28 28 0 1 0 26 38 22 22 0 1 1-26-38z" fill="#fff7dc" opacity={0.97} /></Svg>
    </Animated.View>
  );
}

function Shoot() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = loop(v, 9000, 0, 1, Easing.in(Easing.ease)); a.start(); return () => a.stop(); }, [v]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 330, top: 40, width: 70, height: 2, opacity: v.interpolate({ inputRange: [0, 0.04, 0.16, 1], outputRange: [0, 1, 0, 0] }), transform: [{ rotate: '28deg' }, { translateX: v.interpolate({ inputRange: [0, 0.16, 1], outputRange: [0, -170, -170] }) }, { translateY: v.interpolate({ inputRange: [0, 0.16, 1], outputRange: [0, 95, 95] }) }] }}>
      <Svg width={70} height={2}><Defs><SvgLG id="sh" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#fff" stopOpacity="0" /><Stop offset="1" stopColor="#fff" stopOpacity="1" /></SvgLG></Defs><Rect width={70} height={2} rx={1} fill="url(#sh)" /></Svg>
    </Animated.View>
  );
}

export function SkyArt({ period }: { period: Period }) {
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: 390, height: 340, overflow: 'hidden' }} pointerEvents="none">
      {period === 'Morning' && (<>
        <Pulse style={{ left: 135, top: 21 }}><Glow size={330} stops={[[0, 'rgba(255,238,185,.95)'], [0.38, 'rgba(255,190,120,.45)'], [0.7, 'rgba(0,0,0,0)']]} style={{ position: 'relative' }} /></Pulse>
        <Disc size={72} left={264} top={150} colors={['#fffbe6', '#ffd98a', '#ffb35c']} glow="rgba(255,210,130,.7)" />
        <Cloud top={98} w={80} h={26} opacity={0.6} dur={42000} delay={0.14} />
        <Cloud top={150} w={64} h={20} opacity={0.5} dur={55000} delay={0.44} />
        <Cloud top={60} w={48} h={15} opacity={0.4} dur={48000} delay={0.62} />
      </>)}
      {period === 'Afternoon' && (<>
        <Pulse style={{ left: 108, top: -32 }}><Glow size={320} stops={[[0, 'rgba(255,252,220,.95)'], [0.38, 'rgba(255,225,140,.45)'], [0.7, 'rgba(0,0,0,0)']]} style={{ position: 'relative' }} /></Pulse>
        <Disc size={60} left={238} top={98} colors={['#ffffff', '#fff0a8', '#ffd04d']} glow="rgba(255,236,150,.75)" />
        <Cloud top={88} w={88} h={28} opacity={0.6} dur={36000} delay={0.1} />
        <Cloud top={160} w={72} h={23} opacity={0.55} dur={52000} delay={0.38} />
        <Cloud top={44} w={56} h={18} opacity={0.4} dur={60000} delay={0.55} />
      </>)}
      {period === 'Evening' && (<>
        <Pulse style={{ left: 120, top: 0 }}><Glow size={360} stops={[[0, 'rgba(255,170,110,.9)'], [0.38, 'rgba(255,90,120,.4)'], [0.7, 'rgba(0,0,0,0)']]} style={{ position: 'relative' }} /></Pulse>
        <Disc size={72} left={264} top={146} colors={['#fff0c8', '#ffb06b', '#ff6a5a']} glow="rgba(255,120,90,.65)" />
        <Cloud top={92} w={88} h={28} opacity={0.6} dur={44000} delay={0.18} color="#ffc2d1" />
        <Cloud top={146} w={68} h={22} opacity={0.5} dur={58000} delay={0.45} color="#ffd2bd" />
        <Cloud top={52} w={56} h={18} opacity={0.4} dur={66000} delay={0.52} color="#ffb3c8" />
      </>)}
      {period === 'Night' && (<>
        <Stars />
        <Pulse style={{ left: 150, top: -22 }}><Glow size={300} stops={[[0, 'rgba(190,210,255,.5)'], [0.38, 'rgba(124,156,255,.22)'], [0.7, 'rgba(0,0,0,0)']]} style={{ position: 'relative' }} /></Pulse>
        <Moon />
        <Shoot />
      </>)}
    </View>
  );
}
