import React, { useState } from 'react';
import { SupabaseAuth, isSupabaseConfigured } from '../services/supabase';
import { LocalAuth } from '../services/localAuth';
import { Zap, Flame, Users, Shield, ArrowRight, CheckCircle2, Lock, Mail, User, Sparkles, Trophy, Eye, EyeOff } from 'lucide-react';

interface LandingViewProps {
  onLoginSuccess: (email: string, username: string, reason?: 'signin' | 'signup' | 'session') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
              setIsSignUp(false);
            } else if (isMagicLink) {
              setSuccessMsg('Local Magic Link sent! (Check console - simulated)');
            } else if (isForgot) {
              LocalAuth.resetPassword(email);
              setSuccessMsg('Password reset email sent! 📩 (Simulated locally)');
            } else {
              const user = LocalAuth.signIn(email, password);
              setSuccessMsg('Signed in! Loading your dashboard...');
              onLoginSuccess(user.email, user.username, 'signin');
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
        setSuccessMsg('Magic login link sent to your email! 📩 Check your inbox or spam folder.');
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
      // The onAuthStateChange listener will fire and handle everything
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#00E5FF]/30 font-main relative overflow-hidden flex flex-col justify-between">
      
      {/* Dynamic Background Glow FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#00E5FF]/10 via-[#8B5CF6]/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            <div className="w-full h-full bg-[#080808] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00E5FF] fill-[#00E5FF]" />
            </div>
          </div>
          <span className="font-display font-black text-xl tracking-tight text-white">GrindTrack</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#222] text-[#9CA3AF] text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Secured Authentication</span>
        </div>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 me-2 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 100% Free Social Accountability Platform
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight leading-[1.1]">
            Stay Consistent <br />
            <span className="bg-gradient-to-r from-[#00E5FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
              Together with Squads.
            </span>
          </h1>

          <p className="text-[#9CA3AF] text-sm sm:text-base leading-relaxed max-w-xl">
            Set daily goals in 1 second. Share private invite links with your friends, student group, or dev team. Track consistency rates, maintain heatmaps, and level up together.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">1-Second Quick Add</h4>
                <p className="text-[10px] text-[#9CA3AF]">Zero friction daily task bar</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Invite-Based Squads</h4>
                <p className="text-[10px] text-[#9CA3AF]">1-Click shareable invite links</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Streak & Heatmaps</h4>
                <p className="text-[10px] text-[#9CA3AF]">Track consistency metrics</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Real-Time Ranks</h4>
                <p className="text-[10px] text-[#9CA3AF]">Earn XP & unlocking badges</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Embedded Login / Signup Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#111111] border border-[#222] rounded-3xl p-7 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 blur-3xl pointer-events-none" />

            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-xl text-white">
                {isMagicLink ? 'Passwordless Magic Link' : isForgot ? 'Reset Password' : isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                {isForgot
                  ? 'Enter your email to receive a password reset link'
                  : isSignUp 
                  ? 'Join GrindTrack today and invite your friends' 
                  : 'Sign in to access your goals, streaks, and squads'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUp && !isMagicLink && (
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Username</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none z-10" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. alex_dev"
                      style={{ paddingLeft: '2.8rem' }}
                      className="form-input text-xs py-3 w-full"
                      required
                    />
                  </div>
                </div>
              )}

              {!isForgot && (
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      style={{ paddingLeft: '2.8rem' }}
                      className="form-input text-xs py-3 w-full"
                      required
                    />
                  </div>
                </div>
              )}

              {isForgot && (
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Registered Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      style={{ paddingLeft: '2.8rem' }}
                      className="form-input text-xs py-3 w-full"
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
                          onClick={() => {
                            setIsForgot(true);
                            setIsSignUp(false);
                            setIsMagicLink(false);
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
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
                        className="form-input text-xs py-3 w-full"
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
                          className="form-input text-xs py-3 w-full"
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
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsMagicLink(false);
                  setIsForgot(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full bg-[#181818] hover:bg-[#222222] border border-white/10 text-white text-xs font-bold py-3 rounded-xl transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'New here? Create Free Account'}
              </button>

              <button
                onClick={() => {
                  if (isMagicLink || isForgot) {
                    setIsMagicLink(false);
                    setIsForgot(false);
                    setIsSignUp(false);
                  } else {
                    setIsMagicLink(true);
                    setIsSignUp(false);
                    setIsForgot(false);
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
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use Passwordless Magic Link instead</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-6 w-full text-center text-xs text-[#6B7280]">
        GrindTrack © 2026 — Stay Consistent Together. 100% Free & Open-Source.
      </footer>

    </div>
  );
};
