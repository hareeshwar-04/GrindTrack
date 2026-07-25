import React, { useState } from 'react';
import { Goal, Group, TaskStatus, UserProfile } from '../../types';
import { calculateXP } from '../../services/store';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Zap, Flag, MoreHorizontal, Shield, Edit3, Trash2, Target } from 'lucide-react';

interface GamifiedTaskCardProps {
  goal: Goal;
  user: UserProfile;
  groups: Group[];
  onUpdateStatus: (goalId: string, status: TaskStatus) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

export const GamifiedTaskCard: React.FC<GamifiedTaskCardProps> = ({ goal, user, groups, onUpdateStatus, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = goal.status === 'completed';

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pass status update, App.tsx will handle opening the SessionCompleteModal if going from pending -> completed
    onUpdateStatus(goal.id, isCompleted ? 'pending' : 'completed');
  };

  // Find which groups this goal is explicitly linked to
  const activeGroups = groups.filter(g => (goal.linkedGroups || []).includes(g.id));

  return (
    <div 
      className={`glass-card glass-card-interactive overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-70 grayscale-[0.3]' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex items-start gap-4 cursor-pointer">
        
        {/* Checkbox */}
        <button 
          onClick={handleComplete}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted 
              ? 'bg-[#10B981] border-[#10B981] text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
              : 'border-[#444] text-transparent hover:border-[#8B5CF6]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              goal.difficulty === 'beast' ? 'bg-red-500/20 text-red-500' :
              goal.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-500' :
              'bg-blue-500/20 text-blue-500'
            }`}>
              {goal.difficulty}
            </span>
            <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">{goal.category}</span>
          </div>
          <h3 className={`font-bold text-base text-white truncate transition-all ${isCompleted ? 'line-through text-[#9CA3AF]' : ''}`}>
            {goal.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold">
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <Clock className="w-3.5 h-3.5" /> 
              {isCompleted ? `${goal.actualMinutes} mins logged` : `Est. ${goal.estimatedMinutes} mins`}
            </div>
            {isCompleted && goal.earnedXP && (
              <div className="flex items-center gap-1 text-[#10B981]">
                <Zap className="w-3.5 h-3.5" /> +{goal.earnedXP} XP
              </div>
            )}
            {goal.deadline && (
              <div className="flex items-center gap-1 text-[#9CA3AF]">
                <Clock className="w-3.5 h-3.5" /> {goal.deadline}
              </div>
            )}
            {activeGroups.length > 0 && (
              <div className="flex items-center gap-1 text-[#8B5CF6]">
                <Shield className="w-3.5 h-3.5" /> {activeGroups.length} Squads Linked
              </div>
            )}
          </div>
        </div>

        {/* Expand Toggle */}
        <div className="shrink-0 text-[#9CA3AF]">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded State */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-[#222] mt-2 animate-fade-in cursor-default" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            
            {/* Left Col: Details */}
            <div className="space-y-4">
              {goal.description && (
                <div>
                  <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">Notes</h4>
                  <p className="text-sm text-white/90">{goal.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => onEdit(goal)} className="btn btn-secondary text-[10px] py-1.5 px-3 flex items-center gap-1.5">
                  <Edit3 className="w-3 h-3" /> Edit Task
                </button>
                <button onClick={() => { if(window.confirm('Delete this goal?')) onDelete(goal.id); }} className="btn text-[10px] py-1.5 px-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-1.5">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>

            {/* Right Col: Gameplay Loop Engine */}
            <div className="bg-[#111111] rounded-xl p-4 border border-[#222]">
              <h4 className="text-[10px] font-bold text-[#00E5FF] uppercase mb-3 flex items-center gap-1">
                <Target className="w-3 h-3" /> Mission Rewards
              </h4>
              
              <div className="space-y-3 text-xs font-bold">
                <div className="flex items-center justify-between text-[#9CA3AF]">
                  <span>System Reward (XP)</span>
                  <span className={isCompleted ? 'text-[#F59E0B]' : 'text-white'}>
                    {isCompleted ? `+${goal.earnedXP} XP` : 'Calculated upon completion'}
                  </span>
                </div>
                
                {activeGroups.length > 0 && (
                  <div className="pt-2 border-t border-[#333] space-y-2">
                    <span className="text-[10px] text-[#9CA3AF] uppercase">Linked Squads</span>
                    {activeGroups.map(group => (
                      <div key={group.id} className="flex items-center justify-between text-[#8B5CF6]">
                        <span className="truncate pr-2">{group.name}</span>
                        <span className="shrink-0">{isCompleted ? `+${goal.earnedXP} XP` : 'Pending'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeGroups.length === 0 && (
                  <div className="pt-2 border-t border-[#333]">
                    <span className="text-[10px] text-[#9CA3AF]">This mission is not linked to any squads.</span>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
