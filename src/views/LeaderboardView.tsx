import React, { useState } from 'react';
import { GroupMember } from '../types';
import { Trophy, Award, Flame, ArrowUp, ArrowDown, Minus, Search, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  members: GroupMember[];
  onSelectMember: (member: GroupMember) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ members, onSelectMember }) => {
  const [rankingMode, setRankingMode] = useState<'today' | 'week' | 'month' | 'all'>('today');

  // Sorted members
  const sortedMembers = [...members].sort((a, b) => {
    if (rankingMode === 'today') return b.todayPercentage - a.todayPercentage;
    if (rankingMode === 'week') return b.weeklyPercentage - a.weeklyPercentage;
    if (rankingMode === 'month') return b.monthlyPercentage - a.monthlyPercentage;
    return b.xp - a.xp;
  });

  const top1 = sortedMembers[0];
  const top2 = sortedMembers[1];
  const top3 = sortedMembers[2];
  const remaining = sortedMembers.slice(3);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Ranking Mode Tabs */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#F59E0B]" /> Global & Group Leaderboard
            </h2>
            <span className="badge badge-primary text-[10px]">LIVE RANKINGS</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Real-time rankings based on daily goal execution consistency and XP progression.
          </p>
        </div>

        {/* Ranking Mode Switcher */}
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

      {/* Animated Top 3 Podium (Gold, Silver, Bronze) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
        
        {/* #2 Silver Podium */}
        {top2 && (
          <div 
            onClick={() => onSelectMember(top2)}
            className="glass-card p-6 text-center space-y-3 cursor-pointer transform hover:-translate-y-2 transition-transform border-t-4 border-t-slate-400"
          >
            <div className="relative inline-block">
              <img src={top2.profilePic} alt={top2.username} className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-slate-400" />
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-400 text-black font-extrabold text-xs flex items-center justify-center shadow-lg">
                2
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{top2.username}</h4>
              <p className="text-[10px] text-[#9CA3AF]">{top2.rank}</p>
            </div>
            <div className="badge badge-accent text-xs font-mono">
              {rankingMode === 'today' ? `${top2.todayPercentage}% Done` : `${top2.xp} XP`}
            </div>
          </div>
        )}

        {/* #1 Gold Podium (Tallest & Central) */}
        {top1 && (
          <div 
            onClick={() => onSelectMember(top1)}
            className="glass-card p-8 text-center space-y-4 cursor-pointer transform hover:-translate-y-3 transition-transform border-t-4 border-t-[#F59E0B] bg-gradient-to-b from-[#F59E0B]/10 to-[#111111] shadow-[0_0_30px_rgba(245,158,11,0.2)] order-first md:order-none"
          >
            <div className="text-2xl animate-bounce">👑</div>
            <div className="relative inline-block">
              <img src={top1.profilePic} alt={top1.username} className="w-24 h-24 rounded-2xl object-cover mx-auto ring-4 ring-[#F59E0B]" />
              <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#F59E0B] text-black font-extrabold text-sm flex items-center justify-center shadow-lg">
                1
              </span>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">{top1.username}</h3>
              <p className="text-xs text-[#F59E0B] font-semibold">{top1.rank}</p>
            </div>
            <div className="badge badge-warning text-xs font-mono py-1 px-3">
              🥇 {rankingMode === 'today' ? `${top1.todayPercentage}% Done` : `${top1.xp} XP`}
            </div>
          </div>
        )}

        {/* #3 Bronze Podium */}
        {top3 && (
          <div 
            onClick={() => onSelectMember(top3)}
            className="glass-card p-6 text-center space-y-3 cursor-pointer transform hover:-translate-y-2 transition-transform border-t-4 border-t-amber-700"
          >
            <div className="relative inline-block">
              <img src={top3.profilePic} alt={top3.username} className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-amber-700" />
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center shadow-lg">
                3
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{top3.username}</h4>
              <p className="text-[10px] text-[#9CA3AF]">{top3.rank}</p>
            </div>
            <div className="badge badge-accent text-xs font-mono">
              {rankingMode === 'today' ? `${top3.todayPercentage}% Done` : `${top3.xp} XP`}
            </div>
          </div>
        )}

      </div>

      {/* Leaderboard Table */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-bold text-sm text-white mb-2">Rankings List</h3>
        <div className="space-y-2">
          {sortedMembers.map((m, idx) => (
            <div
              key={m.id}
              onClick={() => onSelectMember(m)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#171717] hover:bg-[#222] border border-[#262626] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-xs text-[#9CA3AF] w-6">#{idx + 1}</span>
                <img src={m.profilePic} alt={m.username} className="w-9 h-9 rounded-xl object-cover" />
                <div>
                  <h5 className="font-bold text-xs text-white">{m.username}</h5>
                  <span className="text-[10px] text-[#9CA3AF]">{m.currentStreak}d streak • Lvl {m.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="badge badge-primary text-xs font-mono">{m.xp} XP</span>
                <span className="text-xs font-bold text-[#00E5FF] w-12 text-right">{m.todayPercentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
