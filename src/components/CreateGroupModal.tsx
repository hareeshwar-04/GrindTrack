import React, { useState } from 'react';
import { Group } from '../types';
import { Users, X, Sparkles, Copy, Check, Shield, Flame } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (group: Partial<Group>) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Code & Tech');
  const [icon, setIcon] = useState('⚡');
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-generated 6-character invite code
  const [inviteCode] = useState(() => 'GT-' + Math.random().toString(36).substring(2, 8).toUpperCase());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateGroup({
      id: 'grp_' + Date.now(),
      name: name.trim(),
      description: description.trim() || 'Daily accountability squad',
      icon,
      code: inviteCode,
      isPrivate: true,
      ownerId: 'u_current',
      adminIds: ['u_current'],
      memberIds: ['u_current'],
      createdAt: new Date().toISOString()
    });

    onClose();
  };

  const shareLink = `${window.location.origin}/?join=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Create Daily Squad</h3>
              <p className="text-xs text-[#9CA3AF]">Build an accountability group for your friends & team</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Squad Emoji & Name */}
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Squad Icon</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="bg-[#171717] border border-[#262626] text-xl rounded-xl p-2 text-center outline-none cursor-pointer"
              >
                {['⚡', '🔥', '💻', '🏋️', '📚', '🚀', '🎯', '🧠', '💰'].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Squad Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5 AM Grind Club, Silicon Valley Devs"
                className="form-input text-xs"
                maxLength={50}
                required
              />
            </div>
          </div>

          {/* Target Focus & Description */}
          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Squad Focus Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Code, Gym, High-Performance"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Group Rule & Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Must complete 100% daily goals by 10 PM every night!"
              className="form-input min-h-[60px] text-xs resize-none"
            />
          </div>

          {/* Generated Shareable Invite Code Box */}
          <div className="p-3.5 rounded-xl bg-[#171717] border border-[#262626] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#00E5FF] uppercase">Generated Squad Invite Code:</span>
              <span className="font-mono font-extrabold text-sm text-white bg-black px-2.5 py-1 rounded-lg border border-[#333]">
                {inviteCode}
              </span>
            </div>
            <p className="text-[10px] text-[#9CA3AF]">
              Friends can use this code or link to join your group instantly with zero friction.
            </p>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full btn btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 border-[#00E5FF]/40 text-[#00E5FF] mt-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Invite Link Copied to Clipboard!' : 'Copy 1-Click Invite Link 🔗'}</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#222]">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs py-2 px-5">
              Launch Squad 🚀
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
