import React, { useState, useEffect } from 'react';
import { UserProfile, Group, GroupMember } from '../../types';
import { DatabaseService } from '../../services/db';
import { MyGroupsView } from './MyGroupsView';
import { DiscoverGroupsView } from './DiscoverGroupsView';
import { GroupDashboardView } from './GroupDashboardView';
import { ArrowLeft } from 'lucide-react';

interface GroupsLayoutProps {
  currentUser: UserProfile;
  initialInviteCode?: string; // Passed if URL had ?join=CODE
}

type GroupViewState = 'my-groups' | 'discover' | 'dashboard';

export const GroupsLayout: React.FC<GroupsLayoutProps> = ({ currentUser, initialInviteCode }) => {
  const [viewState, setViewState] = useState<GroupViewState>('my-groups');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  
  // Data State
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyGroups = async () => {
    setIsLoading(true);
    try {
      const groups = await DatabaseService.getUserSquads(currentUser.id);
      setJoinedGroups(groups);
      
      if (initialInviteCode) {
        const alreadyMember = groups.find(g => g.code === initialInviteCode.toUpperCase());
        if (alreadyMember) {
          // Clear URL parameter so it doesn't trigger on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          handleOpenGroup(alreadyMember.id);
        } else {
          setViewState('discover');
        }
      } else if (groups.length === 0 && viewState === 'my-groups') {
        setViewState('discover');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
  }, [currentUser.id, initialInviteCode]);

  // Routing
  const handleOpenGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    setViewState('dashboard');
  };

  const handleBackToGroups = () => {
    setActiveGroupId(null);
    setViewState('my-groups');
    fetchMyGroups(); // Refresh in case they left a group
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative min-h-screen pb-20">
      
      {viewState !== 'my-groups' && viewState !== 'discover' && (
        <button 
          onClick={handleBackToGroups}
          className="mb-6 flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Groups
        </button>
      )}

      {viewState === 'my-groups' && (
        <MyGroupsView 
          groups={joinedGroups} 
          onOpenGroup={handleOpenGroup}
          onNavigateDiscover={() => setViewState('discover')}
        />
      )}

      {viewState === 'discover' && (
        <DiscoverGroupsView 
          currentUser={currentUser}
          initialInviteCode={initialInviteCode}
          joinedGroups={joinedGroups}
          onBack={() => setViewState('my-groups')}
          onJoinedGroup={(groupId) => {
            fetchMyGroups().then(() => handleOpenGroup(groupId));
          }}
          onOpenGroup={handleOpenGroup}
        />
      )}

      {viewState === 'dashboard' && activeGroupId && (
        <GroupDashboardView 
          groupId={activeGroupId}
          currentUser={currentUser}
          onLeaveGroup={handleBackToGroups}
        />
      )}
    </div>
  );
};
