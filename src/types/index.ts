export type Category = 'Work' | 'Health' | 'Study' | 'Code' | 'Personal' | 'Finance';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'beast';
export type TaskStatus = 'pending' | 'completed' | 'failed' | 'skipped';
export type TargetDay = 'today' | 'tomorrow' | 'week' | 'month' | 'custom' | 'history';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: Category;
  deadline: string; // e.g. "22:00"
  estimatedMinutes: number;
  difficulty: Difficulty;
  colorLabel: string;
  tags: string[];
  subtasks: Subtask[];
  recurring: 'none' | 'daily' | 'weekdays';
  status: TaskStatus;
  targetDay: TargetDay;
  targetDate?: string; // YYYY-MM-DD for custom dates
  completedAt?: string;
  actualMinutes?: number;
  earnedXP?: number;
  linkedGroups?: string[];
  createdAt: string;
  userId: string;
  groupId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requiredVal: number;
  userProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePic: string;
  bio: string;
  timezone: string;
  darkTheme: boolean;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  rank: string;
  totalGoals: number;
  completedGoals: number;
  failedGoals: number;
  skippedGoals: number;
  consistencyRate: number;
  successRate: number;
  avgCompletionTimeMins: number;
  mostProductiveHour: string;
  mostProductiveDay: string;
  badgesUnlocked: string[];
  moodEmoji: string;
  onlineStatus: 'online' | 'offline' | 'grinding';
  lastSeen: string;
  heatmapData: Record<string, number>; // ISO Date YYYY-MM-DD -> completion count
}

export interface GroupMember extends UserProfile {
  todayPercentage: number;
  weeklyPercentage: number;
  monthlyPercentage: number;
  currentGoalCount: number;
}

// Per-member data within a group (join date + group-scoped XP)
export interface GroupMemberData {
  joinedAt: string;  // ISO date when this user joined this group
  xp: number;        // XP earned within THIS group only (starts at 0 on join)
}

export interface Group {
  id: string;
  name: string;
  description: string;
  icon: string;
  code: string;
  isPrivate: boolean;
  ownerId: string;
  adminIds: string[];
  memberIds: string[];
  memberData: Record<string, GroupMemberData>; // userId -> { joinedAt, xp }
  createdAt: string;
}

export interface ReactionItem {
  emoji: string;
  count: number;
  users: string[];
}

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'goal_completed' | 'streak_reached' | 'level_up' | 'all_goals_done';
  text: string;
  timestamp: string;
  reactions: ReactionItem[];
  comments: ActivityComment[];
}

export interface SpreadsheetConfig {
  connected: boolean;
  provider: 'google_sheets' | 'airtable' | 'custom_webhook';
  url: string;
  apiKey?: string;
  sheetName?: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'social' | 'system';
  timestamp: string;
  read: boolean;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: 'info' | 'important';
}
