import React, { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';

let last = 0;
export function PageIn({ i, children }: { i: number; children: React.ReactNode }) {
  const op = useRef(new Animated.Value(1)).current;
  const dx = useRef(new Animated.Value(0)).current;
  const dy = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(1)).current;
  useFocusEffect(useCallback(() => {
    const dir = i > last ? 1 : i < last ? -1 : 0;
    last = i;
    op.setValue(0); dx.setValue(dir * 38); dy.setValue(dir === 0 ? 18 : 10); sc.setValue(0.965);
    const a = Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(dx, { toValue: 0, friction: 9, tension: 90, useNativeDriver: true }),
      Animated.spring(dy, { toValue: 0, friction: 9, tension: 90, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [i]));
  return <Animated.View style={{ flex: 1, opacity: op, transform: [{ translateX: dx }, { translateY: dy }, { scale: sc }] }}>{children}</Animated.View>;
}
