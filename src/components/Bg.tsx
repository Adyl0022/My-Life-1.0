import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { THEMES, Period } from '../lib/theme';

function split(c: string): [string, number] {
  const m = c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  return m ? ['rgb(' + m[1] + ',' + m[2] + ',' + m[3] + ')', m[4] === undefined ? 1 : parseFloat(m[4])] : [c, 1];
}
export function Blob({ size, color, style }: { size: number; color: string; style?: any }) {
  return (
    <View style={[{ position: 'absolute', width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size}><Defs><RadialGradient id="g" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor={split(color)[0]} stopOpacity={split(color)[1]} /><Stop offset="1" stopColor={split(color)[0]} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#g)" /></Svg>
    </View>
  );
}

export function Bg({ period, children }: { period: Period; children?: React.ReactNode }) {
  const t = THEMES[period];
  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <LinearGradient colors={t.colors as any} locations={t.locations as any} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <LinearGradient colors={['rgba(8,12,40,0)', `rgba(8,12,40,${t.shade})`]} start={{ x: 0, y: 0.2 }} end={{ x: 0, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="none" />
      {children}
    </View>
  );
}
