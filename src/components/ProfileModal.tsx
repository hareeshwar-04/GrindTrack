import React from 'react';
import { GroupMember } from '../types';
import { X, Flame, Zap, Trophy, Target, Award, Clock } from 'lucide-react';

interface ProfileModalProps {
  member: GroupMember | null;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Member Header */}
        <div className="flex items-center gap-4">
          <img src={member.profilePic} alt={member.username} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#00E5FF]" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-lg text-white">{member.username}</h3>
              <span>{member.moodEmoji}</span>
            </div>
            <p className="text-xs text-[#00E5FF] font-semibold">{member.rank}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">{member.bio}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#171717] border border-[#262626]">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase block">Streak</span>
            <div className="font-display font-extrabold text-sm text-[#F59E0B] flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-4 h-4 fill-[#F59E0B]" /> {member.currentStreak}d
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#171717] border border-[#262626]">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase block">Level & XP</span>
            <div className="font-display font-extrabold text-sm text-[#00E5FF] mt-0.5">
              Lvl {member.level} ({member.xp})
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#171717] border border-[#262626]">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase block">Today %</span>
            <div className="font-display font-extrabold text-sm text-[#10B981] mt-0.5">
              {member.todayPercentage}%
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-[#222]">
            <span className="text-[#9CA3AF]">Consistency Rate</span>
            <span className="font-bold text-white">{member.consistencyRate}%</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#222]">
            <span className="text-[#9CA3AF]">Success Rate</span>
            <span className="font-bold text-[#10B981]">{member.successRate}%</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#222]">
            <span className="text-[#9CA3AF]">Avg Task Duration</span>
            <span className="font-bold text-white">{member.avgCompletionTimeMins} mins</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[#9CA3AF]">Peak Productive Hour</span>
            <span className="font-bold text-[#00E5FF]">{member.mostProductiveHour}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn btn-secondary text-xs">
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
