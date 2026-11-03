import React from 'react';
import { View, Text, TextInput, Pressable, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const W = '#fff';
export const GP = ['#7c9cff', '#b794ff'] as [string, string];
export const Inp = (p: any) => <TextInput placeholderTextColor="rgba(255,255,255,.4)" {...p} style={[{ color: W, fontSize: 14, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 14, backgroundColor: 'rgba(0,0,0,.28)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)', outlineStyle: 'none' } as any, p.style]} />;
export function DateField({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: any }) {
  if (Platform.OS === 'web') {
    return React.createElement('input', { type: 'date', value, onChange: (e: any) => onChange(e.target.value), style: { color: '#fff', colorScheme: 'dark', fontSize: 14, padding: '10px 12px', borderRadius: 14, background: 'rgba(0,0,0,.28)', border: '1px solid rgba(255,255,255,.14)', outline: 'none', fontFamily: 'inherit', minWidth: 0, ...(style || {}) } });
  }
  return <Inp style={style} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" maxLength={10} />;
}
export const Pill = ({ t, onPress, on, style }: { t: string; onPress: () => void; on?: boolean; style?: any }) => (
  <Pressable onPress={onPress} style={style}>
    {on ? <LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center' }}><Text style={{ color: W, fontSize: 13, fontWeight: '800' }}>{t}</Text></LinearGradient>
      : <View style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center' }}><Text style={{ color: W, fontSize: 13, fontWeight: '600' }}>{t}</Text></View>}
  </Pressable>
);
export const SBtn = ({ t, onPress, kind = 'glass', style }: { t: string; onPress: () => void; kind?: 'glass' | 'danger' | 'primary'; style?: any }) => (
  <Pressable onPress={onPress} style={[{ flex: 1 }, style]}>
    <LinearGradient colors={kind === 'primary' ? GP : kind === 'danger' ? ['rgba(255,107,129,.28)', 'rgba(255,107,129,.28)'] : ['rgba(255,255,255,.12)', 'rgba(255,255,255,.12)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 11, borderRadius: 14, alignItems: 'center' }}>
      <Text style={{ color: kind === 'danger' ? '#ffb3bf' : W, fontSize: 13.5, fontWeight: '700' }}>{t}</Text>
    </LinearGradient>
  </Pressable>
);
export function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(5,8,25,.72)', justifyContent: 'center', padding: 20 }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
        {children}
      </View>
    </Modal>
  );
}
export const Toast = ({ t }: { t: string }) => t ? <View pointerEvents="none" style={{ position: 'absolute', bottom: 40, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.75)' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '600' }}>{t}</Text></View> : null;
export const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
