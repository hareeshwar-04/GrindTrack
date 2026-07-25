import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { MidnightBanner } from './components/MidnightBanner';
import { GoalModal } from './components/GoalModal';
import { CSVImportModal } from './components/CSVImportModal';
import { SearchModal } from './components/SearchModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';

import { DashboardView } from './views/DashboardView';
import { MissionControlView } from './views/goals/MissionControlView';
import { GroupsLayout } from './views/groups/GroupsLayout';
import { ProfileView } from './views/ProfileView';
import { LeaderboardView } from './views/LeaderboardView';
import { ActivityView } from './views/ActivityView';
import { ToastContainer, ToastProps } from './components/Toast';

// Lazy load heavy views
const AnalyticsView = React.lazy(() => import('./views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const CalendarView = React.lazy(() => import('./views/CalendarView').then(m => ({ default: m.CalendarView })));
const SettingsView = React.lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const AdminView = React.lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));
import { LandingView } from './views/LandingView';

import { DatabaseService } from './services/db';
import { StoreService, calculateXP } from './services/store';
import { supabase } from './services/supabase';
import { Goal, UserProfile, Group, ActivityFeedItem, NotificationItem, Badge, SpreadsheetConfig, GroupMember, TaskStatus, SystemAnnouncement, TargetDay } from './types';
import { Zap, LogOut } from 'lucide-react';

// Empty defaults for a brand new user (no mock data)
const EMPTY_USER: UserProfile = {
  id: '', username: '', email: '', profilePic: '', bio: '',
  timezone: '', darkTheme: true, currentStreak: 0, longestStreak: 0,
  xp: 0, level: 1, rank: 'Novice Grinder', totalGoals: 0, completedGoals: 0,
  failedGoals: 0, skippedGoals: 0, consistencyRate: 100, successRate: 100,
  avgCompletionTimeMins: 0, mostProductiveHour: '', mostProductiveDay: '',
  badgesUnlocked: [], moodEmoji: '⚡', onlineStatus: 'online',
  lastSeen: 'Just now', heatmapData: {}
};

