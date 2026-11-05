import React, { useCallback, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

// Plays 0 -> 1 every time the screen gets focus (and whenever `dep` changes).
export function useReplay(dep: any = 0, delay = 0, dur = 700, native = true) {
  const t = useRef(new Animated.Value(0)).current;
  useFocusEffect(useCallback(() => {
    t.setValue(0);
    const a = Animated.timing(t, { toValue: 1, duration: dur, delay: delay + 140, easing: Easing.out(Easing.cubic), useNativeDriver: native });
    a.start();
    return () => a.stop();
  }, [dep]));
  return t;
}
export function Rise({ i = 0, children, style }: { i?: number; children: React.ReactNode; style?: any }) {
  const t = useReplay(0, i * 70, 560);
  return <Animated.View style={[{ opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] }, style]}>{children}</Animated.View>;
}
export function FillBar({ p, color, h = 6, delay = 0, dep = 0 }: { p: number; color: string; h?: number; delay?: number; dep?: any }) {
  const t = useReplay(dep, delay, 800);
  const pc = Math.max(0, Math.min(100, p)) / 100;
  return (
    <View style={{ height: h, borderRadius: h / 2, backgroundColor: 'rgba(255,255,255,.14)', overflow: 'hidden' }}>
      <Animated.View style={{ width: '100%', height: h, borderRadius: h / 2, backgroundColor: color, transformOrigin: 'left', transform: [{ scaleX: t.interpolate({ inputRange: [0, 1], outputRange: [0.0001, Math.max(pc, 0.0001)] }) }] }} />
    </View>
  );
}
export function GrowBar({ h, children, style, delay = 0, dep = 0 }: { h: number; children?: React.ReactNode; style?: any; delay?: number; dep?: any }) {
  const t = useReplay(dep, delay, 700);
  return <Animated.View style={[{ height: h, transformOrigin: 'bottom', transform: [{ scaleY: t.interpolate({ inputRange: [0, 1], outputRange: [0.0001, 1] }) }] }, style]}>{children}</Animated.View>;
}
