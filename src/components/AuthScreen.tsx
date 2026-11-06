import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text } from './Txt';
import { LinearGradient } from 'expo-linear-gradient';
import { Inp, GP, W } from './Ui';
import { Blob } from './Bg';
import { signIn, signUp, verifyCode, resendSignup, sendReset, setNewPassword } from '../lib/auth';

type Mode = 'in' | 'up' | 'verify' | 'forgot' | 'reset';
const OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Full-screen sign in / register / reset screen. Shown until the user is signed in; the login is then remembered on the phone.
export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('in');
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [info, setInfo] = useState('');
  const go = (m: Mode) => { setMode(m); setErr(''); setInfo(''); setCode(''); };
  const run = async (f: () => Promise<void>) => { if (busy) return; setBusy(true); setErr(''); setInfo(''); try { await f(); } finally { setBusy(false); } };
  const needEmail = () => { if (!OK.test(email.trim())) { setErr('Enter a valid email address.'); return false; } return true; };

  const doIn = () => run(async () => {
    if (!needEmail()) return; if (!pw) { setErr('Enter your password.'); return; }
    const r = await signIn(email, pw);
    if (!r.ok) { if (r.unconfirmed) { await resendSignup(email); go('verify'); setInfo('Your email is not confirmed yet. We sent you a new code.'); } else setErr(r.err); }
  });
  const doUp = () => run(async () => {
    if (name.trim().length < 2) { setErr('Enter your name.'); return; }
    if (!needEmail()) return;
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (pw !== pw2) { setErr('The two passwords are not the same.'); return; }
    const r = await signUp(name, email, pw);
    if (!r.ok) setErr(r.err); else if (r.confirm) { go('verify'); setInfo('We sent a 6-digit code to ' + email.trim() + '.'); }
  });
  const doVerify = () => run(async () => {
    if (code.trim().length < 6) { setErr('Enter the code from your email.'); return; }
    const r = await verifyCode(email, code, 'signup'); if (!r.ok) setErr(r.err);
  });
  const doResend = () => run(async () => { const r = await resendSignup(email); if (!r.ok) setErr(r.err); else setInfo('A new code was sent.'); });
  const doForgot = () => run(async () => {
    if (!needEmail()) return; const r = await sendReset(email);
    if (!r.ok) setErr(r.err); else { go('reset'); setInfo('If this email has an account, a 6-digit code is on its way.'); }
  });
  const doReset = () => run(async () => {
    if (code.trim().length < 6) { setErr('Enter the code from your email.'); return; }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (pw !== pw2) { setErr('The two passwords are not the same.'); return; }
    const v = await verifyCode(email, code, 'recovery'); if (!v.ok) { setErr(v.err); return; }
    const r = await setNewPassword(pw); if (!r.ok) setErr(r.err);
  });

  const title = { in: 'Welcome back', up: 'Create your account', verify: 'Confirm your email', forgot: 'Forgot password', reset: 'Set a new password' }[mode];
  const sub = { in: 'Sign in to open My Life.', up: 'Your name, email and a password. That is all.', verify: 'Type the 6-digit code we emailed you.', forgot: 'We will email you a 6-digit code.', reset: 'Enter the code and choose a new password.' }[mode];
  const main = { in: ['Sign in', doIn], up: ['Create account', doUp], verify: ['Confirm', doVerify], forgot: ['Send code', doForgot], reset: ['Save password', doReset] }[mode] as [string, () => void];

  const pwRow = (v: string, set: (s: string) => void, ph: string, ac: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Inp value={v} onChangeText={set} placeholder={ph} secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} autoComplete={ac} style={{ flex: 1 }} />
      <Pressable onPress={() => setShow(!show)} hitSlop={8} style={{ position: 'absolute', right: 12 }}><Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, fontWeight: '700' }}>{show ? 'Hide' : 'Show'}</Text></Pressable>
    </View>
  );
  const link = (t: string, f: () => void) => <Pressable onPress={f} hitSlop={8}><Text style={{ color: '#8fe9e2', fontSize: 13, fontWeight: '700' }}>{t}</Text></Pressable>;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0a0f2c', zIndex: 60 }}>
      <Blob size={380} color="rgba(106,77,240,0.55)" style={{ left: -140, top: -90 }} /><Blob size={320} color="rgba(94,231,223,0.3)" style={{ right: -130, top: 260 }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 22 }}>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ color: W, fontSize: 26, fontWeight: '800' }}>M</Text>
            </LinearGradient>
            <Text style={{ color: W, fontSize: 22, fontWeight: '800' }}>{title}</Text>
            <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginTop: 4, textAlign: 'center' }}>{sub}</Text>
          </View>
          <View style={{ padding: 16, borderRadius: 22, backgroundColor: 'rgba(255,255,255,.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)' }}>
            {mode === 'up' ? <Inp value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" autoComplete="name" style={{ marginBottom: 10 }} /> : null}
            {mode !== 'verify' && mode !== 'reset' ? <Inp value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" style={{ marginBottom: 10 }} /> : null}
            {mode === 'in' ? pwRow(pw, setPw, 'Password', 'current-password') : null}
            {mode === 'up' ? <>{pwRow(pw, setPw, 'Password (min 8 characters)', 'new-password')}{pwRow(pw2, setPw2, 'Repeat password', 'new-password')}</> : null}
            {mode === 'verify' || mode === 'reset' ? <Inp value={code} onChangeText={(t: string) => setCode(t.replace(/\D/g, '').slice(0, 8))} placeholder="6-digit code" keyboardType="number-pad" maxLength={8} style={{ marginBottom: 10, textAlign: 'center', fontSize: 20, letterSpacing: 6 }} /> : null}
            {mode === 'reset' ? <>{pwRow(pw, setPw, 'New password (min 8 characters)', 'new-password')}{pwRow(pw2, setPw2, 'Repeat new password', 'new-password')}</> : null}
            {err ? <Text style={{ color: '#ffb3bf', fontSize: 12.5, marginBottom: 10 }}>{err}</Text> : null}
            {info ? <Text style={{ color: '#8fe9e2', fontSize: 12.5, marginBottom: 10 }}>{info}</Text> : null}
            <Pressable onPress={main[1]} disabled={busy}>
              <LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 13, borderRadius: 16, alignItems: 'center', opacity: busy ? 0.7 : 1 }}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: W, fontSize: 15, fontWeight: '800' }}>{main[0]}</Text>}
              </LinearGradient>
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
              {mode === 'in' ? <>{link('Create account', () => go('up'))}{link('Forgot password?', () => go('forgot'))}</> : null}
              {mode === 'up' ? <>{link('I have an account', () => go('in'))}</> : null}
              {mode === 'verify' ? <>{link('Resend code', doResend)}{link('Back', () => go('in'))}</> : null}
              {mode === 'forgot' || mode === 'reset' ? <>{link('Back to sign in', () => go('in'))}</> : null}
            </View>
          </View>
          <Text style={{ color: 'rgba(255,255,255,.4)', fontSize: 11.5, textAlign: 'center', marginTop: 16 }}>Your data stays on this phone first. Signing in lets it back up and sync to your other phones.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
