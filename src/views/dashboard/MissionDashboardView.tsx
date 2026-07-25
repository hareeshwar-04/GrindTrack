import React from 'react';
import { UserProfile, Goal, ActivityFeedItem, GroupMember, Group, TaskStatus } from '../../types';
import { MissionHeader } from './MissionHeader';
import { NextMissionCard } from './NextMissionCard';
import { SocialSidebar } from './SocialSidebar';
import { TodaySummaryCards } from '../goals/TodaySummaryCards';
import { GamifiedTaskCard } from '../goals/GamifiedTaskCard';
import { Plus, ArrowRight } from 'lucide-react';

interface MissionDashboardViewProps {
  user: UserProfile;
  goals: Goal[];
  activities: ActivityFeedItem[];
  groups: Group[];
  groupMembers: GroupMember[];
  onOpenNewGoal: () => void;
  onUpdateGoalStatus: (goalId: string, status: TaskStatus) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onNavigateView: (view: string) => void;
}

export const MissionDashboardView: React.FC<MissionDashboardViewProps> = ({
  user, goals, activities, groups, groupMembers,
  onOpenNewGoal, onUpdateGoalStatus, onEditGoal, onDeleteGoal, onNavigateView
}) => {
  
  // 1. Determine "Today's Goals"
  const todayGoals = goals.filter(g => g.targetDay === 'today');
  const pendingTodayGoals = todayGoals.filter(g => g.status !== 'completed');
  
  // 2. Calculate "Next Mission"
  // Logic: Highest Priority -> Highest XP (Difficulty) -> Earliest Deadline
  const sortedForNext = [...pendingTodayGoals].sort((a, b) => {
    const xA = a.difficulty === 'beast' ? 4 : a.difficulty === 'hard' ? 3 : a.difficulty === 'medium' ? 2 : 1;
    const xB = b.difficulty === 'beast' ? 4 : b.difficulty === 'hard' ? 3 : b.difficulty === 'medium' ? 2 : 1;
    if (xB !== xA) return xB - xA;
    
    return 0; // Simplified deadline sort for now
  });

  const nextMission = sortedForNext.length > 0 ? sortedForNext[0] : null;

  return (
    <div className="animate-fade-in pb-24 relative min-h-screen">
      
      {/* Global Header */}
      <div className="mb-6">
        <MissionHeader user={user} />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (70%) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Spotlight Next Mission */}
          {nextMission && (
            <NextMissionCard 
              goal={nextMission} 
              user={user} 
              groups={groups} 
              onComplete={onUpdateGoalStatus} 
            />
          )}

          {/* Today KPIs */}
          <div>
            <h3 className="font-bold text-[#9CA3AF] uppercase text-xs mb-3 tracking-wider">Today's Progress</h3>
            <TodaySummaryCards goals={goals} user={user} />
          </div>

          {/* Today's Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#9CA3AF] uppercase text-xs tracking-wider">Action Items</h3>
              <button onClick={() => onNavigateView('goals')} className="text-[#00E5FF] text-xs font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            {todayGoals.length > 0 ? (
              <div className="space-y-3">
                {todayGoals.map(goal => (
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
              <div className="text-center py-10 glass-card border border-dashed border-[#333]">
                <p className="text-[#9CA3AF] text-sm mb-4">No targets initialized for today.</p>
                <button onClick={onOpenNewGoal} className="btn btn-primary py-2 px-6">
                  Create Target
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (30%) */}
        <div className="lg:col-span-1">
          <SocialSidebar members={groupMembers} activities={activities} />
        </div>

      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={onOpenNewGoal}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-[#00E5FF] text-black rounded-full shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};
