import React, { useState } from 'react';
import { Goal, Category, Difficulty, TargetDay, Subtask } from '../types';
import { X, Plus, Trash2, Calendar, Clock, Tag, Award, Sparkles } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => void;
  existingCount: number;
  initialData?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCount,
  initialData
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [deadline, setDeadline] = useState('21:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [colorLabel, setColorLabel] = useState('#00E5FF');
  const [tagsInput, setTagsInput] = useState('Code, Productivity');
  const [targetDay, setTargetDay] = useState<TargetDay>('today');
  const [targetDate, setTargetDate] = useState<string>('');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekdays'>('none');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  React.useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setDifficulty(initialData.difficulty);
      setDeadline(initialData.deadline);
      setEstimatedMinutes(initialData.estimatedMinutes);
      setColorLabel(initialData.colorLabel);
      setTagsInput(initialData.tags.join(', '));
      setTargetDay(initialData.targetDay);
      setTargetDate(initialData.targetDate || '');
      setRecurring(initialData.recurring);
      setSubtasks(initialData.subtasks || []);
    } else if (isOpen) {
      setTitle('');
      setDescription('');
      setCategory('Work');
      setDifficulty('medium');
      setDeadline('21:00');
      setEstimatedMinutes(30);
      setColorLabel('#00E5FF');
      setTagsInput('Code, Productivity');
      setTargetDay('today');
      setTargetDate('');
      setRecurring('none');
      setSubtasks([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: 'st_' + Date.now(), title: '', completed: false }]);
  };

  const handleSubtaskTitleChange = (id: string, text: string) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, title: text } : st));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Goal title is required');
      return;
    }
    if (existingCount >= 20) {
      setErrorMsg('Maximum limit of 20 goals per day reached!');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const validSubtasks = subtasks.filter(st => st.title.trim().length > 0);

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      deadline,
      estimatedMinutes: Number(estimatedMinutes),
      colorLabel,
      tags,
      subtasks: validSubtasks,
      recurring,
      targetDay,
      targetDate: targetDay === 'custom' ? targetDate : undefined,
      status: 'pending'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {initialData ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <p className="text-xs text-[#9CA3AF]">Define your target commitment across any scheduling horizon</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Target Horizon Choice */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#9CA3AF]">Target Horizon & Schedule *</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1.5 bg-[#171717] rounded-xl border border-[#262626]">
              {[
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow 🌙' },
                { id: 'week', label: 'This Week 📅' },
                { id: 'month', label: 'This Month 🗓️' },
                { id: 'custom', label: 'Custom ⏱️' }
              ].map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setTargetDay(h.id as TargetDay)}
                  className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all text-center ${
                    targetDay === h.id ? 'bg-[#00E5FF] text-black shadow-md font-extrabold' : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            {targetDay === 'custom' && (
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-[#00E5FF] mb-1">Select Target End Date:</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="form-input text-xs"
                  required
                />
              </div>
            )}
          </div>

          {/* Goal Title */}
          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Goal Title *</label>
            <input
              type="text"
              placeholder="e.g., Complete 3 LeetCode Hard Questions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              maxLength={80}
              required
            />
          </div>

          {/* Advanced Options Accordion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-[#00E5FF] hover:underline flex items-center gap-1.5 py-1"
            >
              <span>{showAdvanced ? '− Hide Advanced Details' : '+ Add Optional Details (Category, Subtasks, Time, Tags)'}</span>
            </button>
          </div>

          {/* Advanced Options Collapsible Container */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-[#222] animate-fade-in">
              
              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Description & Target Outcomes</label>
                <textarea
                  placeholder="Details on what success looks like..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input min-h-[60px] resize-none"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="form-select text-xs"
                  >
                    <option value="Work">💼 Work</option>
                    <option value="Code">💻 Code</option>
                    <option value="Health">🏋️ Health</option>
                    <option value="Study">📚 Study</option>
                    <option value="Personal">🧘 Personal</option>
                    <option value="Finance">💰 Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="form-select text-xs"
                  >
                    <option value="easy">🟩 Easy (10 XP)</option>
                    <option value="medium">🟨 Medium (25 XP)</option>
                    <option value="hard">🟥 Hard (50 XP)</option>
                    <option value="beast">🔥 Beast (100 XP)</option>
                  </select>
                </div>
              </div>

              {/* Time Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Deadline Time</label>
                  <input
                    type="time"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Est. Time (mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              {/* Color Label & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Color Theme</label>
                  <div className="flex items-center gap-2 mt-1">
                    {['#00E5FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorLabel(c)}
                        className={`w-6 h-6 rounded-lg transition-transform ${
                          colorLabel === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Work, Urgent"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#9CA3AF]">Subtasks Checklist ({subtasks.length})</label>
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => handleSubtaskTitleChange(st.id, e.target.value)}
                        placeholder="Subtask description..."
                        className="form-input py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs"
            >
              {initialData ? 'Save Changes ✅' : 'Save & Publish Goal 🚀'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
