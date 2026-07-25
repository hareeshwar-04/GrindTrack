import React from 'react';
import { Goal, Group, UserProfile, TaskStatus } from '../../types';
import { calculateXP } from '../../services/store';
import { Target, Zap, Clock, Shield, ArrowRight } from 'lucide-react';

interface NextMissionCardProps {
  goal: Goal | null;
  user: UserProfile;
  groups: Group[];
  onComplete: (goalId: string, status: TaskStatus) => void;
}

export const NextMissionCard: React.FC<NextMissionCardProps> = ({ goal, user, groups, onComplete }) => {
  if (!goal) return null;

  const activeGroups = groups.filter(g => g.memberIds.includes(user.id));
  const xpReward = calculateXP(goal.difficulty);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#00E5FF]/30 bg-gradient-to-br from-[#111111] to-[#00E5FF]/10 shadow-[0_0_30px_rgba(0,229,255,0.1)] group">
      
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF] rounded-full blur-[100px] opacity-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8B5CF6] rounded-full blur-[80px] opacity-10" />

      <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
              Next Mission
            </span>
            <span className={`badge text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
              goal.difficulty === 'beast' ? 'bg-red-500/20 text-red-500' :
              goal.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-500' :
              'bg-blue-500/20 text-blue-500'
            }`}>
              {goal.difficulty}
            </span>
          </div>
          
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white">
            {goal.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-[#F59E0B]">
              <Zap className="w-4 h-4" /> +{xpReward} XP
            </div>
            {goal.deadline && (
              <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                <Clock className="w-4 h-4" /> {goal.deadline}
              </div>
            )}
            {goal.estimatedMinutes && (
              <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                <Target className="w-4 h-4" /> {goal.estimatedMinutes} mins
              </div>
            )}
          </div>

          {/* Group Contributions */}
          {activeGroups.length > 0 && (
            <div className="pt-2 border-t border-[#333]/50">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-bold mb-2 block">
                Will contribute to:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {activeGroups.map(g => (
                  <span key={g.id} className="text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {g.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <button 
            onClick={() => onComplete(goal.id, 'completed')}
            className="w-full md:w-auto btn btn-primary py-4 px-8 text-base shadow-[0_0_20px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform"
          >
            Start Mission <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
        </div>

      </div>
    </div>
  );
};
