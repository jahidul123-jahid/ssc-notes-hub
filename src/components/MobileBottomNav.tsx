import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, Landmark, FileQuestion, Timer } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide during active examination taking to prevent distraction and give 100% viewport to the exam
  if (location.pathname.startsWith('/exams/') && !location.pathname.includes('/result')) {
    return null;
  }

  const isHomeActive = location.pathname === '/';
  const isBoardActive = location.pathname.startsWith('/resources');
  const isQuizActive = location.pathname.startsWith('/exams');

  const handleTimerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById('exam-countdown');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-brand-500/50', 'transition-all');
        setTimeout(() => el.classList.remove('ring-4', 'ring-brand-500/50'), 2000);
      } else {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    } else {
      navigate('/#exam-countdown');
      setTimeout(() => {
        const el = document.getElementById('exam-countdown');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-end justify-around max-w-md mx-auto relative">
        {/* 1. হোম (Home) */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group ${
            isHomeActive
              ? 'text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 font-medium'
          }`}
        >
          <div className="relative p-1">
            <Home
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isHomeActive ? 'stroke-[2.5px]' : 'stroke-2'
              }`}
            />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">হোম</span>
        </Link>

        {/* 2. বোর্ড ২০২৫ (Board 2025) */}
        <Link
          to="/resources?category=board_question"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group relative ${
            isBoardActive
              ? 'text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 font-medium'
          }`}
        >
          <div className="relative p-1">
            <Landmark
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isBoardActive ? 'stroke-[2.5px]' : 'stroke-2'
              }`}
            />
            {/* Purple notification badge matching reference */}
            <span className="absolute -top-1 -right-2.5 bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs">
              ১২
            </span>
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5 whitespace-nowrap">
            বোর্ড ২০২৫
          </span>
        </Link>

        {/* 3. কুইজ টেস্ট (Quiz Test - Elevated Center Button) */}
        <Link
          to="/exams"
          className="flex flex-col items-center justify-center flex-1 -mt-4 group z-10"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform group-hover:scale-105 active:scale-95 ${
              isQuizActive
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 dark:ring-emerald-950 shadow-emerald-500/30'
                : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400/80 shadow-md'
            }`}
          >
            <FileQuestion className="w-6 h-6 stroke-[2.2px]" />
          </div>
          <span
            className={`text-[11px] leading-tight font-bold mt-1 tracking-tight ${
              isQuizActive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            কুইজ টেস্ট
          </span>
        </Link>

        {/* 4. টাইমার (Timer) */}
        <button
          onClick={handleTimerClick}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group text-slate-500 hover:text-slate-900 dark:text-slate-400 font-medium"
        >
          <div className="relative p-1">
            <Timer className="w-5 h-5 transition-transform group-hover:scale-110 group-active:rotate-45 stroke-2" />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">টাইমার</span>
        </button>

        {/* 5. WhatsApp */}
        <a
          href="https://wa.me/8801886188485?text=Hello%20SSC%20Note%20Box"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all group text-[#25D366] hover:text-[#20ba59] font-medium"
        >
          <div className="relative p-1">
            {/* SVG WhatsApp Official Icon */}
            <svg
              className="w-5 h-5 transition-transform group-hover:scale-110 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 2c-5.514 0-9.999 4.486-9.999 10 0 1.761.458 3.479 1.328 4.996l-1.36 4.974 5.09-1.336c1.463.8 3.109 1.226 4.796 1.226 5.514 0 10-4.486 10-10 0-5.514-4.486-10-10.001-10zm5.836 14.186c-.244.686-1.42 1.323-1.954 1.367-.497.042-1.127.065-3.238-.809-2.261-.937-3.714-3.239-3.827-3.389-.112-.15-9.15e-4-.302.012-.455.011-.137.07-.327.106-.481.042-.18.069-.269.106-.451.037-.183.018-.344-.009-.498-.027-.154-.244-.588-.335-.807-.091-.219-.183-.189-.252-.193l-.216-.004c-.075 0-.197.027-.3.139-.104.113-.396.388-.396.945s.406 1.096.462 1.171c.056.075.792 1.21 1.92 1.696 1.127.486 1.545.426 1.823.399.278-.027.893-.365 1.019-.718.126-.353.126-.656.089-.718-.037-.062-.137-.099-.288-.174z" />
            </svg>
          </div>
          <span className="text-[11px] leading-tight font-semibold mt-0.5">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
};
