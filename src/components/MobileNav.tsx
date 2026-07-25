import React from 'react';
import { LayoutDashboard, CheckSquare, Users, Trophy, BarChart3, Settings, Calendar, Activity, User } from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: CheckSquare },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'activity', label: 'Feed', icon: Activity },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/90 backdrop-blur-lg border-t border-[#222] px-2 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto overflow-x-auto gap-0.5">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeView === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveView(t.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[9px] font-bold transition-all shrink-0 ${
                isActive ? 'text-[#00E5FF] scale-110' : 'text-[#9CA3AF]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
