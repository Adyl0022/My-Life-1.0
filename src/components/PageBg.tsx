import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Circle, LinearGradient as SG, Stop, G } from 'react-native-svg';
import { Blob } from './Bg';

const loop = (v: Animated.Value, ms: number, delay = 0) => {
  const l = Animated.loop(Animated.sequence([
    Animated.delay(delay),
    Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
  ]));
  l.start();
  return l;
};
function Drift({ children, dx = 24, dy = 18, ms = 7000, delay = 0, style }: { children: React.ReactNode; dx?: number; dy?: number; ms?: number; delay?: number; style?: any }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = loop(v, ms, delay); return () => l.stop(); }, []);
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style, { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-dx, dx] }) }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dy, -dy] }) }] }]}>{children}</Animated.View>;
}
function Star({ x, y, s, i, c = '#fff' }: { x: number; y: number; s: number; i: number; c?: string }) {
  const v = useRef(new Animated.Value(0.1)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.delay(i * 280),
      Animated.timing(v, { toValue: 1, duration: 1400 + s * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.1, duration: 1400 + s * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: (x + '%') as any, top: (y + '%') as any, width: s + 1.5, height: s + 1.5, borderRadius: 4, backgroundColor: c, opacity: v, shadowColor: c, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }} />;
}
function Spin({ children, ms = 60000, style }: { children: React.ReactNode; ms?: number; style?: any }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true })); l.start(); return () => l.stop(); }, []);
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>{children}</Animated.View>;
}

const BARS = [34, 52, 40, 70, 58, 86, 64, 96, 78, 110, 92, 130];
export function StatsBg() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Drift style={{ right: -90, top: -40 }}><Blob size={300} color="rgba(124,156,255,.32)" style={{ position: 'relative' }} /></Drift>
      <Drift style={{ left: -120, bottom: 120 }} dx={20} dy={26} ms={9000} delay={800}><Blob size={320} color="rgba(94,231,223,.22)" style={{ position: 'relative' }} /></Drift>
      <Svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
        <Defs>
          <Pattern id="sgrid" width={40} height={40} patternUnits="userSpaceOnUse">
            <Path d="M40 0H0V40" fill="none" stroke="#fff" strokeWidth={0.8} opacity={0.07} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#sgrid)" />
      </Svg>
      <Svg width="100%" height={190} viewBox="0 0 390 190" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Defs><SG id="sl" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#7c9cff" stopOpacity={0} /><Stop offset="0.5" stopColor="#8fe9e2" stopOpacity={0.5} /><Stop offset="1" stopColor="#b794ff" stopOpacity={0.6} /></SG></Defs>
        <G fill="#fff" opacity={0.06}>
          {BARS.map((h, i) => <Rect key={i} x={6 + i * 32} y={190 - h} width={22} height={h} rx={5} />)}
        </G>
        <Path d="M0 150 L32 140 L64 150 L96 120 L128 130 L160 96 L192 112 L224 70 L256 86 L288 50 L320 66 L352 30 L390 20" fill="none" stroke="url(#sl)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Star x={12} y={30} s={1} i={0} /><Star x={84} y={44} s={2} i={2} c="#8fe9e2" /><Star x={30} y={62} s={1} i={4} /><Star x={70} y={78} s={1} i={1} c="#b794ff" />
    </View>
  );
}

export function InsightsBg() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Drift style={{ left: -110, top: 60 }} dx={22} dy={20} ms={8000}><Blob size={320} color="rgba(255,143,171,.26)" style={{ position: 'relative' }} /></Drift>
      <Drift style={{ right: -120, bottom: 90 }} dx={24} dy={24} ms={9500} delay={600}><Blob size={340} color="rgba(124,156,255,.3)" style={{ position: 'relative' }} /></Drift>
      <Spin style={{ right: -150, top: -100 }} ms={90000}>
        <Svg width={380} height={380} viewBox="0 0 380 380">
          <Circle cx={190} cy={190} r={176} fill="none" stroke="#fff" strokeWidth={1} opacity={0.12} strokeDasharray="4 10" />
          <Circle cx={190} cy={190} r={132} fill="none" stroke="#b794ff" strokeWidth={1} opacity={0.18} />
          <Circle cx={190} cy={190} r={88} fill="none" stroke="#fff" strokeWidth={1} opacity={0.1} strokeDasharray="2 8" />
          <Circle cx={366} cy={190} r={4} fill="#8fe9e2" opacity={0.8} />
          <Circle cx={190} cy={58} r={3} fill="#ff8fab" opacity={0.8} />
        </Svg>
      </Spin>
      <Spin style={{ left: -160, bottom: -150 }} ms={120000}>
        <Svg width={380} height={380} viewBox="0 0 380 380">
          <Circle cx={190} cy={190} r={176} fill="none" stroke="#fff" strokeWidth={1} opacity={0.1} strokeDasharray="3 9" />
          <Circle cx={190} cy={190} r={120} fill="none" stroke="#8fe9e2" strokeWidth={1} opacity={0.14} />
          <Circle cx={14} cy={190} r={4} fill="#ffc46b" opacity={0.8} />
        </Svg>
      </Spin>
      <Star x={10} y={12} s={2} i={0} /><Star x={44} y={6} s={1} i={3} /><Star x={90} y={34} s={2} i={5} c="#8fe9e2" /><Star x={18} y={48} s={1} i={2} /><Star x={78} y={60} s={1} i={4} c="#ff8fab" /><Star x={52} y={86} s={2} i={6} /><Star x={92} y={90} s={1} i={1} />
    </View>
  );
}
