import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Glass } from '../../components/Glass';
import { Blob } from '../../components/Bg';
import { useStored, clearMine, DEFAULT_NAME } from '../../lib/store';
import { PRIVACY, TERMS, WHATS_NEW, LICENCES, Sec } from '../../lib/legal';
import { TOP } from '../../lib/layout';

const W = '#fff', DIM = 'rgba(255,255,255,.7)';
const G = ['#34d399', '#5ee7df'] as [string, string];
const GP = ['#7c9cff', '#b794ff'] as [string, string];
const SIZES = ['Small', 'Default', 'Large', 'Extra large'];
const AR = [24, 28, 33, 38];

const Ttl = ({ t }: { t: string }) => <Text style={{ color: W, fontSize: 14, fontWeight: '700' }}>{t}</Text>;
const Lbl = ({ t, style }: { t: string; style?: any }) => <Text style={[{ color: DIM, fontSize: 11.5, marginTop: 2, lineHeight: 16 }, style]}>{t}</Text>;
const Dot = ({ c = 'rgba(255,255,255,.14)' }: { c?: string }) => <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} /></View>;
const Chev = () => <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 20 }}>›</Text>;
const Sw = ({ on }: { on: boolean }) => (
  <LinearGradient colors={on ? G : ['rgba(255,255,255,.22)', 'rgba(255,255,255,.22)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 26, borderRadius: 13, padding: 3 }}>
    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', marginLeft: on ? 18 : 0 }} />
  </LinearGradient>
);
function Row({ ic, t, sub, right, onPress, last }: { ic?: string; t: string; sub?: string; right?: React.ReactNode; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: last ? 0 : 1, borderBottomColor: 'rgba(255,255,255,.1)' }}>
      {ic ? <Dot c={ic} /> : null}
      <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 14, fontWeight: '600' }}>{t}</Text>{sub ? <Lbl t={sub} /> : null}</View>
      {right}
    </Pressable>
  );
}
const Btn = ({ t, onPress, kind = 'glass', style }: { t: string; onPress: () => void; kind?: 'glass' | 'danger' | 'warn' | 'primary'; style?: any }) => {
  const c = kind === 'danger' ? ['rgba(255,107,129,.28)', 'rgba(255,107,129,.28)'] : kind === 'warn' ? ['rgba(255,196,107,.26)', 'rgba(255,196,107,.26)'] : kind === 'primary' ? GP : ['rgba(255,255,255,.12)', 'rgba(255,255,255,.12)'];
  return (
    <Pressable onPress={onPress} style={[{ flex: 1 }, style]}>
      <LinearGradient colors={c as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}>
        <Text style={{ color: kind === 'danger' ? '#ffb3bf' : kind === 'warn' ? '#ffd593' : W, fontSize: 13.5, fontWeight: '700' }}>{t}</Text>
      </LinearGradient>
    </Pressable>
  );
};
const Inp = (p: any) => <TextInput placeholderTextColor="rgba(255,255,255,.4)" {...p} style={[{ color: W, fontSize: 14, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, backgroundColor: 'rgba(0,0,0,.28)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)', outlineStyle: 'none' } as any, p.style]} />;

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(5,8,25,.72)', justifyContent: 'center', padding: 24 }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
        {children}
      </View>
    </Modal>
  );
}
function Doc({ title, secs, onClose }: { title: string; secs: Sec[]; onClose: () => void }) {
  return (
    <Overlay onClose={onClose}>
      <Glass radius={26} style={{ maxHeight: '82%', padding: 18 }}>
        <Text style={{ color: W, fontSize: 18, fontWeight: '800', marginBottom: 8 }}>{title}</Text>
        <ScrollView>{secs.map((s) => (<View key={s.h} style={{ marginBottom: 12 }}><Text style={{ color: '#8fe9e2', fontSize: 12.5, fontWeight: '700' }}>{s.h}</Text><Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, lineHeight: 19, marginTop: 3 }}>{s.p}</Text></View>))}</ScrollView>
        <View style={{ flexDirection: 'row', marginTop: 8 }}><Btn t="Close" onPress={onClose} /></View>
      </Glass>
    </Overlay>
  );
}

