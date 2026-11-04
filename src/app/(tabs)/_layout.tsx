import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../components/Txt';
import { Tabs, useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from '../../components/Glass';

const ITEMS: { name: string; label: string }[] = [
  { name: 'index', label: 'Home' }, { name: 'stats', label: 'Stats' }, { name: 'insights', label: 'Insights' }, { name: 'settings', label: 'Settings' },
];
function Icon({ name, color }: { name: string; color: string }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {name === 'index' && <Path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" {...p} />}
      {name === 'stats' && <><Path d="M5 20V10M12 20V4M19 20v-7" {...p} /></>}
      {name === 'insights' && <><Path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" {...p} /><Path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" {...p} /></>}
      {name === 'settings' && <><Circle cx={12} cy={12} r={3} {...p} /><Path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" {...p} /></>}
    </Svg>
  );
}
function Bar({ state }: any) {
  const router = useRouter();
  return (
    <>
    <LinearGradient pointerEvents="none" colors={['rgba(10,15,44,0)', 'rgba(10,15,44,.92)', 'rgba(10,15,44,.98)']} locations={[0, 0.55, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 104 }} />
    <View style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
      <Glass radius={28} style={{ flexDirection: 'row', padding: 6, backgroundColor: 'rgba(24,28,72,.78)' }}>
        {state.routes.map((r: any, i: number) => {
          const item = ITEMS.find((x) => x.name === r.name); if (!item) return null;
          const on = state.index === i;
          return (
            <Pressable key={r.key} onPress={() => router.navigate((r.name === 'index' ? '/' : '/' + r.name) as any)} accessibilityLabel={item.label} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 22, backgroundColor: on ? 'rgba(255,255,255,.2)' : 'transparent' }}>
              <Icon name={r.name} color={on ? '#fff' : 'rgba(255,255,255,.65)'} />
              <Text style={{ fontSize: 10.5, fontWeight: '700', marginTop: 2, color: on ? '#fff' : 'rgba(255,255,255,.65)' }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </Glass>
    </View>
    </>
  );
}
export default function TabsLayout() {
  return <Tabs tabBar={(p) => <Bar {...p} />} screenOptions={{ headerShown: false }}>{ITEMS.map((i) => <Tabs.Screen key={i.name} name={i.name} />)}</Tabs>;
}
