import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export const ExamCountdownBanner: React.FC = () => {
  // SSC Board Examination Target Date (180 days countdown)
  const targetDate = new Date('2027-05-26T00:00:00+06:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 180,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 180, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      id="exam-countdown"
      className="relative overflow-hidden bg-[#0d1428]/95 dark:bg-[#070b18]/95 rounded-3xl p-5 sm:p-7 text-white shadow-soft border border-slate-700/60 backdrop-blur-xl transition-all"
    >
      {/* Decorative ambient background blur lights */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Information */}
        <div className="space-y-1.5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] text-white text-xs font-semibold border border-white/15 backdrop-blur-md">
            <Calendar className="w-3.5 h-3.5 text-brand-300" />
            SSC বোর্ড পরীক্ষা কাউন্টডাউন
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
            লক্ষ্য যখন জিপিএ-৫, প্রতিটি সেকেন্ড অমূল্য!
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            নিয়মিত রিভিশন ও অধ্যায়ভিত্তিক মডেল টেস্টই তোমাকে পৌঁছে দেবে তোমার কাঙ্ক্ষিত ফলাফলে।
          </p>
        </div>

        {/* Right Countdown Blocks with subtle glassmorphism blur matching site colors */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Days - Amber Accent */}
          <div className="bg-white/[0.07] backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px] shadow-sm hover:border-white/20 transition-all">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {timeLeft.days}
            </div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase">দিন</div>
          </div>

          <span className="text-lg font-bold text-slate-500 select-none">:</span>

          {/* Hours - Emerald Accent */}
          <div className="bg-white/[0.07] backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px] shadow-sm hover:border-white/20 transition-all">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase">ঘণ্টা</div>
          </div>

          <span className="text-lg font-bold text-slate-500 select-none">:</span>

          {/* Minutes - Sky Blue Accent */}
          <div className="bg-white/[0.07] backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px] shadow-sm hover:border-white/20 transition-all">
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase">মিনিট</div>
          </div>

          <span className="text-lg font-bold text-slate-500 select-none">:</span>

          {/* Seconds - Rose Coral Accent */}
          <div className="bg-white/[0.07] backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px] shadow-sm hover:border-white/20 transition-all">
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase">সেকেন্ড</div>
          </div>
        </div>

      </div>
    </div>
  );
};
