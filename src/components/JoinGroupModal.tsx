import React, { useState } from 'react';
import { KeyRound, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinGroup: (code: string) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  onJoinGroup
}) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a valid 6-character invite code (e.g. GT-SQUAD7)');
      return;
    }

    onJoinGroup(cleanCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Join Friend's Squad</h3>
              <p className="text-xs text-[#9CA3AF]">Enter your squad's unique invite code</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Squad Invite Code / Link</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. GT-SQUAD7"
              className="form-input text-center font-mono font-bold text-base uppercase tracking-widest text-[#00E5FF] placeholder-[#6B7280]"
              maxLength={20}
              required
            />
          </div>

          <p className="text-[11px] text-[#9CA3AF] leading-relaxed text-center">
            Ask your squad creator for their 6-character code or click the invite link they shared with you!
          </p>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#222]">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs py-2 px-5">
              Join Squad Now 🔑
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
