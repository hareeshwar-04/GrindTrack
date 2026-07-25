import React from 'react';
import { Goal, UserProfile } from '../../types';
import { Target, Zap, Flame, CheckCircle2 } from 'lucide-react';

interface TodaySummaryCardsProps {
  goals: Goal[];
  user: UserProfile;
}

export const TodaySummaryCards: React.FC<TodaySummaryCardsProps> = ({ goals, user }) => {
  const todayGoals = goals.filter(g => g.targetDay === 'today');
  const completedToday = todayGoals.filter(g => g.status === 'completed').length;
  const totalToday = todayGoals.length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Calculate XP earned today (from completed today goals)
  // Simplified calculation for display purposes
  let xpEarnedToday = 0;
  todayGoals.filter(g => g.status === 'completed').forEach(g => {
    switch (g.difficulty) {
      case 'easy': xpEarnedToday += 10; break;
      case 'medium': xpEarnedToday += 25; break;
      case 'hard': xpEarnedToday += 50; break;
      case 'beast': xpEarnedToday += 100; break;
      default: xpEarnedToday += 25;
    }
  });
  if (completedToday === totalToday && totalToday > 0) xpEarnedToday += 300; // Bonus

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="glass-card p-4 flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Today's Progress</span>
          <Target className="w-4 h-4 text-[#00E5FF]" />
        </div>
        <div>
          <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-[#00E5FF] transition-all duration-500 ease-out" 
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-white">{completedToday} / {totalToday}</span>
            <span className="text-[#00E5FF]">{completionPct}%</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">XP Earned Today</span>
          <Zap className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <div className="font-display font-extrabold text-2xl text-white">
          +{xpEarnedToday}
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Current Streak</span>
          <Flame className="w-4 h-4 text-[#EF4444]" />
        </div>
        <div className="font-display font-extrabold text-2xl text-white flex items-baseline gap-1">
          {user.currentStreak} <span className="text-sm text-[#9CA3AF]">days</span>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Avg Completion</span>
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
        </div>
        <div className="font-display font-extrabold text-2xl text-white">
          {user.successRate}%
        </div>
      </div>
    </div>
  );
};
