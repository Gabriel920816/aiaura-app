
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

  // 核心逻辑：智能过滤与自动滚动 (Rollover)
  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      // 1. 如果任务日期匹配选择日期，始终显示（无论完成与否）
      if (t.date === selectedDateStr) {
        if (activeTab === 'active') return !t.completed;
        if (activeTab === 'completed') return t.completed;
        return true;
      }

      // 2. Rollover 机制：如果正在查看“今天”，显示所有“过去未完成”的任务
      if (isViewingToday && t.date < systemTodayStr && !t.completed) {
        if (activeTab === 'completed') return false; // 过去任务此时肯定是未完成的
        return true;
      }

      return false;
    });
  }, [todos, selectedDateStr, systemTodayStr, isViewingToday, activeTab]);

  const stats = useMemo(() => ({
    all: filteredTodos.length,
    active: filteredTodos.filter(t => !t.completed).length,
    completed: filteredTodos.filter(t => t.completed).length
  }), [filteredTodos]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{ 
      id: Date.now().toString(), 
      text: input, 
      completed: false, 
      priority: 'medium',
      date: selectedDateStr // 绑定到当前选择的日期
    }, ...todos]);
    setInput('');
  };

  const toggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setTodos(todos.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        // 核心：如果是在今天完成过去的遗留任务，将任务日期更新为今天，实现“永久记录到对应日期内”
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
      <div className="px-6 py-4 border-b border-white/10 shrink-0 flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
            {isViewingToday ? 'Today\'s Focus' : `Tasks for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </h3>
        </div>
        <span className="text-[10px] font-black digital-number opacity-30">{stats.active} ACTIVE</span>
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
          
          <button onClick={() => setActiveTab('all')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'all' ? 'text-white' : 'text-white/30'}`}>All</button>
          <button onClick={() => setActiveTab('active')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'active' ? 'text-white' : 'text-white/30'}`}>To Do</button>
          <button onClick={() => setActiveTab('completed')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'completed' ? 'text-white' : 'text-white/30'}`}>Done</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide min-h-0">
        {filteredTodos.length > 0 ? filteredTodos.map(todo => {
          const isRollover = todo.date < selectedDateStr && !todo.completed;
          return (
            <div 
              key={todo.id} 
              onClick={() => setEditingTodo(todo)}
              className={`group flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                ${todo.completed ? 'bg-transparent border-white/5 opacity-40' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
                ${isRollover ? '!border-indigo-500/30' : ''}`}
            >
               <div className="flex items-center min-w-0 flex-1">
                  {isRollover && <i className="fa-solid fa-clock-rotate-left text-[10px] text-indigo-400 mr-2 opacity-60"></i>}
                  <PriorityIcon level={todo.priority} />
                  <span className={`text-sm font-semibold tracking-tight transition-all truncate text-white ${todo.completed ? 'line-through opacity-50' : ''}`}>
                    {todo.text}
                  </span>
               </div>

               <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={(e) => remove(todo.id, e)}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-rose-500/30 transition-all"
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                  <div 
                    onClick={(e) => toggle(todo.id, e)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all 
                      ${todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20 bg-black/10 hover:border-white/50'}`}
                  >
                    {todo.completed && <i className="fa-solid fa-check text-[10px]"></i>}
                  </div>
               </div>
            </div>
          );
        }) : (
          <div className="py-12 flex flex-col items-center justify-center opacity-20">
              <i className="fa-solid fa-calendar-check text-3xl mb-3"></i>
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">No tasks scheduled</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <form onSubmit={add}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Add task for ${isViewingToday ? 'today' : 'this date'}...`}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none focus:bg-white/10 focus:border-white/30 transition-all placeholder:opacity-30 text-white font-bold"
          />
        </form>
      </div>

      {editingTodo && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in" onClick={() => setEditingTodo(null)}>
          <div className="w-full ios-glass border-white/20 p-8 flex flex-col gap-6 shadow-2xl scale-in-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">Edit Task</h4>
               <button onClick={() => setEditingTodo(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><i className="fa-solid fa-xmark text-xs"></i></button>
            </div>
            
            <input 
              autoFocus
              className="bg-transparent border-none text-xl font-black text-white outline-none w-full"
              value={editingTodo.text}
              onChange={(e) => {
                updateText(editingTodo.id, e.target.value);
                setEditingTodo({...editingTodo, text: e.target.value});
              }}
            />

            <div className="space-y-3">
               <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Priority</span>
               <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button 
                      key={p}
                      onClick={() => {
                        updatePriority(editingTodo.id, p);
                        setEditingTodo({...editingTodo, priority: p});
                      }}
                      className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all
                        ${editingTodo.priority === p 
                          ? (p === 'high' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : p === 'medium' ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300') 
                          : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                    >
                      {p}
                    </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={() => setEditingTodo(null)}
              className="w-full py-4 ios-glass bg-white/10 border-white/30 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg active:scale-95 transition-all mt-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoWidget;
