import React, { useState } from 'react';
import { Goal } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface CalendarViewProps {
  goals: Goal[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ goals }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

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
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 rounded-xl bg-[#171717] hover:bg-[#222] text-[#9CA3AF] hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-white font-mono">{monthName}</span>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
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
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isSelected = selectedDay === dayNum;
            const isToday = dayNum === new Date().getDate();

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

                {/* Dot markers */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Goals Drawer */}
      {selectedDay && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-white">
            Daily Record for {monthName.split(' ')[0]} {selectedDay}, {currentDate.getFullYear()}
          </h3>
          <div className="space-y-2">
            {goals.slice(0, 3).map(g => (
              <div key={g.id} className="p-3 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{g.title}</span>
                <span className="badge badge-success text-[10px]">COMPLETED</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
