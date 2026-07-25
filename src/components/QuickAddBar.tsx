import React, { useState } from 'react';
import { TargetDay, Category } from '../types';
import { Zap, Plus, Sparkles, CornerDownLeft } from 'lucide-react';

interface QuickAddBarProps {
  onAddGoal: (title: string, targetDay: TargetDay) => void;
  onOpenFullModal?: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddGoal, onOpenFullModal }) => {
  const [title, setTitle] = useState('');
  const [targetDay, setTargetDay] = useState<TargetDay>('today');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddGoal(title.trim(), targetDay);
    setTitle('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <div className="glass-card p-3 border-[#00E5FF]/20 bg-gradient-to-r from-[#00E5FF]/5 via-[#111111] to-[#8B5CF6]/5 transition-all hover:border-[#00E5FF]/40 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        
        {/* Quick Icon Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-white hidden md:inline">Quick Add:</span>
        </div>

        {/* Input field */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Type task title and press Enter ↵ (e.g., Run 5K, Finish RTL module...)"
            className="w-full bg-[#171717] border border-[#262626] focus:border-[#00E5FF] rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-[#6B7280] transition-colors pr-10"
            maxLength={100}
          />
          <span className="absolute right-3 top-2.5 text-[10px] font-mono text-[#6B7280] pointer-events-none hidden sm:inline">
            ↵ Enter
          </span>
        </div>

        {/* Horizon Pills & Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          <div className="flex items-center gap-1 p-1 bg-[#141414] border border-[#222] rounded-xl">
            {[
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' }
            ].map(h => (
              <button
                key={h.id}
                type="button"
                onClick={() => setTargetDay(h.id as TargetDay)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  targetDay === h.id ? 'bg-[#00E5FF] text-black shadow-sm' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="text-[11px] text-[#9CA3AF] hover:text-white underline shrink-0 px-1"
              title="Open full goal modal with subtasks & tags"
            >
              Full Options
            </button>
          )}
        </div>

      </form>

      {isSuccess && (
        <div className="text-[11px] font-bold text-[#10B981] pt-1.5 px-2 flex items-center gap-1 animate-fade-in">
          ✓ Goal added to {targetDay.toUpperCase()}! Keep grinding! 🚀
        </div>
      )}
    </div>
  );
};
