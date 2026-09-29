import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or localStorage override
const getEnvOrStorage = (key: string, storageKey: string): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(storageKey);
    if (saved && saved.trim() !== '') return saved.trim();
  }
  return (import.meta.env[key] as string) || '';
};

let currentUrl = getEnvOrStorage('VITE_SUPABASE_URL', '888_supabase_url');
let currentAnonKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', '888_supabase_anon_key');

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    currentUrl &&
    currentUrl.startsWith('https://') &&
    currentAnonKey &&
    currentAnonKey.length > 20
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(currentUrl, currentAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

export const updateSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('888_supabase_url', url.trim());
      currentUrl = url.trim();
    } else {
      localStorage.removeItem('888_supabase_url');
      currentUrl = '';
    }

    if (key.trim()) {
      localStorage.setItem('888_supabase_anon_key', key.trim());
      currentAnonKey = key.trim();
    } else {
      localStorage.removeItem('888_supabase_anon_key');
      currentAnonKey = '';
    }

    // Reset instance to recreate on next get
    supabaseInstance = null;
  }
};

export const getStoredCredentials = () => {
  return {
    url: currentUrl,
    key: currentAnonKey,
    isConfigured: isSupabaseConfigured(),
  };
};
