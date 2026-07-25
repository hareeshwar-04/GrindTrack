import React, { useState } from 'react';
import { Goal, Category, TaskStatus } from '../types';
import { calculateXP } from '../services/store';
import { 
  CheckSquare, Plus, Search, Filter, Clock, CheckCircle2, XCircle, 
  SkipForward, Calendar, Shield, Sparkles, FileSpreadsheet, Edit3, Trash2, ArrowRight
} from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  onOpenNewGoal: () => void;
  onOpenCSVImport?: () => void;
  onUpdateGoalStatus: (goalId: string, status: TaskStatus) => void;
  onToggleSubtask: (goalId: string, subtaskId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onRollOverGoal: (goalId: string) => void;
  onEditGoal: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onOpenNewGoal,
  onOpenCSVImport,
  onUpdateGoalStatus,
  onToggleSubtask,
  onDeleteGoal,
  onRollOverGoal,
  onEditGoal
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [horizonFilter, setHorizonFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGoals = goals.filter(g => {
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    if (horizonFilter !== 'all' && g.targetDay !== horizonFilter) return false;
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    if (searchQuery.trim() && !g.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const todayCount = goals.filter(g => g.targetDay === 'today').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header & Max 20 Limit Indicator */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display font-extrabold text-2xl text-white">Master Goals Board</h2>
            <span className="badge badge-primary text-[10px]">{todayCount}/20 Today's Limit</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Track, execute, and verify targets across Today, Tomorrow, Week, Month, or Custom horizons.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {onOpenCSVImport && (
            <button
              onClick={onOpenCSVImport}
              className="btn btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF]"
            >
              <FileSpreadsheet className="w-4 h-4" /> Import CSV
            </button>
          )}
          <button onClick={onOpenNewGoal} className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        </div>
      </div>

      {/* Target Horizon Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Horizons' },
          { id: 'today', label: 'Today' },
          { id: 'tomorrow', label: 'Tomorrow 🌙' },
          { id: 'week', label: 'This Week 📅' },
          { id: 'month', label: 'This Month 🗓️' },
          { id: 'custom', label: 'Custom Date ⏱️' }
        ].map(h => (
          <button
            key={h.id}
            onClick={() => setHorizonFilter(h.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              horizonFilter === h.id
                ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-[#141414] text-[#9CA3AF] hover:text-white border border-[#222]'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 w-full md:w-72">
          <Search className="w-4 h-4 text-[#00E5FF]" />
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white text-xs outline-none w-full placeholder-[#6B7280]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'completed', 'failed', 'skipped'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === st 
                  ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                  : 'bg-[#171717] text-[#9CA3AF] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-select text-xs py-2 w-full md:w-40"
        >
          <option value="all">All Categories</option>
          <option value="Work">💼 Work</option>
          <option value="Code">💻 Code</option>
          <option value="Health">🏋️ Health</option>
          <option value="Study">📚 Study</option>
          <option value="Personal">🧘 Personal</option>
          <option value="Finance">💰 Finance</option>
        </select>

      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-[#9CA3AF] text-xs">
            No goals match the selected filters.
          </div>
        ) : (
          filteredGoals.map(g => {
            const isCompleted = g.status === 'completed';

            return (
              <div
                key={g.id}
                className={`glass-card p-5 space-y-3 transition-all border-l-4 ${
                  isCompleted ? 'opacity-75 border-l-[#10B981] bg-[#10B981]/5' : ''
                }`}
                style={{ borderLeftColor: isCompleted ? '#10B981' : g.colorLabel }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="badge badge-primary text-[9px] py-0">{g.category}</span>
                      <span className={`badge text-[9px] py-0 uppercase ${
                        g.difficulty === 'beast' ? 'badge-danger' : g.difficulty === 'hard' ? 'badge-warning' : g.difficulty === 'medium' ? 'badge-accent' : 'badge-success'
                      }`}>{g.difficulty}</span>
                    </div>
                    <h4 className={`font-bold text-sm ${isCompleted ? 'line-through text-[#9CA3AF]' : 'text-white'}`}>
                      {g.title}
                    </h4>
                  </div>

                  <span className={`badge text-[10px] uppercase font-bold py-1 ${
                    g.status === 'completed' ? 'badge-success' : g.status === 'failed' ? 'badge-danger' : g.status === 'skipped' ? 'badge-warning' : 'badge-primary'
                  }`}>
                    {g.status}
                  </span>
                </div>

                {g.description && (
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{g.description}</p>
                )}

                {/* Subtasks */}
                {g.subtasks.length > 0 && (
                  <div className="pt-2 border-t border-[#222] space-y-1.5">
                    {g.subtasks.map(st => (
                      <div
                        key={st.id}
                        onClick={() => onToggleSubtask(g.id, st.id)}
                        className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white cursor-pointer"
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                          st.completed ? 'bg-[#10B981] border-[#10B981] text-black font-bold' : 'border-[#404040]'
                        }`}>
                          {st.completed && '✓'}
                        </div>
                        <span className={st.completed ? 'line-through opacity-60' : ''}>{st.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#222] flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> {g.deadline} ({g.estimatedMinutes}m)
                  </span>

                  {g.status === 'pending' && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => onUpdateGoalStatus(g.id, 'completed')}
                        className="p-1.5 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/30 text-[#10B981] flex items-center gap-1 text-[10px] font-bold"
                        title="Complete"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </button>
                      <button
                        onClick={() => onUpdateGoalStatus(g.id, 'failed')}
                        className="p-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/30 text-[#EF4444] flex items-center gap-1 text-[10px] font-bold"
                        title="Fail"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </button>
                      <button
                        onClick={() => onUpdateGoalStatus(g.id, 'skipped')}
                        className="p-1.5 rounded-lg bg-[#F59E0B]/15 hover:bg-[#F59E0B]/30 text-[#F59E0B] flex items-center gap-1 text-[10px] font-bold"
                        title="Skip"
                      >
                        <SkipForward className="w-3.5 h-3.5" /> Skip
                      </button>

                      {g.targetDay === 'today' && (
                        <button
                          onClick={() => onRollOverGoal(g.id)}
                          className="p-1.5 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] flex items-center gap-1 text-[10px] font-bold"
                          title="Roll Over to Tomorrow"
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> Roll Over
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 border-l border-[#222] pl-2 ml-1">
                    <button
                      onClick={() => onEditGoal(g)}
                      className="p-1.5 text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold"
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
                      className="p-1.5 text-[#EF4444] hover:text-[#DC2626] transition-colors flex items-center gap-1 text-[10px] font-bold"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
