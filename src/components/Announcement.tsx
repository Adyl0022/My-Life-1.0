import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from './Txt';
import { Glass } from './Glass';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/auth';

const SEEN = 'ml_ann_seen';
// A short message from the owner (for example "a new version is ready"). Shown once per message until it is closed.
export function Announcement() {
  const [sess] = useSession(); const uid = sess?.user?.id || '';
  const [a, setA] = useState<{ id: number; msg: string } | null>(null);
  useEffect(() => {
    let live = true; if (!uid) return;
    (async () => {
      try {
        const { data } = await supabase.rpc('get_announcement'); if (!live || !data?.msg) return;
        const seen = await AsyncStorage.getItem(SEEN); if (seen === String(data.id)) return;
        setA({ id: data.id, msg: data.msg });
      } catch {}
    })();
    return () => { live = false; };
  }, [uid]);
  if (!a) return null;
  const close = () => { AsyncStorage.setItem(SEEN, String(a.id)).catch(() => {}); setA(null); };
  return (
    <Glass radius={18} style={{ marginTop: 12, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 16 }}>📣</Text>
      <Text style={{ flex: 1, color: '#fff', fontSize: 12.5, lineHeight: 17 }}>{a.msg}</Text>
      <Pressable onPress={close} hitSlop={10} accessibilityLabel="Close message"><Text style={{ color: 'rgba(255,255,255,.8)', fontSize: 16 }}>✕</Text></Pressable>
    </Glass>
  );
}
