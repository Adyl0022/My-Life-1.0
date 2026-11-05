import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { Blob } from './Bg';

const lp = (v: Animated.Value, ms: number, delay = 0, from = 0, to = 1) => {
  const l = Animated.loop(Animated.sequence([
    Animated.delay(delay),
    Animated.timing(v, { toValue: to, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    Animated.timing(v, { toValue: from, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
  ]));
  l.start();
  return l;
};

function Drift({ children, dx = 10, dy = 16, ms = 5000, delay = 0, rot = 0, style }: any) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = lp(v, ms, delay); return () => l.stop(); }, []);
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style, {
      transform: [
        { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-dx, dx] }) },
        { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-dy, dy] }) },
        { rotate: v.interpolate({ inputRange: [0, 1], outputRange: [-rot + 'deg', rot + 'deg'] }) },
      ],
    }]}>{children}</Animated.View>
  );
}
function Spin({ children, ms = 24000, style }: any) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true })); l.start(); return () => l.stop(); }, []);
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>{children}</Animated.View>;
}
function Star({ x, y, s, i, c = '#fff' }: any) {
  const v = useRef(new Animated.Value(0.1)).current;
  useEffect(() => { const l = lp(v, 1400 + s * 300, i * 280, 0.1, 1); return () => l.stop(); }, []);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: (x + '%') as any, top: (y + '%') as any, width: s + 1.5, height: s + 1.5, borderRadius: 4, backgroundColor: c, opacity: v }} />;
}
function Ring({ x, y, size, c, ms = 3600, delay = 0 }: any) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.out(Easing.quad), useNativeDriver: true })]));
    l.start(); return () => l.stop();
  }, []);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: (x + '%') as any, top: (y + '%') as any, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: size, borderWidth: 1.5, borderColor: c,
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.5] }) }] }} />;
}

const ICONS: Record<string, React.ReactNode> = {
  bell: <><Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><Path d="M10 20a2 2 0 0 0 4 0" /></>,
  moon: <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  gear: <><Circle cx="12" cy="12" r="3" /><Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  cloud: <><Path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17 18z" /><Path d="M12 11v5M9.8 13.8L12 16l2.2-2.2" /></>,
  shield: <><Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><Path d="M9 12l2 2 4-4" /></>,
  lock: <><Rect x="5" y="11" width="14" height="9" rx="2.5" /><Path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  key: <><Circle cx="8" cy="12" r="3.5" /><Path d="M11.5 12H20M17 12v3M20 12v2.5" /></>,
  finger: <><Path d="M7 11a5 5 0 0 1 10 0v2M5 14a7 7 0 0 1 .5-3M12 9v6a3 3 0 0 0 3 3M9 12v4a5 5 0 0 0 1 3M15 12v3" /></>,
  heart: <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  info: <><Circle cx="12" cy="12" r="8.5" /><Path d="M12 11v5M12 8v.1" /></>,
  star: <Path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
  doc: <><Path d="M7 3h7l4 4v14H7z" /><Path d="M14 3v4h4M10 12h5M10 16h5" /></>,
};
function Tile({ ic, size = 54, c = '#9db4ff', style, ...r }: any) {
  return (
    <Drift style={style} {...r}>
      <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: 'rgba(255,255,255,.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{ICONS[ic]}</Svg>
      </View>
    </Drift>
  );
}

function Mini({ ic, x, y, size = 18, c = '#9db4ff', i = 0 }: any) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const l = lp(v, 2600 + i * 400, i * 350); return () => l.stop(); }, []);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: (x + '%') as any, top: (y + '%') as any,
      opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.5] }),
      transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] }) }, { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{ICONS[ic]}</Svg>
    </Animated.View>
  );
}

export function SettingsBg({ tab = 0 }: { tab?: number }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Drift style={{ right: -100, top: -30 }} dx={22} dy={18} ms={8000}><Blob size={300} color={tab === 1 ? 'rgba(94,231,223,.26)' : tab === 2 ? 'rgba(183,148,255,.28)' : 'rgba(124,156,255,.30)'} style={{ position: 'relative' }} /></Drift>
      <Drift style={{ left: -120, bottom: 110 }} dx={20} dy={24} ms={9500} delay={700}><Blob size={320} color="rgba(183,148,255,.20)" style={{ position: 'relative' }} /></Drift>

      <Spin style={{ right: -70, top: 150 }}>
        <Svg width={220} height={220} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={0.5} opacity={0.10}>{ICONS.gear}<Circle cx="12" cy="12" r="9" /></Svg>
      </Spin>
      <Spin ms={36000} style={{ left: -60, bottom: 260 }}>
        <Svg width={160} height={160} viewBox="0 0 24 24" fill="none" stroke="#8fe9e2" strokeWidth={0.6} opacity={0.12}>{ICONS.gear}<Circle cx="12" cy="12" r="9" /></Svg>
      </Spin>

      {tab === 0 && <>
        <Ring x={82} y={22} size={120} c="rgba(157,180,255,.6)" />
        <Mini ic="bell" x={90} y={7} c="#9db4ff" i={0} /><Mini ic="moon" x={80} y={10} size={15} c="#ffd98a" i={2} />
        <Mini ic="cloud" x={3} y={72} c="#8fe9e2" i={1} /><Mini ic="heart" x={92} y={76} size={15} c="#ff9db4" i={3} />
      </>}
      {tab === 1 && <>
        <Ring x={80} y={26} size={130} c="rgba(94,231,223,.6)" />
        <Mini ic="shield" x={90} y={7} c="#8fe9e2" i={0} /><Mini ic="lock" x={80} y={10} size={15} c="#b794ff" i={2} />
        <Mini ic="finger" x={3} y={72} c="#9db4ff" i={1} /><Mini ic="key" x={92} y={76} size={15} c="#ffd98a" i={3} />
      </>}
      {tab === 2 && <>
        <Ring x={80} y={24} size={120} c="rgba(183,148,255,.6)" />
        <Mini ic="info" x={90} y={7} c="#9db4ff" i={0} /><Mini ic="star" x={80} y={10} size={15} c="#ffd98a" i={2} />
        <Mini ic="doc" x={3} y={72} c="#8fe9e2" i={1} /><Mini ic="heart" x={92} y={76} size={15} c="#ff9db4" i={3} />
      </>}

      <Star x={10} y={14} s={1} i={0} /><Star x={46} y={9} s={2} i={2} c="#8fe9e2" /><Star x={88} y={44} s={1} i={4} /><Star x={22} y={50} s={1} i={1} c="#b794ff" />
      <Star x={64} y={64} s={2} i={3} /><Star x={8} y={78} s={1} i={5} c="#8fe9e2" /><Star x={92} y={84} s={1} i={2} c="#b794ff" /><Star x={52} y={90} s={1} i={6} />
    </View>
  );
}
