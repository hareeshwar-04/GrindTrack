import React, { useState } from 'react';
import { Goal, GroupMember, ActivityFeedItem } from '../types';
import { Search, X, CheckSquare, Users, Activity, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  members: GroupMember[];
  activities: ActivityFeedItem[];
  onSelectResult: (view: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  goals,
  members,
  activities,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredGoals = query.trim()
    ? goals.filter(g => g.title.toLowerCase().includes(query.toLowerCase()) || g.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredMembers = query.trim()
    ? members.filter(m => m.username.toLowerCase().includes(query.toLowerCase()) || m.bio.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredActivities = query.trim()
    ? activities.filter(a => a.text.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222] bg-[#171717]">
          <Search className="w-5 h-5 text-[#00E5FF]" />
          <input
            type="text"
            autoFocus
            placeholder="Search goals, group members, activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-medium text-sm outline-none placeholder-[#6B7280]"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#9CA3AF] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {!query.trim() && (
            <div className="text-center py-8 text-[#9CA3AF] text-xs">
              Type to search across goals, group members, badges and activity feed.
            </div>
          )}

          {filteredGoals.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-[#9CA3AF] mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#00E5FF]" /> Goals ({filteredGoals.length})
              </div>
              <div className="space-y-1.5">
                {filteredGoals.map(g => (
                  <div
                    key={g.id}
                    onClick={() => { onSelectResult('goals'); onClose(); }}
                    className="p-2.5 rounded-xl bg-[#171717] hover:bg-[#222] border border-[#262626] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white">{g.title}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#9CA3AF]">
                        <span className="badge badge-primary text-[9px] py-0">{g.category}</span>
                        <span>Est: {g.estimatedMinutes}m</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6B7280]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredMembers.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-[#9CA3AF] mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#8B5CF6]" /> Members ({filteredMembers.length})
              </div>
              <div className="space-y-1.5">
                {filteredMembers.map(m => (
                  <div
                    key={m.id}
                    onClick={() => { onSelectResult('groups'); onClose(); }}
                    className="p-2.5 rounded-xl bg-[#171717] hover:bg-[#222] border border-[#262626] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={m.profilePic} alt={m.username} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <span className="text-xs font-semibold text-white">{m.username}</span>
                        <p className="text-[10px] text-[#9CA3AF]">{m.rank} • {m.currentStreak}d streak</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6B7280]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredActivities.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-[#9CA3AF] mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#10B981]" /> Activity ({filteredActivities.length})
              </div>
              <div className="space-y-1.5">
                {filteredActivities.map(a => (
                  <div
                    key={a.id}
                    onClick={() => { onSelectResult('activity'); onClose(); }}
                    className="p-2.5 rounded-xl bg-[#171717] hover:bg-[#222] border border-[#262626] cursor-pointer text-xs text-white transition-colors"
                  >
                    <strong className="text-[#00E5FF]">{a.userName}</strong> {a.text}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
