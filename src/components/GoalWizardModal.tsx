import React, { useState, useEffect } from 'react';
import { Goal, Group, Category, TargetDay } from '../types';
import { Target, Clock, Calendar as CalendarIcon, Shield, ArrowRight, X, BookOpen, Code, Dumbbell, PlayCircle, BookMarked, Briefcase, ChevronRight } from 'lucide-react';

interface GoalWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt' | 'userId'>) => void;
  groups: Group[];
}

const CATEGORY_TEMPLATES: { label: string; category: Category; icon: React.ReactNode; defaultMins: number }[] = [
  { label: 'Study Session', category: 'Study', icon: <BookOpen className="w-5 h-5" />, defaultMins: 60 },
  { label: 'Coding Practice', category: 'Code', icon: <Code className="w-5 h-5" />, defaultMins: 90 },
  { label: 'Gym Workout', category: 'Health', icon: <Dumbbell className="w-5 h-5" />, defaultMins: 60 },
  { label: 'Reading', category: 'Personal', icon: <BookMarked className="w-5 h-5" />, defaultMins: 30 },
  { label: 'Deep Work', category: 'Work', icon: <Briefcase className="w-5 h-5" />, defaultMins: 120 }
];

const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

export const GoalWizardModal: React.FC<GoalWizardModalProps> = ({ isOpen, onClose, onSave, groups }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Study');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [targetDay, setTargetDay] = useState<TargetDay>('today');
  const [linkedGroups, setLinkedGroups] = useState<string[]>([]);
  
  // Advanced options (collapsed by default in a real app, simplified here)
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [description, setDescription] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTitle('');
      setCategory('Study');
      
      // Default to next nearest hour
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      const sh = now.getHours().toString().padStart(2, '0');
      const sm = now.getMinutes().toString().padStart(2, '0');
      setStartTime(`${sh}:${sm}`);
      
      now.setHours(now.getHours() + 1);
      const eh = now.getHours().toString().padStart(2, '0');
      const em = now.getMinutes().toString().padStart(2, '0');
      setEndTime(`${eh}:${em}`);

      setTargetDay('today');
      setLinkedGroups(groups.map(g => g.id)); // Auto-check all joined groups by default
      setPriority('medium');
      setDescription('');
    }
  }, [isOpen, groups]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      alert('Please enter what you are going to work on.');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const calculateMinutes = (start: string, end: string) => {
    if (!start || !end) return 60;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const handleSave = () => {
    onSave({
      title,
      description,
      category,
      deadline: '23:59', // Simplified
      startTime,
      endTime,
      estimatedMinutes: calculateMinutes(startTime, endTime),
      difficulty: 'medium', // Legacy fallback, no longer drives XP
      colorLabel: '#8B5CF6',
      tags: [],
      subtasks: [],
      recurring: 'none',
      status: 'pending',
      targetDay,
      linkedGroups,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#111111] border border-[#333] rounded-2xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#222] flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-xl text-white">Plan Mission</h2>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${step >= s ? 'bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'bg-[#333]'}`} />
                  {s < 4 && <div className={`w-8 h-[1px] ${step > s ? 'bg-[#00E5FF]/50' : 'bg-[#333]'}`} />}
                </div>
              ))}
              <span className="text-xs text-[#9CA3AF] ml-2 font-bold">{step} / 4</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: WHAT */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-[#00E5FF] uppercase tracking-wider mb-2">
                  What are you going to work on?
                </label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete LeetCode Problem, Study RTL..."
                  className="w-full bg-transparent border-b-2 border-[#333] focus:border-[#00E5FF] outline-none text-2xl font-bold text-white py-3 placeholder:text-[#555] transition-colors"
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-3">Suggested Templates</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORY_TEMPLATES.map(temp => (
                    <button
                      key={temp.label}
                      onClick={() => {
                        if (!title) setTitle(temp.label);
                        setCategory(temp.category);
                        // Optional: Could adjust end time based on temp.defaultMins here, but for simplicity we let user pick explicitly in step 2.
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        category === temp.category && (title === temp.label || !title)
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white'
                          : 'bg-[#1a1a1a] border-[#333] text-[#9CA3AF] hover:border-[#555] hover:text-white'
                      }`}
                    >
                      {temp.icon}
                      <span className="text-sm font-bold">{temp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HOW LONG */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 mb-8">
                <Clock className="w-12 h-12 text-[#F59E0B] mx-auto opacity-80" />
                <h3 className="text-xl font-bold text-white">When are you scheduling this?</h3>
                <p className="text-sm text-[#9CA3AF]">Pick a specific time block. Actual XP is based on verified focus time later.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-[#9CA3AF] uppercase">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#F59E0B] rounded-xl px-4 py-3 text-white font-bold text-lg outline-none transition-colors"
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-[#9CA3AF] uppercase">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#F59E0B] rounded-xl px-4 py-3 text-white font-bold text-lg outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-between">
                <span className="text-sm font-bold text-[#F59E0B]">Expected Duration:</span>
                <span className="text-lg font-extrabold text-[#F59E0B]">{calculateMinutes(startTime, endTime)} mins</span>
              </div>
            </div>
          )}

          {/* STEP 3: WHEN */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 mb-8">
                <CalendarIcon className="w-12 h-12 text-[#10B981] mx-auto opacity-80" />
                <h3 className="text-xl font-bold text-white">When are you executing this?</h3>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'today', label: 'Today', icon: '🔥' },
                  { id: 'tomorrow', label: 'Tomorrow', icon: '🌙' },
                  { id: 'week', label: 'This Week', icon: '📅' }
                ].map(day => (
                  <button
                    key={day.id}
                    onClick={() => setTargetDay(day.id as TargetDay)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      targetDay === day.id
                        ? 'bg-[#10B981]/10 border-[#10B981] text-white'
                        : 'bg-[#1a1a1a] border-[#333] text-[#9CA3AF] hover:border-[#555]'
                    }`}
                  >
                    <span className="font-bold">{day.label}</span>
                    <span className="text-xl">{day.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: WHO BENEFITS */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 mb-6">
                <Shield className="w-12 h-12 text-[#8B5CF6] mx-auto opacity-80" />
                <h3 className="text-xl font-bold text-white">Who benefits from this work?</h3>
                <p className="text-sm text-[#9CA3AF]">Every study session powers the ecosystem. Select the squads that will receive XP from this mission.</p>
              </div>

              {groups.length > 0 ? (
                <div className="space-y-3">
                  {groups.map(group => {
                    const isLinked = linkedGroups.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        onClick={() => {
                          if (isLinked) setLinkedGroups(linkedGroups.filter(id => id !== group.id));
                          else setLinkedGroups([...linkedGroups, group.id]);
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isLinked
                            ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                            : 'bg-[#1a1a1a] border-[#333] text-[#9CA3AF] hover:border-[#555]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isLinked ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-[#555] bg-transparent'
                          }`}>
                            {isLinked && <Target className="w-3 h-3" />}
                          </div>
                          <span className="font-bold">{group.name}</span>
                        </div>
                        <span className="text-xl opacity-50">{group.icon}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] text-center">
                  <p className="text-sm text-[#9CA3AF]">You are not currently in any squads.</p>
                </div>
              )}
              
              <div className="p-4 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 mt-4">
                <h4 className="text-[10px] font-bold text-[#00E5FF] uppercase mb-2">Mission Impact Preview</h4>
                <ul className="space-y-1.5 text-xs text-[#D1D5DB]">
                  <li className="flex items-center gap-2">✔ Earn Personal XP (1 min = 1 XP)</li>
                  <li className="flex items-center gap-2">✔ Increase your consistency streak</li>
                  {linkedGroups.map(gid => {
                    const name = groups.find(g => g.id === gid)?.name;
                    return <li key={gid} className="flex items-center gap-2">✔ Contribute XP to {name}</li>
                  })}
                  <li className="flex items-center gap-2">✔ Generate activity feed events</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#222] flex items-center justify-between bg-[#111111] rounded-b-2xl">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-[#9CA3AF] hover:text-white">
              Back
            </button>
          ) : <div />}
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="btn btn-primary py-2.5 px-6 flex items-center gap-2"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="btn bg-[#00E5FF] text-black hover:bg-white border-none py-2.5 px-8 font-extrabold shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" /> Initialize Mission
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
