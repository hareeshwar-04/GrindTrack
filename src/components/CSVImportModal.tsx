import React, { useState } from 'react';
import { Goal, TargetDay, Category, Difficulty } from '../types';
import { StoreService } from '../services/store';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, 
  X, HelpCircle, Edit3, Trash2, Sparkles, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportGoals: (goals: Goal[]) => void;
  currentUserId: string;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportGoals,
  currentUserId
}) => {
  const [activeStep, setActiveStep] = useState<'upload' | 'review'>('upload');
  const [parsedGoals, setParsedGoals] = useState<Partial<Goal>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Download Sample CSV
  const handleDownloadSample = () => {
    const csvContent = StoreService.generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'GrindTrack_Sample_Goals.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload & Parsing
  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid .csv file');
      return;
    }
    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setErrorMsg('File content is empty');
        return;
      }

      const goals = StoreService.parseCSVGoals(text, currentUserId);
      if (goals.length === 0) {
        setErrorMsg('Could not parse any valid goal rows. Please check the CSV format guidelines below.');
        return;
      }

      setParsedGoals(goals);
      // Select all by default
      const initialSelected: Record<number, boolean> = {};
      goals.forEach((_, idx) => { initialSelected[idx] = true; });
      setSelectedIndices(initialSelected);

      setActiveStep('review');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleToggleSelect = (idx: number) => {
    setSelectedIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleToggleSelectAll = (selectAll: boolean) => {
    const updated: Record<number, boolean> = {};
    parsedGoals.forEach((_, idx) => { updated[idx] = selectAll; });
    setSelectedIndices(updated);
  };

  const handleUpdateGoalField = (idx: number, field: keyof Goal, value: any) => {
    const updated = [...parsedGoals];
    updated[idx] = { ...updated[idx], [field]: value };
    setParsedGoals(updated);
  };

  const handleDeleteParsedRow = (idx: number) => {
    const updated = parsedGoals.filter((_, i) => i !== idx);
    setParsedGoals(updated);
  };

  // Approve & Confirm Import
  const handleConfirmImport = () => {
    const finalGoalsToImport: Goal[] = parsedGoals
      .filter((_, idx) => selectedIndices[idx])
      .map((g, idx) => ({
        id: 'g_import_' + Date.now() + '_' + idx,
        title: g.title || 'Untitled Task',
        description: g.description || '',
        category: g.category || 'Work',
        deadline: g.deadline || '21:00',
        estimatedMinutes: g.estimatedMinutes || 30,
        difficulty: g.difficulty || 'medium',
        colorLabel: g.colorLabel || '#00E5FF',
        tags: g.tags || ['CSV Import'],
        subtasks: g.subtasks || [],
        recurring: 'none',
        status: 'pending',
        targetDay: g.targetDay || 'today',
        targetDate: g.targetDate,
        createdAt: new Date().toISOString(),
        userId: currentUserId
      }));

    if (finalGoalsToImport.length === 0) {
      alert('Please select at least one goal to import.');
      return;
    }

    onImportGoals(finalGoalsToImport);
    onClose();
  };

  const selectedCount = Object.values(selectedIndices).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-[#222] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
                Automated CSV Goal Importer
                <span className="badge badge-accent text-[9px]">v2.4 Engine</span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                {activeStep === 'upload' ? 'Upload a CSV file to bulk import targets across any horizon' : `Review and approve ${parsedGoals.length} parsed tasks`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center border-b border-[#222] bg-[#0B0B0B] px-6 py-2 text-xs">
          <div className={`flex items-center gap-2 font-bold ${activeStep === 'upload' ? 'text-[#00E5FF]' : 'text-[#10B981]'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
            Upload & Format Guidelines
          </div>
          <ArrowRight className="w-4 h-4 text-[#404040] mx-4" />
          <div className={`flex items-center gap-2 font-bold ${activeStep === 'review' ? 'text-[#00E5FF]' : 'text-[#6B7280]'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
            Pre-Import Review Page ({parsedGoals.length} items)
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeStep === 'upload' ? (
            <div className="space-y-6">
              
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#333] hover:border-[#00E5FF] rounded-2xl p-10 text-center transition-all bg-[#141414]/50 cursor-pointer group"
              >
                <input
                  type="file"
                  accept=".csv"
                  id="csvFileInput"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <label htmlFor="csvFileInput" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Drag & drop your CSV file here</h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">or click to browse your local device</p>
                  </div>
                  <span className="badge badge-primary text-[10px] py-1 px-3 mt-2">
                    Supports Today, Tomorrow, Week, Month & Custom Dates
                  </span>
                </label>
              </div>

              {/* Sample Download Bar */}
              <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#8B5CF6]" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Need a CSV template?</h5>
                    <p className="text-[11px] text-[#9CA3AF]">Download our pre-formatted sample CSV file to quickly fill in your goals.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0 border-[#8B5CF6]/40 hover:border-[#8B5CF6] text-[#C084FC]"
                >
                  <Download className="w-3.5 h-3.5" /> Download Sample CSV
                </button>
              </div>

              {/* CSV Guidelines Reference Box */}
              <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#222] space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-[#00E5FF] uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" /> CSV Column Header Guidelines
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#222] text-[#9CA3AF]">
                        <th className="py-2 px-3">Column Header</th>
                        <th className="py-2 px-3">Allowed Values / Example</th>
                        <th className="py-2 px-3">Required?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A] text-white">
                      <tr>
                        <td className="py-2 px-3 font-mono text-[#00E5FF]">Title</td>
                        <td className="py-2 px-3">"Review SystemVerilog RTL"</td>
                        <td className="py-2 px-3 font-bold text-[#10B981]">Required</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono text-[#00E5FF]">Category</td>
                        <td className="py-2 px-3">Work | Code | Health | Study | Personal | Finance</td>
                        <td className="py-2 px-3 text-[#9CA3AF]">Optional (Default: Work)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono text-[#00E5FF]">Difficulty</td>
                        <td className="py-2 px-3">easy | medium | hard | beast</td>
                        <td className="py-2 px-3 text-[#9CA3AF]">Optional (Default: medium)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono text-[#00E5FF]">TargetHorizon</td>
                        <td className="py-2 px-3">today | tomorrow | week | month | custom</td>
                        <td className="py-2 px-3 text-[#9CA3AF]">Optional (Default: today)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono text-[#00E5FF]">TargetDate</td>
                        <td className="py-2 px-3">YYYY-MM-DD (e.g., 2026-08-15) for custom horizon</td>
                        <td className="py-2 px-3 text-[#9CA3AF]">Optional</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono text-[#00E5FF]">Subtasks</td>
                        <td className="py-2 px-3">Pipe-separated steps (e.g., "Step 1 | Step 2")</td>
                        <td className="py-2 px-3 text-[#9CA3AF]">Optional</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* Review Step */
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#141414] p-3.5 rounded-xl border border-[#222]">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#9CA3AF]">
                    File: <strong className="text-white">{fileName}</strong>
                  </span>
                  <span className="badge badge-accent text-[10px]">
                    {selectedCount} of {parsedGoals.length} Selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(true)}
                    className="text-[11px] text-[#00E5FF] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#333]">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(false)}
                    className="text-[11px] text-[#9CA3AF] hover:underline"
                  >
                    Deselect All
                  </button>
                  <span className="text-[#333]">|</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep('upload')}
                    className="text-[11px] text-[#8B5CF6] hover:underline"
                  >
                    Re-upload File
                  </button>
                </div>
              </div>

              {/* Interactive Parsed Goals Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#222] max-h-[50vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#171717] sticky top-0 z-10 border-b border-[#262626] text-[#9CA3AF] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">Include</th>
                      <th className="py-3 px-3 min-w-[200px]">Goal Title</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Difficulty</th>
                      <th className="py-3 px-3">Horizon</th>
                      <th className="py-3 px-3">Deadline</th>
                      <th className="py-3 px-3">Subtasks</th>
                      <th className="py-3 px-3 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A] bg-[#111111]">
                    {parsedGoals.map((g, idx) => {
                      const isSelected = !!selectedIndices[idx];
                      return (
                        <tr key={idx} className={`hover:bg-[#161616] transition-colors ${!isSelected ? 'opacity-40 bg-black/40' : ''}`}>
                          
                          {/* Checkbox */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(idx)}
                              className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
                            />
                          </td>

                          {/* Title (Editable) */}
                          <td className="py-3 px-3 font-semibold text-white">
                            <input
                              type="text"
                              value={g.title || ''}
                              onChange={(e) => handleUpdateGoalField(idx, 'title', e.target.value)}
                              className="bg-transparent border-b border-transparent hover:border-[#333] focus:border-[#00E5FF] text-white text-xs outline-none w-full py-0.5"
                            />
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3">
                            <select
                              value={g.category || 'Work'}
                              onChange={(e) => handleUpdateGoalField(idx, 'category', e.target.value as Category)}
                              className="bg-[#171717] border border-[#262626] text-white text-[11px] rounded px-2 py-1 outline-none"
                            >
                              <option value="Work">Work</option>
                              <option value="Code">Code</option>
                              <option value="Health">Health</option>
                              <option value="Study">Study</option>
                              <option value="Personal">Personal</option>
                              <option value="Finance">Finance</option>
                            </select>
                          </td>

                          {/* Difficulty */}
                          <td className="py-3 px-3">
                            <select
                              value={g.difficulty || 'medium'}
                              onChange={(e) => handleUpdateGoalField(idx, 'difficulty', e.target.value as Difficulty)}
                              className="bg-[#171717] border border-[#262626] text-white text-[11px] rounded px-2 py-1 outline-none uppercase font-semibold"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                              <option value="beast">Beast</option>
                            </select>
                          </td>

                          {/* Target Horizon */}
                          <td className="py-3 px-3">
                            <select
                              value={g.targetDay || 'today'}
                              onChange={(e) => handleUpdateGoalField(idx, 'targetDay', e.target.value as TargetDay)}
                              className="bg-[#171717] border border-[#262626] text-[#00E5FF] font-bold text-[11px] rounded px-2 py-1 outline-none uppercase"
                            >
                              <option value="today">Today</option>
                              <option value="tomorrow">Tomorrow</option>
                              <option value="week">This Week</option>
                              <option value="month">This Month</option>
                              <option value="custom">Custom Date</option>
                            </select>
                          </td>

                          {/* Deadline */}
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={g.deadline || '21:00'}
                              onChange={(e) => handleUpdateGoalField(idx, 'deadline', e.target.value)}
                              className="bg-transparent text-xs text-[#9CA3AF] w-14 outline-none border-b border-transparent focus:border-[#00E5FF]"
                            />
                          </td>

                          {/* Subtasks Count */}
                          <td className="py-3 px-3 text-[#9CA3AF] font-mono text-[11px]">
                            {g.subtasks?.length || 0} steps
                          </td>

                          {/* Delete */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteParsedRow(idx)}
                              className="text-[#EF4444] hover:text-red-400 p-1"
                              title="Remove row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#222] bg-[#141414] flex items-center justify-between gap-4">
          <button onClick={onClose} className="btn btn-secondary text-xs">
            Cancel
          </button>

          {activeStep === 'review' && (
            <button
              onClick={handleConfirmImport}
              className="btn btn-primary text-xs flex items-center gap-2 py-2.5 px-5"
            >
              <ShieldCheck className="w-4 h-4" /> Approve & Import {selectedCount} Goals
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
