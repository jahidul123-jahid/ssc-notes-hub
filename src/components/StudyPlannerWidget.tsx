import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Target, Flame } from 'lucide-react';
import { StudyTask } from '../types';

const STORAGE_KEY = 'ssc_study_tasks_v1';

const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'task_1',
    title: 'পদার্থবিজ্ঞান ৩য় অধ্যায় (বল): সূত্র ও গাণিতিক সমস্যা রিভিশন',
    completed: true,
    subject: 'Physics',
    dueDate: new Date().toISOString()
  },
  {
    id: 'task_2',
    title: 'সাধারণ গণিত ত্রিকোণমিতি ৯.১ এর সৃজনশীল ২টি অনুশীলন',
    completed: false,
    subject: 'Mathematics',
    dueDate: new Date().toISOString()
  },
  {
    id: 'task_3',
    title: 'রসায়ন ৪র্থ অধ্যায় পর্যায় সারণির মৌলসমূহের যোজনী মুখস্থ করা',
    completed: false,
    subject: 'Chemistry',
    dueDate: new Date().toISOString()
  }
];

export const StudyPlannerWidget: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('General');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        setTasks(DEFAULT_TASKS);
      }
    } else {
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  const saveTasks = (updated: StudyTask[]) => {
    setTasks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: StudyTask = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      subject: newSubject,
      dueDate: new Date().toISOString()
    };

    saveTasks([...tasks, newTask]);
    setNewTitle('');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      {/* Title & Progress */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">দৈনিক পড়াশোনার প্ল্যানার</h3>
            <span className="text-[11px] text-slate-400">আজকের লক্ষ্য ও টাস্কলিস্ট</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-emerald-600">{progressPercent}% সম্পন্ন</span>
          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={addTask} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="আজকে কী পড়তে চাও? (যেমন: উচ্চতর গণিত স্থানাঙ্ক জ্যামিতি)..."
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
        />
        <button
          type="submit"
          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>যোগ করুন</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">আজকের জন্য কোনো টাস্ক যোগ করা হয়নি।</p>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-emerald-50/50 border-emerald-200/60 text-slate-500'
                  : 'bg-white border-slate-200/70 text-slate-800 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id || task.taskId || '')}
                className="flex items-center gap-2.5 flex-1 text-left min-w-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 hover:text-emerald-500 shrink-0" />
                )}
                <span className={`text-xs font-medium leading-relaxed truncate ${
                  task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                }`}>
                  {task.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => deleteTask(task.id || task.taskId || '')}
                className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
