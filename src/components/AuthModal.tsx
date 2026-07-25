import React, { useState } from 'react';
import { SupabaseAuth, isSupabaseConfigured } from '../services/supabase';
import { LocalAuth } from '../services/localAuth';
import { LogIn, Mail, Lock, User, Sparkles, X, CheckCircle2, AlertCircle, ArrowRight, Wand2, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userEmail: string, username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic' | 'forgot'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isSignUp = mode === 'signup';
  const isMagicLink = mode === 'magic';
  const isForgot = mode === 'forgot';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // LOCAL MODE: Use LocalAuth to simulate backend validation
        setTimeout(() => {
          try {
            if (isSignUp) {
              LocalAuth.signUp(email, password, username);
              setSuccessMsg('Local account created! You can now Sign In.');
              setMode('signin');
            } else if (isMagicLink) {
              setSuccessMsg('Local Magic Link sent! (Check console - simulated)');
            } else if (isForgot) {
              LocalAuth.resetPassword(email);
              setSuccessMsg('Password reset email sent! 📩 (Simulated locally)');
            } else {
              const user = LocalAuth.signIn(email, password);
              setSuccessMsg('Signed in! Loading your dashboard...');
              onAuthSuccess(user.email, user.username);
              setTimeout(() => onClose(), 500);
            }
          } catch (err: any) {
            setErrorMsg(err.message);
          }
          setIsLoading(false);
        }, 800);
        return;
      }

      if (isMagicLink) {
        await SupabaseAuth.signInWithMagicLink(email);
        setSuccessMsg('Magic login link sent to your email inbox! 📩 Check your inbox or spam folder.');
        setIsLoading(false);
        return;
      }

      if (isForgot) {
        await SupabaseAuth.resetPassword(email);
        setSuccessMsg('Password reset link sent to your email! 📩 Please check your inbox.');
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        await SupabaseAuth.signUpWithEmail(email, password, username);
        setSuccessMsg('Verification link sent to your email! 📩 Please check your inbox and click the verification link, then come back and Sign In.');
        setIsLoading(false);
        return;
      }

      // Sign In — Supabase onAuthStateChange in App.tsx will auto-load user data
      await SupabaseAuth.signInWithEmail(email, password);
      setSuccessMsg('Signed in! Loading your dashboard...');
      setTimeout(() => onClose(), 500);
      // The onAuthStateChange listener will fire and handle everything
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 relative">
        
        {/* Decorative Top Ambient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#00E5FF]/20 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              {isMagicLink ? <Wand2 className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
            <h3 className="font-display font-extrabold text-2xl text-white">
              {isMagicLink ? 'Magic Link' : isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="text-sm text-slate-400">
              {isForgot 
                ? 'Enter your email to receive a password reset link' 
                : isSignUp 
                ? 'Join GrindTrack and start your journey today' 
                : 'Sign in to access your goals, streaks, and squads'}
            </p>
          </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Supabase ENV keys pending. Demo Mode will simulate login instantly!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Username</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_dev"
                  style={{ paddingLeft: '2.75rem' }}
                  className="form-input text-xs w-full py-3 bg-[#181818] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {!isForgot && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ paddingLeft: '2.75rem' }}
                  className="form-input text-xs w-full py-3 bg-[#181818] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {isForgot && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Registered Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ paddingLeft: '2.75rem' }}
                  className="form-input text-xs w-full py-3 bg-[#181818] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {!isMagicLink && !isForgot && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#9CA3AF]">Password</label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-[#00E5FF] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                    className="form-input text-xs py-3 w-full bg-[#181818] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:outline-none transition-colors"
                    minLength={6}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none z-10" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                      className="form-input text-xs py-3 w-full bg-[#181818] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:outline-none transition-colors"
                      minLength={6}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-3 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <span>
                {isMagicLink 
                  ? 'Send Magic Link 📩' 
                  : isForgot 
                  ? 'Send Reset Link 📩' 
                  : isSignUp 
                  ? 'Create Free Account 🚀' 
                  : 'Sign In Now 🔑'}
              </span>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="h-px bg-white/10 flex-1" />
          <span>OR</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <div className="space-y-3">
          {/* Main Toggle Button */}
          <button
            onClick={() => {
              setMode(isSignUp ? 'signin' : 'signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="w-full bg-[#181818] hover:bg-[#222222] border border-white/10 text-white text-xs font-bold py-3 rounded-xl transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New here? Create Free Account'}
          </button>

          {/* Secondary Option Button (Magic Link / Back to Login) */}
          <button
            onClick={() => {
              if (isMagicLink || isForgot) {
                setMode('signin');
              } else {
                setMode('magic');
              }
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="w-full text-[#9CA3AF] hover:text-white text-xs font-bold py-2 transition-colors flex items-center justify-center gap-2"
          >
            {isMagicLink || isForgot ? (
              <>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Back to Standard Login</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Use Passwordless Magic Link instead</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
