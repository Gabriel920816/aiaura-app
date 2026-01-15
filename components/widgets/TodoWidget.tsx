
import React, { useState, useMemo } from 'react';
import { TodoItem } from '../../types';

interface TodoWidgetProps {
  todos: TodoItem[];
  setTodos: (t: TodoItem[]) => void;
  selectedDate: Date;
}

const TodoWidget: React.FC<TodoWidgetProps> = ({ todos, setTodos, selectedDate }) => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const selectedDateStr = useMemo(() => 
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
  [selectedDate]);

  const systemTodayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const isViewingToday = selectedDateStr === systemTodayStr;

  // 基础过滤：获取当前日期相关的所有任务（包含活跃的延期任务）
  const contextTodos = useMemo(() => {
    return todos.filter(t => {
      // 1. 属于选定日期的任务
      if (t.date === selectedDateStr) return true;
      // 2. 如果正在查看今天，包含所有未完成的过往任务（Rollover）
      if (isViewingToday && t.date < systemTodayStr && !t.completed) return true;
      return false;
    });
  }, [todos, selectedDateStr, systemTodayStr, isViewingToday]);

  // 计算活跃任务数（待办数）
  const activeCount = useMemo(() => 
    contextTodos.filter(t => !t.completed).length, 
  [contextTodos]);

  // 最终显示的过滤列表（基于当前选中的 Tab）
  const displayTodos = useMemo(() => {
    return contextTodos.filter(t => {
      if (activeTab === 'active') return !t.completed;
      if (activeTab === 'completed') return t.completed;
      return true;
    });
  }, [contextTodos, activeTab]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{ 
      id: Date.now().toString(), 
      text: input, 
      completed: false, 
      priority: 'medium',
      date: selectedDateStr 
    }, ...todos]);
    setInput('');
  };

  const toggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTodos(todos.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        // 如果是今天完成的过往任务，将其归档到今天
        const nextDate = (isViewingToday && nextCompleted) ? systemTodayStr : t.date;
        return { ...t, completed: nextCompleted, date: nextDate };
      }
      return t;
    }));
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTodos(todos.filter(t => t.id !== id));
  };

  const updatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(todos.map(t => t.id === id ? { ...t, priority } : t));
  };

  const updateText = (id: string, text: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, text } : t));
  };

  const PriorityIcon = ({ level }: { level: string }) => {
    switch (level) {
      case 'high': return <span className="text-rose-400 font-black tracking-tighter mr-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">!!!</span>;
      case 'medium': return <span className="text-orange-400 font-black tracking-tighter mr-2 opacity-80">!!</span>;
      default: return <span className="text-emerald-400 font-black tracking-tighter mr-2 opacity-60">!</span>;
    }
  };

  return (
    <div className="ios-glass p-0 h-full flex flex-col min-h-0 overflow-hidden relative">
      <div className={`flex flex-col h-full transition-all duration-100 ${editingTodo ? 'content-blur-active' : ''}`}>
        <div className="px-6 py-4 border-b border-white/10 shrink-0 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
            {isViewingToday ? 'Today\'s Focus' : `Tasks for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </h3>
        </div>

        <div className="px-4 py-3 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex relative">
            <div 
              className="absolute top-1 bottom-1 bg-white/15 rounded-xl transition-all duration-300 ease-out z-0" 
              style={{ 
                width: 'calc(33.33% - 4px)', 
                left: activeTab === 'all' ? '4px' : activeTab === 'active' ? '33.33%' : '66.66%' 
              }}
            ></div>
            
            <button 
              onClick={() => setActiveTab('all')} 
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors flex items-center justify-center gap-2 ${activeTab === 'all' ? 'text-white' : 'text-white/30'}`}
            >
              All
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[8px] digital-number min-w-[14px] text-center">
                  {activeCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('active')} 
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors flex items-center justify-center gap-2 ${activeTab === 'active' ? 'text-white' : 'text-white/30'}`}
            >
              To Do
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[8px] digital-number min-w-[14px] text-center">
                  {activeCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('completed')} 
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'completed' ? 'text-white' : 'text-white/30'}`}
            >
              Done
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide min-h-0">
          {displayTodos.map(todo => {
            const isRollover = todo.date < selectedDateStr && !todo.completed;
            return (
              <div 
                key={todo.id} 
                onClick={() => setEditingTodo(todo)}
                className={`group flex items-center justify-between gap-2 py-2.5 px-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
                  ${todo.completed ? 'bg-transparent border-white/5 opacity-40' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
                  ${isRollover ? '!border-indigo-500/30' : ''}`}
              >
                <div className="flex items-center min-w-0 flex-1">
                    {isRollover && <i className="fa-solid fa-clock-rotate-left text-[9px] text-indigo-400 mr-2 opacity-60"></i>}
                    <PriorityIcon level={todo.priority} />
                    <span className={`text-[13px] font-bold tracking-tight transition-all truncate text-white/90 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                      {todo.text}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => remove(todo.id, e)} className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-rose-500/30 transition-all"><i className="fa-solid fa-trash-can text-[9px]"></i></button>
                    <div onClick={(e) => toggle(todo.id, e)} className={`w-6 h-6 rounded-lg border-[1.5px] flex items-center justify-center transition-all ${todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20 bg-black/5 hover:border-white/50'}`}>{todo.completed && <i className="fa-solid fa-check text-[9px]"></i>}</div>
                </div>
              </div>
            );
          })}
          {displayTodos.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-20">
                <i className="fa-solid fa-calendar-check text-2xl mb-3"></i>
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">No tasks scheduled</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <form onSubmit={add}><input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={`Add task...`} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[11px] outline-none focus:bg-white/10 focus:border-white/30 transition-all placeholder:opacity-30 text-white font-bold" /></form>
        </div>
      </div>

      {editingTodo && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center p-4 bg-black/20 animate-in fade-in duration-100" onClick={() => setEditingTodo(null)}>
          <div className="w-full max-w-[280px] heavy-glass border-white/20 p-6 rounded-[2.2rem] flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-100 relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
               <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Edit Task</h4>
               <button onClick={() => setEditingTodo(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all border border-white/10 hover:bg-white/10"><i className="fa-solid fa-xmark text-xs"></i></button>
            </div>
            
            <div className="space-y-1">
              <input 
                autoFocus 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base font-bold text-white outline-none w-full focus:bg-white/10 focus:border-white/30 transition-all" 
                value={editingTodo.text} 
                onChange={(e) => { updateText(editingTodo.id, e.target.value); setEditingTodo({...editingTodo, text: e.target.value}); }} 
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button 
                    key={p} 
                    onClick={() => { updatePriority(editingTodo.id, p); setEditingTodo({...editingTodo, priority: p}); }} 
                    className={`py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${editingTodo.priority === p ? (p === 'high' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : p === 'medium' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300') : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10 hover:text-white/60'}`}
                  >
                    {p}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoWidget;
