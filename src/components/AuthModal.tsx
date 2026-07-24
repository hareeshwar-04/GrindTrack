import React, { useState } from 'react';
import { SupabaseAuth, isSupabaseConfigured } from '../services/supabase';
import { LogIn, Mail, Lock, User, Sparkles, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userEmail: string, username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Fallback for local demo mode if env vars aren't added yet
        setTimeout(() => {
          setIsLoading(false);
          onAuthSuccess(email || 'user@grindtrack.app', username || 'GrindMaster');
          onClose();
        }, 1000);
        return;
      }

      if (isMagicLink) {
        await SupabaseAuth.signInWithMagicLink(email);
        setSuccessMsg('Magic login link sent to your email inbox! 📩');
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const res = await SupabaseAuth.signUpWithEmail(email, password, username);
        setSuccessMsg('Account created! Please check your email to confirm signup.');
        if (res?.user) {
          onAuthSuccess(res.user.email || email, username || 'New Grind');
        }
      } else {
        const res = await SupabaseAuth.signInWithEmail(email, password);
        if (res?.user) {
          onAuthSuccess(res.user.email || email, res.user.user_metadata?.username || 'GrindMaster');
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {isMagicLink ? 'Passwordless Magic Link' : isSignUp ? 'Create GrindTrack Account' : 'Sign In to GrindTrack'}
              </h3>
              <p className="text-xs text-[#9CA3AF]">Sync daily goals and streaks across all devices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Supabase ENV keys pending. Demo Mode will simulate login instantly!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
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
                <User className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_dev"
                  className="form-input text-xs pl-9"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="form-input text-xs pl-9"
                required
              />
            </div>
          </div>

          {!isMagicLink && (
            <div>
              <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input text-xs pl-9"
                  minLength={6}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary text-xs py-2.5 flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Processing...' : isMagicLink ? 'Send Magic Link 📩' : isSignUp ? 'Create Account 🚀' : 'Sign In 🔑'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Toggle modes */}
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] pt-2 border-t border-[#222]">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsMagicLink(false);
              }}
              className="hover:text-[#00E5FF] underline font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>

            <button
              type="button"
              onClick={() => setIsMagicLink(!isMagicLink)}
              className="hover:text-[#8B5CF6] underline font-semibold"
            >
              {isMagicLink ? 'Use Password' : 'Magic Link ✉️'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
