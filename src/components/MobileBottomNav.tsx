import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, Trophy, LayoutDashboard, GraduationCap } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  // Hide during active examination taking to prevent distraction and give 100% viewport to the exam
  if (location.pathname.startsWith('/exams/') && !location.pathname.includes('/result')) {
    return null;
  }

  const isHomeActive = location.pathname === '/';
  const isResourcesActive = location.pathname.startsWith('/resources');
  const isExamActive = location.pathname.startsWith('/exams');
  const isLeaderboardActive = location.pathname.startsWith('/leaderboard');
  const isDashboardActive = location.pathname.startsWith('/dashboard');

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-sky-100 dark:border-sky-950/60 shadow-[0_-4px_24px_rgba(14,165,233,0.12)] px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-end justify-around max-w-md mx-auto relative">
        {/* 1. হোম (Home) */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group ${
            isHomeActive
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isHomeActive ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400' : ''
            }`}
          >
            <Home
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isHomeActive ? 'stroke-[2.4px]' : 'stroke-2'
              }`}
            />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">হোম</span>
        </Link>

        {/* 2. রিসোর্স (Resources) */}
        <Link
          to="/resources"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group ${
            isResourcesActive
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isResourcesActive ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400' : ''
            }`}
          >
            <BookOpen
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isResourcesActive ? 'stroke-[2.4px]' : 'stroke-2'
              }`}
            />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">রিসোর্স</span>
        </Link>

        {/* 3. পরীক্ষা (Exam - Elevated Center Button in Light Blue Theme) */}
        <Link
          to="/exams"
          className="flex flex-col items-center justify-center flex-1 -mt-4 group z-10"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform group-hover:scale-105 active:scale-95 ${
              isExamActive
                ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white ring-4 ring-sky-200 dark:ring-sky-950 shadow-sky-500/35'
                : 'bg-sky-500 hover:bg-sky-600 text-white border-2 border-white dark:border-slate-900 shadow-md shadow-sky-500/25'
            }`}
          >
            <GraduationCap className="w-6 h-6 stroke-[2.2px]" />
          </div>
          <span className="text-[11px] leading-tight font-bold mt-1 text-sky-600 dark:text-sky-400 tracking-tight">
            পরীক্ষা
          </span>
        </Link>

        {/* 4. লিডারবোর্ড (Leaderboard) */}
        <Link
          to="/leaderboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group ${
            isLeaderboardActive
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isLeaderboardActive ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400' : ''
            }`}
          >
            <Trophy
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isLeaderboardActive ? 'stroke-[2.4px]' : 'stroke-2'
              }`}
            />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">লিডারবোর্ড</span>
        </Link>

        {/* 5. ড্যাশবোর্ড (Dashboard) */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group ${
            isDashboardActive
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isDashboardActive ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400' : ''
            }`}
          >
            <LayoutDashboard
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isDashboardActive ? 'stroke-[2.4px]' : 'stroke-2'
              }`}
            />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">ড্যাশবোর্ড</span>
        </Link>
      </div>
    </nav>
  );
};
