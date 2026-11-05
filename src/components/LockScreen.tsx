import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { Text } from './Txt';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import { useLock, checkPin, unlock, bioAuth, bioReady, wipeEverything, setPin, SENSITIVE } from '../lib/lock';

const W = '#fff';
const GP = ['#7c9cff', '#b794ff'] as [string, string];

// Six-dot PIN entry with a keypad. 4 to 6 digits; it submits itself at 6 or when OK is pressed.
export function PinPad({ title, sub, err, onDone, onBio, extra }: { title: string; sub?: string; err?: string; onDone: (pin: string) => void; onBio?: () => void; extra?: React.ReactNode }) {
  const [pin, setP] = useState('');
  const go = (v: string) => { setP(''); onDone(v); };
  const add = (d: string) => { const n = (pin + d).slice(0, 6); setP(n); if (n.length === 6) go(n); };
  const key = (k: string) => (
    <Pressable key={k} onPress={() => (k === '<' ? setP(pin.slice(0, -1)) : k === 'ok' ? (pin.length >= 4 ? go(pin) : null) : k === 'bio' ? onBio && onBio() : add(k))}
      style={{ width: 74, height: 62, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: k === 'bio' || k === 'ok' && pin.length < 4 ? 'transparent' : 'rgba(255,255,255,.12)', borderWidth: k === 'bio' || k === 'ok' && pin.length < 4 ? 0 : 1, borderColor: 'rgba(255,255,255,.14)' }}>
      <Text style={{ color: W, fontSize: k === 'ok' || k === 'bio' ? 14 : 24, fontWeight: '700', opacity: k === 'ok' && pin.length < 4 ? 0.35 : 1 }}>{k === '<' ? '⌫' : k === 'ok' ? 'OK' : k === 'bio' ? (onBio ? 'Scan' : '') : k}</Text>
    </Pressable>
  );
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: W, fontSize: 20, fontWeight: '800' }}>{title}</Text>
      {sub ? <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 }}>{sub}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 22, height: 16 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => <View key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: i < pin.length ? '#8fe9e2' : 'rgba(255,255,255,.2)' }} />)}
      </View>
      <Text style={{ color: '#ffb3bf', fontSize: 12.5, marginTop: 12, minHeight: 18, textAlign: 'center' }}>{err || ' '}</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], [onBio ? 'bio' : 'x', '0', pin.length ? 'ok' : '<']].map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10 }}>{r.map((k) => (k === 'x' ? <View key={k} style={{ width: 74 }} /> : key(k)))}</View>
        ))}
      </View>
      {pin.length > 0 ? <Pressable onPress={() => setP(pin.slice(0, -1))} style={{ marginTop: 12 }}><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>Delete last digit</Text></Pressable> : <View style={{ height: 29 }} />}
      {extra}
    </View>
  );
}

// Used by Settings to set a new PIN (enter, then enter again) or to confirm the current one.
export function PinDialog({ mode, onClose, onOk, bio }: { mode: 'new' | 'verify'; onClose: () => void; onOk: (pin?: string) => void; bio?: boolean }) {
  const [first, setFirst] = useState<string | null>(null); const [err, setErr] = useState(''); const [wait, setWait] = useState(0);
  const bioTried = useRef(false);
  useEffect(() => { if (mode === 'verify' && bio && !bioTried.current) { bioTried.current = true; bioAuth('Confirm it is you').then((ok) => ok && onOk()); } }, []);
  const done = async (pin: string) => {
    if (mode === 'new') {
      if (pin.length < 4) return setErr('Use at least 4 digits.');
      if (first == null) { setFirst(pin); setErr(''); return; }
      if (first !== pin) { setFirst(null); return setErr('The two PINs did not match. Start again.'); }
      return onOk(pin);
    }
    const r = await checkPin(pin);
    if (r.r === 'ok') return onOk();
    setErr(r.r === 'wait' ? 'Too many tries. Wait ' + r.secs + ' seconds.' : 'Wrong PIN. ' + r.left + ' tries left.');
  };
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(5,8,25,.85)', justifyContent: 'center', padding: 20 }}>
        <View style={{ padding: 20, borderRadius: 28, backgroundColor: '#131845', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)' }}>
          <PinPad key={String(first)} title={mode === 'verify' ? 'Enter your PIN' : first == null ? 'Create a PIN' : 'Repeat your PIN'}
            sub={mode === 'verify' ? 'Confirm it is you to continue.' : first == null ? 'Choose 4 to 6 digits.' : 'Enter the same PIN once more.'}
            err={err} onDone={done} onBio={mode === 'verify' && bio ? () => bioAuth('Confirm it is you').then((ok) => ok && onOk()) : undefined}
            extra={mode === 'new' && first == null ? <Text style={{ color: '#ffd593', fontSize: 12, lineHeight: 17, marginTop: 6, textAlign: 'center', paddingHorizontal: 8 }}>If you forget the PIN and cannot use your fingerprint, the only way back in is to erase the app data. Save a copy with Export first.</Text> : null} />
          <Pressable onPress={onClose} style={{ alignSelf: 'center', marginTop: 14 }}><Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 13.5, fontWeight: '700' }}>Cancel</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Full-screen cover. Shown while the app is locked (for the whole app, or only Finance, Notes and Records).
