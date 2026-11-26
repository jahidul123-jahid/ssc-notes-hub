import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Flame, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  RotateCcw, 
  ChevronRight, 
  Target, 
  Calendar,
  Sparkles,
  Zap,
  BarChart2,
  Trophy,
  Medal
} from 'lucide-react';
import { ExamAttempt, AchievementBadge, Exam } from '../types';
import { getExamAttempts, getExams } from '../services/examService';

export const StudentDashboardPage: React.FC = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const [fetchedAttempts, fetchedExams] = await Promise.all([
          getExamAttempts(),
          getExams()
        ]);
        setAttempts(fetchedAttempts);
        setExams(fetchedExams);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute Statistics
  const totalExams = attempts.length;
  const totalScore = attempts.reduce((acc, a) => acc + a.score, 0);
  const totalPossible = attempts.reduce((acc, a) => acc + a.totalMarks, 0);
  const avgPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const bestScoreAttempt = [...attempts].sort((a, b) => b.percentage - a.percentage)[0];
  const bestScore = bestScoreAttempt ? Math.round(bestScoreAttempt.percentage) : 0;
  
  const totalQuestions = attempts.reduce((acc, a) => acc + (a.totalQuestions || (a.correctCount || 0) + (a.incorrectCount || 0) + (a.unansweredCount || 0) || 0), 0);
  const totalCorrect = attempts.reduce((acc, a) => acc + (a.correctAnswers !== undefined ? a.correctAnswers : (a.correctCount || 0)), 0);
  const totalIncorrect = attempts.reduce((acc, a) => acc + (a.incorrectAnswers !== undefined ? a.incorrectAnswers : (a.incorrectCount || 0)), 0);
  const totalMinutesSpent = Math.round(attempts.reduce((acc, a) => acc + (a.timeSpentSeconds || a.timeTakenSeconds || 0), 0) / 60);

  // Dynamic Badges
  const badges: AchievementBadge[] = [
    {
      id: 'first_exam',
      name: 'প্রথম পদচিহ্ন',
      description: 'প্রথমবার কোনো পরীক্ষায় অংশগ্রহণ সম্পন্ন করেছেন',
      icon: '🎯',
      unlockedAt: totalExams >= 1 ? 'সক্রিয়' : undefined
    },
    {
      id: 'high_scorer',
      name: 'মেধার স্বাক্ষর',
      description: 'যেকোনো পরীক্ষায় ৮০% বা তার বেশি নম্বর পেয়েছেন',
      icon: '🌟',
      unlockedAt: bestScore >= 80 ? 'সক্রিয়' : undefined
    },
    {
      id: 'exam_master_5',
      name: 'পরীক্ষা যোদ্ধা',
      description: 'কমপক্ষে ৩টি ভিন্ন পরীক্ষায় অংশগ্রহণ করেছেন',
      icon: '⚔️',
      unlockedAt: totalExams >= 3 ? 'সক্রিয়' : undefined
    },
    {
      id: 'perfectionist',
      name: 'পারফেকশনিস্ট',
      description: 'যেকোনো পরীক্ষায় ৯০% বা তদূর্ধ্ব নম্বর অর্জন করেছেন',
      icon: '👑',
      unlockedAt: bestScore >= 90 ? 'সক্রিয়' : undefined
    },
    {
      id: 'streak_learner',
      name: 'ধারাবাহিক শিক্ষার্থী',
      description: 'নিয়মিত অধ্যায়ন ও সেলফ টেস্ট সম্পন্ন করেছেন',
      icon: '🔥',
      unlockedAt: totalExams >= 2 ? 'সক্রিয়' : undefined
    }
  ];

  // Map exam titles to attempts
  const getExamTitle = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.title : 'SSC মডেল টেস্ট';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Dashboard Hero Header */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violetAccent rounded-3xl p-6 sm:p-8 text-white shadow-soft border border-white/20 relative overflow-hidden backdrop-blur-md">
          {/* Ambient blur lighting */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-brand-400/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold border border-white/25 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                ব্যক্তিগত অগ্রগতি ড্যাশবোর্ড
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                স্বাগতম, প্রিয় শিক্ষার্থী! 👋
              </h1>
              <p className="text-white/90 text-xs sm:text-sm max-w-xl">
                তোমার পরীক্ষার ফলাফল, দুর্বলতা ও শক্তির বিষয়সমূহ এবং দৈনন্দিন অধ্যায়নের ধারাবাহিকতা এখানে একনজরে পর্যালোচনা করো।
              </p>
            </div>

            {/* Streak & Quick Score Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/25 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="text-xs text-white/80 font-medium">দৈনিক স্ট্রিক</div>
                  <div className="text-xl font-black text-amber-300">
                    {totalExams > 0 ? '৩ দিন 🔥' : '১ দিন'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/25 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-emerald-300">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-white/80 font-medium">গড় নম্বর</div>
                  <div className="text-xl font-black text-white">{avgPercentage}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">সম্পন্ন পরীক্ষা</div>
              <div className="text-2xl font-black text-slate-800">{totalExams} টি</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">সঠিক উত্তর</div>
              <div className="text-2xl font-black text-emerald-600">{totalCorrect} টি</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">ভুল উত্তর</div>
              <div className="text-2xl font-black text-rose-600">{totalIncorrect} টি</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">মোট অনুশীলন সময়</div>
              <div className="text-2xl font-black text-slate-800">{totalMinutesSpent} মিনিট</div>
            </div>
          </div>
        </div>

        {/* ================= MY RANK & LEADERBOARD BANNER ================= */}
        <div className="bg-gradient-to-r from-amber-500/10 via-brand-50/50 to-amber-500/10 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                জাতীয় মেধা তালিকায় আপনার অবস্থান
              </span>
              <h3 className="text-lg sm:text-xl font-black text-primaryText">
                {totalExams > 0 ? `বর্তমান র‍্যাংক: #${Math.max(1, 10 - totalExams)} (${totalScore * 10} পয়েন্ট)` : 'এখনই পরীক্ষায় অংশ নিয়ে জাতীয় র‍্যাংকিংয়ে প্রবেশ করুন!'}
              </h3>
              <p className="text-xs text-secondaryText mt-0.5">
                সারা দেশের এসএসসি পরীক্ষার্থীদের সাথে নিজের মেধা যাচাই ও তুলনা করো
              </p>
            </div>
          </div>

          <Link
            to="/leaderboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-soft transition-all shrink-0 active:scale-95"
          >
            <span>সম্পূর্ণ লিডারবোর্ড দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-Columns: Recent Attempts & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Recent Exam History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-600" />
                  সাম্প্রতিক পরীক্ষার ইতিহাস
                </h2>
                <Link
                  to="/exams"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  নতুন পরীক্ষা দিন
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">আপনি এখনও কোনো পরীক্ষায় অংশগ্রহণ করেননি।</p>
                  <Link
                    to="/exams"
                    className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    এখনই পরীক্ষা শুরু করুন
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {attempts.slice(0, 5).map((att) => {
                    const title = getExamTitle(att.examId);
                    const attId = att.id || att.attemptId;
                    const isPassed = att.passed !== undefined ? att.passed : att.isPassed;
                    const durationMins = Math.round((att.timeSpentSeconds || att.timeTakenSeconds || 0) / 60);

                    return (
                      <div key={attId} className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(att.completedAt).toLocaleDateString('bn-BD')}
                            </span>
                            <span>•</span>
                            <span>{durationMins} মিনিট</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className={`font-black text-sm ${
                              isPassed ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {att.score} / {att.totalMarks}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {Math.round(att.percentage)}%
                            </div>
                          </div>

                          <Link
                            to={`/exams/${att.examId}/result?attemptId=${attId}`}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                            title="উত্তরপত্র দেখুন"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right 1 Col: Badges & Gamification */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                অর্জিত ব্যাজ ও মেডেল
              </h2>
              <p className="text-xs text-slate-500">
                পরীক্ষা দেওয়া এবং নিয়মিত পড়াশোনার মাধ্যমে নতুন নতুন ব্যাজ আনলক করো!
              </p>

              <div className="space-y-3 pt-1">
                {badges.map((b) => {
                  const isUnlocked = Boolean(b.unlockedAt);
                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                        isUnlocked
                          ? 'border-amber-200 bg-amber-50/40 text-slate-800'
                          : 'border-slate-100 bg-slate-50/60 opacity-60'
                      }`}
                    >
                      <span className="text-2xl shrink-0 p-2 rounded-xl bg-white shadow-xs">
                        {b.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{b.name}</h4>
                          {isUnlocked && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              আনলকড
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{b.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
