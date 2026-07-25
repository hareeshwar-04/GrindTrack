import React, { useState, useEffect } from 'react';
import { Group, GroupMember, UserProfile } from '../types';
import { DatabaseService } from '../services/db';
import { 
  Users, Plus, Key, Shield, Crown, Flame, Zap, Award, 
  ExternalLink, Copy, Check, Settings, UserMinus, UserCheck, Sparkles 
} from 'lucide-react';

interface GroupsViewProps {
  groups: Group[];
  members: GroupMember[];
  currentUser: UserProfile;
  onSelectMemberProfile: (member: GroupMember) => void;
  onCreateGroup: (name: string, description: string, isPrivate: boolean) => void;
  onJoinGroup: (code: string) => void;
  onPreviewGroup: (code: string) => Promise<{ id: string; name: string; description: string; icon: string; memberCount: number } | null>;
  onKickMember?: (memberId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  members,
  currentUser,
  onSelectMemberProfile,
  onCreateGroup,
  onJoinGroup,
  onPreviewGroup,
  onKickMember
}) => {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [previewData, setPreviewData] = useState<{ id: string; name: string; description: string; icon: string; memberCount: number } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  // Public Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchPublicGroups = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await DatabaseService.searchPublicSquads(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Auto-join logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setJoinCodeInput(joinCode.toUpperCase());
      setShowJoinModal(true);
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-trigger preview
      setIsPreviewLoading(true);
      onPreviewGroup(joinCode.toUpperCase())
        .then(data => { if (data) setPreviewData(data); })
        .catch(err => console.error(err))
        .finally(() => setIsPreviewLoading(false));
    }
  }, [onPreviewGroup]);

  const currentGroup = groups[activeGroupIndex] || groups[0];

  const [friendHandleInput, setFriendHandleInput] = useState('');
  const [friendInviteSuccess, setFriendInviteSuccess] = useState('');

  const handleCopyShareableLink = () => {
    if (!currentGroup) return;
    const link = `${window.location.origin}/?join=${currentGroup.code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAddFriendByHandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendHandleInput.trim()) return;
    setFriendInviteSuccess(`Invite sent to ${friendHandleInput.trim()}!`);
    setFriendHandleInput('');
    setTimeout(() => setFriendInviteSuccess(''), 3000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onCreateGroup(newGroupName.trim(), newGroupDesc.trim(), newGroupPrivate);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    
    if (previewData) {
      // Step 2: Accept Invite
      onJoinGroup(joinCodeInput.trim().toUpperCase());
      setShowJoinModal(false);
      setJoinCodeInput('');
      setPreviewData(null);
    } else {
      // Step 1: Fetch Preview
      try {
        setIsPreviewLoading(true);
        const data = await onPreviewGroup(joinCodeInput.trim().toUpperCase());
        if (data) setPreviewData(data);
      } catch (err) {
        // App.tsx handles the toast error, so we can just leave this
      } finally {
        setIsPreviewLoading(false);
      }
    }
  };

  // Empty state — no groups
  if (groups.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-12 text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#00E5FF]/10 to-[#8B5CF6]/10 flex items-center justify-center border border-white/10">
            <Users className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-white">No Squads Yet</h3>
          <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
            Create your first accountability squad or join an existing one with an invite code. Each squad tracks its own XP separately!
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Squad
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn btn-secondary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Key className="w-4 h-4 text-[#8B5CF6]" /> Join with Code
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <h3 className="font-display font-extrabold text-lg text-white">Create Private Squad</h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Squad Name *</label>
                  <input type="text" placeholder="e.g. 100 Days Coding Titans" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Description</label>
                  <textarea placeholder="Daily rules and expectations..." value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="form-input min-h-[70px]" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary text-xs">Cancel</button>
                  <button type="submit" className="btn btn-primary text-xs">Create Squad 🚀</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Modal with Preview Step */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative overflow-hidden">
              
              {!previewData ? (
                <>
                  <h3 className="font-display font-extrabold text-lg text-white">Join Squad with Invite Code</h3>
                  <form onSubmit={handleJoinSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Enter Invite Code</label>
                      <input type="text" placeholder="e.g. TITAN-5921" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} className="form-input font-mono uppercase" required />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary text-xs">Cancel</button>
                      <button type="submit" className="btn btn-primary text-xs" disabled={isPreviewLoading}>
                        {isPreviewLoading ? 'Searching...' : 'Search Squad'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 flex items-center justify-center border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                      <span className="text-3xl">{previewData.icon}</span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl text-white pt-2">{previewData.name}</h3>
                    <p className="text-sm text-[#9CA3AF]">{previewData.description || 'A highly active accountability squad.'}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#8B5CF6]" />
                      <span className="text-sm font-semibold text-white">Current Members</span>
                    </div>
                    <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1 rounded-full text-sm font-bold border border-[#8B5CF6]/30">
                      {previewData.memberCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => setPreviewData(null)} className="btn btn-secondary text-xs flex-1">Back</button>
                    <button type="button" onClick={handleJoinSubmit} className="btn btn-primary text-xs flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED]">
                      Accept Invite
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & Selector */}
      <div className="glass-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent text-[10px]">PRIVATE ACCOUNTABILITY SQUAD</span>
            <span className="text-xs text-[#9CA3AF]">• Code: <strong className="text-[#00E5FF] font-mono">{currentGroup?.code}</strong></span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-3">
            <span>{currentGroup?.icon}</span> {currentGroup?.name}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1 max-w-xl">
            {currentGroup?.description}
          </p>

          {/* Group-Specific XP & Join Date */}
          {currentGroup?.memberData?.[currentUser.id] && (
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span className="text-xs font-bold text-[#00E5FF]">
                  {currentGroup.memberData[currentUser.id].xp} Group XP
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span className="text-xs font-bold text-[#8B5CF6]">
                  Joined {new Date(currentGroup.memberData[currentUser.id].joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-xs font-bold text-[#F59E0B]">
                  {currentUser.xp} Total XP (All-Time)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
          <button
            onClick={handleCopyShareableLink}
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF]"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-[#00E5FF]" />}
            <span>{copiedCode ? 'Link Copied! 🔗' : 'Copy Invite Link 🔗'}</span>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 border-[#8B5CF6]/30 hover:border-[#8B5CF6]"
          >
            <Key className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Join via Code</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Squad</span>
          </button>
        </div>
      </div>

      {/* Add Friend by Username Input Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleAddFriendByHandle} className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <span className="text-xs font-bold text-white shrink-0">Invite Friend:</span>
          <input
            type="text"
            value={friendHandleInput}
            onChange={(e) => setFriendHandleInput(e.target.value)}
            placeholder="Enter friend's username (e.g. @alex_dev)..."
            className="bg-[#171717] border border-[#262626] focus:border-[#00E5FF] rounded-xl px-3 py-1.5 text-xs text-white outline-none w-full max-w-sm"
          />
          <button type="submit" className="btn btn-secondary text-xs py-1.5 px-3 shrink-0">
            Send Invite 📩
          </button>
        </form>

        {friendInviteSuccess && (
          <span className="text-xs font-bold text-[#10B981] animate-fade-in">
            ✓ {friendInviteSuccess}
          </span>
        )}
      </div>

      {/* Group Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {groups.map((grp, idx) => (
          <button
            key={grp.id}
            onClick={() => setActiveGroupIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeGroupIndex === idx 
                ? 'bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-black shadow-lg' 
                : 'bg-[#111111] text-[#9CA3AF] border border-[#222] hover:text-white'
            }`}
          >
            <span>{grp.icon}</span>
            <span>{grp.name}</span>
            <span className="badge badge-primary text-[9px] py-0">{grp.memberIds.length} members</span>
          </button>
        ))}
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.filter(m => currentGroup?.memberIds.includes(m.id)).map(member => (
          <div
            key={member.id}
            onClick={() => onSelectMemberProfile(member)}
            className="glass-card glass-card-interactive p-5 space-y-4 cursor-pointer relative overflow-hidden"
          >
            {/* Top Member Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={member.profilePic}
                    alt={member.username}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#00E5FF]/40"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#111111] ${
                    member.onlineStatus === 'online' ? 'bg-[#10B981]' : member.onlineStatus === 'grinding' ? 'bg-[#00E5FF] animate-pulse' : 'bg-[#6B7280]'
                  }`} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {member.username} <span>{member.moodEmoji}</span>
                  </h4>
                  <p className="text-[10px] text-[#9CA3AF] font-semibold">{member.rank}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="badge badge-accent text-[10px] font-mono">
                  Lvl {member.level}
                </span>
                
                {/* ADMIN CONTROLS: Kick Button */}
                {currentGroup?.ownerId === currentUser.id && member.id !== currentUser.id && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to kick ${member.username} from the squad?`)) {
                        onKickMember?.(member.id);
                      }
                    }}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors"
                  >
                    Kick
                  </button>
                )}
              </div>
            </div>

            {/* Daily % Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#9CA3AF]">Today's Target</span>
                <span className="text-[#00E5FF]">{member.todayPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] transition-all duration-500" 
                  style={{ width: `${member.todayPercentage}%` }}
                />
              </div>
            </div>

            {/* Member Stats Matrix */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#222] text-center">
              <div className="p-2 rounded-xl bg-[#171717]">
                <span className="text-[9px] text-[#9CA3AF] uppercase font-bold block">Streak</span>
                <div className="font-display font-extrabold text-xs text-[#F59E0B] flex items-center justify-center gap-0.5 mt-0.5">
                  <Flame className="w-3 h-3 fill-[#F59E0B]" /> {member.currentStreak}d
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#171717]">
                <span className="text-[9px] text-[#9CA3AF] uppercase font-bold block">Weekly</span>
                <div className="font-display font-extrabold text-xs text-[#10B981] mt-0.5">
                  {member.weeklyPercentage}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#171717]">
                <span className="text-[9px] text-[#9CA3AF] uppercase font-bold block">Goals</span>
                <div className="font-display font-extrabold text-xs text-[#00E5FF] mt-0.5">
                  {member.currentGoalCount} Active
                </div>
              </div>
            </div>

            {/* Bottom Status Footer */}
            <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] pt-1">
              <span>Last seen: <strong className="text-white">{member.lastSeen}</strong></span>
              <span className="text-[#00E5FF] font-semibold flex items-center gap-0.5 hover:underline">
                Inspect Profile <ExternalLink className="w-3 h-3" />
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Public Squad Discover Section */}
      <div className="mt-8 pt-8 border-t border-[#222]">
        <h3 className="font-display font-extrabold text-lg text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00E5FF]" /> Discover Public Squads
        </h3>
        
        <form onSubmit={handleSearchPublicGroups} className="flex items-center gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Search by squad name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input flex-1"
          />
          <button type="submit" className="btn btn-primary" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.map(squad => (
              <div key={squad.id} className="glass-card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center text-lg border border-[#00E5FF]/20">
                    {squad.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{squad.name}</h4>
                    <p className="text-[10px] text-[#9CA3AF] line-clamp-1">{squad.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setJoinCodeInput(squad.code);
                    setShowJoinModal(true);
                    
                    setIsPreviewLoading(true);
                    onPreviewGroup(squad.code)
                      .then(data => { if (data) setPreviewData(data); })
                      .finally(() => setIsPreviewLoading(false));
                  }}
                  className="btn btn-secondary text-[10px] py-1.5 px-3 shrink-0"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Squad */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-display font-extrabold text-lg text-white">Create Private Squad</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Squad Name *</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Days Coding Titans"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Description & Rules</label>
                <textarea
                  placeholder="Daily rules and expectations..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="form-input min-h-[70px]"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs">
                  Create Squad 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Squad */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-display font-extrabold text-lg text-white">Join Squad with Invite Code</h3>
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Enter 8-Digit Invite Code</label>
                <input
                  type="text"
                  placeholder="e.g. ALPHA-9921"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="form-input font-mono uppercase"
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs">
                  Join Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