export function LockScreen() {
  const { cfg, locked } = useLock();
  const path = usePathname();
  const [err, setErr] = useState(''); const [forgot, setForgot] = useState<'' | 'menu' | 'erase' | 'newpin'>('');
  const [bioOk, setBioOk] = useState(false); const tried = useRef(false);
  const guard = locked && (cfg.scope === 'all' || SENSITIVE.some((p) => path.startsWith(p)));
  useEffect(() => { bioReady().then((b) => setBioOk(b && cfg.bio)); }, [cfg.bio]);
  useEffect(() => {
    if (!guard) { tried.current = false; return; }
    if (bioOk && !tried.current) { tried.current = true; bioAuth().then((ok) => ok && unlock()); }
  }, [guard, bioOk]);
  if (!guard) return null;
  const done = async (pin: string) => {
    const r = await checkPin(pin);
    if (r.r === 'ok') { setErr(''); unlock(); } else setErr(r.r === 'wait' ? 'Too many tries. Wait ' + r.secs + ' seconds.' : 'Wrong PIN. ' + r.left + ' tries left.');
  };
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#0a0f2c', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Text style={{ color: W, fontSize: 28, fontWeight: '800' }}>M</Text>
      </LinearGradient>
      {forgot === 'menu' ? (
        <View style={{ width: 300, gap: 10 }}>
          <Text style={{ color: W, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>Forgot your PIN?</Text>
          {bioOk ? <Pressable onPress={async () => { if (await bioAuth('Confirm it is you to set a new PIN')) setForgot('newpin'); }} style={BTN}><Text style={BT}>Use fingerprint, then set a new PIN</Text></Pressable> : null}
          <Pressable onPress={() => setForgot('erase')} style={[BTN, { backgroundColor: 'rgba(255,107,129,.25)' }]}><Text style={[BT, { color: '#ffb3bf' }]}>Erase app data and start fresh</Text></Pressable>
          <Pressable onPress={() => setForgot('')} style={{ alignSelf: 'center', padding: 8 }}><Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 13.5 }}>Back</Text></Pressable>
        </View>
      ) : forgot === 'erase' ? (
        <View style={{ width: 300, gap: 10 }}>
          <Text style={{ color: W, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>Erase everything?</Text>
          <Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, lineHeight: 19, textAlign: 'center' }}>All your notes, finance, records and habits on this phone will be deleted for good, and the lock is removed. This cannot be undone.</Text>
          <Pressable onPress={async () => { await wipeEverything(); setForgot(''); }} style={[BTN, { backgroundColor: 'rgba(255,107,129,.35)' }]}><Text style={[BT, { color: '#ffb3bf' }]}>Yes, erase everything</Text></Pressable>
          <Pressable onPress={() => setForgot('menu')} style={{ alignSelf: 'center', padding: 8 }}><Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 13.5 }}>Keep my data</Text></Pressable>
        </View>
      ) : forgot === 'newpin' ? (
        <NewPin onDone={async (p) => { await setPin(p, cfg.bio); setForgot(''); }} />
      ) : (
        <PinPad title="My Life is locked" sub="Enter your PIN to continue." err={err} onDone={done}
          onBio={bioOk ? () => bioAuth().then((ok) => ok && unlock()) : undefined}
          extra={<Pressable onPress={() => setForgot('menu')} style={{ marginTop: 10, padding: 8 }}><Text style={{ color: '#8fe9e2', fontSize: 13.5, fontWeight: '700' }}>Forgot PIN?</Text></Pressable>} />
      )}
    </View>
  );
}
const BTN = { paddingVertical: 14, borderRadius: 16, alignItems: 'center' as const, backgroundColor: 'rgba(255,255,255,.12)' };
const BT = { color: '#fff', fontSize: 14, fontWeight: '700' as const };

function NewPin({ onDone }: { onDone: (p: string) => void }) {
  const [first, setFirst] = useState<string | null>(null); const [err, setErr] = useState('');
  return <PinPad key={String(first)} title={first == null ? 'Set a new PIN' : 'Repeat your PIN'} sub="Choose 4 to 6 digits." err={err}
    onDone={(p) => { if (p.length < 4) return setErr('Use at least 4 digits.'); if (first == null) { setFirst(p); setErr(''); } else if (first === p) onDone(p); else { setFirst(null); setErr('The two PINs did not match.'); } }} />;
}