export function App() {
  // Auth state: null = checking, false = not logged in, true = logged in
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'verified' | 'authenticated'>('loading');
  const [verifyReason, setVerifyReason] = useState<'signin' | 'signup' | 'session'>('signin');
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Toast state
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    setToasts(prev => [...prev, { id: 't_' + Date.now(), message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSetActiveView = (view: string) => {
    if (view !== activeView) {
      setViewHistory(prev => [...prev, view]);
      setActiveView(view);
    }
  };

  const handleGoBack = () => {
    setViewHistory(prev => {
      if (prev.length <= 1) return prev;
      const newHistory = [...prev];
      newHistory.pop();
      setActiveView(newHistory[newHistory.length - 1]);
      return newHistory;
    });
  };
  // App state - starts empty, loaded after auth
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig>({ connected: false, provider: 'google_sheets', url: '', autoSync: true });
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);

  // Group members list — derived from the current user (real data, not mocks)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Core function: Load all data from real Supabase Backend
  const loadUserData = useCallback(async (userId: string, email: string, username?: string, reason?: 'signin' | 'signup' | 'session') => {
    localStorage.setItem('grindtrack_active_email', email);

    // 1. Fetch Profile
    let loadedUser = await DatabaseService.getProfile(userId);
    
    // If the profile doesn't exist yet (e.g. race condition with trigger, or old auth user after a schema wipe)
    if (!loadedUser) {
      console.warn('Profile not found, attempting to create one via fallback...');
      loadedUser = await DatabaseService.createProfile(userId, email, username || email.split('@')[0]);
      
      if (!loadedUser) {
        // Ultimate fallback if create fails
        showToast('Error loading or creating profile from database.', 'error');
        setAuthState('unauthenticated');
        return;
      }
    }

    // If a username was passed (from Supabase metadata), update it
    if (username && loadedUser.username !== username) {
      loadedUser.username = username;
      await DatabaseService.updateProfile(userId, { username });
    }

    setUser(loadedUser);
    
    // 2. Fetch Goals & Squads asynchronously
    const [fetchedGoals, fetchedGroups] = await Promise.all([
      DatabaseService.getGoals(userId),
      DatabaseService.getUserSquads(userId)
    ]);
    
    setGoals(fetchedGoals);
    setGroups(fetchedGroups);
    
    // 3. Fallback for things not yet migrated to Supabase (Activities, Notifications, Badges)
    setActivities(StoreService.getActivities(email));
    setNotifications(StoreService.getNotifications(email));
    setBadges(StoreService.getBadges(email));
    setSpreadsheetConfig(StoreService.getSpreadsheetConfig(email));
    
    // Build the user's own leaderboard entry from their real stats
    const todayGoals = fetchedGoals.filter(g => g.targetDay === 'today');
    const completedToday = todayGoals.filter(g => g.status === 'completed').length;
    const todayPct = todayGoals.length > 0 ? Math.round((completedToday / todayGoals.length) * 100) : 0;
    
    const userAsMember = {
      ...loadedUser,
      todayPercentage: todayPct,
      weeklyPercentage: loadedUser.consistencyRate,
      monthlyPercentage: loadedUser.successRate,
      currentGoalCount: todayGoals.length
    };
    
    // Fetch real members for all squads
    let allMembers: GroupMember[] = [userAsMember];
    for (const group of fetchedGroups) {
      const mems = await DatabaseService.getSquadMembers(group.id);
      // Filter out ourselves so we don't duplicate (we use userAsMember for our own live data)
      const others = mems.filter(m => m.id !== userId);
      // Very basic deduplication (in case a member is in multiple squads)
      others.forEach(o => {
        if (!allMembers.find(existing => existing.id === o.id)) {
          allMembers.push(o);
        }
      });
    }
    
    setGroupMembers(allMembers);
    
    // Auto-join logic
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    
    if (joinCode) {
      handleSetActiveView('groups');
    } else {
      handleSetActiveView('dashboard');
    }
    
    setVerifyReason(reason || 'signin');
    setAuthState(prev => prev === 'authenticated' ? 'authenticated' : 'verified');
  }, []);

  // Listen for Supabase auth state (single source of truth)
  useEffect(() => {
    if (!supabase) {
      // No Supabase configured — go straight to landing
      setAuthState('unauthenticated');
      return;
    }

    let mounted = true;

    // 1. Check existing session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user?.email && session?.user?.id) {
        const email = session.user.email;
        const userId = session.user.id;
        const username = session.user.user_metadata?.username || email.split('@')[0];
        loadUserData(userId, email, username, 'session');
      } else {
        setAuthState('unauthenticated');
      }
    });

    // 2. Listen for auth state changes (sign in, sign out, magic link redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user?.email && session?.user?.id) {
        const email = session.user.email;
        const userId = session.user.id;
        const username = session.user.user_metadata?.username || email.split('@')[0];
        // Detect if this is a fresh email verification (user confirmed their email)
        const isEmailVerify = session.user.email_confirmed_at && 
          (Date.now() - new Date(session.user.email_confirmed_at).getTime()) < 60000;
        loadUserData(userId, email, username, isEmailVerify ? 'signup' : 'signin');
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('grindtrack_active_email');
        setUser(EMPTY_USER);
        setGoals([]);
        setGroups([]);
        setActivities([]);
        setNotifications([]);
        setBadges([]);
        setAuthState('unauthenticated');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  // Check URL parameter for ?join=CODE share links
  useEffect(() => {
    if (authState !== 'authenticated') return;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      handleSetActiveView('groups');
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
  }, [authState]);

  // Auto-transition from 'verified' splash to 'authenticated' after 2.5 seconds
  useEffect(() => {
    if (authState !== 'verified') return;
    const timer = setTimeout(() => setAuthState('authenticated'), 2500);
    return () => clearTimeout(timer);
  }, [authState]);

  // Keyboard shortcut: Ctrl+K / ⌘K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Handlers ─────────────────────────────────────────
  const handleSaveUser = async (updated: Partial<UserProfile>) => {
    const newProfile = { ...user, ...updated };
    setUser(newProfile);
    await DatabaseService.updateProfile(user.id, updated);
  };

  const handleUpdateGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    // Note: We don't have a batch save in DatabaseService for simplicity.
    // Realtime updates would usually handle single-goal mutations via specific functions.
    // For now, we update local state immediately. The specific update functions (status change) will trigger DB calls separately.
  };

  const handleCreateGoal = async (partialGoal: Partial<Goal>) => {
    try {
      const dbGoal = await DatabaseService.createGoal(user.id, partialGoal as Omit<Goal, 'id' | 'createdAt' | 'userId'>);
      if (dbGoal) {
        // Construct the full goal object as expected by frontend
        const newGoal: Goal = {
          id: dbGoal.id,
          title: dbGoal.title,
          description: dbGoal.description || '',
          category: dbGoal.category as any,
          deadline: dbGoal.deadline,
          estimatedMinutes: dbGoal.estimated_minutes,
          difficulty: dbGoal.difficulty as any,
          colorLabel: dbGoal.color_label,
          tags: dbGoal.tags || [],
          subtasks: dbGoal.subtasks || [],
          recurring: dbGoal.recurring as any,
          status: dbGoal.status as any,
          targetDay: dbGoal.target_day as any,
          targetDate: dbGoal.target_date,
          completedAt: dbGoal.completed_at,
          createdAt: dbGoal.created_at,
          userId: dbGoal.user_id,
          groupId: dbGoal.squad_id
        };
        setGoals(prev => [newGoal, ...prev]);
        showToast('Goal created successfully!', 'success');
        
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
        const updatedActs = [newAct, ...activities];
        setActivities(updatedActs);
        StoreService.saveActivities(updatedActs, user.email);

        // Update total goals stat
        handleSaveUser({ totalGoals: user.totalGoals + 1 });
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to create goal', 'error');
      return;
    }
  };

  const handleUpdateGoalStatus = (goalId: string, status: TaskStatus) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined };
      }
      return g;
    });
    handleUpdateGoals(updatedGoals);

    if (status === 'completed' && targetGoal.status !== 'completed') {
      const todayGoals = updatedGoals.filter(g => g.targetDay === 'today');
      const allTodayCompleted = todayGoals.length > 0 && todayGoals.every(g => g.status === 'completed');

      // Per-task XP + all-clear bonus
      const taskXP = calculateXP(targetGoal.difficulty);
      const bonusXP = allTodayCompleted ? 300 : 0;
      const totalXP = taskXP + bonusXP;
      const newXP = user.xp + totalXP;
      const newLevel = Math.floor(newXP / 500) + 1;
      const newCompletedGoals = user.completedGoals + 1;

      // Streak logic: increment when all today's goals are done
      let newStreak = user.currentStreak;
      let newLongestStreak = user.longestStreak;
      if (allTodayCompleted) {
        newStreak = user.currentStreak + 1;
        newLongestStreak = Math.max(newStreak, user.longestStreak);
      }

      // Update heatmap for today
      const todayKey = new Date().toISOString().split('T')[0];
      const newHeatmap = { ...user.heatmapData };
      newHeatmap[todayKey] = (newHeatmap[todayKey] || 0) + 1;

      // Success rate
      const newTotalGoals = user.totalGoals;
      const newSuccessRate = newTotalGoals > 0 ? Math.round((newCompletedGoals / newTotalGoals) * 1000) / 10 : 100;

      // Rank progression
      let newRank = user.rank;
      if (newLevel >= 20) newRank = 'Legendary Grinder';
      else if (newLevel >= 15) newRank = 'Diamond Grinder';
      else if (newLevel >= 10) newRank = 'Master Grinder';
      else if (newLevel >= 7) newRank = 'Platinum Grinder';
      else if (newLevel >= 4) newRank = 'Gold Grinder';
      else if (newLevel >= 2) newRank = 'Silver Grinder';

      handleSaveUser({
        xp: newXP,
        level: newLevel,
        rank: newRank,
        completedGoals: newCompletedGoals,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        successRate: newSuccessRate,
        heatmapData: newHeatmap
      });

      // Badge progression
      const updatedBadges = badges.map(b => {
        let progress = b.userProgress;
        let unlocked = b.isUnlocked;

        // Volume badges
        if (b.id === 'b3') progress = newCompletedGoals; // 100 Goals
        if (b.id === 'b4') progress = newCompletedGoals; // 1000 Goals

        // Streak badges
        if (b.id === 'b8') progress = newStreak; // 14-day streak
        if (b.id === 'b9' && allTodayCompleted) progress = progress + 1; // Perfect Week
        if (b.id === 'b10' && allTodayCompleted) progress = progress + 1; // Perfect Month

        // Category badges
        if (b.id === 'b7' && targetGoal.category === 'Code') progress = progress + 1; // Coding Beast (30 Code tasks)

        // Time-based badges
        const currentHour = new Date().getHours();
        if (b.id === 'b1' && currentHour < 7) progress = progress + 1; // Early Bird

        // Check unlock
        if (!unlocked && progress >= b.requiredVal) {
          unlocked = true;
        }

        return { ...b, userProgress: progress, isUnlocked: unlocked, unlockedAt: unlocked && !b.isUnlocked ? new Date().toISOString() : b.unlockedAt };
      });
      setBadges(updatedBadges);
      StoreService.saveBadges(updatedBadges, user.email);

      // Update per-group XP
      if (totalXP > 0 && groups.length > 0) {
        const updatedGroups = groups.map(g => {
          if (g.memberIds.includes(user.id) && g.memberData?.[user.id]) {
            return {
              ...g,
              memberData: {
                ...g.memberData,
                [user.id]: {
                  ...g.memberData[user.id],
                  xp: (g.memberData[user.id]?.xp || 0) + totalXP
                }
              }
            };
          }
          return g;
        });
        setGroups(updatedGroups);
        DatabaseService.addSquadXP(user.id, totalXP).catch(console.error);
      }

      const actText = allTodayCompleted
        ? `completed all daily goals! 🌟 +${totalXP} XP (includes +300 Consistency Bonus!)`
        : `completed "${targetGoal.title}" (+${taskXP} XP)`;

      const act: ActivityFeedItem = {
        id: 'act_' + Date.now(),
        userId: user.id, userName: user.username, userAvatar: user.profilePic,
        type: allTodayCompleted ? 'all_goals_done' : 'goal_completed',
        text: actText, timestamp: 'Just now',
        reactions: [{ emoji: '🔥', count: 1, users: ['system'] }],
        comments: []
      };
      const updatedActs = [act, ...activities];
      setActivities(updatedActs);
      StoreService.saveActivities(updatedActs, user.email);
    } else if (status === 'pending' && targetGoal.status === 'completed') {
      // DEDUCT XP if they un-complete a goal to prevent infinite XP exploit
      const taskXP = calculateXP(targetGoal.difficulty);
      const newXP = Math.max(0, user.xp - taskXP);
      const newLevel = Math.floor(newXP / 500) + 1;
      const newCompletedGoals = Math.max(0, user.completedGoals - 1);
      const newSuccessRate = user.totalGoals > 0 ? Math.round((newCompletedGoals / user.totalGoals) * 1000) / 10 : 100;
      
      // We do not revert the 300 daily bonus to keep it simple, but we do deduct task XP.
      // We also don't revert the heatmap/streaks to avoid complicated rollbacks.
      
      handleSaveUser({
        xp: newXP,
        level: newLevel,
        completedGoals: newCompletedGoals,
        successRate: newSuccessRate
      });
      
      // Update per-group XP
      if (taskXP > 0 && groups.length > 0) {
        const updatedGroups = groups.map(g => {
          if (g.memberIds.includes(user.id) && g.memberData?.[user.id]) {
            return {
              ...g,
              memberData: {
                ...g.memberData,
                [user.id]: {
                  ...g.memberData[user.id],
                  xp: Math.max(0, (g.memberData[user.id]?.xp || 0) - taskXP)
                }
              }
            };
          }
          return g;
        });
        setGroups(updatedGroups);
        StoreService.saveGroups(updatedGroups, user.email);
      }
    }
  };

  const handleToggleSubtask = (goalId: string, subtaskId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, subtasks: g.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st) };
      }
      return g;
    });
    handleUpdateGoals(updatedGoals);
  };

  const handleEditGoal = (updatedGoal: Goal) => {
    const updatedGoals = goals.map(g => (g.id === updatedGoal.id ? updatedGoal : g));
    handleUpdateGoals(updatedGoals);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    handleUpdateGoals(updatedGoals);
    
    // Decrement total goals stat
    handleSaveUser({ totalGoals: Math.max(0, user.totalGoals - 1) });
  };

  const handleRollOverGoal = (goalId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, targetDay: 'tomorrow' as TargetDay };
      }
      return g;
    });
    handleUpdateGoals(updatedGoals);
  };

  const handleTriggerRollover = () => {
    const updatedGoals = StoreService.triggerMidnightRollover();
    setGoals(updatedGoals);
  };

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
    StoreService.saveActivities(updated, user.email);
  };

  const handleAddComment = (activityId: string, text: string) => {
    const updated = activities.map(act => {
      if (act.id === activityId) {
        const comments = [...act.comments, {
          id: 'c_' + Date.now(), userId: user.id, userName: user.username,
          userAvatar: user.profilePic, text, timestamp: 'Just now'
        }];
        return { ...act, comments };
      }
      return act;
    });
    setActivities(updated);
    StoreService.saveActivities(updated, user.email);
  };

  const handleImportCSVGoals = (newGoals: Goal[]) => {
    const updated = [...newGoals, ...goals];
    handleUpdateGoals(updated);
    const newAct: ActivityFeedItem = {
      id: 'act_' + Date.now(), userId: user.id, userName: user.username,
      userAvatar: user.profilePic, type: 'goal_completed',
      text: `bulk imported ${newGoals.length} targets via CSV Engine 📊`,
      timestamp: 'Just now', reactions: [], comments: []
    };
    const updatedActs = [newAct, ...activities];
    setActivities(updatedActs);
    StoreService.saveActivities(updatedActs, user.email);
  };

  const handleQuickAddGoal = (title: string, targetDay: TargetDay) => {
    handleCreateGoal({
      title, targetDay, category: 'Work', difficulty: 'medium',
      deadline: '21:00', estimatedMinutes: 30, colorLabel: '#00E5FF',
      tags: ['QuickAdd'], subtasks: [], recurring: 'none', status: 'pending'
    });
  };

  const handleSignOut = () => {
    setIsSignOutModalOpen(true);
  };

  const confirmSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('grindtrack_active_email');
    setUser(EMPTY_USER);
    setGoals([]);
    setGroups([]);
    setActivities([]);
    setNotifications([]);
    setBadges([]);
    setAuthState('unauthenticated');
    setIsSignOutModalOpen(false);
  };

  // ─── Render ──────────────────────────────────────────

  // Loading screen while checking Supabase session
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] p-0.5 shadow-[0_0_30px_rgba(0,229,255,0.4)] animate-pulse">
          <div className="w-full h-full bg-[#080808] rounded-[14px] flex items-center justify-center">
            <Zap className="w-7 h-7 text-[#00E5FF] fill-[#00E5FF]" />
          </div>
        </div>
        <p className="text-sm text-slate-400 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  // Verified splash screen — shown briefly after successful login
  if (authState === 'verified') {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-6 overflow-hidden">
        {/* Animated glow ring */}
        <div className="relative">
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#10B981] blur-2xl opacity-40 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#10B981] p-1 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" className="animate-[draw_0.6s_ease-out_0.3s_both]" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'draw 0.6s ease-out 0.3s forwards' }} />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2 animate-fade-in">
          <h2 className="font-display font-extrabold text-2xl text-white">
            {verifyReason === 'signup' 
              ? 'Email Verified Successfully! 🎉' 
              : verifyReason === 'session' 
                ? 'Session Restored!' 
                : 'Signed In Successfully!'}
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            {verifyReason === 'signup' 
              ? <span>Your account is all set, <span className="text-[#10B981] font-bold">{user.username || 'Grinder'}</span>! Let's start grinding.</span>
              : verifyReason === 'session'
                ? <span>Welcome back, <span className="text-[#00E5FF] font-bold">{user.username || 'Grinder'}</span>. Picking up where you left off...</span>
                : <span>Welcome back, <span className="text-[#00E5FF] font-bold">{user.username || 'Grinder'}</span>. Loading your dashboard...</span>}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-[#00E5FF] to-[#10B981] rounded-full"
            style={{ animation: 'progressFill 2.2s ease-in-out forwards' }}
          />
        </div>

        {/* Inline keyframes */}
        <style>{`
          @keyframes draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes progressFill {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated — show landing page
  if (authState === 'unauthenticated') {
    return <LandingView onLoginSuccess={(email, username, reason) => loadUserData(email, username, reason)} />;
  }

  // Authenticated — show main app
  return (
    <div className="min-h-screen bg-[#080808] text-[#F9FAFB] font-main selection:bg-[#00E5FF]/30 selection:text-white">

      <Navbar
        user={user}
        activeView={activeView}
        setActiveView={handleSetActiveView}
        canGoBack={viewHistory.length > 1}
        onGoBack={handleGoBack}
        notifications={notifications}
        onOpenNewGoal={() => setIsGoalModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="app-container">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
        <MidnightBanner
          timezone={user.timezone}
          onTriggerRollover={handleTriggerRollover}
        />

        {activeView === 'dashboard' && (
          <DashboardView
            user={user}
            goals={goals}
            onUpdateGoalStatus={handleUpdateGoalStatus}
            onToggleSubtask={handleToggleSubtask}
            onDeleteGoal={handleDeleteGoal}
            onRollOverGoal={handleRollOverGoal}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setIsGoalModalOpen(true);
            }}
            activities={activities}
            groups={groups}
            groupMembers={groupMembers}
            onOpenNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onOpenCSVImport={() => setIsCSVModalOpen(true)}
            onNavigateView={handleSetActiveView}
            onQuickAddGoal={handleQuickAddGoal}
          />
        )}

        {activeView === 'goals' && (
          <MissionControlView
            user={user}
            goals={goals}
            groups={groups}
            onOpenNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onUpdateGoalStatus={handleUpdateGoalStatus}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeView === 'groups' && (
          <GroupsLayout
            currentUser={user}
            initialInviteCode={new URLSearchParams(window.location.search).get('join') || undefined}
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
              StoreService.saveSpreadsheetConfig(config, user.email);
            }}
            onSignOut={handleSignOut}
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

        </React.Suspense>
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      <MobileNav activeView={activeView} setActiveView={handleSetActiveView} />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={(goalData) => {
          if (editingGoal) {
            handleEditGoal({ ...editingGoal, ...goalData });
          } else {
            handleCreateGoal(goalData);
          }
        }}
        existingCount={goals.filter(g => g.targetDay === 'today').length}
        initialData={editingGoal}
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
        onSelectResult={(view) => handleSetActiveView(view)}
      />

      <ProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(email, username) => {
          loadUserData(email, username);
        }}
      />

      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EF4444]/10 flex items-center justify-center border border-[#EF4444]/20">
              <LogOut className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Sign Out?</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Are you sure you want to sign out of your account? You will need to log back in to access your dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setIsSignOutModalOpen(false)}
                className="flex-1 btn btn-secondary text-xs py-2.5"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSignOut}
                className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
