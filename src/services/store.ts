import { Goal, UserProfile, Group, ActivityFeedItem, Badge, SpreadsheetConfig, NotificationItem, SystemAnnouncement, GroupMember, Difficulty } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

// Initial Blank User
export const INITIAL_USER: UserProfile = {
  id: 'user_1',
  username: 'Grinder',
  email: 'demo@grindtrack.app',
  profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=Grinder',
  bio: 'Building consistent habits daily on GrindTrack.',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  darkTheme: true,
  currentStreak: 0,
  longestStreak: 0,
  xp: 0,
  level: 1,
  rank: 'Novice Grinder',
  totalGoals: 0,
  completedGoals: 0,
  failedGoals: 0,
  skippedGoals: 0,
  consistencyRate: 0,
  successRate: 0,
  avgCompletionTimeMins: 0,
  mostProductiveHour: 'Not enough data',
  mostProductiveDay: 'Not enough data',
  badgesUnlocked: [],
  moodEmoji: '⚡',
  onlineStatus: 'online',
  lastSeen: 'Just now',
  heatmapData: {}
};



// Fresh badges template — all locked with 0 progress for new users
export const FRESH_BADGES: Badge[] = [
  { id: 'b1', name: 'Early Bird', description: 'Complete a task before 7:00 AM', icon: '🌅', category: 'Time', requiredVal: 1, userProgress: 0, isUnlocked: false },
  { id: 'b2', name: 'Night Owl', description: 'Set goals past 11:00 PM for 5 consecutive days', icon: '🦉', category: 'Time', requiredVal: 5, userProgress: 0, isUnlocked: false },
  { id: 'b3', name: '100 Goals', description: 'Successfully finish 100 goals', icon: '💯', category: 'Volume', requiredVal: 100, userProgress: 0, isUnlocked: false },
  { id: 'b4', name: '1000 Goals', description: 'Reach 1,000 completed goals legend status', icon: '👑', category: 'Volume', requiredVal: 1000, userProgress: 0, isUnlocked: false },
  { id: 'b5', name: 'Never Missed Monday', description: 'Complete 100% goals on 4 Mondays in a row', icon: '⚡', category: 'Consistency', requiredVal: 4, userProgress: 0, isUnlocked: false },
  { id: 'b6', name: 'Weekend Warrior', description: 'Grind through 10 full weekend days', icon: '⚔️', category: 'Consistency', requiredVal: 10, userProgress: 0, isUnlocked: false },
  { id: 'b7', name: 'Coding Beast', description: 'Complete 30 Code category tasks', icon: '💻', category: 'Skill', requiredVal: 30, userProgress: 0, isUnlocked: false },
  { id: 'b8', name: 'Consistency King', description: 'Maintain a 14-day goal streak', icon: '🏆', category: 'Streak', requiredVal: 14, userProgress: 0, isUnlocked: false },
  { id: 'b9', name: 'Perfect Week', description: '100% goal completion for 7 consecutive days', icon: '🌟', category: 'Streak', requiredVal: 7, userProgress: 0, isUnlocked: false },
  { id: 'b10', name: 'Perfect Month', description: '100% goal completion for 30 consecutive days', icon: '💎', category: 'Streak', requiredVal: 30, userProgress: 0, isUnlocked: false }
];

// Legacy mock badges for demo reference (not used for new accounts)
export const INITIAL_BADGES = FRESH_BADGES;

export const INITIAL_GOALS: Goal[] = [];

export const MOCK_GROUP_MEMBERS: GroupMember[] = [];
export const INITIAL_GROUPS: Group[] = [];

export const INITIAL_ACTIVITIES: ActivityFeedItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [];

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

// Per-task XP calculator based on difficulty
export function calculateXP(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 10;
    case 'medium': return 25;
    case 'hard': return 50;
    case 'beast': return 100;
    default: return 25;
  }
}

// Local Storage Helper with User Isolation
export class StoreService {
  private static getKey(email: string | undefined, type: string): string {
    const activeEmail = email || localStorage.getItem('grindtrack_active_email') || 'demo';
    const cleanEmail = activeEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `grindtrack_${cleanEmail}_${type}_v2`;
  }

