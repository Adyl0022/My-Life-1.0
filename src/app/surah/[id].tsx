import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Glass } from '../../components/Glass';
import { IslamicBg, Header, ToolBar, VerseBlock, Credit } from '../../components/IslamicUi';
import { W } from '../../components/Ui';
import { SURAH, BISMILLAH, useIslamic, useLang, useSize, AR_SIZE } from '../../lib/islamic';

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = SURAH[String(id)] || SURAH.fatihah;
  const key = SURAH[String(id)] ? String(id) : 'fatihah';
  const [isl, setIsl] = useIslamic();
  const [lang, setLang] = useLang();
  const [size, setSize] = useSize();
  const [toast, setToast] = useState('');
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1600); };
  const saved = !!isl.bm[key];
  const lastV = isl.last[key];
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <IslamicBg />
      <SafeAreaView style={{ flex: 1 }}>
        <Header title={s.title} sub={s.sub} right={<Text style={{ color: W, fontSize: 22 }}>{s.ar}</Text>} />
        <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Glass radius={26} style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
            {s.bismillah && <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.1)' }}><Text style={{ color: W, fontSize: AR_SIZE[size] + 3, textAlign: 'center', lineHeight: (AR_SIZE[size] + 3) * 1.8 }}>{BISMILLAH.ar}</Text></View>}
            {s.verses.map((v, i) => (
              <React.Fragment key={v.n}>
                {key === 'kahfi' && v.n === 101 && <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 11.5, textAlign: 'center', paddingVertical: 10 }}>· · · verses 11 to 100 omitted · · ·</Text>}
                <VerseBlock v={v} size={size} lang={lang} active={lastV === v.n} last={i === s.verses.length - 1} onPress={() => { setIsl({ ...isl, last: { ...isl.last, [key]: v.n }, lastKey: key }); say('Last read: verse ' + v.n); }} />
              </React.Fragment>
            ))}
          </Glass>
          {key === 'yasin' && <Glass radius={22} style={{ marginTop: 12, padding: 14 }}><Text style={{ color: '#ffd593', fontSize: 13, fontWeight: '800' }}>Doa after Yasin</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5, lineHeight: 18, marginTop: 4 }}>The doa text will be added only from a verified source, checked by someone knowledgeable.</Text></Glass>}
          <Text style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, marginHorizontal: 4, marginTop: 10 }}>Tap a verse to mark where you stopped.</Text>
          <Credit lang={lang} />
        </ScrollView>
        {toast ? <View pointerEvents="none" style={{ position: 'absolute', bottom: 90, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.75)' }}><Text style={{ color: W, fontSize: 12.5 }}>{toast}</Text></View> : null}
        <ToolBar saved={saved} onSave={() => { setIsl({ ...isl, bm: { ...isl.bm, [key]: !saved } }); say(saved ? 'Bookmark removed' : 'Bookmarked'); }} size={size} onSize={() => setSize((size + 1) % 3)} lang={lang} onLang={() => setLang(lang === 'en' ? 'ms' : 'en')} />
      </SafeAreaView>
    </View>
  );
}
