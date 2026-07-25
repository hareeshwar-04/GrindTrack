import React, { useState } from 'react';
import { GroupMember } from '../types';
import { Trophy, Award, Flame, Users, Target, Zap } from 'lucide-react';

interface LeaderboardViewProps {
  members: GroupMember[];
  onSelectMember: (member: GroupMember) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ members, onSelectMember }) => {
  const [rankingMode, setRankingMode] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const sortedMembers = [...members].sort((a, b) => {
    if (rankingMode === 'today') return b.todayPercentage - a.todayPercentage;
    if (rankingMode === 'week') return b.weeklyPercentage - a.weeklyPercentage;
    if (rankingMode === 'month') return b.monthlyPercentage - a.monthlyPercentage;
    return b.xp - a.xp;
  });

  const getDisplayValue = (m: GroupMember) => {
    if (rankingMode === 'today') return `${m.todayPercentage}% Done`;
    if (rankingMode === 'week') return `${m.weeklyPercentage}% Weekly`;
    if (rankingMode === 'month') return `${m.monthlyPercentage}% Monthly`;
    return `${m.xp} XP`;
  };

  // Empty state when no squad members
  if (sortedMembers.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-6">
          <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#F59E0B]" /> Leaderboard
          </h2>
        </div>
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center">
            <Users className="w-10 h-10 text-[#F59E0B]" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">No Squad Members Yet</h3>
          <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
            Create or join a Squad to see the leaderboard! Invite friends with your squad code and compete on daily consistency.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Ranking Mode Tabs */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#F59E0B]" /> Leaderboard
            </h2>
            <span className="badge badge-primary text-[10px]">YOUR STATS</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            {sortedMembers.length === 1 
              ? 'Your personal rankings. Invite friends to your squad to compete!'
              : 'Real-time rankings based on daily goal execution consistency and XP progression.'
            }
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#171717] border border-[#262626] rounded-xl">
          {[
            { id: 'today', label: 'Today %' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All-Time XP' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setRankingMode(m.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rankingMode === m.id 
                  ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black shadow-md' 
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Your Stats Summary (always shown) */}
      {sortedMembers.length >= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center space-y-1">
            <Zap className="w-5 h-5 text-[#00E5FF] mx-auto" />
            <p className="font-display font-extrabold text-xl text-white">{sortedMembers[0].xp}</p>
            <p className="text-[10px] text-[#9CA3AF] font-semibold">Total XP</p>
          </div>
          <div className="glass-card p-4 text-center space-y-1">
            <Flame className="w-5 h-5 text-[#F59E0B] mx-auto" />
            <p className="font-display font-extrabold text-xl text-white">{sortedMembers[0].currentStreak}d</p>
            <p className="text-[10px] text-[#9CA3AF] font-semibold">Current Streak</p>
          </div>
          <div className="glass-card p-4 text-center space-y-1">
            <Target className="w-5 h-5 text-[#10B981] mx-auto" />
            <p className="font-display font-extrabold text-xl text-white">Lvl {sortedMembers[0].level}</p>
            <p className="text-[10px] text-[#9CA3AF] font-semibold">Current Level</p>
          </div>
          <div className="glass-card p-4 text-center space-y-1">
            <Award className="w-5 h-5 text-[#8B5CF6] mx-auto" />
            <p className="font-display font-extrabold text-xl text-[#F59E0B]">{sortedMembers[0].rank}</p>
            <p className="text-[10px] text-[#9CA3AF] font-semibold">Current Rank</p>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-bold text-sm text-white mb-2">Rankings</h3>
        <div className="space-y-2">
          {sortedMembers.map((m, idx) => (
            <div
              key={m.id}
              onClick={() => onSelectMember(m)}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                idx === 0 
                  ? 'bg-gradient-to-r from-[#F59E0B]/10 to-transparent border-[#F59E0B]/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                  : 'bg-[#171717] hover:bg-[#222] border-[#262626]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-extrabold text-sm w-8 text-center ${
                  idx === 0 ? 'text-[#F59E0B]' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-[#9CA3AF]'
                }`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <img src={m.profilePic} alt={m.username} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h5 className="font-bold text-sm text-white">{m.username}</h5>
                  <span className="text-[10px] text-[#9CA3AF]">{m.currentStreak}d streak • Lvl {m.level} • {m.rank}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="badge badge-primary text-xs font-mono">{m.xp} XP</span>
                <span className="text-xs font-bold text-[#00E5FF] w-20 text-right">{getDisplayValue(m)}</span>
              </div>
            </div>
          ))}
        </div>

        {sortedMembers.length === 1 && (
          <div className="mt-4 p-4 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-center">
            <p className="text-xs text-[#00E5FF] font-medium">
              💡 You're the only one here! Create a Squad and share your invite code with friends to unlock competitive leaderboards.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
