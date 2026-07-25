import React from 'react';
import { UserProfile } from '../../types';
import { Flame, Trophy, Zap, Bell, Search } from 'lucide-react';

interface MissionHeaderProps {
  user: UserProfile;
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning`;
    if (hour < 17) return `Good Afternoon`;
    if (hour < 22) return `Good Evening`;
    return `Late Night Grind`;
  };

  const todayDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-b border-[#222]">
      
      {/* Greeting & Date */}
      <div>
        <h1 className="font-display font-extrabold text-2xl text-white">
          {getGreeting()}, <span className="text-[#00E5FF]">{user.username}</span>
        </h1>
        <p className="text-sm text-[#9CA3AF] font-bold uppercase tracking-wider mt-1">{todayDate}</p>
      </div>

      {/* KPI Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#F59E0B]" />
          <div>
            <div className="text-[10px] text-[#9CA3AF] font-bold uppercase">Total XP</div>
            <div className="font-bold text-white text-sm">{user.xp}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#8B5CF6]" />
          <div>
            <div className="text-[10px] text-[#9CA3AF] font-bold uppercase">Level {user.level}</div>
            <div className="font-bold text-white text-sm">{user.rank}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#EF4444]" />
          <div>
            <div className="text-[10px] text-[#9CA3AF] font-bold uppercase">Streak</div>
            <div className="font-bold text-white text-sm">{user.currentStreak} Days</div>
          </div>
        </div>

      </div>
    </div>
  );
};
