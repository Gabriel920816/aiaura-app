
import React, { useState } from 'react';
import { GmailMessage } from '../../types';

const MOCK_MAILS: GmailMessage[] = [
  { id: '1', sender: 'Aura Project', subject: 'Updated Roadmap 2025', snippet: 'The new calendar integration is now live for all alpha users...', time: '10:45 AM', unread: true },
  { id: '2', sender: 'Google Cloud', subject: 'Monthly Usage Report', snippet: 'Your API consumption for Gemini 3.0 Pro has decreased by 12%...', time: '08:30 AM', unread: true },
  { id: '3', sender: 'Subway Rewards', subject: 'Your points are expiring!', snippet: 'Don\'t miss out on your free cookie! Visit any store today...', time: 'Yesterday', unread: false }
];

const GmailWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mails, setMails] = useState<GmailMessage[]>(MOCK_MAILS);
  const unreadCount = mails.filter(m => m.unread).length;

  return (
    <div className="relative overflow-visible">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`ios-glass w-10 h-10 flex items-center justify-center transition-all relative ${isOpen ? 'bg-white/20 border-white/40 text-white' : 'opacity-60 hover:opacity-100'}`}
      >
        <i className="fa-solid fa-envelope text-[10px]"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg border border-white/20">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-72 ios-glass z-[1000] shadow-2xl animate-in fade-in slide-in-from-top-2 border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Gmail Inbox</span>
            <button className="text-[8px] font-black uppercase text-indigo-400 hover:text-white transition-all">Mark all read</button>
          </div>
          
          <div className="max-h-80 overflow-y-auto scrollbar-hide divide-y divide-white/5">
            {mails.map(mail => (
              <div 
                key={mail.id} 
                className={`p-4 hover:bg-white/5 transition-all cursor-pointer group ${mail.unread ? 'bg-white/5' : ''}`}
                onClick={() => {
                  setMails(mails.map(m => m.id === mail.id ? { ...m, unread: false } : m));
                }}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-[11px] font-black truncate max-w-[140px] ${mail.unread ? 'text-white' : 'text-white/40'}`}>
                    {mail.sender}
                  </span>
                  <span className="text-[8px] font-bold text-white/20 uppercase">{mail.time}</span>
                </div>
                <p className={`text-[10px] font-bold truncate mb-1 ${mail.unread ? 'text-indigo-200' : 'text-white/30'}`}>
                  {mail.subject}
                </p>
                <p className="text-[9px] text-white/20 line-clamp-2 leading-relaxed">
                  {mail.snippet}
                </p>
              </div>
            ))}
          </div>

          <a 
            href="https://mail.google.com" 
            target="_blank" 
            rel="noreferrer"
            className="p-3 bg-white/5 border-t border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all group"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white">View Full Inbox</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[8px] text-white/20"></i>
          </a>
        </div>
      )}
    </div>
  );
};

export default GmailWidget;
