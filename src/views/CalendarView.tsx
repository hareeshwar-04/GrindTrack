import React, { useState, useMemo } from 'react';
import { Goal } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, SkipForward } from 'lucide-react';

interface CalendarViewProps {
  goals: Goal[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ goals }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build a map of date -> goals for this month
  const goalsByDate = useMemo(() => {
    const map: Record<string, Goal[]> = {};
    goals.forEach(g => {
      // Use completedAt if available, otherwise createdAt
      const dateStr = g.completedAt
        ? g.completedAt.split('T')[0]
        : g.createdAt?.split('T')[0];
      if (!dateStr) return;
      const [y, m, _d] = dateStr.split('-').map(Number);
      if (y === year && m - 1 === month) {
        const day = _d;
        const key = String(day);
        if (!map[key]) map[key] = [];
        map[key].push(g);
      }
    });
    return map;
  }, [goals, year, month]);

  const selectedGoals = selectedDay ? (goalsByDate[String(selectedDay)] || []) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'failed': return <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />;
      case 'skipped': return <SkipForward className="w-3.5 h-3.5 text-[#F59E0B]" />;
      default: return <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'failed': return 'badge-danger';
      case 'skipped': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#00E5FF]" /> Consistency Calendar
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Click any date cell to review historical performance and completed commitments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl bg-[#171717] hover:bg-[#222] text-[#9CA3AF] hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-white font-mono">{monthName}</span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl bg-[#171717] hover:bg-[#222] text-[#9CA3AF] hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#9CA3AF] mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="p-3 min-h-[70px]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isSelected = selectedDay === dayNum;
            const today = new Date();
            const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayGoals = goalsByDate[String(dayNum)] || [];
            const completedCount = dayGoals.filter(g => g.status === 'completed').length;
            const failedCount = dayGoals.filter(g => g.status === 'failed').length;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`p-3 rounded-2xl min-h-[70px] border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                    : 'bg-[#111111] border-[#222] hover:border-[#404040]'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className={isToday ? 'text-[#00E5FF]' : 'text-white'}>{dayNum}</span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />}
                </div>

                {/* Real activity dots */}
                {dayGoals.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {completedCount > 0 && <div className="w-2 h-2 rounded-full bg-[#10B981]" title={`${completedCount} completed`} />}
                    {failedCount > 0 && <div className="w-2 h-2 rounded-full bg-[#EF4444]" title={`${failedCount} failed`} />}
                    {dayGoals.length - completedCount - failedCount > 0 && <div className="w-2 h-2 rounded-full bg-[#00E5FF]" title="pending/skipped" />}
                    <span className="text-[9px] text-[#6B7280] ml-0.5">{dayGoals.length}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Goals Drawer */}
      {selectedDay && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-white">
            Daily Record for {monthName.split(' ')[0]} {selectedDay}, {year}
          </h3>
          {selectedGoals.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">No goals recorded for this date.</p>
          ) : (
            <div className="space-y-2">
              {selectedGoals.map(g => (
                <div key={g.id} className="p-3 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(g.status)}
                    <span className="font-semibold text-white">{g.title}</span>
                  </div>
                  <span className={`badge text-[10px] uppercase ${getStatusBadge(g.status)}`}>{g.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
