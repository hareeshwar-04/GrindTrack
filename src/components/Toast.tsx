import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#10B981]" />,
    error: <XCircle className="w-4 h-4 text-[#EF4444]" />,
    info: <Info className="w-4 h-4 text-[#00E5FF]" />
  };

  const borders = {
    success: 'border-[#10B981]/40 bg-[#10B981]/10',
    error: 'border-[#EF4444]/40 bg-[#EF4444]/10',
    info: 'border-[#00E5FF]/40 bg-[#00E5FF]/10'
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-fade-in ${borders[type]}`}>
      {icons[type]}
      <p className="text-xs font-semibold text-white mr-4">{message}</p>
      <button onClick={() => onClose(id)} className="text-[#9CA3AF] hover:text-white transition-colors">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
