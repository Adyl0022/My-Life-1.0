import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useSession } from './auth';

// Only the owner's account is an admin. The server checks this on every call, so hiding the screen is just for looks.
export function useIsAdmin(): boolean {
  const [sess] = useSession(); const id = sess?.user?.id || ''; const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true; setOk(false); if (!id) return;
    supabase.rpc('is_admin').then(({ data }) => { if (live) setOk(data === true); }, () => {});
    return () => { live = false; };
  }, [id]);
  return ok;
}
export async function adminCall<T>(fn: string, args?: Record<string, unknown>): Promise<{ ok: true; data: T } | { ok: false; err: string }> {
  try {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) return { ok: false, err: error.message.includes('not_admin') ? 'This account is not an admin.' : 'Could not load. Check your internet and try again.' };
    return { ok: true, data: data as T };
  } catch { return { ok: false, err: 'No internet connection.' }; }
}
