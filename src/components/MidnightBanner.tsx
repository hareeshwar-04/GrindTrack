import React, { useState, useEffect } from 'react';
import { Moon, Clock, Play, Sparkles } from 'lucide-react';

interface MidnightBannerProps {
  timezone: string;
  onTriggerRollover: () => void;
}

export const MidnightBanner: React.FC<MidnightBannerProps> = ({ timezone, onTriggerRollover }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-[#111111] via-[#171717] to-[#111111] border border-[#222] rounded-2xl p-3.5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6]">
          <Moon className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs text-white tracking-wide uppercase">Midnight System Active</h4>
            <span className="badge badge-accent text-[9px] py-0.5">AUTO-TRANSITION</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Timezone: <strong className="text-white">{timezone}</strong></span>
            <span className="text-[#6B7280]">|</span>
            <span className="text-[#00E5FF] font-mono font-semibold">{currentTime}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={onTriggerRollover}
          className="btn btn-secondary text-xs py-2 px-3 w-full md:w-auto border-[#8B5CF6]/40 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-[#C084FC]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Simulate Midnight Rollover 🌙</span>
        </button>
      </div>
    </div>
  );
};