  static getUser(email?: string): UserProfile {
    const activeEmail = email || localStorage.getItem('grindtrack_active_email');
    if (!activeEmail || activeEmail === 'demo@grindtrack.app') {
      return INITIAL_USER;
    }

    const key = this.getKey(activeEmail, 'user');
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    // Create fresh user profile for a newly signed up user
    const username = activeEmail.split('@')[0] || 'Grinder';
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      username: username,
      email: activeEmail,
      profilePic: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      bio: 'Building consistent habits daily on GrindTrack.',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      darkTheme: true,
      currentStreak: 0,
      longestStreak: 0,
      xp: 0,
      level: 1,
      rank: 'Novice Grinder',
      totalGoals: 0,
      completedGoals: 0,
      failedGoals: 0,
      skippedGoals: 0,
      consistencyRate: 100,
      successRate: 100,
      avgCompletionTimeMins: 30,
      mostProductiveHour: '09:00 AM - 11:00 AM',
      mostProductiveDay: 'Monday',
      badgesUnlocked: [],
      moodEmoji: '⚡',
      onlineStatus: 'online',
      lastSeen: 'Just now',
      heatmapData: {}
    };
    this.saveUser(newUser);
    return newUser;
  }

  static saveUser(user: UserProfile) {
    if (user.email) {
      localStorage.setItem('grindtrack_active_email', user.email);
      const key = this.getKey(user.email, 'user');
      localStorage.setItem(key, JSON.stringify(user));
    }
  }

  static getGoals(email?: string): Goal[] {
    const key = this.getKey(email, 'goals');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  static saveGoals(goals: Goal[], email?: string) {
    const key = this.getKey(email, 'goals');
    localStorage.setItem(key, JSON.stringify(goals));
  }

  static getGroups(email?: string): Group[] {
    const key = this.getKey(email, 'groups');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  static saveGroups(groups: Group[], email?: string) {
    const key = this.getKey(email, 'groups');
    localStorage.setItem(key, JSON.stringify(groups));
  }

  static getActivities(email?: string): ActivityFeedItem[] {
    const key = this.getKey(email, 'activities');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  static saveActivities(activities: ActivityFeedItem[], email?: string) {
    const key = this.getKey(email, 'activities');
    localStorage.setItem(key, JSON.stringify(activities));
  }

  static getNotifications(email?: string): NotificationItem[] {
    const key = this.getKey(email, 'notifications');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  static saveNotifications(notifs: NotificationItem[], email?: string) {
    const key = this.getKey(email, 'notifications');
    localStorage.setItem(key, JSON.stringify(notifs));
  }

  static getBadges(email?: string): Badge[] {
    const key = this.getKey(email, 'badges');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : FRESH_BADGES;
  }

  static saveBadges(badges: Badge[], email?: string) {
    const key = this.getKey(email, 'badges');
    localStorage.setItem(key, JSON.stringify(badges));
  }

  static getSpreadsheetConfig(email?: string): SpreadsheetConfig {
    const key = this.getKey(email, 'spreadsheet');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : INITIAL_SPREADSHEET_CONFIG;
  }

  static saveSpreadsheetConfig(config: SpreadsheetConfig, email?: string) {
    const key = this.getKey(email, 'spreadsheet');
    localStorage.setItem(key, JSON.stringify(config));
  }

  // Automatic Midnight Rollover Simulator Function
  static triggerMidnightRollover() {
    const goals = this.getGoals();
    const updated = goals.map(g => {
      if (g.targetDay === 'tomorrow') {
        return { ...g, targetDay: 'today' as const };
      }
      if (g.targetDay === 'today') {
        if (g.status === 'pending') {
          return { ...g, status: 'failed' as const, targetDay: 'history' as const };
        }
        return { ...g, targetDay: 'history' as const };
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
      doc.text(`${idx + 1}. [${g.status.toUpperCase()}] ${g.title} (${g.category})`, 14, y);
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
      'Title,Category,TargetHorizon,TargetDate,Deadline,EstMins,Description,Subtasks',
      '"Review SystemVerilog RTL Architecture",Code,today,,18:00,60,"Check testbench coverage report","Run lint check | Verify synthesized gate simulation | Generate HTML report"',
      '"Morning 5K Gym Run",Health,today,,08:30,45,"Target sub-25 min pace","Warm-up stretches | 5K run complete"',
      '"Prepare Weekly Sprint Roadmap",Work,week,,17:00,120,"Outline architecture milestones","Draft sprint tasks | Review with team"',
      '"Monthly Portfolio Audit & Rebalance",Finance,month,,20:00,90,"Review asset allocation","Export monthly statement | Rebalance ETF weightings"',
      '"Quarterly System Architecture Refactor",Code,custom,2026-08-15,19:00,180,"Deep refactor of state sync engine","Audit memory leaks | Run performance benchmark"'
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
      const difficulty = (getCol('difficulty').toLowerCase() || 'medium') as any;
      const category = (getCol('category') || 'Work') as any;
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
        difficulty: ['easy', 'medium', 'hard', 'beast'].includes(difficulty) ? difficulty : 'medium',
        deadline,
        estimatedMinutes: estMins,
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
