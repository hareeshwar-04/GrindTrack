import React, { useState, useEffect } from 'react';
import { Goal, Group } from '../types';
import { Zap, Clock, Shield, Target, Flame, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SessionCompleteModalProps {
  goal: Goal;
  groups: Group[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actualMinutes: number, earnedXP: number) => void;
  currentStreak: number;
}

export const SessionCompleteModal: React.FC<SessionCompleteModalProps> = ({ goal, groups, isOpen, onClose, onConfirm, currentStreak }) => {
  const [actualMinutes, setActualMinutes] = useState(goal.estimatedMinutes || 60);
  const [step, setStep] = useState<'log' | 'celebrate'>('log');
  
  // Calculate linked groups
  const linkedGroupObjects = groups.filter(g => (goal.linkedGroups || []).includes(g.id));

  // 1 Minute = 1 XP
  const earnedXP = actualMinutes;

  useEffect(() => {
    if (isOpen) {
      setStep('log');
      setActualMinutes(goal.estimatedMinutes || 60);
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const handleFinish = () => {
    setStep('celebrate');
    // Epic confetti burst
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ['#00E5FF', '#8B5CF6', '#10B981', '#F59E0B'];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleFinalClose = () => {
    onConfirm(actualMinutes, earnedXP);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={step === 'log' ? onClose : undefined} />
      
      <div className="bg-[#111111] border border-[#333] rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden">
        
        {step === 'log' && (
          <div className="p-8 animate-fade-in text-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 mx-auto flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-[#10B981]" />
            </div>
            
            <h2 className="font-display font-extrabold text-2xl text-white mb-2">Session Complete</h2>
            <p className="text-sm text-[#9CA3AF] mb-8">"{goal.title}"</p>

            <div className="space-y-4 mb-8">
              <label className="block text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
                Log Verified Focus Time
              </label>
              
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setActualMinutes(Math.max(5, actualMinutes - 5))}
                  className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] text-white font-bold text-xl hover:bg-[#333]"
                >-</button>
                <div className="w-24 text-center">
                  <div className="font-display font-extrabold text-4xl text-white">{actualMinutes}</div>
                  <div className="text-xs font-bold text-[#9CA3AF] uppercase">Minutes</div>
                </div>
                <button 
                  onClick={() => setActualMinutes(actualMinutes + 5)}
                  className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] text-white font-bold text-xl hover:bg-[#333]"
                >+</button>
              </div>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full btn btn-primary py-4 text-base shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              Calculate XP
            </button>
          </div>
        )}

        {step === 'celebrate' && (
          <div className="p-8 animate-fade-in text-center relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B] rounded-full blur-[80px] opacity-20" />
            
            <h2 className="font-display font-extrabold text-3xl text-white mb-8">Mission Success!</h2>

            <div className="space-y-6">
              
              {/* Stat Rows */}
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <span className="text-[#9CA3AF] font-bold text-sm">Verified Focus</span>
                <span className="text-white font-display font-extrabold text-xl">{actualMinutes} mins</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <span className="text-[#9CA3AF] font-bold text-sm">Reward Earned</span>
                <span className="text-[#F59E0B] font-display font-extrabold text-2xl flex items-center gap-1">
                  <Zap className="w-5 h-5" /> +{earnedXP} XP
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <span className="text-[#9CA3AF] font-bold text-sm">Current Streak</span>
                <span className="text-[#EF4444] font-display font-extrabold text-xl flex items-center gap-1">
                  <Flame className="w-5 h-5" /> {currentStreak} Days
                </span>
              </div>

              {/* Ecosystem Impact */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 text-left border border-[#333]">
                <span className="text-[10px] text-[#9CA3AF] font-bold uppercase block mb-3">Ecosystem Impact</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Zap className="w-4 h-4 text-[#F59E0B]" /> +{earnedXP} Personal XP
                  </div>
                  {linkedGroupObjects.map(g => (
                    <div key={g.id} className="flex items-center gap-2 text-sm text-[#8B5CF6]">
                      <Shield className="w-4 h-4" /> +{earnedXP} to {g.name}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <button 
              onClick={handleFinalClose}
              className="w-full btn bg-white text-black font-extrabold hover:bg-gray-200 mt-8 py-3"
            >
              Continue
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};
