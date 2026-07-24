import { Goal, UserProfile, Group, ActivityFeedItem, Badge, SpreadsheetConfig, NotificationItem, SystemAnnouncement, GroupMember, Difficulty } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

// Initial Mock Seed User
export const INITIAL_USER: UserProfile = {
  id: 'user_1',
  username: 'Hareesh',
  email: 'hareesh@grindtrack.io',
  profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Fullstack Dev & Systems Architect. Building every day. Zero excuses.',
  timezone: 'Asia/Kolkata (GMT+5:30)',
  darkTheme: true,
  currentStreak: 14,
  longestStreak: 28,
  xp: 3450,
  level: 7,
  rank: 'Diamond Grinder',
  totalGoals: 142,
  completedGoals: 128,
  failedGoals: 9,
  skippedGoals: 5,
  consistencyRate: 94.5,
  successRate: 90.1,
  avgCompletionTimeMins: 42,
  mostProductiveHour: '09:00 AM - 11:00 AM',
  mostProductiveDay: 'Tuesday',
  badgesUnlocked: ['b1', 'b3', 'b5', 'b7', 'b8', 'b9'],
  moodEmoji: '🔥',
  onlineStatus: 'grinding',
  lastSeen: 'Just now',
  heatmapData: generateInitialHeatmap()
};

function generateInitialHeatmap(): Record<string, number> {
  const map: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isoKey = d.toISOString().split('T')[0];
    // Random realistic activity frequency (80% non-zero)
    const val = Math.random() > 0.2 ? Math.floor(Math.random() * 5) + 1 : 0;
    map[isoKey] = val;
  }
  return map;
}

