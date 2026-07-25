import React from 'react';
import { GroupMember, ActivityFeedItem } from '../../types';
import { Trophy, Activity, ArrowRight, TrendingUp } from 'lucide-react';

interface SocialSidebarProps {
  members: GroupMember[];
  activities: ActivityFeedItem[];
}

export const SocialSidebar: React.FC<SocialSidebarProps> = ({ members, activities }) => {
  // Sort global members by level for the leaderboard summary
  const topMembers = [...members].sort((a, b) => b.level - a.level).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Leaderboard Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#8B5CF6]" /> Global Top 5
          </h3>
          <button className="text-[#9CA3AF] hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          {topMembers.map((member, idx) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                idx === 0 ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                idx === 1 ? 'bg-[#9CA3AF]/20 text-[#9CA3AF]' :
                idx === 2 ? 'bg-[#D97706]/20 text-[#D97706]' : 'text-[#6B7280]'
              }`}>
                #{idx + 1}
              </div>
              <img src={member.profilePic} alt={member.username} className="w-8 h-8 rounded-full border border-[#333]" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{member.username}</div>
                <div className="text-[10px] text-[#9CA3AF]">Level {member.level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00E5FF]" /> Live Feed
          </h3>
          <TrendingUp className="w-4 h-4 text-[#00E5FF] animate-pulse" />
        </div>

        <div className="space-y-4">
          {activities.slice(0, 5).map((act, i) => (
            <div key={act.id || i} className="relative pl-4 border-l border-[#333]">
              <div className="absolute w-2 h-2 rounded-full bg-[#00E5FF] -left-[4.5px] top-1.5 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              <p className="text-xs text-white leading-relaxed">
                <span className="font-bold text-[#8B5CF6]">{act.userName}</span> {act.text}
              </p>
              <div className="text-[10px] text-[#9CA3AF] mt-1 font-bold">
                {act.timestamp}
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-4 text-xs text-[#9CA3AF]">No recent activity.</div>
          )}
        </div>
      </div>

    </div>
  );
};
