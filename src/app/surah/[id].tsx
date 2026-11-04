import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Glass } from '../../components/Glass';
import { IslamicBg, Header, ToolBar, VerseBlock, Credit } from '../../components/IslamicUi';
import { W } from '../../components/Ui';
import { SURAH, BISMILLAH, useIslamic, useLang, useSize, AR_SIZE } from '../../lib/islamic';

export default function SurahScreen() {
  const { id, v: jump } = useLocalSearchParams<{ id: string; v?: string }>();
  const scrollRef = React.useRef<any>(null);
  const ys = React.useRef<Record<number, number>>({});
  const top = React.useRef(0);
  const done = React.useRef(false);
  const tryJump = () => { const n = +(jump || 0); if (!n || done.current) return; const y = ys.current[n]; if (y === undefined) return; done.current = true; setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, top.current + y - 80), animated: true }), 250); };
  const s = SURAH[String(id)] || SURAH.fatihah;
  const key = SURAH[String(id)] ? String(id) : 'fatihah';
  const [isl, setIsl] = useIslamic();
  const [lang, setLang] = useLang();
  const [size, setSize] = useSize();
  const [toast, setToast] = useState('');
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1600); };
  const saved = !!isl.bm[key];
  const lastV = isl.last[key];
  const marks: number[] = (isl.vb || {})[key] || [];
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <IslamicBg />
      <SafeAreaView style={{ flex: 1 }}>
        <Header title={s.title} sub={s.sub} right={<Text style={{ color: W, fontSize: 22 }}>{s.ar}</Text>} />
        <ScrollView ref={scrollRef} style={{ marginTop: 12 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <View onLayout={(e) => { top.current = e.nativeEvent.layout.y; tryJump(); }}>
          <Glass radius={26} style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
            {s.bismillah && <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.1)' }}><Text style={{ color: W, fontSize: AR_SIZE[size] + 3, textAlign: 'center', lineHeight: (AR_SIZE[size] + 3) * 1.8 }}>{BISMILLAH.ar}</Text></View>}
            {s.verses.map((v, i) => (
              <React.Fragment key={v.n}>
                {key === 'kahfi10' && v.n === 101 && <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 11.5, textAlign: 'center', paddingVertical: 10 }}>· · · verses 11 to 100 omitted · · ·</Text>}
                <View onLayout={(e) => { ys.current[v.n] = e.nativeEvent.layout.y; if (v.n === +(jump || 0)) tryJump(); }}>
                <VerseBlock v={v} size={size} lang={lang} active={lastV === v.n || +(jump || 0) === v.n} marked={marks.includes(v.n)} last={i === s.verses.length - 1}
                  onPress={() => { setIsl({ ...isl, last: { ...isl.last, [key]: v.n }, lastKey: key }); say('Last read: verse ' + v.n); }}
                  onLong={() => { const nx = marks.includes(v.n) ? marks.filter((x) => x !== v.n) : [...marks, v.n].sort((a, b) => a - b); setIsl({ ...isl, vb: { ...(isl.vb || {}), [key]: nx } }); say(marks.includes(v.n) ? 'Verse bookmark removed' : 'Verse ' + v.n + ' bookmarked'); }} />
                </View>
              </React.Fragment>
            ))}
          </Glass>
          </View>
          {key === 'yasin' && <Glass radius={22} style={{ marginTop: 12, padding: 14 }}><Text style={{ color: '#ffd593', fontSize: 13, fontWeight: '800' }}>Doa after Yasin</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5, lineHeight: 18, marginTop: 4 }}>The doa text will be added only from a verified source, checked by someone knowledgeable.</Text></Glass>}
          <Text style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, marginHorizontal: 4, marginTop: 10 }}>Tap a verse to mark where you stopped. Long-press a verse to bookmark it (★).</Text>
          <Credit lang={lang} />
        </ScrollView>
        {toast ? <View pointerEvents="none" style={{ position: 'absolute', bottom: 90, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.75)' }}><Text style={{ color: W, fontSize: 12.5 }}>{toast}</Text></View> : null}
        <ToolBar saved={saved} onSave={() => { setIsl({ ...isl, bm: { ...isl.bm, [key]: !saved } }); say(saved ? 'Bookmark removed' : 'Bookmarked'); }} size={size} onSize={() => setSize((size + 1) % 3)} lang={lang} onLang={() => setLang(lang === 'en' ? 'ms' : 'en')} />
      </SafeAreaView>
    </View>
  );
}