export const INITIAL_BADGES: Badge[] = [
  { id: 'b1', name: 'Early Bird', description: 'Complete a task before 7:00 AM', icon: '🌅', category: 'Time', requiredVal: 1, userProgress: 1, isUnlocked: true, unlockedAt: '2026-07-10' },
  { id: 'b2', name: 'Night Owl', description: 'Set goals past 11:00 PM for 5 consecutive days', icon: '🦉', category: 'Time', requiredVal: 5, userProgress: 3, isUnlocked: false },
  { id: 'b3', name: '100 Goals', description: 'Successfully finish 100 goals', icon: '💯', category: 'Volume', requiredVal: 100, userProgress: 128, isUnlocked: true, unlockedAt: '2026-07-18' },
  { id: 'b4', name: '1000 Goals', description: 'Reach 1,000 completed goals legend status', icon: '👑', category: 'Volume', requiredVal: 1000, userProgress: 128, isUnlocked: false },
  { id: 'b5', name: 'Never Missed Monday', description: 'Complete 100% goals on 4 Mondays in a row', icon: '⚡', category: 'Consistency', requiredVal: 4, userProgress: 4, isUnlocked: true, unlockedAt: '2026-07-20' },
  { id: 'b6', name: 'Weekend Warrior', description: 'Grind through 10 full weekend days', icon: '⚔️', category: 'Consistency', requiredVal: 10, userProgress: 7, isUnlocked: false },
  { id: 'b7', name: 'Coding Beast', description: 'Complete 30 Code category tasks', icon: '💻', category: 'Skill', requiredVal: 30, userProgress: 30, isUnlocked: true, unlockedAt: '2026-07-15' },
  { id: 'b8', name: 'Consistency King', description: 'Maintain a 14-day goal streak', icon: '🏆', category: 'Streak', requiredVal: 14, userProgress: 14, isUnlocked: true, unlockedAt: '2026-07-24' },
  { id: 'b9', name: 'Perfect Week', description: '100% goal completion for 7 consecutive days', icon: '🌟', category: 'Streak', requiredVal: 7, userProgress: 7, isUnlocked: true, unlockedAt: '2026-07-21' },
  { id: 'b10', name: 'Perfect Month', description: '100% goal completion for 30 consecutive days', icon: '💎', category: 'Streak', requiredVal: 30, userProgress: 14, isUnlocked: false }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Review SystemVerilog RTL Architecture',
    description: 'Optimize timing paths and check testbench coverage report for final release',
    category: 'Code',
    priority: 'urgent',
    deadline: '18:00',
    estimatedMinutes: 60,
    difficulty: 'hard',
    colorLabel: '#00E5FF',
    tags: ['VLSI', 'Verilog', 'Work'],
    subtasks: [
      { id: 'st1', title: 'Run lint check with zero warnings', completed: true },
      { id: 'st2', title: 'Verify synthesized gate-level simulation', completed: true },
      { id: 'st3', title: 'Generate code coverage report html', completed: false }
    ],
    recurring: 'daily',
    status: 'pending',
    targetDay: 'today',
    createdAt: new Date().toISOString(),
    userId: 'user_1'
  },
  {
    id: 'g2',
    title: 'Morning 5K Gym Run & Hydration',
    description: 'Target sub-25 min pace and 3L total water intake',
    category: 'Health',
    priority: 'high',
    deadline: '08:30',
    estimatedMinutes: 45,
    difficulty: 'medium',
    colorLabel: '#10B981',
    tags: ['Fitness', 'Cardio'],
    subtasks: [
      { id: 'st4', title: 'Warm-up dynamic stretches', completed: true },
      { id: 'st5', title: '5K run complete', completed: true }
    ],
    recurring: 'daily',
    status: 'completed',
    targetDay: 'today',
    completedAt: '2026-07-24T08:22:00Z',
    createdAt: new Date().toISOString(),
    userId: 'user_1'
  },
  {
    id: 'g3',
    title: 'Deploy GrindTrack Production Build to Vercel',
    description: 'Verify PWA manifest, service worker offline fallback & webhooks',
    category: 'Work',
    priority: 'high',
    deadline: '21:00',
    estimatedMinutes: 30,
    difficulty: 'beast',
    colorLabel: '#8B5CF6',
    tags: ['SaaS', 'Deploy', 'Vite'],
    subtasks: [
      { id: 'st6', title: 'Configure environment secret keys', completed: true },
      { id: 'st7', title: 'Audit Lighthouse score >= 95', completed: false }
    ],
    recurring: 'none',
    status: 'pending',
    targetDay: 'today',
    createdAt: new Date().toISOString(),
    userId: 'user_1'
  },
  {
    id: 'g4',
    title: 'Read 20 Pages of Atomic Habits',
    description: 'Chapter on identity-based habit loops and social accountability design',
    category: 'Personal',
    priority: 'low',
    deadline: '23:00',
    estimatedMinutes: 25,
    difficulty: 'easy',
    colorLabel: '#F59E0B',
    tags: ['Reading', 'Mindset'],
    subtasks: [],
    recurring: 'daily',
    status: 'pending',
    targetDay: 'tomorrow',
    createdAt: new Date().toISOString(),
    userId: 'user_1'
  },
  {
    id: 'g5',
    title: 'Setup Google Sheets API Webhook Sync',
    description: 'Hook spreadsheet rows directly to task list auto-import engine',
    category: 'Code',
    priority: 'high',
    deadline: '11:00',
    estimatedMinutes: 40,
    difficulty: 'hard',
    colorLabel: '#00E5FF',
    tags: ['Integration', 'API'],
    subtasks: [
      { id: 'st8', title: 'Format CSV column headers', completed: false },
      { id: 'st9', title: 'Test auto-pull on page load', completed: false }
    ],
    recurring: 'none',
    status: 'pending',
    targetDay: 'tomorrow',
    createdAt: new Date().toISOString(),
    userId: 'user_1'
  }
];

