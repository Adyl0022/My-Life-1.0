import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Txt';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Glass } from './Glass';
import { Blob } from './Bg';
import { W } from './Ui';
import { Verse, AR_SIZE, M_SIZE } from '../lib/islamic';

export const IslamicBg = ({ a = 'rgba(52,211,153,.4)', b = 'rgba(124,156,255,.35)' }: { a?: string; b?: string }) => (
  <>
    <LinearGradient colors={['#0a0f2c', '#0f1f3d', '#0c3a3f']} locations={[0, 0.5, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
    <Blob size={320} color={a} style={{ right: -100, top: -40 }} />
    <Blob size={340} color={b} style={{ left: -120, bottom: 40 }} />
  </>
);
export function Header({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16 }}>
      <Pressable onPress={() => router.back()} accessibilityLabel="Back"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 24, marginTop: -3 }}>‹</Text></Glass></Pressable>
      <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 21, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>{sub ? <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{sub}</Text> : null}</View>
      {right}
    </View>
  );
}
export function ToolBar({ saved, onSave, size, onSize, lang, onLang }: { saved: boolean; onSave: () => void; size: number; onSize: () => void; lang: string; onLang: () => void }) {
  const T = ({ a, b, onPress, c }: any) => <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}><Text style={{ color: c || 'rgba(255,255,255,.85)', fontSize: 15, fontWeight: '800' }}>{a}</Text><Text style={{ color: c || 'rgba(255,255,255,.75)', fontSize: 11.5, fontWeight: '600', marginTop: 1 }}>{b}</Text></Pressable>;
  return (
    <Glass radius={22} style={{ marginHorizontal: 20, marginBottom: 12, flexDirection: 'row' }}>
      <T a={saved ? '★' : '☆'} b={saved ? 'Saved' : 'Save'} c={saved ? '#ffd593' : undefined} onPress={onSave} />
      <T a="Aa" b={['S', 'M', 'L'][size]} onPress={onSize} />
      <T a="文" b={lang === 'en' ? 'EN' : 'BM'} onPress={onLang} />
    </Glass>
  );
}
export function VerseBlock({ v, size, lang, showNum = true, active, onPress, last }: { v: Verse; size: number; lang: string; showNum?: boolean; active?: boolean; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: last ? 0 : 1, borderBottomColor: 'rgba(255,255,255,.1)', backgroundColor: active ? 'rgba(125,240,198,.12)' : 'transparent', borderRadius: active ? 14 : 0 }}>
      <Text style={{ color: W, fontSize: AR_SIZE[size] + 3, lineHeight: (AR_SIZE[size] + 3) * 1.9, textAlign: 'right', writingDirection: 'rtl' }}>{v.ar}{showNum ? <Text style={{ color: '#7df0c6', fontSize: 15 }}>{'  ﴿' + v.n + '﴾'}</Text> : null}</Text>
      <Text style={{ color: 'rgba(255,255,255,.82)', fontSize: M_SIZE[size] + 1, lineHeight: (M_SIZE[size] + 1) * 1.5, marginTop: 6 }}>{lang === 'en' ? v.en : v.ms}</Text>
    </Pressable>
  );
}
export const Credit = ({ lang }: { lang: string }) => (
  <Text style={{ color: 'rgba(255,255,255,.5)', fontSize: 10.5, lineHeight: 15, marginTop: 14, marginHorizontal: 4 }}>
    Arabic: Tanzil Uthmani text (tanzil.net, CC BY 3.0). {lang === 'en' ? 'English: Marmaduke Pickthall (public domain).' : 'Malay: Abdullah Basumayyah (Basmeih), via QuranEnc.com, v1.0.0.'} Text has not yet been reviewed by a qualified reader.
  </Text>
);
export const Pending = ({ kind }: { kind: string }) => (
  <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12 }}>
    <Text style={{ color: '#ffd593', fontSize: 13, fontWeight: '800' }}>Text to be added</Text>
    <Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: 6 }}>This {kind === 'Quran' ? 'part' : kind.toLowerCase()} will be added only from a verified source, checked by someone knowledgeable.</Text>
  </View>
);
