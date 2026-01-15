
import React, { ReactNode } from 'react';

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

const StandardModal: React.FC<StandardModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "440px" 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/30 backdrop-blur-[10px] animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full ios-glass-standard p-8 md:p-10 flex flex-col gap-6 relative overflow-visible max-h-[92vh] overflow-y-auto scrollbar-hide shadow-2xl"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button - Clean & Integrated */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all z-[10] border border-white/10 hover:bg-white/10 active:scale-95"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Title Header */}
        {title && (
          <div className="mb-2 shrink-0">
            <h2 className="text-[1.8rem] font-black text-white tracking-tighter leading-none">{title}</h2>
            <div className="h-0.5 w-16 bg-white/20 mt-4 rounded-full"></div>
          </div>
        )}

        {/* Content Area */}
        <div className="relative z-[1] !overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StandardModal;
