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
        data: { username },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    
    // Supabase returns an empty identities array if user already exists
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists! Please Sign In or use Magic Link.');
    }

    return data;
  },

  // Sign in with Email & Password
  signInWithEmail: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase credentials not configured in environment.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('not verified')) {
        throw new Error('Email not verified yet! Please check your Gmail inbox and click the verification link first.');
      }
      throw error;
    }
    return data;
  },

  // Passwordless Magic Link Login (Requires user to be signed up first)
  signInWithMagicLink: async (email: string) => {
    if (!supabase) throw new Error('Supabase credentials not configured in environment.');
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false // Prevents magic link from auto-registering new accounts
      }
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('user not found') || msg.includes('signups not allowed') || msg.includes('invalid') || error.status === 400) {
        throw new Error('No account found with this email. Please click "Sign Up" first to create an account!');
      }
      throw error;
    }
    return data;
  },

  // Reset Password via Email
  resetPassword: async (email: string) => {
    if (!supabase) throw new Error('Supabase credentials not configured in environment.');
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '?mode=reset-password',
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