export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  {
    ...INITIAL_USER,
    todayPercentage: 66,
    weeklyPercentage: 92,
    monthlyPercentage: 95,
    currentGoalCount: 3,
  },
  {
    id: 'user_2',
    username: 'Rahul Verma',
    email: 'rahul@dev.io',
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Backend Specialist | Rust & Go Enthusiast',
    timezone: 'Asia/Kolkata',
    darkTheme: true,
    currentStreak: 15,
    longestStreak: 21,
    xp: 4120,
    level: 8,
    rank: 'Master Grinder',
    totalGoals: 160,
    completedGoals: 151,
    failedGoals: 6,
    skippedGoals: 3,
    consistencyRate: 96.0,
    successRate: 94.3,
    avgCompletionTimeMins: 38,
    mostProductiveHour: '08:00 AM - 10:00 AM',
    mostProductiveDay: 'Monday',
    badgesUnlocked: ['b1', 'b3', 'b5', 'b8', 'b9'],
    moodEmoji: '💪',
    onlineStatus: 'online',
    lastSeen: 'Active 2m ago',
    heatmapData: {},
    todayPercentage: 100,
    weeklyPercentage: 96,
    monthlyPercentage: 94,
    currentGoalCount: 4
  },
  {
    id: 'user_3',
    username: 'Akash Sharma',
    email: 'akash@code.org',
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Competitive Programmer & Gym Freak',
    timezone: 'Asia/Kolkata',
    darkTheme: true,
    currentStreak: 10,
    longestStreak: 19,
    xp: 2980,
    level: 6,
    rank: 'Platinum Grinder',
    totalGoals: 110,
    completedGoals: 98,
    failedGoals: 8,
    skippedGoals: 4,
    consistencyRate: 89.0,
    successRate: 89.0,
    avgCompletionTimeMins: 50,
    mostProductiveHour: '02:00 PM - 05:00 PM',
    mostProductiveDay: 'Wednesday',
    badgesUnlocked: ['b1', 'b3', 'b7'],
    moodEmoji: '⚡',
    onlineStatus: 'grinding',
    lastSeen: 'Just now',
    heatmapData: {},
    todayPercentage: 75,
    weeklyPercentage: 88,
    monthlyPercentage: 90,
    currentGoalCount: 4
  },
  {
    id: 'user_4',
    username: 'Priya Nair',
    email: 'priya@ux.design',
    profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Product Designer | UI/UX & Motion Crafter',
    timezone: 'Asia/Kolkata',
    darkTheme: true,
    currentStreak: 12,
    longestStreak: 16,
    xp: 3100,
    level: 6,
    rank: 'Platinum Grinder',
    totalGoals: 125,
    completedGoals: 112,
    failedGoals: 9,
    skippedGoals: 4,
    consistencyRate: 91.2,
    successRate: 89.6,
    avgCompletionTimeMins: 45,
    mostProductiveHour: '10:00 AM - 01:00 PM',
    mostProductiveDay: 'Thursday',
    badgesUnlocked: ['b1', 'b3', 'b9'],
    moodEmoji: '🎯',
    onlineStatus: 'offline',
    lastSeen: '1h ago',
    heatmapData: {},
    todayPercentage: 50,
    weeklyPercentage: 85,
    monthlyPercentage: 88,
    currentGoalCount: 4
  }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp_1',
    name: 'Alpha Grind Syndicate',
    description: 'Daily high-performance goal crushing group for devs, engineers & creators.',
    icon: '⚡',
    code: 'ALPHA-9921',
    isPrivate: true,
    ownerId: 'user_1',
    adminIds: ['user_1', 'user_2'],
    memberIds: ['user_1', 'user_2', 'user_3', 'user_4'],
    createdAt: '2026-06-01'
  },
  {
    id: 'grp_2',
    name: '5 AM Club & Fitness',
    description: 'Early morning cardio, gym sessions, and habit tracking squad.',
    icon: '🌅',
    code: 'FIT-5501',
    isPrivate: false,
    ownerId: 'user_3',
    adminIds: ['user_3'],
    memberIds: ['user_1', 'user_3'],
    createdAt: '2026-06-15'
  }
];

export const INITIAL_ACTIVITIES: ActivityFeedItem[] = [
  {
    id: 'act_1',
    userId: 'user_1',
    userName: 'Hareesh',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    type: 'goal_completed',
    text: 'completed "Morning 5K Gym Run & Hydration"',
    timestamp: '15 minutes ago',
    reactions: [
      { emoji: '🔥', count: 4, users: ['user_2', 'user_3', 'user_4'] },
      { emoji: '💪', count: 2, users: ['user_2', 'user_3'] }
    ],
    comments: [
      {
        id: 'c1',
        userId: 'user_2',
        userName: 'Rahul Verma',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        text: 'Insane pace man! Sub 25 min is tough! 🔥',
        timestamp: '10m ago'
      }
    ]
  },
  {
    id: 'act_2',
    userId: 'user_2',
    userName: 'Rahul Verma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    type: 'streak_reached',
    text: 'reached a 15-day streak milestone! 🏆',
    timestamp: '1 hour ago',
    reactions: [
      { emoji: '👏', count: 5, users: ['user_1', 'user_3', 'user_4'] },
      { emoji: '⭐', count: 3, users: ['user_1', 'user_4'] }
    ],
    comments: []
  },
  {
    id: 'act_3',
    userId: 'user_3',
    userName: 'Akash Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    type: 'all_goals_done',
    text: 'completed 100% of today\'s 4 goals!',
    timestamp: '3 hours ago',
    reactions: [
      { emoji: '🔥', count: 3, users: ['user_1', 'user_2'] }
    ],
    comments: []
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Nightly Goal Reminder', message: 'Time to set your goals for tomorrow! (10:00 PM)', type: 'reminder', timestamp: '10:00 PM', read: false },
  { id: 'n2', title: 'Streak Milestone Unlocked!', message: 'You unlocked the "Consistency King" 14-day badge!', type: 'achievement', timestamp: '2 hours ago', read: false },
  { id: 'n3', title: 'Rahul Verma reacted', message: 'Rahul reacted 🔥 to your Morning 5K Gym Run', type: 'social', timestamp: '15m ago', read: true }
];

export const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann_1',
    title: 'GrindTrack v2.4 Release: Spreadsheet Sync Engine!',
    content: 'You can now link Google Sheets, Airtable, or JSON REST endpoints directly under Settings -> Database Sync.',
    createdAt: '2026-07-24',
    priority: 'important'
  }
];