type Dev = { id: string; name: string; note: string; cur: boolean };
const DEVS: Dev[] = [{ id: 'a', name: 'This device', note: 'Active now', cur: true }, { id: 'i', name: 'iPhone', note: 'Last active 2 days ago', cur: false }, { id: 'w', name: 'Web browser', note: 'Last active 5 days ago', cur: false }];

export default function Settings() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [name, setName] = useStored<string>('ml_name', DEFAULT_NAME);
  const [draft, setDraft] = useState<string | null>(null);
  const [nameMsg, setNameMsg] = useState('');
  const [theme, setTheme] = useStored<string>('ml_theme', 'Dark');
  const [size, setSize] = useStored<number>('ml_textsize', 1);
  const [tg, setTg] = useStored<Record<string, boolean>>('ml_toggles', { ev: true, pr: true, zk: true, wt: false, qh: true });
  const [alertNew, setAlertNew] = useStored<boolean>('ml_alert_new', true);
  const [devs, setDevs] = useState<Dev[]>(DEVS);
  const [checked, setChecked] = useState(false);
  const [dlg, setDlg] = useState<'' | 'out' | 'reset' | 'delete' | 'pw' | 'privacy' | 'terms' | 'new' | 'lic' | 'backup' | 'log'>('');
  const [typed, setTyped] = useState(''); const [pwv, setPwv] = useState('');
  const [p1, setP1] = useState(''); const [p2, setP2] = useState(''); const [p3, setP3] = useState(''); const [pwErr, setPwErr] = useState('');
  const [toast, setToast] = useState('');
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 2200); };
  const close = () => { setDlg(''); setTyped(''); setPwv(''); setP1(''); setP2(''); setP3(''); setPwErr(''); };

  const TOG: [string, string, string][] = [['ev', 'Event reminders', 'Before each Planner event'], ['pr', 'Prayer times', 'Alert at each solat time'], ['zk', 'Daily zikir', "Morning and evening Al-Ma'thurat"], ['wt', 'Drink water', 'Every 2 hours, 8 am to 8 pm'], ['qh', 'Quiet hours', 'Mute alerts from 10 pm to 6 am']];
  const light = theme === 'Light';
  const isDel = dlg === 'delete';
  const canGo = isDel ? typed.trim().toUpperCase() === 'DELETE' && pwv.length > 0 : typed.trim().toUpperCase() === 'RESET';

  const savePw = () => {
    if (!p1) return setPwErr('Enter your current password.');
    if (p2.length < 8) return setPwErr('New password must be at least 8 characters.');
    if (p2 !== p3) return setPwErr('The two new passwords do not match.');
    if (p2 === p1) return setPwErr('Choose a password different from the current one.');
    close(); say('Password updated');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Blob size={320} color="rgba(124,156,255,.5)" style={{ right: -100, top: -40 }} />
      <Blob size={340} color="rgba(94,231,223,.3)" style={{ left: -120, bottom: 60 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 + TOP, paddingBottom: 130 }}>
          <Text style={{ color: W, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>Settings</Text>
          <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)', marginTop: 14 }}>
            {['General', 'Security', 'About'].map((n, i) => (
              <Pressable key={n} onPress={() => setTab(i)} style={{ flex: 1 }}>
                {tab === i ? <LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 8, borderRadius: 999, alignItems: 'center' }}><Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>{n}</Text></LinearGradient>
                  : <View style={{ paddingVertical: 8, alignItems: 'center' }}><Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>{n}</Text></View>}
              </Pressable>
            ))}
          </View>

          {tab === 0 && (
            <View style={{ gap: 12, marginTop: 14 }}>
              <Glass style={{ padding: 16 }}>
                <Ttl t="Appearance" />
                <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)', marginTop: 10 }}>
                  {['Dark', 'Light', 'Auto'].map((n) => (
                    <Pressable key={n} onPress={() => setTheme(n)} style={{ flex: 1 }}>
                      {theme === n ? <LinearGradient colors={GP} style={{ paddingVertical: 7, borderRadius: 999, alignItems: 'center' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '700' }}>{n}</Text></LinearGradient>
                        : <View style={{ paddingVertical: 7, alignItems: 'center' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '700' }}>{n}</Text></View>}
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                  <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 14, fontWeight: '600' }}>Text size</Text><Lbl t={SIZES[size] + ' (Quran and reading text)'} /></View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={() => setSize(Math.max(0, size - 1))} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>A</Text></Pressable>
                    <Pressable onPress={() => setSize(Math.min(3, size + 1))} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 20, fontWeight: '700' }}>A</Text></Pressable>
                  </View>
                </View>
                <View style={{ marginTop: 12, borderRadius: 16, padding: 14, alignItems: 'center', backgroundColor: light ? '#f6f4ff' : 'rgba(0,0,0,.3)' }}>
                  <Text style={{ color: light ? '#1a1048' : W, fontSize: AR[size], textAlign: 'center', lineHeight: AR[size] * 1.6 }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
                  <Text style={{ color: light ? '#1a1048' : W, fontSize: [12, 13.5, 15, 17][size], marginTop: 4, textAlign: 'center' }}>Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.</Text>
                </View>
              </Glass>

              <Glass style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <View style={{ paddingTop: 8 }}><Ttl t="Reminders and notifications" /></View>
                {TOG.map(([k, t, s], i) => <Row key={k} ic="rgba(124,156,255,.35)" t={t} sub={s} last={i === TOG.length - 1} onPress={() => setTg({ ...tg, [k]: !tg[k] })} right={<Sw on={!!tg[k]} />} />)}
              </Glass>

              <Pressable onPress={() => router.push('/export' as any)}>
                <Glass style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Dot c="rgba(94,231,181,.35)" />
                  <View style={{ flex: 1 }}><Ttl t="Export all my data" /><Lbl t="Everything in one file: Excel, PDF, CSV or a full backup" /></View>
                  <Chev />
                </Glass>
              </Pressable>

              <Glass style={{ paddingHorizontal: 16 }}><Row ic="rgba(183,148,255,.35)" t="Language" last right={<Text style={{ color: DIM, fontSize: 12.5 }}>English</Text>} /></Glass>
              <Pressable onPress={() => setDlg('out')}><Glass style={{ paddingVertical: 14, alignItems: 'center' }}><Text style={{ color: '#ffb3bf', fontSize: 14, fontWeight: '700' }}>Log out</Text></Glass></Pressable>
            </View>
          )}

          {tab === 1 && (
            <View style={{ gap: 12, marginTop: 14 }}>
              <Glass style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Dot c="rgba(94,231,181,.4)" />
                <View style={{ flex: 1 }}><Ttl t="Your data is protected" /><Lbl t="Encrypted sync is on · Last synced just now" /></View>
              </Glass>
              <Glass style={{ paddingHorizontal: 16 }}>
                <Row ic="rgba(124,156,255,.35)" t="Change password" onPress={() => setDlg('pw')} right={<Chev />} />
                <Row ic="rgba(255,196,107,.35)" t="Alert on new device sign-in" last onPress={() => setAlertNew(!alertNew)} right={<Sw on={alertNew} />} />
              </Glass>
              <Glass style={{ padding: 16 }}>
                <Ttl t="Logged-in Devices" /><Lbl t={devs.length + ' signed in'} />
                <View style={{ marginTop: 6 }}>
                  {devs.map((d, i) => <Row key={d.id} ic="rgba(255,255,255,.14)" t={d.name} sub={d.note} last={i === devs.length - 1}
                    right={!d.cur ? <Pressable onPress={() => setDevs(devs.filter((x) => x.id !== d.id))}><Text style={{ color: '#ffb3bf', fontSize: 12.5, fontWeight: '700' }}>Log out</Text></Pressable> : undefined} />)}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10 }}><Btn t="Log out all other devices" onPress={() => setDevs(devs.filter((x) => x.cur))} /></View>
              </Glass>
              <Glass style={{ paddingHorizontal: 16 }}>
                <Row ic="rgba(94,231,223,.35)" t="Encrypted backup & restore" onPress={() => setDlg('backup')} right={<Chev />} />
                <Row ic="rgba(255,143,171,.35)" t="Security activity log" last onPress={() => setDlg('log')} right={<Text style={{ color: DIM, fontSize: 12.5 }}>30 days</Text>} />
              </Glass>
              <Glass style={{ padding: 16 }}>
                <Ttl t="Account and data" />
                <Lbl t="Name shown on your Dashboard and in the assistant" style={{ marginBottom: 8 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Inp style={{ flex: 1 }} value={draft ?? name} onChangeText={(v: string) => { setDraft(v); setNameMsg(''); }} placeholder="Your name" maxLength={30} />
                  <Btn t="Save" kind="primary" style={{ flex: 0, minWidth: 80 }} onPress={() => { const v = (draft ?? name).trim(); if (!v) return setNameMsg('Please enter a name.'); setName(v); setDraft(null); setNameMsg('Saved. It will show on your Dashboard and assistant.'); }} />
                </View>
                {nameMsg ? <Text style={{ color: '#8fe9e2', fontSize: 12, marginTop: 6 }}>{nameMsg}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <Btn t="Reset all data" kind="warn" onPress={() => setDlg('reset')} />
                  <Btn t="Delete account" kind="danger" onPress={() => setDlg('delete')} />
                </View>
              </Glass>
            </View>
          )}

          {tab === 2 && (
            <View style={{ gap: 12, marginTop: 14 }}>
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 28, fontWeight: '800' }}>M</Text></LinearGradient>
                <Text style={{ color: W, fontSize: 20, fontWeight: '800', marginTop: 10 }}>My Life 1.0</Text>
                <Text style={{ color: '#8fe9e2', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginTop: 3 }}>YOUR LIFE, ALL IN ONE PLACE</Text>
                <Pressable onPress={() => setChecked(!checked)} style={{ marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: checked ? 'rgba(94,231,181,.25)' : 'rgba(255,255,255,.12)' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '700' }}>{checked ? "You're up to date" : 'Check for updates'}</Text></Pressable>
              </View>
              <Glass style={{ paddingHorizontal: 16 }}>
                {[['Version', '1.0'], ['Build', '1'], ['Developed', 'November 2026'], ['Developer', 'Adli Syahmi']].map(([a, b], i) => <Row key={a} t={a} last={i === 3} right={<Text style={{ color: DIM, fontSize: 13 }}>{b}</Text>} />)}
              </Glass>
              <Glass style={{ paddingHorizontal: 16 }}>
                <Row t="What's new in 1.0" onPress={() => setDlg('new')} right={<Chev />} />
                <Row t="Privacy Policy" onPress={() => setDlg('privacy')} right={<Chev />} />
                <Row t="Terms of Use" onPress={() => setDlg('terms')} right={<Chev />} />
                <Row t="Open-source licences" last onPress={() => setDlg('lic')} right={<Chev />} />
              </Glass>
              <Glass style={{ padding: 16 }}>
                <Ttl t="Privacy at a glance" />
                {['Your data stays yours. It is stored on your device and synced only to your own account.', 'Encrypted before it leaves your device.', 'No ads, no tracking, never sold or shared.'].map((t) => (
                  <View key={t} style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}><Text style={{ color: '#5ee7df', fontSize: 13 }}>✓</Text><Text style={{ flex: 1, color: 'rgba(255,255,255,.82)', fontSize: 12.5, lineHeight: 18 }}>{t}</Text></View>
                ))}
              </Glass>
              <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 11.5, textAlign: 'center' }}>© 2026 Adli Syahmi. All rights reserved.</Text>
            </View>
          )}
        </ScrollView>

        {dlg === 'privacy' && <Doc title="Privacy Policy" secs={PRIVACY} onClose={close} />}
        {dlg === 'terms' && <Doc title="Terms of Use" secs={TERMS} onClose={close} />}
        {dlg === 'new' && <Doc title="What's new in 1.0" secs={WHATS_NEW} onClose={close} />}
        {dlg === 'lic' && <Doc title="Open-source licences" secs={LICENCES} onClose={close} />}
        {dlg === 'backup' && <Doc title="Encrypted backup & restore" secs={[{ h: 'Coming with sync', p: 'Backups will be encrypted and tied to your account. For now you can save a full copy with Export, using the Backup (JSON) format.' }]} onClose={close} />}
        {dlg === 'log' && <Doc title="Security activity log" secs={[{ h: 'Last 30 days', p: 'Sign-ins, password changes and device removals will be listed here once your account is connected.' }]} onClose={close} />}

        {dlg === 'out' && (
          <Overlay onClose={close}><Glass radius={26} style={{ padding: 20 }}>
            <Text style={{ color: W, fontSize: 17, fontWeight: '800' }}>Log out of My Life?</Text>
            <Text style={{ color: DIM, fontSize: 13, lineHeight: 19, marginTop: 6 }}>You will need your email and password to sign back in on this device.</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}><Btn t="Cancel" onPress={close} /><Btn t="Log out" kind="danger" onPress={() => { close(); say('Sign-in screens are being built'); }} /></View>
          </Glass></Overlay>
        )}
        {dlg === 'pw' && (
          <Overlay onClose={close}><Glass radius={26} style={{ padding: 20 }}>
            <Text style={{ color: W, fontSize: 17, fontWeight: '800' }}>Change password</Text>
            <View style={{ gap: 8, marginTop: 12 }}>
              <Inp secureTextEntry placeholder="Current password" value={p1} onChangeText={setP1} />
              <Inp secureTextEntry placeholder="New password (8+ characters)" value={p2} onChangeText={setP2} />
              <Inp secureTextEntry placeholder="Repeat new password" value={p3} onChangeText={setP3} />
            </View>
            {pwErr ? <Text style={{ color: '#ffb3bf', fontSize: 12, marginTop: 8 }}>{pwErr}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}><Btn t="Cancel" onPress={close} /><Btn t="Update" kind="primary" onPress={savePw} /></View>
          </Glass></Overlay>
        )}
        {(dlg === 'reset' || dlg === 'delete') && (
          <Overlay onClose={close}><Glass radius={26} style={{ padding: 20 }}>
            <Text style={{ color: W, fontSize: 17, fontWeight: '800' }}>{isDel ? 'Delete your account?' : 'Reset all your data?'}</Text>
            <Text style={{ color: DIM, fontSize: 12.5, lineHeight: 18, marginTop: 6 }}>{isDel ? 'This permanently deletes your account and everything in it: planner, notes, finance, records and habits, on all your devices. This cannot be undone. Export your data first if you want a copy.' : 'This erases ALL your data: planner, notes, finance, records and habits. Your account and login stay. This cannot be undone. Export your data first if you want a copy.'}</Text>
            <Text style={{ color: W, fontSize: 12.5, fontWeight: '700', marginTop: 12, marginBottom: 6 }}>{isDel ? 'Type DELETE to confirm' : 'Type RESET to confirm'}</Text>
            <Inp autoCapitalize="characters" value={typed} onChangeText={setTyped} />
            {isDel && (<><Text style={{ color: W, fontSize: 12.5, fontWeight: '700', marginTop: 10, marginBottom: 6 }}>Enter your password</Text><Inp secureTextEntry value={pwv} onChangeText={setPwv} /></>)}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Btn t="Cancel" onPress={close} />
              {canGo ? <Btn t={isDel ? 'Delete forever' : 'Reset everything'} kind="danger" onPress={async () => { await clearMine(!isDel); close(); say(isDel ? 'Account data deleted' : 'All data has been reset'); }} />
                : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'rgba(255,255,255,.45)', fontSize: 12.5 }}>{isDel ? 'Fill both fields' : 'Type RESET'}</Text></View>}
            </View>
          </Glass></Overlay>
        )}
        {toast ? <View pointerEvents="none" style={{ position: 'absolute', bottom: 110, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.75)' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '600' }}>{toast}</Text></View> : null}
      </SafeAreaView>
    </View>
  );
}
