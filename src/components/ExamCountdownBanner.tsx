import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles, Flame } from 'lucide-react';

export const ExamCountdownBanner: React.FC = () => {
  // SSC Examination Target Date (180 days remaining)
  const targetDate = new Date('2027-05-26T00:00:00+06:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
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
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg border border-indigo-900/40">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Information */}
        <div className="space-y-1.5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            SSC বোর্ড পরীক্ষা কাউন্টডাউন
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            লক্ষ্য যখন জিপিএ-৫, প্রতিটি সেকেন্ড অমূল্য!
          </h3>
          <p className="text-xs text-slate-300">
            নিয়মিত রিভিশন ও অধ্যায়ভিত্তিক মডেল টেস্টই তোমাকে পৌঁছে দেবে তোমার কাঙ্ক্ষিত ফলাফলে।
          </p>
        </div>

        {/* Right Countdown Blocks */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px]">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{timeLeft.days}</div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase">দিন</div>
          </div>
          <span className="text-lg font-bold text-white/40">:</span>
          <div className="bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px]">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase">ঘণ্টা</div>
          </div>
          <span className="text-lg font-bold text-white/40">:</span>
          <div className="bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px]">
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase">মিনিট</div>
          </div>
          <span className="text-lg font-bold text-white/40">:</span>
          <div className="bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[62px] sm:min-w-[70px]">
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
