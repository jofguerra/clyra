import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Local mode is the default until both public settings are configured.
// The explicit switch also lets developers test offline with saved cloud settings.
export const isLocalMode = process.env.EXPO_PUBLIC_LOCAL_MODE === 'true'
  || !supabaseUrl || !supabaseAnonKey;

export const supabase: SupabaseClient | null = isLocalMode ? null : createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Cloud features are unavailable in local mode.');
  return supabase;
}
