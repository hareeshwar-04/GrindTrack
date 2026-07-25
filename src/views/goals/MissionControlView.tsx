import React, { useState } from 'react';
import { Goal, TaskStatus, UserProfile, Group } from '../../types';
import { TodaySummaryCards } from './TodaySummaryCards';
import { ViewTabs } from './ViewTabs';
import { CompactFilterBar } from './CompactFilterBar';
import { GamifiedTaskCard } from './GamifiedTaskCard';
import { Plus, CheckSquare } from 'lucide-react';

interface MissionControlViewProps {
  user: UserProfile;
  goals: Goal[];
  groups: Group[];
  onOpenNewGoal: () => void;
  onUpdateGoalStatus: (goalId: string, status: TaskStatus) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  user, goals, groups, onOpenNewGoal, onUpdateGoalStatus, onEditGoal, onDeleteGoal
}) => {
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('priority');

  // Filter Logic
  const filteredGoals = goals.filter(g => {
    if (activeTab === 'completed' && g.status !== 'completed') return false;
    if (activeTab !== 'completed' && activeTab !== 'later' && g.targetDay !== activeTab && g.status !== 'completed') return false;
    if (activeTab !== 'completed' && g.status === 'completed') return false; // Hide completed from active tabs

    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!g.title.toLowerCase().includes(q) && !(g.description || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort Logic
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    if (sortOption === 'xp-high') {
      const xpA = a.difficulty === 'beast' ? 100 : a.difficulty === 'hard' ? 50 : 25;
      const xpB = b.difficulty === 'beast' ? 100 : b.difficulty === 'hard' ? 50 : 25;
      return xpB - xpA;
    }
    if (sortOption === 'priority') {
      const pA = a.difficulty === 'beast' ? 4 : a.difficulty === 'hard' ? 3 : a.difficulty === 'medium' ? 2 : 1;
      const pB = b.difficulty === 'beast' ? 4 : b.difficulty === 'hard' ? 3 : b.difficulty === 'medium' ? 2 : 1;
      return pB - pA;
    }
    // newest (fallback)
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in pb-24 relative min-h-screen">
      
      {/* 1. Header (Minimal) */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-white">Mission Control</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">Execute tasks to generate XP for yourself and your squads.</p>
      </div>

      {/* 2. Today Summary */}
      <TodaySummaryCards goals={goals} user={user} />

      {/* 3. Views & Filters */}
      <div className="sticky top-0 z-20 bg-[#080808]/90 backdrop-blur-md pt-2 pb-4 border-b border-[#222]">
        <ViewTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-4">
          <CompactFilterBar 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            sortOption={sortOption} setSortOption={setSortOption}
          />
        </div>
      </div>

      {/* 4. Task List */}
      {sortedGoals.length > 0 ? (
        <div className="space-y-3">
          {sortedGoals.map(goal => (
            <GamifiedTaskCard 
              key={goal.id} 
              goal={goal} 
              user={user}
              groups={groups}
              onUpdateStatus={onUpdateGoalStatus}
              onEdit={onEditGoal}
              onDelete={onDeleteGoal}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 glass-card border border-dashed border-[#333]">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#111111] border border-[#222] flex items-center justify-center mb-4 text-[#8B5CF6]">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No active targets in this view.</h3>
          <p className="text-[#9CA3AF] text-sm mb-6 max-w-md mx-auto">
            Tasks you complete here instantly boost your global rank and contribute XP to your squads.
          </p>
          <button onClick={onOpenNewGoal} className="btn btn-primary py-2.5 px-6 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Initialize Target
          </button>
        </div>
      )}

      {/* 5. Floating Action Button (FAB) */}
      <button 
        onClick={onOpenNewGoal}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-[#00E5FF] text-black rounded-full shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};
