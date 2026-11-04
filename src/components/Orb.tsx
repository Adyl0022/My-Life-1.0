import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Text } from './Txt';
import Svg, { Defs, RadialGradient, LinearGradient as LG, Stop, Circle, Ellipse, Path, ClipPath, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

export function OrbSvg({ size, uid }: { size: number; uid: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <RadialGradient id={uid + 'b'} cx="0.34" cy="0.28" r="0.85"><Stop offset="0" stopColor="#d9fffb" /><Stop offset="0.38" stopColor="#7fb2ff" /><Stop offset="0.75" stopColor="#6a4df0" /><Stop offset="1" stopColor="#2a1a78" /></RadialGradient>
        <LG id={uid + 'h'} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#fff" stopOpacity="0.85" /><Stop offset="1" stopColor="#fff" stopOpacity="0" /></LG>
        <LG id={uid + 'r'} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#fff" stopOpacity="0.9" /><Stop offset="0.5" stopColor="#fff" stopOpacity="0.08" /><Stop offset="1" stopColor="#8fe9e2" stopOpacity="0.8" /></LG>
        <RadialGradient id={uid + 'c1'} cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#5ee7df" stopOpacity="0.9" /><Stop offset="1" stopColor="#5ee7df" stopOpacity="0" /></RadialGradient>
        <RadialGradient id={uid + 'c2'} cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#ff8fe0" stopOpacity="0.85" /><Stop offset="1" stopColor="#ff8fe0" stopOpacity="0" /></RadialGradient>
        <RadialGradient id={uid + 'c3'} cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" /><Stop offset="1" stopColor="#ffd27a" stopOpacity="0" /></RadialGradient>
        <ClipPath id={uid + 'k'}><Circle cx="24" cy="24" r="22" /></ClipPath>
      </Defs>
      <Circle cx="24" cy="24" r="22" fill={`url(#${uid}b)`} />
      <G clipPath={`url(#${uid}k)`}>
        <Ellipse cx="14" cy="32" rx="14" ry="10" fill={`url(#${uid}c1)`} />
        <Ellipse cx="35" cy="17" rx="12" ry="9" fill={`url(#${uid}c2)`} />
        <Ellipse cx="33" cy="35" rx="11" ry="8" fill={`url(#${uid}c3)`} />
        <Ellipse cx="17" cy="11" rx="12" ry="6.5" fill={`url(#${uid}h)`} transform="rotate(-24 17 11)" />
        <Path d="M6 33a20 20 0 0 0 36 0" fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={3} />
      </G>
      <Circle cx="24" cy="24" r="21.4" fill="none" stroke={`url(#${uid}r)`} strokeWidth={1.2} />
      <Path d="M24 11l3 8.2L35.2 22l-8.2 2.8L24 33l-3-8.2L12.8 22l8.2-2.8z" fill="#fff" />
      <Circle cx="35" cy="12" r="1.8" fill="#fff" />
    </Svg>
  );
}

export function Orb({ size = 42, badge = true, onPress }: { size?: number; badge?: boolean; onPress?: () => void }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 1400, useNativeDriver: false }), Animated.timing(v, { toValue: 0, duration: 1400, useNativeDriver: false })])); a.start(); return () => a.stop(); }, [v]);
  const shadowOpacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.95] });
  return (
    <Animated.View accessibilityLabel="Ask My Life assistant" onTouchEnd={onPress} style={{ width: size, height: size, borderRadius: size / 2, shadowColor: '#8fe9e2', shadowRadius: 14, shadowOpacity: shadowOpacity as any, shadowOffset: { width: 0, height: 0 } }}>
      <OrbSvg size={size} uid={'o' + size} />
      {badge && (
        <LinearGradient colors={['#ff8fab', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', right: -7, bottom: -5, paddingHorizontal: 6, borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,.85)' }}>
          <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 0.4, color: '#fff', lineHeight: 13 }}>AI</Text>
        </LinearGradient>
      )}
    </Animated.View>
  );
}
