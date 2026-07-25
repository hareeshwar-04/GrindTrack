import React, { useState, useEffect } from 'react';
import { UserProfile, Group } from '../../types';
import { DatabaseService } from '../../services/db';
import { Search, Users, Shield, ArrowRight, Compass, Sparkles, CheckCircle2 } from 'lucide-react';

interface DiscoverGroupsViewProps {
  currentUser: UserProfile;
  initialInviteCode?: string;
  joinedGroups: Group[];
  onBack: () => void;
  onJoinedGroup: (groupId: string) => void;
  onOpenGroup: (groupId: string) => void;
}

export const DiscoverGroupsView: React.FC<DiscoverGroupsViewProps> = ({ 
  currentUser, initialInviteCode, joinedGroups, onBack, onJoinedGroup, onOpenGroup 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setJoinError('');
    try {
      // Check if it's an invite code first (usually caps/hyphenated)
      if (query.toUpperCase() === query && query.length > 5) {
        const preview = await DatabaseService.previewSquad(query.toUpperCase());
        if (preview) {
          setPreviewData(preview);
          setIsSearching(false);
          return;
        }
      }
      // Otherwise, search public squads
      const results = await DatabaseService.searchPublicSquads(query);
      setSearchResults(results);
    } catch (err: any) {
      console.error(err);
      setJoinError(err.message || 'Squad not found.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Always load default public squads in the background so the list isn't empty on back
    handleSearch('');
    
    if (initialInviteCode) {
      setSearchQuery(initialInviteCode);
      handleSearch(initialInviteCode);
      // Clear URL parameter so it doesn't trigger on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [initialInviteCode]);

  const handlePreview = async (code: string) => {
    setIsPreviewLoading(true);
    setJoinError('');
    try {
      const data = await DatabaseService.previewSquad(code);
      if (data) setPreviewData(data);
    } catch (err: any) {
      setJoinError(err.message);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!previewData || isJoining) return;
    setIsJoining(true);
    setJoinError('');
    try {
      const joinedSquad = await DatabaseService.joinSquadWithCode(currentUser.id, previewData.code || searchQuery.toUpperCase());
      if (joinedSquad) {
        onJoinedGroup(joinedSquad.id);
      }
    } catch (err: any) {
      setJoinError(err.message);
      setIsJoining(false);
    }
  };

  if (previewData) {
    const alreadyMemberGroup = joinedGroups.find(g => g.code === (previewData.code || searchQuery.toUpperCase()));
    const isAlreadyMember = !!alreadyMemberGroup;

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card w-full max-w-md p-6 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 flex items-center justify-center border border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.2)] text-4xl">
              {previewData.icon}
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white pt-2">{previewData.name}</h3>
            <p className="text-sm text-[#9CA3AF]">{previewData.description || 'A highly active accountability squad.'}</p>
          </div>
          
          <div className="bg-[#111111] rounded-xl p-4 border border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#8B5CF6]" />
              <span className="text-sm font-semibold text-white">Current Members</span>
            </div>
            <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1 rounded-full text-sm font-bold border border-[#8B5CF6]/30">
              {previewData.memberCount}
            </span>
          </div>

          {joinError && (
            <div className="bg-red-500/10 text-red-500 text-xs font-bold p-3 rounded-lg border border-red-500/20 text-center">
              {joinError}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            {isAlreadyMember ? (
              <>
                <div className="flex items-center justify-center gap-2 text-[#10B981] font-bold text-sm mb-2">
                  <CheckCircle2 className="w-5 h-5" /> You're already a member
                </div>
                <button onClick={() => onOpenGroup(alreadyMemberGroup.id)} className="btn btn-primary w-full py-3 text-sm">
                  Open Group Dashboard
                </button>
              </>
            ) : (
              <button 
                onClick={handleJoin} 
                disabled={isJoining}
                className="btn btn-primary w-full py-3 text-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  <>Join Group <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
            
            <button onClick={() => {
              setPreviewData(null);
              setSearchQuery('');
            }} className="btn btn-secondary w-full py-3 text-sm">
              Back to Discover
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-[#00E5FF]" /> Discover Groups
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
        <input 
          type="text" 
          placeholder="Search by name, tags, or paste an Invite Code..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          className="w-full bg-[#111111] border border-[#222] rounded-2xl pl-12 pr-32 py-4 text-base text-white focus:border-[#00E5FF] outline-none shadow-xl transition-all"
        />
        <button 
          onClick={() => handleSearch(searchQuery)}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary py-2 px-4"
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {joinError && (
        <div className="text-red-500 text-sm text-center py-2">{joinError}</div>
      )}

      {/* Recommended / Results List */}
      <div className="space-y-4">
        <h3 className="font-bold text-[#9CA3AF] text-sm uppercase tracking-wider">
          {searchQuery ? 'Search Results' : 'Trending Public Squads'}
        </h3>
        
        {isSearching && !previewData && searchResults.length === 0 ? (
          <div className="text-center py-10 text-[#9CA3AF]">Loading...</div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {searchResults.map(squad => (
              <div key={squad.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#8B5CF6]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#111111] border border-[#222] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {squad.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{squad.name}</h4>
                    <p className="text-xs text-[#9CA3AF] line-clamp-1">{squad.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider bg-[#8B5CF6]/10 px-2 py-0.5 rounded">Public</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handlePreview(squad.code)}
                  className="btn btn-secondary whitespace-nowrap"
                  disabled={isPreviewLoading}
                >
                  Preview Squad <ArrowRight className="w-4 h-4 ml-1 inline" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 glass-card border border-dashed border-[#333]">
            <p className="text-[#9CA3AF] text-sm">No public squads found matching that criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
