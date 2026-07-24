import React, { useState } from 'react';
import { UserProfile, Badge } from '../types';
import { 
  Flame, Zap, Trophy, Target, Award, Calendar, Clock, 
  TrendingUp, CheckCircle2, XCircle, SkipForward, BarChart2, ShieldCheck 
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  badges: Badge[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, badges }) => {
  const [activeChartTab, setActiveChartTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  // Heatmap rendering logic (365 days)
  const heatmapEntries = Object.entries(user.heatmapData || {}).slice(-140); // Last 140 days for grid fit

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-[#171717] border-[#262626]';
    if (count === 1) return 'bg-[#00E5FF]/20 border-[#00E5FF]/30';
    if (count === 2) return 'bg-[#00E5FF]/40 border-[#00E5FF]/50';
    if (count === 3) return 'bg-[#00E5FF]/70 border-[#00E5FF]/80';
    return 'bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Profile Header Card */}
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-[#111111] via-[#171717] to-[#111111] border border-[#222]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img
              src={user.profilePic}
              alt={user.username}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#00E5FF]/40 shadow-2xl"
            />
            <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold shadow-lg">
              {user.moodEmoji}
            </span>
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="font-display font-extrabold text-2xl text-white">{user.username}</h2>
              <span className="badge badge-primary font-mono text-[10px]">{user.rank}</span>
              <span className="badge badge-accent text-[10px]">TIMEZONE: {user.timezone.split(' ')[0]}</span>
            </div>

            <p className="text-xs text-[#9CA3AF] max-w-2xl leading-relaxed">{user.bio}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-semibold">
              <span className="text-[#F59E0B] flex items-center gap-1">
                <Flame className="w-4 h-4 fill-[#F59E0B]" /> {user.currentStreak} Day Streak
              </span>
              <span className="text-[#00E5FF] flex items-center gap-1">
                <Zap className="w-4 h-4 fill-[#00E5FF]" /> Level {user.level} ({user.xp} XP)
              </span>
              <span className="text-[#10B981] flex items-center gap-1">
                <Target className="w-4 h-4" /> {user.consistencyRate}% Consistency
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-Style Heatmap Calendar */}
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00E5FF]" /> Daily Consistency Heatmap (365 Days)
          </h3>
          <span className="text-[10px] text-[#9CA3AF]">
            Color intensity represents completed goals per day
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
            {heatmapEntries.map(([dateKey, count]) => (
              <div
                key={dateKey}
                title={`${dateKey}: ${count} goals completed`}
                className={`rounded-[4px] border ${getHeatmapColor(count)} transition-transform hover:scale-125`}
                style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px' }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 text-[10px] text-[#9CA3AF] pt-1">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-[#171717] border border-[#262626]" />
          <div className="w-3 h-3 rounded bg-[#00E5FF]/30" />
          <div className="w-3 h-3 rounded bg-[#00E5FF]/70" />
          <div className="w-3 h-3 rounded bg-[#00E5FF]" />
          <span>More</span>
        </div>
      </div>

      {/* Comprehensive Statistics Suite */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Total Goals</span>
          <div className="font-display font-extrabold text-xl text-white">{user.totalGoals}</div>
        </div>

        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#10B981] uppercase">Completed</span>
          <div className="font-display font-extrabold text-xl text-[#10B981]">{user.completedGoals}</div>
        </div>

        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#EF4444] uppercase">Failed</span>
          <div className="font-display font-extrabold text-xl text-[#EF4444]">{user.failedGoals}</div>
        </div>

        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#F59E0B] uppercase">Skipped</span>
          <div className="font-display font-extrabold text-xl text-[#F59E0B]">{user.skippedGoals}</div>
        </div>

        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Success Rate</span>
          <div className="font-display font-extrabold text-xl text-[#00E5FF]">{user.successRate}%</div>
        </div>

        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Avg Duration</span>
          <div className="font-display font-extrabold text-xl text-[#C084FC]">{user.avgCompletionTimeMins}m</div>
        </div>

      </div>

      {/* Peak Productivity Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-2">
          <h4 className="font-bold text-xs text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#00E5FF]" /> Peak Productive Time Window
          </h4>
          <div className="font-display font-extrabold text-lg text-white">{user.mostProductiveHour}</div>
          <p className="text-xs text-[#9CA3AF]">Most of your task check-offs occur during this time slot.</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <h4 className="font-bold text-xs text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" /> Peak Productive Day of Week
          </h4>
          <div className="font-display font-extrabold text-lg text-white">{user.mostProductiveDay}s</div>
          <p className="text-xs text-[#9CA3AF]">You achieve highest completion rate on Tuesdays.</p>
        </div>
      </div>

      {/* Achievements & Badges Shelf */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F59E0B]" /> Achievements Showcase ({badges.filter(b => b.isUnlocked).length}/{badges.length})
          </h3>
          <span className="text-[10px] text-[#9CA3AF]">Badges unlocked by consistent execution</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                b.isUnlocked 
                  ? 'bg-[#171717] border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.15)]' 
                  : 'bg-[#111111] border-[#222] opacity-40 grayscale'
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <h5 className="font-bold text-xs text-white leading-tight">{b.name}</h5>
              <p className="text-[10px] text-[#9CA3AF] leading-tight line-clamp-2">{b.description}</p>
              
              {/* Progress bar for locked badges */}
              {!b.isUnlocked && (
                <div className="w-full h-1.5 rounded-full bg-[#262626] overflow-hidden mt-1">
                  <div 
                    className="h-full bg-[#00E5FF]" 
                    style={{ width: `${Math.min(100, (b.userProgress / b.requiredVal) * 100)}%` }} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
