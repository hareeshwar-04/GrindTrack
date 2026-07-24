import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { MidnightBanner } from './components/MidnightBanner';
import { GoalModal } from './components/GoalModal';
import { CSVImportModal } from './components/CSVImportModal';
import { SearchModal } from './components/SearchModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';

import { DashboardView } from './views/DashboardView';
import { GoalsView } from './views/GoalsView';
import { GroupsView } from './views/GroupsView';
import { ProfileView } from './views/ProfileView';
import { LeaderboardView } from './views/LeaderboardView';
import { ActivityView } from './views/ActivityView';
import { AnalyticsView } from './views/AnalyticsView';
import { CalendarView } from './views/CalendarView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { LandingView } from './views/LandingView';

import { StoreService, calculateXP, MOCK_GROUP_MEMBERS } from './services/store';
import { Goal, UserProfile, Group, ActivityFeedItem, NotificationItem, Badge, SpreadsheetConfig, GroupMember, TaskStatus, SystemAnnouncement, TargetDay } from './types';

export function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('grindtrack_logged_in') === 'true';
  });
  
  // App state loaded from Store Service
  const [user, setUser] = useState<UserProfile>(() => StoreService.getUser());
  const [goals, setGoals] = useState<Goal[]>(() => StoreService.getGoals());
  const [groups, setGroups] = useState<Group[]>(() => StoreService.getGroups());
  const [activities, setActivities] = useState<ActivityFeedItem[]>(() => StoreService.getActivities());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StoreService.getNotifications());
  const [badges, setBadges] = useState<Badge[]>(() => StoreService.getBadges());
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig>(() => StoreService.getSpreadsheetConfig());
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);

  // Group members list
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(MOCK_GROUP_MEMBERS);

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

  // Check URL parameter for ?join=CODE share links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setActiveView('groups');
      const newNotif: NotificationItem = {
        id: 'n_' + Date.now(),
        title: 'Squad Invite Received 🚀',
        message: `Click Join Squad and enter code: ${joinCode.toUpperCase()}`,
        timestamp: 'Just now',
        read: false,
        type: 'system'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  }, []);

  // Save changes to local store
  const handleSaveUser = (updated: Partial<UserProfile>) => {
    const newProfile = { ...user, ...updated };
    setUser(newProfile);
    StoreService.saveUser(newProfile);
  };

  const handleUpdateGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    StoreService.saveGoals(newGoals);
  };

  // Create Goal Handler
  const handleCreateGoal = (partialGoal: Partial<Goal>) => {
    const newGoal: Goal = {
      id: 'g_' + Date.now(),
      title: partialGoal.title || 'New Goal',
      description: partialGoal.description || '',
      category: partialGoal.category || 'Work',
      priority: partialGoal.priority || 'medium',
      deadline: partialGoal.deadline || '21:00',
      estimatedMinutes: partialGoal.estimatedMinutes || 30,
      difficulty: partialGoal.difficulty || 'medium',
      colorLabel: partialGoal.colorLabel || '#00E5FF',
      tags: partialGoal.tags || [],
      subtasks: partialGoal.subtasks || [],
      recurring: partialGoal.recurring || 'none',
      status: 'pending',
      targetDay: partialGoal.targetDay || 'today',
      createdAt: new Date().toISOString(),
      userId: user.id
    };

    const updated = [newGoal, ...goals];
    handleUpdateGoals(updated);

    // Update Activity
    const newAct: ActivityFeedItem = {
      id: 'act_' + Date.now(),
      userId: user.id,
      userName: user.username,
      userAvatar: user.profilePic,
      type: 'goal_completed',
      text: `created a new goal "${newGoal.title}"`,
      timestamp: 'Just now',
      reactions: [],
      comments: []
    };
    setActivities([newAct, ...activities]);
  };

  // Update Goal Status Handler
  const handleUpdateGoalStatus = (goalId: string, status: TaskStatus) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return g;
    });

    handleUpdateGoals(updatedGoals);

    // Handle goal completion under Consistency XP System
    if (status === 'completed') {
      const todayGoals = updatedGoals.filter(g => g.targetDay === 'today');
      const allTodayCompleted = todayGoals.length > 0 && todayGoals.every(g => g.status === 'completed');
      
      // Award Consistency Bonus (+300 XP for 100% daily clear)
      const addedXP = allTodayCompleted ? 300 : 0;
      const newXP = user.xp + addedXP;
      const newLevel = Math.floor(newXP / 500) + 1;
      const newCompletedCount = user.completedGoals + 1;

      const updatedUser: UserProfile = {
        ...user,
        xp: newXP,
        level: newLevel,
        completedGoals: newCompletedCount,
        totalGoals: user.totalGoals + 1
      };
      handleSaveUser(updatedUser);

      // Add to Activity Feed
      const actText = allTodayCompleted 
        ? `completed all daily goals! 🌟 Unlocked +300 Consistency XP Bonus!`
        : `completed "${targetGoal.title}"`;

      const act: ActivityFeedItem = {
        id: 'act_' + Date.now(),
        userId: user.id,
        userName: user.username,
        userAvatar: user.profilePic,
        type: allTodayCompleted ? 'all_goals_done' : 'goal_completed',
        text: actText,
        timestamp: 'Just now',
        reactions: [
          { emoji: '🔥', count: 1, users: ['user_2'] }
        ],
        comments: []
      };
      setActivities([act, ...activities]);
    }
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = (goalId: string, subtaskId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const subtasks = g.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        return { ...g, subtasks };
      }
      return g;
    });
    handleUpdateGoals(updatedGoals);
  };

  // Midnight Rollover Simulator Trigger
  const handleTriggerRollover = () => {
    const updatedGoals = StoreService.triggerMidnightRollover();
    setGoals(updatedGoals);
  };

  // Social Reactions
  const handleAddReaction = (activityId: string, emoji: string) => {
    const updated = activities.map(act => {
      if (act.id === activityId) {
        const existing = act.reactions.find(r => r.emoji === emoji);
        let reactions = [...act.reactions];
        if (existing) {
          reactions = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
        } else {
          reactions.push({ emoji, count: 1, users: [user.id] });
        }
        return { ...act, reactions };
      }
      return act;
    });
    setActivities(updated);
    StoreService.saveActivities(updated);
  };

  // Social Comment Add
  const handleAddComment = (activityId: string, text: string) => {
    const updated = activities.map(act => {
      if (act.id === activityId) {
        const comments = [
          ...act.comments,
          {
            id: 'c_' + Date.now(),
            userId: user.id,
            userName: user.username,
            userAvatar: user.profilePic,
            text,
            timestamp: 'Just now'
          }
        ];
        return { ...act, comments };
      }
      return act;
    });
    setActivities(updated);
    StoreService.saveActivities(updated);
  };

  // Bulk CSV Import Goals Handler
  const handleImportCSVGoals = (newGoals: Goal[]) => {
    const updated = [...newGoals, ...goals];
    handleUpdateGoals(updated);

    const newAct: ActivityFeedItem = {
      id: 'act_' + Date.now(),
      userId: user.id,
      userName: user.username,
      userAvatar: user.profilePic,
      type: 'goal_completed',
      text: `bulk imported ${newGoals.length} targets via CSV Engine 📊`,
      timestamp: 'Just now',
      reactions: [],
      comments: []
    };
    setActivities([newAct, ...activities]);
  };

  // Quick-Add Goal Handler (1-Second Creation)
  const handleQuickAddGoal = (title: string, targetDay: TargetDay) => {
    handleCreateGoal({
      title,
      targetDay,
      category: 'Work',
      priority: 'medium',
      difficulty: 'medium',
      deadline: '21:00',
      estimatedMinutes: 30,
      colorLabel: '#00E5FF',
      tags: ['QuickAdd'],
      subtasks: [],
      recurring: 'none',
      status: 'pending'
    });
  };

  const handleLoginSuccess = (email: string, username: string) => {
    localStorage.setItem('grindtrack_logged_in', 'true');
    setIsAuthenticated(true);
    handleSaveUser({ email, username });
  };

  const handleSignOut = () => {
    localStorage.removeItem('grindtrack_logged_in');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LandingView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F9FAFB] font-main selection:bg-[#00E5FF]/30 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        notifications={notifications}
        onOpenNewGoal={() => setIsGoalModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Application Container */}
      <main className="app-container">
        
        {/* Timezone Midnight Rollover Banner */}
        <MidnightBanner
          timezone={user.timezone}
          onTriggerRollover={handleTriggerRollover}
        />

        {/* View Switcher Router */}
        {activeView === 'dashboard' && (
          <DashboardView
            user={user}
            goals={goals}
            onUpdateGoalStatus={handleUpdateGoalStatus}
            onToggleSubtask={handleToggleSubtask}
            activities={activities}
            groupMembers={groupMembers}
            onOpenNewGoal={() => setIsGoalModalOpen(true)}
            onOpenCSVImport={() => setIsCSVModalOpen(true)}
            onNavigateView={setActiveView}
            onQuickAddGoal={handleQuickAddGoal}
          />
        )}

        {activeView === 'goals' && (
          <GoalsView
            goals={goals}
            onOpenNewGoal={() => setIsGoalModalOpen(true)}
            onOpenCSVImport={() => setIsCSVModalOpen(true)}
            onUpdateGoalStatus={handleUpdateGoalStatus}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {activeView === 'groups' && (
          <GroupsView
            groups={groups}
            members={groupMembers}
            currentUser={user}
            onSelectMemberProfile={(m) => setSelectedMember(m)}
            onCreateGroup={(name, desc, isPrivate) => {
              const newGrp: Group = {
                id: 'grp_' + Date.now(),
                name,
                description: desc,
                icon: '⚡',
                code: 'TITAN-' + Math.floor(1000 + Math.random() * 9000),
                isPrivate,
                ownerId: user.id,
                adminIds: [user.id],
                memberIds: [user.id],
                createdAt: new Date().toISOString()
              };
              setGroups([...groups, newGrp]);
            }}
            onJoinGroup={(code) => {
              const matched = groups.find(g => g.code === code);
              if (matched) {
                alert(`Joined squad "${matched.name}" successfully!`);
              } else {
                alert('Invalid Invite Code!');
              }
            }}
          />
        )}

        {activeView === 'profile' && (
          <ProfileView user={user} badges={badges} />
        )}

        {activeView === 'leaderboard' && (
          <LeaderboardView
            members={groupMembers}
            onSelectMember={(m) => setSelectedMember(m)}
          />
        )}

        {activeView === 'activity' && (
          <ActivityView
            activities={activities}
            currentUser={user}
            onAddReaction={handleAddReaction}
            onAddComment={handleAddComment}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView user={user} goals={goals} />
        )}

        {activeView === 'calendar' && (
          <CalendarView goals={goals} />
        )}

        {activeView === 'settings' && (
          <SettingsView
            user={user}
            onUpdateUser={handleSaveUser}
            spreadsheetConfig={spreadsheetConfig}
            onUpdateSpreadsheetConfig={(config) => {
              setSpreadsheetConfig(config);
              StoreService.saveSpreadsheetConfig(config);
            }}
          />
        )}

        {activeView === 'admin' && (
          <AdminView
            members={groupMembers}
            groups={groups}
            announcements={announcements}
            onPublishAnnouncement={(title, content) => {
              setAnnouncements([
                { id: 'ann_' + Date.now(), title, content, createdAt: new Date().toISOString(), priority: 'important' },
                ...announcements
              ]);
            }}
          />
        )}

      </main>

      {/* Mobile Bottom Sticky Navigation */}
      <MobileNav activeView={activeView} setActiveView={setActiveView} />

      {/* Global Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleCreateGoal}
        existingCount={goals.filter(g => g.targetDay === 'today').length}
      />

      <CSVImportModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImportGoals={handleImportCSVGoals}
        currentUserId={user.id}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        goals={goals}
        members={groupMembers}
        activities={activities}
        onSelectResult={(view) => setActiveView(view)}
      />

      <ProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(email, username) => {
          handleSaveUser({ email, username });
        }}
      />

    </div>
  );
}

export default App;
