import React from 'react';
import { LayoutDashboard, CheckSquare, Users, Trophy, BarChart3, Settings } from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: CheckSquare },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/90 backdrop-blur-lg border-t border-[#222] px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeView === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveView(t.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-[#00E5FF] scale-110' : 'text-[#9CA3AF]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
