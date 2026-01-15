
import React, { useState, useEffect, useRef } from 'react';

interface GlassDatePickerProps {
  value: string;
  onChange: (v: string) => void;
  label: string;
}

const GlassDatePicker: React.FC<GlassDatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 text-white/50">{label}</label>
      <div onClick={() => setIsOpen(!isOpen)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white cursor-pointer flex justify-between items-center hover:bg-white/10 transition-all">
        <span className="font-bold text-sm">{value || 'Select Date'}</span>
        <i className="fa-solid fa-calendar text-[10px] opacity-40"></i>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 z-[10001] heavy-glass rounded-[2.5rem] p-7 shadow-2xl border border-white/20 w-[300px] animate-in slide-in-from-top-2 fade-in duration-150">
          <div className="flex justify-between items-center mb-5">
             <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
             <span className="text-[11px] font-black uppercase tracking-widest text-white/90">{viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
             <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[9px] font-black opacity-30 text-white">{d}</span>)}
            {blanks.map(b => <div key={`b-${b}`} />)}
            {days.map(d => {
              const currentMonth = viewDate.getMonth() + 1;
              const dateKey = `${viewDate.getFullYear()}-${String(currentMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              const isSelected = value === dateKey;
              return (
                <button key={d} type="button" onClick={() => handleSelect(d)} className={`text-[11px] font-bold h-8 w-8 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                  {d}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-5 pt-5 border-t border-white/10">
            <button type="button" onClick={() => { onChange(''); setIsOpen(false); }} className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-all">Clear</button>
            <button type="button" onClick={() => { onChange(getTodayStr()); setIsOpen(false); }} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all">Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassDatePicker;
