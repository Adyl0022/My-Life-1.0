import { useName } from '../lib/store';
import React from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Glass } from '../components/Glass';
import { Blob } from '../components/Bg';
import { OrbSvg } from '../components/Orb';
import { AssistantBase } from '../lib/assistantBase';
import { ROUTES } from '../lib/routes';
import { TOP } from '../lib/layout';

const stroke = { stroke: '#fff', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

class Chat extends AssistantBase {
  scrollRef: any = null;
  note = '';
  constructor(props: any) {
    super(props);
    (this as any).scrollRef = null;
  }
  render() {
    const v: any = this.renderVals();
    const { go } = this.props as any;
    const ms = this.state.lang === 'ms';
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={() => this.props.onBack()} accessibilityLabel="Back">
            <Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <View><Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M15 5l-7 7 7 7" {...stroke} /></Svg></View>
            </Glass>
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>My Life Assistant</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#34d399' }} />
              <Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 11 }} numberOfLines={1}>{v.sub}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)' }}>
            {[['EN', v.goEn, v.l1], ['BM', v.goMs, v.l2]].map(([t, f, on]: any) => (
              <Pressable key={t} onPress={f}>
                {on === 'on' ? (
                  <LinearGradient colors={['#7c9cff', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}><Text style={{ color: '#fff', fontSize: 11.5, fontWeight: '800' }}>{t}</Text></LinearGradient>
                ) : (<View style={{ paddingVertical: 6, paddingHorizontal: 10 }}><Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5, fontWeight: '600' }}>{t}</Text></View>)}
              </Pressable>
            ))}
          </View>
          <Pressable onPress={v.clear} accessibilityLabel="Clear chat" style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }}>
            <View><Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...stroke} /></Svg></View>
          </Pressable>
        </View>

        <ScrollView ref={(r) => { (this as any).scrollRef = r; }} style={{ flex: 1, marginTop: 12 }} contentContainerStyle={{ gap: 14, paddingBottom: 16, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <OrbSvg size={32} uid="wl" />
            <Glass radius={20} style={{ maxWidth: 300, paddingVertical: 13, paddingHorizontal: 16, borderBottomLeftRadius: 6 }}><Text style={{ color: '#fff', fontSize: 14.5, lineHeight: 22 }}>{v.welcome}</Text></Glass>
          </View>
          {v.startDisp === 'grid' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
              {v.starters.map((s: any) => (
                <Pressable key={s.label} onPress={s.go} style={{ width: '47.5%' }}>
                  <Glass radius={20} style={{ paddingVertical: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <LinearGradient colors={gradOf(s.bg)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <Svg width={18} height={18} viewBox="0 0 24 24"><Path d={s.d} {...stroke} /></Svg>
                    </LinearGradient>
                    <Text style={{ flex: 1, color: '#fff', fontSize: 12.5, fontWeight: '700', lineHeight: 16 }}>{s.label}</Text>
                  </Glass>
                </Pressable>
              ))}
            </View>
          )}
          {v.msgs.map((m: any, i: number) => {
            const me = m.just === 'flex-end';
            const body = (
              <>
                {m.bigD === 'block' && (
                  <View style={{ marginBottom: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(0,0,0,.25)' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}><Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{m.big}</Text><Text style={{ color: 'rgba(255,255,255,.78)', fontSize: 11.5, fontWeight: '600', flexShrink: 1 }}>{m.bigLbl}</Text></View>
                    {m.barD === 'block' && <View style={{ height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.14)', overflow: 'hidden', marginTop: 8 }}><View style={{ height: 7, borderRadius: 4, width: `${Math.min(100, m.pct)}%`, backgroundColor: m.color }} /></View>}
                  </View>
                )}
                <Text style={{ color: '#fff', fontSize: 14.5, lineHeight: 22 }}>{m.text}</Text>
                {m.btnD === 'flex' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <Pressable onPress={m.no} style={{ flex: 1, height: 38, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.25)', backgroundColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{m.noL}</Text></Pressable>
                    <Pressable onPress={m.yes} style={{ flex: 1.4 }}><LinearGradient colors={['#34d399', '#5ee7df']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#06281c', fontSize: 13, fontWeight: '800' }}>{m.yesL}</Text></LinearGradient></Pressable>
                  </View>
                )}
                {m.linkD === 'block' && (
                  <Pressable onPress={() => go(m.href)} style={{ marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center' }}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{m.label}</Text></Pressable>
                )}
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 6, textAlign: 'right' }}>{m.time}</Text>
              </>
            );
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', justifyContent: me ? 'flex-end' : 'flex-start' }}>
                {!me && <OrbSvg size={32} uid={'m' + i} />}
                {me ? (
                  <LinearGradient colors={['#7c9cff', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ maxWidth: 300, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 20, borderBottomRightRadius: 6 }}>{body}</LinearGradient>
                ) : (
                  <Glass radius={20} style={{ maxWidth: 300, paddingVertical: 13, paddingHorizontal: 16, borderBottomLeftRadius: 6 }}>{body}</Glass>
                )}
              </View>
            );
          })}
          {v.typD === 'flex' && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
              <OrbSvg size={32} uid="ty" />
              <Glass radius={20} style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 5, borderBottomLeftRadius: 6 }}>
                {[0, 1, 2].map((d) => <View key={d} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', opacity: 0.5 + d * 0.2 }} />)}
              </Glass>
            </View>
          )}
        </ScrollView>

        <View style={{ marginHorizontal: -20, paddingBottom: 16, paddingTop: 12, backgroundColor: 'rgba(10,15,44,.94)' }}>
          {v.startDisp === 'grid' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }} style={{ flexGrow: 0 }}>
            {v.cats.map((c: any) => (
              <Pressable key={c.name} onPress={c.go}>
                {c.cls === 'cat on' ? (
                  <LinearGradient colors={['#7c9cff', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999 }}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{c.name}</Text></LinearGradient>
                ) : (<View style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)' }}><Text style={{ color: 'rgba(255,255,255,.78)', fontSize: 12, fontWeight: '600' }}>{c.name}</Text></View>)}
              </Pressable>
            ))}
          </ScrollView>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }} style={{ flexGrow: 0, marginTop: 10 }}>
            {v.chips.map((q: any) => (
              <Pressable key={q.label} onPress={q.go}><Glass radius={16} style={{ paddingVertical: 9, paddingHorizontal: 14 }}><Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '600' }}>{q.label}</Text></Glass></Pressable>
            ))}
          </ScrollView>
          <Glass radius={26} style={{ marginHorizontal: 20, marginTop: 12, height: 54, flexDirection: 'row', alignItems: 'center', paddingLeft: 18, paddingRight: 6, gap: 8 }}>
            <TextInput value={v.draft} onChangeText={(t) => this.setState({ draft: t })} onSubmitEditing={() => v.send()} placeholder={v.ph} placeholderTextColor="rgba(255,255,255,.5)" returnKeyType="send" style={{ flex: 1, minWidth: 0, height: 44, color: '#fff', fontSize: 14, fontWeight: '600', outlineStyle: 'none' } as any} />
            <Pressable onPress={v.send} accessibilityLabel="Send">
              <LinearGradient colors={['#7c9cff', '#b794ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M5 12h14M13 6l6 6-6 6" {...stroke} /></Svg>
              </LinearGradient>
            </Pressable>
          </Glass>
        </View>
      </View>
    );
  }
}
function gradOf(css: string): [string, string] {
  const m = css.match(/#[0-9a-f]{6}/gi) || ['#7c9cff', '#b794ff'];
  return [m[0], m[1] || m[0]];
}

export default function Assistant() {
  const name = useName();
  const router = useRouter();
  const [note, setNote] = React.useState('');
  const chat = React.useRef<any>(null);
  const go = (h: string) => {
    const r = ROUTES[h];
    if (r) router.push(r as any); else { setNote('This screen is being built and will open here soon.'); setTimeout(() => setNote(''), 2200); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Blob size={320} color="rgba(183,148,255,.5)" style={{ right: -100, top: -40 }} />
      <Blob size={340} color="rgba(94,231,223,.3)" style={{ left: -120, bottom: 80 }} />
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 + TOP }}>
        <Chat ref={chat} userName={name} onBack={() => router.back()} go={go} onScroll={() => chat.current?.scrollRef?.scrollToEnd({ animated: true })} />
        {!!note && <View style={{ position: 'absolute', left: 20, right: 20, bottom: 230, alignItems: 'center' }}><Glass radius={999} style={{ paddingVertical: 9, paddingHorizontal: 18, backgroundColor: 'rgba(20,26,70,.92)' }}><Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>{note}</Text></Glass></View>}
      </SafeAreaView>
    </View>
  );
}
