import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

// Public values: the publishable key is safe inside the app because every table is protected by row level security.
export const SUPABASE_URL = 'https://azaomuekgxquxbvsvtvx.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_UDEGQLhgmkdCO8XuAercfA_uZvJcJc_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (s) => {
    if (s === 'active') supabase.auth.startAutoRefresh(); else supabase.auth.stopAutoRefresh();
  });
}
