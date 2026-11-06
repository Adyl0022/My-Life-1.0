import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { setItem } from './store';

let cur: Session | null = null;
let ready = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

supabase.auth.getSession().then(({ data }) => { cur = data.session; ready = true; emit(); }).catch(() => { ready = true; emit(); });
supabase.auth.onAuthStateChange((ev, s) => {
  cur = s; ready = true;
  const nm = s?.user?.user_metadata?.name;
  if (ev === 'SIGNED_IN' && typeof nm === 'string' && nm.trim()) setItem('ml_name', nm.trim());
  emit();
});

// [session, ready]. "ready" is false only for the first moment while the saved login is read from the phone (works offline).
export function useSession(): [Session | null, boolean] {
  const [, n] = useState(0);
  useEffect(() => { const f = () => n((x) => x + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  return [cur, ready];
}
export const getSession = () => cur;

const clean = (m: string) => {
  const s = (m || '').toLowerCase();
  if (s.includes('invalid login')) return 'Wrong email or password.';
  if (s.includes('not confirmed')) return 'Please confirm your email first.';
  if (s.includes('already registered') || s.includes('already been registered')) return 'This email is already registered. Try signing in.';
  if (s.includes('rate limit') || s.includes('too many') || s.includes('seconds')) return 'Too many tries. Please wait a little and try again.';
  if (s.includes('token') && (s.includes('expired') || s.includes('invalid'))) return 'That code is wrong or has expired.';
  if (s.includes('password') && s.includes('characters')) return 'Password must be at least 8 characters.';
  if (s.includes('same password')) return 'Choose a different password from the old one.';
  if (s.includes('network') || s.includes('fetch')) return 'No internet connection. Please try again.';
  return m || 'Something went wrong. Please try again.';
};
type R = { ok: true; confirm?: boolean } | { ok: false; err: string; unconfirmed?: boolean };
const fail = (e: any): R => ({ ok: false, err: clean(e?.message || ''), unconfirmed: /not confirmed/i.test(e?.message || '') });

export async function signIn(email: string, password: string): Promise<R> {
  try { const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); return error ? fail(error) : { ok: true }; } catch (e) { return fail(e); }
}
export async function signUp(name: string, email: string, password: string): Promise<R> {
  try {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } });
    if (error) return fail(error);
    // A user that already exists comes back with no identities (Supabase hides this on purpose).
    if (data.user && data.user.identities && data.user.identities.length === 0) return { ok: false, err: 'This email is already registered. Try signing in.' };
    return { ok: true, confirm: !data.session };
  } catch (e) { return fail(e); }
}
export async function verifyCode(email: string, token: string, type: 'signup' | 'recovery'): Promise<R> {
  try { const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type }); return error ? fail(error) : { ok: true }; } catch (e) { return fail(e); }
}
export async function resendSignup(email: string): Promise<R> {
  try { const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() }); return error ? fail(error) : { ok: true }; } catch (e) { return fail(e); }
}
export async function sendReset(email: string): Promise<R> {
  try { const { error } = await supabase.auth.resetPasswordForEmail(email.trim()); return error ? fail(error) : { ok: true }; } catch (e) { return fail(e); }
}
export async function setNewPassword(password: string): Promise<R> {
  try { const { error } = await supabase.auth.updateUser({ password }); return error ? fail(error) : { ok: true }; } catch (e) { return fail(e); }
}
// Checks the account password again (used for Forgot PIN). Does not change the current login.
export async function checkPassword(password: string): Promise<boolean> {
  const em = cur?.user?.email; if (!em) return false;
  try { const { error } = await supabase.auth.signInWithPassword({ email: em, password }); return !error; } catch (e) { return false; }
}
export async function signOut() { try { await supabase.auth.signOut(); } catch (e) {} cur = null; emit(); }
export async function deleteAccount(): Promise<R> {
  try { const { error } = await supabase.rpc('delete_my_account'); if (error) return fail(error); await signOut(); return { ok: true }; } catch (e) { return fail(e); }
}
