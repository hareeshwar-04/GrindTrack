import React, { useState, useEffect } from 'react';
import { Group, GroupMember, UserProfile } from '../../types';
import { DatabaseService } from '../../services/db';
import { Users, Trophy, Activity, Settings, Shield, Zap, ExternalLink, Copy, Check } from 'lucide-react';

interface GroupDashboardViewProps {
  groupId: string;
  currentUser: UserProfile;
  onLeaveGroup: () => void;
}

type TabState = 'overview' | 'members' | 'leaderboard' | 'activity' | 'settings';

export const GroupDashboardView: React.FC<GroupDashboardViewProps> = ({ groupId, currentUser, onLeaveGroup }) => {
  const [activeTab, setActiveTab] = useState<TabState>('overview');
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [drawerMember, setDrawerMember] = useState<GroupMember | null>(null);

  const fetchGroupData = async () => {
    setIsLoading(true);
    try {
      const [allSquads, squadMembers] = await Promise.all([
        DatabaseService.getUserSquads(currentUser.id),
        DatabaseService.getSquadMembers(groupId)
      ]);
      const current = allSquads.find(s => s.id === groupId);
      if (current) setGroup(current);
      setMembers(squadMembers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  if (isLoading || !group) {
    return <div className="text-center py-20 text-[#9CA3AF]">Loading dashboard...</div>;
  }

  const isOwner = group.ownerId === currentUser.id;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?join=${group.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-4 border-t-[#8B5CF6]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#222] flex items-center justify-center text-3xl shadow-lg">
            {group.icon}
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
              {group.name}
              {group.isPrivate && <Shield className="w-4 h-4 text-[#F59E0B]" />}
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1 line-clamp-1">{group.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCopyCode} className="btn btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Link' : 'Invite'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-[#222]">
        {(['overview', 'members', 'leaderboard', 'activity', 'settings'] as TabState[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-sm uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-[#00E5FF] text-[#00E5FF]' 
                : 'border-transparent text-[#9CA3AF] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex items-center gap-4">
              <Users className="w-8 h-8 text-[#8B5CF6]" />
              <div>
                <div className="text-xs text-[#9CA3AF] font-bold uppercase">Total Members</div>
                <div className="font-display font-extrabold text-2xl text-white">{members.length}</div>
              </div>
            </div>
            <div className="glass-card p-6 flex items-center gap-4">
              <Zap className="w-8 h-8 text-[#F59E0B]" />
              <div>
                <div className="text-xs text-[#9CA3AF] font-bold uppercase">My Group XP</div>
                <div className="font-display font-extrabold text-2xl text-white">
                  {(group.memberData as any)[currentUser.id]?.xp || 0}
                </div>
              </div>
            </div>
            <div className="glass-card p-6 flex items-center gap-4">
              <Trophy className="w-8 h-8 text-[#00E5FF]" />
              <div>
                <div className="text-xs text-[#9CA3AF] font-bold uppercase">My Rank</div>
                <div className="font-display font-extrabold text-2xl text-white">
                  #{[...members].sort((a, b) => ((group.memberData as any)[b.id]?.xp || 0) - ((group.memberData as any)[a.id]?.xp || 0)).findIndex(m => m.id === currentUser.id) + 1}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="glass-card p-6">
            <h3 className="font-display font-extrabold text-lg text-white mb-4">Group Leaderboard</h3>
            <p className="text-xs text-[#9CA3AF] mb-6">Rankings are based strictly on XP earned *after* joining this specific group.</p>
            <div className="space-y-2">
              {[...members].sort((a, b) => ((group.memberData as any)[b.id]?.xp || 0) - ((group.memberData as any)[a.id]?.xp || 0)).map((member, idx) => (
                <div key={member.id} className={`flex items-center gap-4 p-4 rounded-xl border ${member.id === currentUser.id ? 'bg-[#00E5FF]/5 border-[#00E5FF]/20' : 'bg-[#111111] border-[#222]'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold ${
                    idx === 0 ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                    idx === 1 ? 'bg-[#9CA3AF]/20 text-[#9CA3AF]' :
                    idx === 2 ? 'bg-[#D97706]/20 text-[#D97706]' : 'text-[#6B7280]'
                  }`}>
                    #{idx + 1}
                  </div>
                  <img src={member.profilePic} alt={member.username} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{member.username} {member.id === group.ownerId && <Shield className="w-3 h-3 text-[#F59E0B] inline ml-1" />}</h4>
                    <span className="text-[10px] text-[#9CA3AF]">Level {member.level}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-extrabold text-[#00E5FF]">{(group.memberData as any)[member.id]?.xp || 0} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => (
              <div key={member.id} onClick={() => setDrawerMember(member)} className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-[#8B5CF6]/50 transition-colors">
                <img src={member.profilePic} alt={member.username} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{member.username}</h4>
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{member.id === group.ownerId ? 'Leader' : 'Member'}</p>
                </div>
                {isOwner && member.id !== currentUser.id && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Kick member?')) {
                        DatabaseService.kickMember(group.id, member.id).then(fetchGroupData);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    Kick
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-20 text-[#9CA3AF]">
            Activity feed for {group.name} will appear here. (Coming soon)
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl space-y-6">
            <div className="glass-card p-6 border-red-500/20">
              <h3 className="font-bold text-red-500 mb-2">Danger Zone</h3>
              <p className="text-xs text-[#9CA3AF] mb-4">Leaving this group will permanently delete your group XP and contribution history.</p>
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to leave this group?')) {
                    await DatabaseService.kickMember(group.id, currentUser.id);
                    onLeaveGroup();
                  }
                }}
                className="btn py-2 px-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Leave Group
              </button>
            </div>
            
            {isOwner && (
              <div className="glass-card p-6 border-red-500/20 mt-4">
                <h3 className="font-bold text-red-500 mb-2">Admin: Delete Group</h3>
                <p className="text-xs text-[#9CA3AF] mb-4">This action cannot be undone.</p>
                <button 
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to completely DELETE this group?')) {
                      // Note: We need a deleteSquad method in db.ts
                      alert('Delete functionality coming soon via backend update.');
                    }
                  }}
                  className="btn py-2 px-4 bg-red-500 border border-red-500 text-white hover:bg-red-600"
                >
                  Delete Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Member Drawer */}
      {drawerMember && (
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#111111] border-l border-[#222] shadow-2xl z-50 p-6 animate-slide-in flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-extrabold text-white text-lg">Member Profile</h3>
            <button onClick={() => setDrawerMember(null)} className="text-[#9CA3AF] hover:text-white">✕</button>
          </div>
          <div className="text-center space-y-3">
            <img src={drawerMember.profilePic} alt={drawerMember.username} className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-[#8B5CF6]/30" />
            <h4 className="font-bold text-xl text-white">{drawerMember.username}</h4>
            <p className="text-sm text-[#00E5FF] font-bold">Group XP: {(group.memberData as any)[drawerMember.id]?.xp || 0}</p>
          </div>
          <div className="mt-8 space-y-4 flex-1">
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
              <div className="text-[10px] text-[#9CA3AF] font-bold uppercase mb-1">Global Level</div>
              <div className="font-bold text-white text-lg">Level {drawerMember.level}</div>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
              <div className="text-[10px] text-[#9CA3AF] font-bold uppercase mb-1">Joined Group</div>
              <div className="font-bold text-white text-sm">
                {new Date((group.memberData as any)[drawerMember.id]?.joinedAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
