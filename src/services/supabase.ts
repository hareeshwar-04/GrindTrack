import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helper functions
export const SupabaseAuth = {
  // Sign up with Email & Password
  signUpWithEmail: async (email: string, password: string, username: string) => {
    if (!supabase) throw new Error('Supabase credentials not configured in environment.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw error;
    return data;
  },

  // Sign in with Email & Password
  signInWithEmail: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase credentials not configured in environment.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Passwordless Magic Link Login
  signInWithMagicLink: async (email: string) => {
    if (!supabase) throw new Error('Supabase credentials not configured in environment.');
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  // Sign Out
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  // Get current user session
  getSession: async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
};
