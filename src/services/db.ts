import { supabase } from './supabase';
import { Goal, UserProfile, Group, ActivityFeedItem, GroupMember } from '../types';

export class DatabaseService {
  // ─── PROFILES ──────────────────────────────────────────────
  static async getProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) return null;
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      profilePic: data.profile_pic,
      bio: data.bio,
      timezone: data.timezone,
      darkTheme: data.dark_theme,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      xp: data.xp,
      level: data.level,
      rank: data.rank,
      totalGoals: data.total_goals,
      completedGoals: data.completed_goals,
      failedGoals: data.failed_goals,
      skippedGoals: data.skipped_goals,
      consistencyRate: data.consistency_rate,
      successRate: data.success_rate,
      avgCompletionTimeMins: data.avg_completion_time_mins,
      mostProductiveHour: data.most_productive_hour,
      mostProductiveDay: data.most_productive_day,
      badgesUnlocked: data.badges_unlocked || [],
      moodEmoji: data.mood_emoji,
      onlineStatus: data.online_status,
      lastSeen: data.last_seen,
      heatmapData: data.heatmap_data || {}
    };
  }

  static async createProfile(userId: string, email: string, username: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    
    // Attempt to insert
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email,
      username,
      profile_pic: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
    });
    
    // Ignore 23505 (unique violation) in case the trigger beat us to it
    if (error && error.code !== '23505') {
      console.error('Failed to create profile fallback:', error);
      return null;
    }
    
    return this.getProfile(userId);
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    if (!supabase) return;
    
    // Convert camelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.rank !== undefined) dbUpdates.rank = updates.rank;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.moodEmoji !== undefined) dbUpdates.mood_emoji = updates.moodEmoji;

    await supabase.from('profiles').update(dbUpdates).eq('id', userId);
  }

  // ─── GOALS ────────────────────────────────────────────────
  static async getGoals(userId: string): Promise<Goal[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      category: g.category,
      deadline: g.deadline,
      estimatedMinutes: g.estimated_minutes,
      difficulty: g.difficulty,
      colorLabel: g.color_label,
      tags: g.tags || [],
      subtasks: g.subtasks || [],
      recurring: g.recurring,
      status: g.status,
      targetDay: g.target_day,
      targetDate: g.target_date,
      completedAt: g.completed_at,
      createdAt: g.created_at,
      userId: g.user_id,
      groupId: g.squad_id
    }));
  }

  static async createGoal(userId: string, goal: Omit<Goal, 'id' | 'createdAt' | 'userId'>) {
    if (!supabase) return null;
    const dbGoal = {
      user_id: userId,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      deadline: goal.deadline,
      estimated_minutes: goal.estimatedMinutes,
      difficulty: goal.difficulty,
      color_label: goal.colorLabel,
      tags: goal.tags,
      subtasks: goal.subtasks,
      recurring: goal.recurring,
      status: goal.status,
      target_day: goal.targetDay,
      target_date: goal.targetDate
    };
    const { data, error } = await supabase.from('goals').insert(dbGoal).select().single();
    if (error) throw error;
    return data;
  }

  static async updateGoalStatus(goalId: string, status: string, completedAt?: string) {
    if (!supabase) return;
    await supabase.from('goals').update({ status, completed_at: completedAt }).eq('id', goalId);
  }

  static async deleteGoal(goalId: string) {
    if (!supabase) return;
    await supabase.from('goals').delete().eq('id', goalId);
  }

  // ─── SQUADS (GROUPS) ──────────────────────────────────────
  static async getUserSquads(userId: string): Promise<Group[]> {
    if (!supabase) return [];
    
    // Get all squad_ids the user is in
    const { data: memberData, error: memErr } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId);
    if (memErr || !memberData || memberData.length === 0) return [];
    
    const squadIds = memberData.map(m => m.squad_id);
    
    // Fetch those squads
    const { data: squads, error: sqErr } = await supabase.from('squads').select('*').in('id', squadIds);
    if (sqErr || !squads) return [];

    // Map to frontend Group interface
    return squads.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      code: s.code,
      isPrivate: s.is_private,
      ownerId: s.owner_id,
      adminIds: [s.owner_id], // Simplified for now
      memberIds: [], // Will populate in UI or via separate query
      memberData: {},
      createdAt: s.created_at
    }));
  }

  static async createSquad(userId: string, name: string, description: string, isPrivate: boolean) {
    if (!supabase) return null;
    const code = 'SQUAD-' + Math.floor(1000 + Math.random() * 9000);
    
    const { data: squad, error } = await supabase.from('squads').insert({
      name, description, is_private: isPrivate, code, owner_id: userId
    }).select().single();
    
    if (error || !squad) throw error;
    
    // Auto-join the creator to the squad
    await supabase.from('squad_members').insert({
      squad_id: squad.id,
      user_id: userId,
      role: 'admin'
    });

    return squad;
  }

  static async joinSquadWithCode(userId: string, code: string) {
    if (!supabase) return null;
    const { data: squad, error } = await supabase.from('squads').select('id, name').eq('code', code).single();
    
    if (error || !squad) throw new Error('Invalid Code');
    
    const { error: joinErr } = await supabase.from('squad_members').insert({
      squad_id: squad.id,
      user_id: userId,
      role: 'member'
    });
    
    if (joinErr) {
      if (joinErr.code === '23505') throw new Error('You are already in this squad!');
      throw joinErr;
    }
    
    return squad;
  }
}
