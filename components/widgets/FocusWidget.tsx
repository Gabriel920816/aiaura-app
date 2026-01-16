
import React from 'react';

interface FocusWidgetProps {
  timerLeft: number;
  timerActive: boolean;
  setTimerActive: (a: boolean) => void;
  resetTimer: () => void;
}

const FocusWidget: React.FC<FocusWidgetProps> = ({ timerLeft, timerActive, setTimerActive, resetTimer }) => {
  const mins = Math.floor(timerLeft / 60).toString().padStart(2, '0');
  const secs = (timerLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black digital-number text-white">{mins}</span>
        <span className="text-lg font-light text-white/20">:</span>
        <span className="text-xl font-black digital-number opacity-50 text-white/60">{secs}</span>
      </div>

      <div className="h-4 w-px bg-white/10 mx-0.5"></div>

      <div className="flex gap-1.5">
          <button 
            onClick={(e) => { e.stopPropagation(); setTimerActive(!timerActive); }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${timerActive ? 'bg-white text-black scale-105' : 'bg-white/5 text-white hover:bg-white/10'}`}
          >
            <i className={`fa-solid ${timerActive ? 'fa-pause' : 'fa-play ml-0.5'} text-[10px]`}></i>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); resetTimer(); }}
            className="w-7 h-7 rounded-lg bg-white/5 text-white/30 flex items-center justify-center hover:bg-white/10 hover:text-white"
          >
            <i className="fa-solid fa-rotate-right text-[8px]"></i>
          </button>
      </div>
    </div>
  );
};

export default FocusWidget;
