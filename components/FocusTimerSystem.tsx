
import React, { useState } from 'react';

interface FocusModalContentProps {
  timerLeft: number;
  timerMax: number;
  timerActive: boolean;
  setTimerActive: (a: boolean) => void;
  setTimerLeft: (t: number) => void;
  setTimerMax: (t: number) => void;
  isImmersive?: boolean;
}

export const FocusModalContent: React.FC<FocusModalContentProps> = ({ 
  timerLeft, timerMax, timerActive, setTimerActive, setTimerLeft, setTimerMax, isImmersive 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const minutes = Math.floor(timerLeft / 60);
  const seconds = timerLeft % 60;
  const progress = ((timerMax - timerLeft) / timerMax) * 100;

  const handleTimeSelect = (m: number) => {
    setTimerMax(m * 60);
    setTimerLeft(m * 60);
    setShowPicker(false);
  };

  return (
    <div className={`flex flex-col items-center gap-16 select-none ${isImmersive ? 'drop-shadow-2xl' : ''}`}>
      {/* 核心容器 - 320px (md:w-80) */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        
        {/* SVG 圆环层 */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 z-0">
          {/* 背景底环 - 细线 1.5px */}
          <circle 
            cx="50%" cy="50%" r="44%" 
            className="fill-none stroke-white/10" 
            strokeWidth="1.5" 
          />
          {/* 生长进度环 - 粗线 4px */}
          {/* 逻辑：只有当进度大于 0（即开始计时或手动调过时间）且计时器活动/非满值时才显示 */}
          <circle 
            cx="50%" cy="50%" r="44%" 
            className="fill-none stroke-white transition-all duration-1000 ease-linear" 
            strokeWidth="4"
            strokeDasharray="276%"
            strokeDashoffset={`${276 - (progress * 2.76)}%`}
            strokeLinecap="round"
            style={{ 
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
              strokeOpacity: progress > 0 ? 1 : 0, // 进度为0时彻底隐藏
              transition: 'stroke-dashoffset 1s linear, stroke-opacity 0.4s ease'
            }}
          />
        </svg>

        {/* 中心数字区 - Picker 开启时完全隐藏 */}
        <div className={`relative z-10 flex flex-col items-center transition-opacity duration-300 ${showPicker ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div 
            onClick={() => !timerActive && setShowPicker(true)}
            className={`flex items-baseline gap-1 cursor-pointer transition-all active:scale-95 group ${!timerActive ? 'hover:scale-105' : ''}`}
          >
            <span className="text-6xl md:text-7xl font-light tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-3xl font-extralight text-white/20 group-hover:text-white/50 transition-colors mx-1">:</span>
            <span className="text-5xl md:text-6xl font-extralight tracking-tighter text-white/60 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
          <p className="text-[9px] font-normal uppercase tracking-[0.8em] text-white/30 mt-6 ml-2 translate-x-1">Focus</p>
        </div>

        {/* 编辑分钟圆盘系统 */}
        {showPicker && (
          <>
            {/* 点击外部退出的透明遮罩（覆盖整个 Modal 区域或全屏） */}
            <div 
              className="fixed inset-0 z-[90] cursor-default"
              onClick={() => setShowPicker(false)}
            />

            {/* 圆盘主体 */}
            <div 
              className="absolute z-[100] ios-glass-standard !border-none !rounded-full flex flex-col items-center animate-in zoom-in-90 duration-300 overflow-hidden"
              style={{ 
                width: '88%', 
                height: '88%', 
                // 移除 rgba(0,0,0,0.85) 的遮罩，使用更轻盈的玻璃感
                backgroundColor: 'rgba(255,255,255,0.02)', 
                backdropFilter: 'blur(40px) saturate(180%)'
              }}
              onClick={(e) => e.stopPropagation()} // 防止点击圆盘内部（非分钟处）意外关闭，如果需要点击内部背景也关闭，可移除此行
            >
               {/* 顶部渐变遮罩 */}
               <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"></div>
               
               <div 
                 className="h-full w-full overflow-y-auto scrollbar-hide snap-y snap-mandatory py-28 flex flex-col items-center relative z-20"
                 onClick={() => setShowPicker(false)} // 点击滚轮区域的背景也可以退出
               >
                  {/* 5-90 分钟滚轮 */}
                  {Array.from({ length: 18 }, (_, i) => (i + 1) * 5).map(m => (
                    <div 
                      key={m} 
                      onClick={(e) => { e.stopPropagation(); handleTimeSelect(m); }}
                      className={`h-16 shrink-0 flex items-center justify-center snap-center text-4xl transition-all cursor-pointer hover:scale-110 
                        ${minutes === m ? 'font-bold text-white scale-125' : 'font-light text-white/10 hover:text-white/40'}
                      `}
                    >
                      {m}
                    </div>
                  ))}
               </div>

               {/* 底部渐变遮罩 */}
               <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10"></div>
            </div>
          </>
        )}
      </div>

      {/* 控制钮区 */}
      <div className="flex items-center gap-12">
        <button 
          onClick={() => setTimerActive(!timerActive)}
          className={`w-16 h-16 rounded-full backdrop-blur-3xl flex items-center justify-center transition-all duration-500 border active:scale-90
            ${timerActive 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300/80 hover:bg-amber-500/20' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300/80 hover:bg-emerald-500/20'}
          `}
        >
          <i className={`fa-solid ${timerActive ? 'fa-pause' : 'fa-play ml-1'} text-xl`}></i>
        </button>

        <button 
          onClick={() => { setTimerActive(false); setTimerLeft(timerMax); }}
          className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300/80 backdrop-blur-2xl flex items-center justify-center hover:bg-rose-500/20 transition-all active:scale-90"
        >
          <i className="fa-solid fa-stop text-sm"></i>
        </button>
      </div>
    </div>
  );
};
