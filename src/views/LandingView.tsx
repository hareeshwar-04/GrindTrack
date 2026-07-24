import React, { useState } from 'react';
import { SupabaseAuth, isSupabaseConfigured } from '../services/supabase';
import { Zap, Flame, Users, Shield, ArrowRight, CheckCircle2, Lock, Mail, User, Sparkles, Trophy } from 'lucide-react';

interface LandingViewProps {
  onLoginSuccess: (email: string, username: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Fallback demo mode if Supabase env vars aren't populated
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(email || 'demo@grindtrack.app', username || 'GrindMaster');
        }, 800);
        return;
      }

      if (isMagicLink) {
        await SupabaseAuth.signInWithMagicLink(email);
        setSuccessMsg('Magic login link sent to your email! Check your inbox.');
      } else if (isSignUp) {
        const res = await SupabaseAuth.signUpWithEmail(email, password, username);
        if (res?.user) {
          setSuccessMsg('Account created! Please check your email to confirm.');
          onLoginSuccess(res.user.email || email, username || 'New Grinder');
        }
      } else {
        const res = await SupabaseAuth.signInWithEmail(email, password);
        if (res?.user) {
          onLoginSuccess(res.user.email || email, res.user.user_metadata?.username || 'GrindMaster');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check credentials.');
    } finally {
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
                {isMagicLink ? 'Passwordless Magic Link' : isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                {isSignUp ? 'Join GrindTrack today and invite your friends' : 'Sign in to access your goals, streaks, and squads'}
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
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3.5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. alex_dev"
                      className="form-input text-xs pl-9 py-2.5"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-[#6B7280]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="form-input text-xs pl-9 py-2.5"
                    required
                  />
                </div>
              </div>

              {!isMagicLink && (
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#6B7280]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input text-xs pl-9 py-2.5"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                <span>{isLoading ? 'Authenticating...' : isMagicLink ? 'Send Magic Link 📩' : isSignUp ? 'Create Free Account 🚀' : 'Sign In Now 🔑'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-[#9CA3AF] pt-2 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setIsMagicLink(false);
                  }}
                  className="hover:text-[#00E5FF] font-semibold"
                >
                  {isSignUp ? 'Existing user? Sign In' : "Don't have an account? Sign Up"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMagicLink(!isMagicLink)}
                  className="hover:text-[#8B5CF6] font-semibold"
                >
                  {isMagicLink ? 'Use Password' : 'Magic Link ✉️'}
                </button>
              </div>

            </form>
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
