import React from 'react';
import { View } from 'react-native';
import { Text } from './Txt';

const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Twelve months as two rows of six tiles: month name, the number of fasts, and a small fill that shows how it compares.
export function FastMonths({ months, now = new Date(), color = '#34d399' }: { months: number[]; now?: Date; color?: string }) {
  const mx = Math.max(...months, 1);
  const tiles = months.map((n, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1, 12); return { n, m: MS[d.getMonth()], y: d.getFullYear(), cur: i === 11 }; });
  const rows = [tiles.slice(0, 6), tiles.slice(6)];
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11.5, fontWeight: '700', marginBottom: 8 }}>Sunat fasts each month (days)</Text>
      <View style={{ gap: 6 }}>
        {rows.map((r, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: 6 }}>
            {r.map((t, k) => {
              const first = ri === 0 && k === 0; const jan = t.m === 'Jan';
              return (
                <View key={t.m + t.y} style={{ flex: 1, borderRadius: 12, paddingVertical: 8, alignItems: 'center', backgroundColor: t.n > 0 ? 'rgba(52,211,153,.16)' : 'rgba(255,255,255,.07)', borderWidth: 1.5, borderColor: t.cur ? color : 'transparent' }}>
                  <Text style={{ color: t.cur ? '#fff' : 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: '700' }}>{t.m}</Text>
                  <Text style={{ color: t.n > 0 ? color : 'rgba(255,255,255,.35)', fontSize: 17, fontWeight: '800', marginTop: 2 }}>{t.n}</Text>
                  <View style={{ width: '60%', height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.12)', marginTop: 4, overflow: 'hidden' }}><View style={{ width: Math.round((t.n / mx) * 100) + '%', height: 3, backgroundColor: color }} /></View>
                  <Text style={{ color: 'rgba(255,255,255,.45)', fontSize: 9, marginTop: 3 }}>{first || jan ? String(t.y) : ' '}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, marginTop: 8 }}>The outlined tile is this month.</Text>
    </View>
  );
}
