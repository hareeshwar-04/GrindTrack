import React, { useState, useEffect } from 'react';
import { UserProfile, Goal, ActivityFeedItem, GroupMember, Group } from '../types';
import { AIService, AIQuote } from '../services/aiService';
import { calculateXP } from '../services/store';
import confetti from 'canvas-confetti';
import { QuickAddBar } from '../components/QuickAddBar';
import { 
  Flame, Zap, Trophy, Target, CheckCircle2, XCircle, SkipForward, Clock, 
  Sparkles, RefreshCw, ChevronRight, Plus, Calendar, AlertCircle, FileSpreadsheet, Edit3, Trash2, ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  goals: Goal[];
  onUpdateGoalStatus: (goalId: string, status: Goal['status']) => void;
  onToggleSubtask: (goalId: string, subtaskId: string) => void;
  activities: ActivityFeedItem[];
  groups: Group[];
  groupMembers: GroupMember[];
  onOpenNewGoal: () => void;
  onOpenCSVImport?: () => void;
  onNavigateView: (view: string) => void;
  onQuickAddGoal?: (title: string, targetDay: any) => void;
  onDeleteGoal: (goalId: string) => void;
  onRollOverGoal: (goalId: string) => void;
  onEditGoal: (goal: Goal) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  goals,
  onUpdateGoalStatus,
  onToggleSubtask,
  activities,
  groups,
  groupMembers,
  onOpenNewGoal,
  onOpenCSVImport,
  onNavigateView,
  onQuickAddGoal,
  onDeleteGoal,
  onRollOverGoal,
  onEditGoal
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week' | 'month'>('today');
  const [quote, setQuote] = useState<AIQuote>(AIService.getRandomQuote());
  const [selectedSquadId, setSelectedSquadId] = useState<string>('all');

  // Auto-rotate quotes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setQuote(AIService.getRandomQuote()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning, ${user.username}`;
    if (hour < 17) return `Good Afternoon, ${user.username}`;
    if (hour < 22) return `Good Evening, ${user.username}`;
    return `Late Night Grind, ${user.username}`;
  };

  const todayGoals = goals.filter(g => g.targetDay === 'today');
  const tomorrowGoals = goals.filter(g => g.targetDay === 'tomorrow');
  const weekGoals = goals.filter(g => g.targetDay === 'week');
  const monthGoals = goals.filter(g => g.targetDay === 'month');

  const displayedGoals = 
    activeTab === 'today' ? todayGoals :
    activeTab === 'tomorrow' ? tomorrowGoals :
    activeTab === 'week' ? weekGoals : monthGoals;

  const completedToday = todayGoals.filter(g => g.status === 'completed').length;
  const totalToday = todayGoals.length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // XP progress toward next level
  const xpForCurrentLevel = (user.level - 1) * 500;
  const xpForNextLevel = user.level * 500;
  const xpProgress = Math.min(100, Math.round(((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100));
  const xpRemaining = xpForNextLevel - user.xp;

  // Trigger celebration confetti on goal completion
  const handleCompleteGoal = (goalId: string, difficulty: Goal['difficulty']) => {
    onUpdateGoalStatus(goalId, 'completed');
    
    // Check if this completes ALL today goals
    const willAllBeComplete = todayGoals.filter(g => g.id !== goalId).every(g => g.status === 'completed');
    if (willAllBeComplete && todayGoals.length > 0) {
      // Epic confetti burst for clearing the day!
      const duration = 2000;
      const end = Date.now() + duration;
      const colors = ['#00E5FF', '#8B5CF6', '#10B981', '#F59E0B'];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    } else {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRefreshQuote = () => {
    setQuote(AIService.getRandomQuote());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner & Greeting */}
      <div className="glass-card p-8 relative overflow-hidden bg-gradient-to-r from-[#111111] via-[#141414] to-[#111111] border border-[#222]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-primary font-mono text-[10px] px-2.5 py-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-tight">
              {getGreeting()} <span className="inline-block animate-bounce">⚡</span>
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-1 max-w-xl">
              Consistency is your multiplier. Stay accountable with your group, complete today's targets, and set goals every night.
            </p>
          </div>

          {/* Animated Large Progress Ring */}
          <div className="flex items-center gap-6 bg-[#080808]/60 p-4 rounded-2xl border border-[#222] backdrop-blur-md">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#262626"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="url(#gradientRing)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - completionPct / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradientRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display font-extrabold text-xl text-white leading-none">{completionPct}%</span>
                <span className="text-[9px] font-bold text-[#9CA3AF] mt-0.5">DONE</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-[#9CA3AF]">Progress Breakdown</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> {completedToday} / {totalToday} Tasks Done
              </div>
              <button 
                onClick={onOpenNewGoal}
                className="btn btn-primary text-[11px] py-1.5 px-3 mt-1.5 w-full flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak Card */}
        <div className={`glass-card p-4 glass-card-interactive flex items-center gap-4 ${user.currentStreak > 0 ? 'ring-1 ring-[#F59E0B]/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''}`}>
          <div className={`p-3 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] ${user.currentStreak >= 7 ? 'animate-pulse' : ''}`}>
            <Flame className="w-6 h-6 fill-[#F59E0B]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Current Streak</span>
            <div className="font-display font-extrabold text-xl text-white">{user.currentStreak} Days {user.currentStreak >= 7 ? '🔥' : ''}</div>
            <span className="text-[10px] text-[#10B981] font-semibold">Best: {user.longestStreak} Days</span>
          </div>
        </div>

        {/* Level & XP Card */}
        <div className="glass-card p-4 glass-card-interactive flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF]">
            <Zap className="w-6 h-6 fill-[#00E5FF]" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Level & XP</span>
            <div className="font-display font-extrabold text-xl text-white">Lvl {user.level}</div>
            <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
            <span className="text-[10px] text-[#00E5FF] font-semibold">{xpRemaining} XP to Lvl {user.level + 1}</span>
          </div>
        </div>

        {/* Current Rank Card */}
        <div className="glass-card p-4 glass-card-interactive flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Global Tier</span>
            <div className="font-display font-extrabold text-sm text-white truncate max-w-[120px]">{user.rank}</div>
            <span className="text-[10px] text-[#C084FC] font-semibold">Top 5% Performers</span>
          </div>
        </div>

        {/* Consistency Rate Card */}
        <div className="glass-card p-4 glass-card-interactive flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Consistency Rate</span>
            <div className="font-display font-extrabold text-xl text-white">{user.consistencyRate}%</div>
            <span className="text-[10px] text-[#10B981] font-semibold">Success: {user.successRate}%</span>
          </div>
        </div>

      </div>

      {/* Motivational Quote Banner */}
      <div className="p-4 rounded-2xl bg-[#111111] border border-[#222] flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#8B5CF6] tracking-wider mb-0.5">
              Daily AI Wisdom • {quote.category}
            </div>
            <p className="text-xs text-white italic font-medium">"{quote.quote}"</p>
            <span className="text-[10px] text-[#9CA3AF] font-semibold mt-0.5 block">— {quote.author}</span>
          </div>
        </div>
        <button
          onClick={handleRefreshQuote}
          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5"
          title="New Quote"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Goals Board + Side Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goals Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick-Add Task Bar */}
          {onQuickAddGoal && (
            <QuickAddBar
              onAddGoal={onQuickAddGoal}
              onOpenFullModal={onOpenNewGoal}
            />
          )}

          {/* Board Header & Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#111111] border border-[#222] rounded-xl overflow-x-auto max-w-full">
              {[
                { id: 'today', label: `Today (${todayGoals.length})` },
                { id: 'tomorrow', label: `Tomorrow (${tomorrowGoals.length})` },
                { id: 'week', label: `This Week (${weekGoals.length})` },
                { id: 'month', label: `This Month (${monthGoals.length})` }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    activeTab === t.id ? 'bg-[#00E5FF] text-black shadow-md' : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {onOpenCSVImport && (
                <button
                  onClick={onOpenCSVImport}
                  className="text-xs text-[#00E5FF] hover:underline font-bold flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Import CSV
                </button>
              )}
              <button
                onClick={onOpenNewGoal}
                className="text-xs text-white hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4 text-[#00E5FF]" /> Add Goal
              </button>
            </div>
          </div>

          {/* Goals List */}
          <div className="space-y-3">
            {displayedGoals.length === 0 ? (
              <div className="glass-card p-10 text-center space-y-3">
                <Target className="w-12 h-12 text-[#6B7280] mx-auto opacity-50" />
                <h4 className="font-bold text-sm text-white">No goals scheduled for this horizon!</h4>
                <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
                  Stay consistent. Add your commitments manually or import a batch CSV template.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {onOpenCSVImport && (
                    <button onClick={onOpenCSVImport} className="btn btn-secondary text-xs py-2 px-3 border-[#00E5FF]/40 text-[#00E5FF]">
                      Import CSV
                    </button>
                  )}
                  <button onClick={onOpenNewGoal} className="btn btn-primary text-xs py-2 px-4">
                    Create Goal Now
                  </button>
                </div>
              </div>
            ) : (
              displayedGoals.map(g => {
                const xpAmount = calculateXP(g.difficulty);
                const isCompleted = g.status === 'completed';

                return (
                  <div
                    key={g.id}
                    className={`glass-card p-5 rounded-2xl transition-all border-l-4 ${
                      isCompleted ? 'opacity-75 border-l-[#10B981] bg-[#10B981]/5' : 'hover:border-l-[#00E5FF]'
                    }`}
                    style={{ borderLeftColor: isCompleted ? '#10B981' : g.colorLabel }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        {/* Header Badges Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="badge badge-primary text-[10px] px-2.5 py-1 font-bold">{g.category}</span>
                          <span className={`badge text-[10px] px-2.5 py-1 font-bold uppercase ${
                            g.difficulty === 'beast' ? 'badge-danger' : g.difficulty === 'hard' ? 'badge-warning' : g.difficulty === 'medium' ? 'badge-accent' : 'badge-success'
                          }`}>{g.difficulty}</span>
                          <span className="text-xs text-[#9CA3AF] flex items-center gap-1 font-medium ml-1">
                            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> {g.deadline} ({g.estimatedMinutes}m)
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className={`font-bold text-base leading-snug tracking-tight ${isCompleted ? 'line-through text-[#9CA3AF]' : 'text-white'}`}>
                          {g.title}
                        </h4>

                        {/* Description */}
                        {g.description && (
                          <p className="text-xs text-[#9CA3AF] leading-relaxed my-0.5">{g.description}</p>
                        )}

                        {/* Subtasks List */}
                        {g.subtasks.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#222] flex flex-col gap-1.5">
                            {g.subtasks.map(st => (
                              <div
                                key={st.id}
                                onClick={() => onToggleSubtask(g.id, st.id)}
                                className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white cursor-pointer py-0.5"
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                                  st.completed ? 'bg-[#10B981] border-[#10B981] text-black font-bold' : 'border-[#404040]'
                                }`}>
                                  {st.completed && '✓'}
                                </div>
                                <span className={st.completed ? 'line-through opacity-60' : ''}>{st.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-1">
                        {g.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCompleteGoal(g.id, g.difficulty)}
                              className="p-2 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981]/30 border border-[#10B981]/30 text-[#10B981] transition-colors flex items-center gap-1 text-[10px] font-bold"
                              title="Mark Completed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </button>
                            <button
                              onClick={() => onUpdateGoalStatus(g.id, 'failed')}
                              className="p-2 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/30 border border-[#EF4444]/30 text-[#EF4444] transition-colors flex items-center gap-1 text-[10px] font-bold"
                              title="Mark Failed"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Failed
                            </button>
                            <button
                              onClick={() => onUpdateGoalStatus(g.id, 'skipped')}
                              className="p-2 rounded-xl bg-[#F59E0B]/15 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/30 text-[#F59E0B] transition-colors flex items-center gap-1 text-[10px] font-bold"
                              title="Skip Goal"
                            >
                              <SkipForward className="w-3.5 h-3.5" /> Skip
                            </button>
                            
                            {g.targetDay === 'today' && (
                              <button
                                onClick={() => onRollOverGoal(g.id)}
                                className="p-2 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/30 text-[#8B5CF6] transition-colors flex items-center gap-1 text-[10px] font-bold"
                                title="Roll Over to Tomorrow"
                              >
                                <ArrowRight className="w-3.5 h-3.5" /> Roll Over
                              </button>
                            )}
                          </>
                        )}
                        {isCompleted && (
                          <span className="badge badge-success text-[10px] py-1 px-2.5">
                            COMPLETED
                          </span>
                        )}

                        {/* Management Actions */}
                        <div className="flex items-center gap-1 border-l border-[#222] pl-2 ml-1">
                          <button
                            onClick={() => onEditGoal(g)}
                            className="p-2 text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold"
                            title="Edit Goal"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this goal?')) {
                                onDeleteGoal(g.id);
                              }
                            }}
                            className="p-2 text-[#EF4444] hover:text-[#DC2626] transition-colors flex items-center gap-1 text-[10px] font-bold"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Side Column: Group Leaderboard Preview + Activity Feed */}
        <div className="space-y-6">
          
          {/* Global/Squad Leaderboard */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F59E0B]" /> Live Leaderboard
              </h3>
              
              <select 
                value={selectedSquadId} 
                onChange={(e) => setSelectedSquadId(e.target.value)}
                className="bg-[#111111] text-xs text-white border border-[#222] rounded-lg px-2 py-1 outline-none focus:border-[#8B5CF6] transition-colors"
              >
                <option value="all">Global (All Squads)</option>
                {[...groups].sort((a, b) => a.name.localeCompare(b.name)).map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {[...groupMembers]
                .filter(m => selectedSquadId === 'all' || groups.find(g => g.id === selectedSquadId)?.memberIds.includes(m.id))
                .sort((a, b) => b.xp - a.xp)
                .slice(0, 10)
                .map((member, idx) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-[#222]">
                  <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                    idx === 0 ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                    idx === 1 ? 'bg-[#9CA3AF]/20 text-[#9CA3AF]' :
                    idx === 2 ? 'bg-[#D97706]/20 text-[#D97706]' : 'text-[#6B7280]'
                  }`}>
                    #{idx + 1}
                  </div>
                  <img src={member.profilePic} alt={member.username} className="w-8 h-8 rounded-full border border-[#333]" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {member.username} <span>{member.moodEmoji}</span>
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">
                      Lvl {member.level} • {member.totalGoals} Goals
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#8B5CF6]">{member.xp} XP</div>
                    <div className="text-[10px] text-[#10B981]">{member.todayPercentage}% Today</div>
                  </div>
                </div>
              ))}
              
              {groups.length === 0 && selectedSquadId === 'all' && groupMembers.length <= 1 && (
                <div className="text-center p-4 border border-dashed border-[#333] rounded-xl bg-[#111111]/50">
                  <p className="text-xs text-[#9CA3AF]">You are not in any squads yet!</p>
                  <button onClick={() => onNavigateView('groups')} className="btn btn-secondary text-[10px] mt-2 py-1 px-3">Join a Squad</button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed Preview */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" /> Live Activity
              </h3>
              <button
                onClick={() => onNavigateView('activity')}
                className="text-xs text-[#00E5FF] hover:underline font-semibold flex items-center gap-0.5"
              >
                View Feed <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 3).map(act => (
                <div key={act.id} className="p-3 rounded-xl bg-[#171717] border border-[#262626] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <img src={act.userAvatar} alt="" className="w-4 h-4 rounded-full" />
                      {act.userName}
                    </span>
                    <span>{act.timestamp}</span>
                  </div>
                  <p className="text-white text-[11px] leading-tight">{act.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
