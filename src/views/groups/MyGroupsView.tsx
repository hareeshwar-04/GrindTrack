import React, { useState } from 'react';
import { Group } from '../../types';
import { Users, Search, Plus, Compass, Zap, Lock, Unlock, Crown } from 'lucide-react';

interface MyGroupsViewProps {
  groups: Group[];
  onOpenGroup: (groupId: string) => void;
  onNavigateDiscover: () => void;
}

export const MyGroupsView: React.FC<MyGroupsViewProps> = ({ groups, onOpenGroup, onNavigateDiscover }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">My Groups</h2>
          <p className="text-[#9CA3AF] text-sm mt-1">Select a group to view its dashboard.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search my groups..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-[#222] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-[#8B5CF6] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Group Cards Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <div 
              key={group.id}
              onClick={() => onOpenGroup(group.id)}
              className="glass-card glass-card-interactive p-5 space-y-4 cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#00E5FF]/20 flex items-center justify-center text-2xl border border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:scale-110 transition-transform duration-300">
                    {group.icon || '⚡'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-[#8B5CF6] transition-colors">{group.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-0.5">
                      {group.isPrivate ? <><Lock className="w-3 h-3" /> Private</> : <><Unlock className="w-3 h-3" /> Public</>}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#9CA3AF] line-clamp-2 flex-1">
                {group.description || 'No description provided.'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#222]">
                <div className="bg-[#111111] rounded-lg p-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00E5FF]" />
                  <div>
                    <div className="text-[9px] text-[#9CA3AF] font-bold uppercase">Members</div>
                    <div className="text-xs font-bold text-white">{group.memberIds.length}</div>
                  </div>
                </div>
                <div className="bg-[#111111] rounded-lg p-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  <div>
                    <div className="text-[9px] text-[#9CA3AF] font-bold uppercase">My Group XP</div>
                    <div className="text-xs font-bold text-white">{(group.memberData as any)[group.ownerId]?.xp || 0} XP</div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 glass-card border border-dashed border-[#333]">
          <p className="text-[#9CA3AF] text-sm">No groups found.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-[#222]">
        <button 
          onClick={onNavigateDiscover}
          className="btn btn-primary flex-1 flex items-center justify-center gap-2 py-3"
        >
          <Compass className="w-5 h-5" /> Discover New Groups
        </button>
      </div>

    </div>
  );
};