export const INITIAL_SPREADSHEET_CONFIG: SpreadsheetConfig = {
  connected: false,
  provider: 'google_sheets',
  url: '',
  autoSync: true,
  lastSyncedAt: undefined
};

// Consistency-based XP Calculator
// XP is awarded based on consistency (Streaks + 100% Daily Clear Bonuses)
export function calculateConsistencyXP(streakDays: number, isAllTodayDone: boolean): number {
  let xp = 100 + (streakDays * 25);
  if (isAllTodayDone) {
    xp += 300;
  }
  return xp;
}

// Deprecated per-task XP calculator (Returns 0 since XP is consistency-based)
export function calculateXP(_difficulty: Difficulty): number {
  return 0;
}

// Local Storage Helper
const STORAGE_KEYS = {
  USER: 'grindtrack_user_v1',
  GOALS: 'grindtrack_goals_v1',
  GROUPS: 'grindtrack_groups_v1',
  ACTIVITIES: 'grindtrack_activities_v1',
  NOTIFICATIONS: 'grindtrack_notifications_v1',
  BADGES: 'grindtrack_badges_v1',
  SPREADSHEET: 'grindtrack_spreadsheet_v1'
};

export class StoreService {
  static getUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : INITIAL_USER;
  }

  static saveUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getGoals(): Goal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? JSON.parse(raw) : INITIAL_GOALS;
  }

  static saveGoals(goals: Goal[]) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  static getGroups(): Group[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return raw ? JSON.parse(raw) : INITIAL_GROUPS;
  }

  static saveGroups(groups: Group[]) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }

  static getActivities(): ActivityFeedItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : INITIAL_ACTIVITIES;
  }

  static saveActivities(activities: ActivityFeedItem[]) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }

  static getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  }

  static saveNotifications(notifs: NotificationItem[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  static getBadges(): Badge[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    return raw ? JSON.parse(raw) : INITIAL_BADGES;
  }

  static saveBadges(badges: Badge[]) {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  }

  static getSpreadsheetConfig(): SpreadsheetConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SPREADSHEET);
    return raw ? JSON.parse(raw) : INITIAL_SPREADSHEET_CONFIG;
  }

  static saveSpreadsheetConfig(config: SpreadsheetConfig) {
    localStorage.setItem(STORAGE_KEYS.SPREADSHEET, JSON.stringify(config));
  }

  // Automatic Midnight Rollover Simulator Function
  static triggerMidnightRollover() {
    const goals = this.getGoals();
    const updated = goals.map(g => {
      if (g.targetDay === 'tomorrow') {
        return { ...g, targetDay: 'today' as const };
      }
      if (g.targetDay === 'today' && g.status === 'pending') {
        return { ...g, status: 'failed' as const, targetDay: 'history' as const };
      }
      return g;
    });
    this.saveGoals(updated);
    
    // Add Notification
    const notifs = this.getNotifications();
    notifs.unshift({
      id: 'n_midnight_' + Date.now(),
      title: 'Midnight Rollover Triggered!',
      message: 'Tomorrow\'s goals have automatically become Today\'s tasks. Time to grind!',
      type: 'system',
      timestamp: 'Just now',
      read: false
    });
    this.saveNotifications(notifs);

    return updated;
  }

  // Export to CSV/Excel
  static exportGoalsToExcel(goals: Goal[]) {
    const data = goals.map(g => ({
      Title: g.title,
      Category: g.category,
      Priority: g.priority,
      Difficulty: g.difficulty,
      Status: g.status,
      TargetDay: g.targetDay,
      Deadline: g.deadline,
      EstMins: g.estimatedMinutes,
      CompletedAt: g.completedAt || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GrindTrack Goals');
    XLSX.writeFile(wb, `GrindTrack_Goals_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // Export PDF Printable Report
  static exportPDFReport(user: UserProfile, goals: Goal[]) {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('GrindTrack - Daily Performance Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`User: ${user.username} | Streak: ${user.currentStreak} Days | Level: ${user.level}`, 14, 28);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 34);

    doc.setFontSize(14);
    doc.text('Today Goals Summary:', 14, 45);

    let y = 55;
    goals.forEach((g, idx) => {
      doc.setFontSize(10);
      doc.text(`${idx + 1}. [${g.status.toUpperCase()}] ${g.title} (${g.category} - ${g.priority.toUpperCase()})`, 14, y);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`GrindTrack_Report_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Generate Sample CSV Template content
  static generateSampleCSV(): string {
    return [
      'Title,Category,Priority,TargetHorizon,TargetDate,Deadline,EstMins,Description,Subtasks',
      '"Review SystemVerilog RTL Architecture",Code,urgent,today,,18:00,60,"Check testbench coverage report","Run lint check | Verify synthesized gate simulation | Generate HTML report"',
      '"Morning 5K Gym Run",Health,high,today,,08:30,45,"Target sub-25 min pace","Warm-up stretches | 5K run complete"',
      '"Prepare Weekly Sprint Roadmap",Work,high,week,,17:00,120,"Outline architecture milestones","Draft sprint tasks | Review with team"',
      '"Monthly Portfolio Audit & Rebalance",Finance,medium,month,,20:00,90,"Review asset allocation","Export monthly statement | Rebalance ETF weightings"',
      '"Quarterly System Architecture Refactor",Code,high,custom,2026-08-15,19:00,180,"Deep refactor of state sync engine","Audit memory leaks | Run performance benchmark"'
    ].join('\n');
  }

  // Parse CSV text into goal preview items
  static parseCSVGoals(csvText: string, currentUserId: string): Partial<Goal>[] {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    const parsedGoals: Partial<Goal>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex CSV line splitter that respects quoted strings
      const rowMatches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
      if (!rowMatches) continue;

      const row = rowMatches.map(cell => {
        let val = cell.replace(/^,/, '').trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        return val;
      });

      const getCol = (name: string) => {
        const idx = headers.findIndex(h => h.includes(name));
        return idx !== -1 ? row[idx] || '' : '';
      };

      const title = getCol('title') || `Imported Task #${i}`;
      const category = (getCol('category') || 'Work') as any;
      const priority = (getCol('priority').toLowerCase() || 'medium') as any;
      const rawHorizon = getCol('horizon') || getCol('target') || 'today';
      const targetDay: any = ['today', 'tomorrow', 'week', 'month', 'custom'].includes(rawHorizon.toLowerCase())
        ? rawHorizon.toLowerCase()
        : 'today';
      const targetDate = getCol('date') || '';
      const deadline = getCol('deadline') || '21:00';
      const estMins = parseInt(getCol('est') || getCol('min') || '30', 10) || 30;
      const description = getCol('description') || '';
      const subtasksRaw = getCol('subtask') || '';

      const subtasks = subtasksRaw
        ? subtasksRaw.split('|').map((s, stIdx) => ({
            id: `st_${Date.now()}_${i}_${stIdx}`,
            title: s.trim(),
            completed: false
          })).filter(st => st.title.length > 0)
        : [];

      parsedGoals.push({
        id: `g_csv_${Date.now()}_${i}`,
        title,
        description,
        category: ['Work', 'Health', 'Study', 'Code', 'Personal', 'Finance'].includes(category) ? category : 'Work',
        priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
        deadline,
        estimatedMinutes: estMins,
        difficulty: 'medium',
        colorLabel: '#00E5FF',
        tags: ['CSV Import'],
        subtasks,
        recurring: 'none',
        status: 'pending',
        targetDay,
        targetDate: targetDate || undefined,
        createdAt: new Date().toISOString(),
        userId: currentUserId
      });
    }

    return parsedGoals;
  }
}
