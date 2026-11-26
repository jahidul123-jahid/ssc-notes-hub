import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Star, 
  Filter, 
  ChevronRight, 
  Search, 
  UserCheck, 
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';
import { examService } from '../services/examService';
import { ExamAttempt } from '../types';

export interface LeaderboardStudent {
  rank: number;
  studentId: string;
  name: string;
  schoolName: string;
  avatar: string;
  examsCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  avgScore: number;
  totalPoints: number;
  badge: 'gold' | 'silver' | 'bronze' | 'top_10' | 'scholar';
  streakDays: number;
  bestSubject: string;
}

const DEFAULT_TOP_STUDENTS: LeaderboardStudent[] = [
  {
    rank: 1,
    studentId: 'st-01',
    name: 'রাফিদ হাসান',
    schoolName: 'মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 42,
    totalQuestions: 1260,
    correctAnswers: 1210,
    avgScore: 28.8,
    totalPoints: 1210,
    badge: 'gold',
    streakDays: 24,
    bestSubject: 'পদার্থবিজ্ঞান ও রসায়ন'
  },
  {
    rank: 2,
    studentId: 'st-02',
    name: 'তাসনিম তাবাসসুম',
    schoolName: 'ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 39,
    totalQuestions: 1170,
    correctAnswers: 1115,
    avgScore: 28.5,
    totalPoints: 1115,
    badge: 'silver',
    streakDays: 19,
    bestSubject: 'জীববিজ্ঞান ও গণিত'
  },
  {
    rank: 3,
    studentId: 'st-03',
    name: 'আরাফাত রহমান',
    schoolName: 'রাজউক উত্তরা মডেল কলেজ',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 36,
    totalQuestions: 1080,
    correctAnswers: 1020,
    avgScore: 28.3,
    totalPoints: 1020,
    badge: 'bronze',
    streakDays: 15,
    bestSubject: 'উচ্চতর গণিত'
  },
  {
    rank: 4,
    studentId: 'st-04',
    name: 'সাদিয়া ইসলাম',
    schoolName: 'হলি ক্রস বালিকা উচ্চ বিদ্যালয়',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 32,
    totalQuestions: 960,
    correctAnswers: 890,
    avgScore: 27.8,
    totalPoints: 890,
    badge: 'top_10',
    streakDays: 12,
    bestSubject: 'পদার্থবিজ্ঞান'
  },
  {
    rank: 5,
    studentId: 'st-05',
    name: 'মাহমুদুল হক তামিম',
    schoolName: 'চট্টগ্রাম কলেজিয়েট স্কুল',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 29,
    totalQuestions: 870,
    correctAnswers: 812,
    avgScore: 28.0,
    totalPoints: 812,
    badge: 'top_10',
    streakDays: 10,
    bestSubject: 'রসায়ন'
  },
  {
    rank: 6,
    studentId: 'st-06',
    name: 'নুসরাত জাহান মিম',
    schoolName: 'খুলনা জিলা স্কুল',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 25,
    totalQuestions: 750,
    correctAnswers: 695,
    avgScore: 27.8,
    totalPoints: 695,
    badge: 'top_10',
    streakDays: 8,
    bestSubject: 'সাধারণ গণিত'
  },
  {
    rank: 7,
    studentId: 'st-07',
    name: 'ফারহান আহমেদ',
    schoolName: 'সিলেট সরকারি পাইলট উচ্চ বিদ্যালয়',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 22,
    totalQuestions: 660,
    correctAnswers: 610,
    avgScore: 27.7,
    totalPoints: 610,
    badge: 'scholar',
    streakDays: 6,
    bestSubject: 'বাংলাদেশ ও বিশ্বপরিচয়'
  },
  {
    rank: 8,
    studentId: 'st-08',
    name: 'ইশরাত জাহান',
    schoolName: 'বরিশাল জিলা স্কুল',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150',
    examsCompleted: 19,
    totalQuestions: 570,
    correctAnswers: 525,
    avgScore: 27.6,
    totalPoints: 525,
    badge: 'scholar',
    streakDays: 5,
    bestSubject: 'তথ্য ও যোগাযোগ প্রযুক্তি'
  }
];

export const LeaderboardPage: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<'overall' | 'weekly' | 'monthly'>('overall');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<LeaderboardStudent[]>(DEFAULT_TOP_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardStudent | null>(null);
  const [userRank, setUserRank] = useState<{ rank: number; points: number } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Merge real student attempts from localStorage into leaderboard
    const loadRealUserStats = async () => {
      try {
        const attempts: ExamAttempt[] = await examService.getExamAttempts();
        if (attempts.length > 0) {
          const totalExams = attempts.length;
          const totalScore = attempts.reduce((acc, a) => acc + (a.score || 0), 0);
          const totalCorrect = attempts.reduce((acc, a) => acc + (a.correctAnswers || a.correctCount || 0), 0);
          const totalQuestions = attempts.reduce((acc, a) => acc + (a.totalQuestions || 30), 0);
          const avgScore = Number((totalScore / totalExams).toFixed(1));

          // If current student has attempts, integrate them into the ranking
          const currentStudent: LeaderboardStudent = {
            rank: 9,
            studentId: 'current-user',
            name: 'আপনি (Current Student)',
            schoolName: 'SSC পরীক্ষার্থী ২০২৭',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            examsCompleted: totalExams,
            totalQuestions,
            correctAnswers: totalCorrect,
            avgScore,
            totalPoints: Math.round(totalScore * 10),
            badge: 'scholar',
            streakDays: Math.min(14, totalExams),
            bestSubject: attempts[0]?.subjectId || 'পদার্থবিজ্ঞান'
          };

          const combined = [...DEFAULT_TOP_STUDENTS, currentStudent]
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((s, idx) => ({ ...s, rank: idx + 1 }));

          setStudents(combined);
          const foundMe = combined.find(s => s.studentId === 'current-user');
          if (foundMe) {
            setUserRank({ rank: foundMe.rank, points: foundMe.totalPoints });
          }
        }
      } catch {
        // fallback
      }
    };
    loadRealUserStats();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterSubject !== 'all' && !s.bestSubject.toLowerCase().includes(filterSubject.toLowerCase())) {
      return false;
    }
    return true;
  });

  const top1 = filteredStudents.find(s => s.rank === 1) || students[0];
  const top2 = filteredStudents.find(s => s.rank === 2) || students[1];
  const top3 = filteredStudents.find(s => s.rank === 3) || students[2];

  return (
    <div className="min-h-screen bg-slate-100/60 py-8 px-3 sm:px-6 lg:px-8 space-y-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= PAGE HERO HEADER ================= */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-indigo-600 to-violetAccent rounded-3xl p-6 sm:p-10 text-white shadow-soft border border-white/20 backdrop-blur-md">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/25 backdrop-blur-md">
                <Trophy className="w-4 h-4 text-amber-300" />
                SSC জাতীয় মেধা তালিকা ও লিডারবোর্ড
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                সেরা শিক্ষার্থীদের সাথে প্রতিযোগিতা করো
              </h1>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                প্রতিটি অধ্যায়ভিত্তিক ৩০টি বহুনির্বাচনী পরীক্ষায় অংশগ্রহণ করে পয়েন্ট অর্জন করো এবং সারা বাংলাদেশের সেরা শিক্ষার্থীদের কাতারে নিজের নাম যুক্ত করো।
              </p>
            </div>

            {userRank && (
              <div className="bg-white/15 backdrop-blur-md border border-white/25 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-sm self-start md:self-auto">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                  #{userRank.rank}
                </div>
                <div>
                  <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider block">আপনার বর্তমান অবস্থান</span>
                  <span className="text-base sm:text-lg font-black text-white">{userRank.points} পয়েন্ট</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= TOP 3 PODIUM ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cardBorder shadow-soft">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-black text-primaryText flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>শীর্ষ ৩ মেধা পডিয়াম (Top 3 Champions)</span>
            </h2>
            <p className="text-xs text-secondaryText mt-0.5">জাতীয় পর্যায়ের সেরা ৩ জন মেধাবী শিক্ষার্থী</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-4">
            
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div 
                onClick={() => setSelectedStudent(top2)}
                className="cursor-pointer order-2 md:order-1 bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl p-5 text-center border-2 border-slate-300 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative"
              >
                <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-800 font-black text-base flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-white shadow-xs">
                  🥈
                </div>
                <img src={top2.avatar} alt={top2.name} className="w-16 h-16 rounded-full mx-auto mt-2 object-cover border-2 border-slate-300" />
                <h3 className="font-extrabold text-sm sm:text-base text-primaryText mt-2.5 truncate">{top2.name}</h3>
                <p className="text-[11px] text-secondaryText truncate">{top2.schoolName}</p>
                <div className="mt-3 bg-white py-1.5 px-3 rounded-xl inline-block border border-slate-200">
                  <span className="text-xs font-black text-slate-700">{top2.totalPoints} পয়েন্ট</span>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {top1 && (
              <div 
                onClick={() => setSelectedStudent(top1)}
                className="cursor-pointer order-1 md:order-2 bg-gradient-to-b from-amber-50 to-amber-100/80 rounded-3xl p-6 text-center border-2 border-amber-400 shadow-soft hover:shadow-soft-hover transition-all hover:-translate-y-1.5 relative md:-mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center absolute -top-5 left-1/2 -translate-x-1/2 border-4 border-white shadow-md">
                  🥇
                </div>
                <img src={top1.avatar} alt={top1.name} className="w-20 h-20 rounded-full mx-auto mt-2 object-cover border-4 border-amber-400 shadow-sm" />
                <h3 className="font-black text-base sm:text-lg text-primaryText mt-3 truncate">{top1.name}</h3>
                <p className="text-xs text-secondaryText truncate font-medium">{top1.schoolName}</p>
                <div className="mt-3 bg-white py-2 px-4 rounded-xl inline-block border border-amber-300 shadow-xs">
                  <span className="text-sm font-black text-amber-900">{top1.totalPoints} পয়েন্ট</span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div 
                onClick={() => setSelectedStudent(top3)}
                className="cursor-pointer order-3 md:order-3 bg-gradient-to-b from-amber-950/5 to-amber-950/10 rounded-3xl p-5 text-center border-2 border-amber-600/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative"
              >
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-black text-base flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-white shadow-xs">
                  🥉
                </div>
                <img src={top3.avatar} alt={top3.name} className="w-16 h-16 rounded-full mx-auto mt-2 object-cover border-2 border-amber-600/40" />
                <h3 className="font-extrabold text-sm sm:text-base text-primaryText mt-2.5 truncate">{top3.name}</h3>
                <p className="text-[11px] text-secondaryText truncate">{top3.schoolName}</p>
                <div className="mt-3 bg-white py-1.5 px-3 rounded-xl inline-block border border-amber-200">
                  <span className="text-xs font-black text-amber-800">{top3.totalPoints} পয়েন্ট</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= FILTER TOOLBAR ================= */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cardBorder shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Period Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setFilterPeriod('overall')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterPeriod === 'overall' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সার্বিক (Overall)
            </button>
            <button
              onClick={() => setFilterPeriod('weekly')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterPeriod === 'weekly' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সাপ্তাহিক (Weekly)
            </button>
            <button
              onClick={() => setFilterPeriod('monthly')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterPeriod === 'monthly' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              মাসিক (Monthly)
            </button>
          </div>

          {/* Search & Subject Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-50 border border-cardBorder rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="all">সকল বিষয় (All Subjects)</option>
              <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
              <option value="রসায়ন">রসায়ন বিজ্ঞান</option>
              <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
              <option value="গণিত">সাধারণ ও উচ্চতর গণিত</option>
              <option value="তথ্য ও যোগাযোগ প্রযুক্তি">তথ্যপ্রযুক্তি (ICT)</option>
              <option value="বাংলাদেশ ও বিশ্বপরিচয়">বাংলাদেশ ও বিশ্বপরিচয়</option>
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিক্ষার্থী খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

        </div>

        {/* ================= LEADERBOARD RANKING TABLE ================= */}
        <div className="bg-white rounded-3xl border border-cardBorder shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-cardBorder text-[11px] sm:text-xs font-bold text-secondaryText uppercase tracking-wider">
                  <th className="py-4 px-4 sm:px-6">মেধাক্রম</th>
                  <th className="py-4 px-4">শিক্ষার্থীর নাম ও বিদ্যালয়</th>
                  <th className="py-4 px-3 text-center">সম্পন্ন পরীক্ষা</th>
                  <th className="py-4 px-3 text-center hidden md:table-cell">মোট প্রশ্ন</th>
                  <th className="py-4 px-3 text-center hidden sm:table-cell">সঠিক উত্তর</th>
                  <th className="py-4 px-3 text-center">গড় নম্বর</th>
                  <th className="py-4 px-4 sm:px-6 text-right">মোট পয়েন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredStudents.map((st) => {
                  const isGold = st.rank === 1;
                  const isSilver = st.rank === 2;
                  const isBronze = st.rank === 3;
                  const isMe = st.studentId === 'current-user';

                  return (
                    <tr 
                      key={st.studentId}
                      onClick={() => setSelectedStudent(st)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${
                        isMe ? 'bg-brand-50/40 font-bold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 sm:px-6 font-black">
                        {isGold ? (
                          <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                            1
                          </span>
                        ) : isSilver ? (
                          <span className="w-7 h-7 rounded-xl bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs">
                            2
                          </span>
                        ) : isBronze ? (
                          <span className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            3
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {st.rank}
                          </span>
                        )}
                      </td>

                      {/* Name & School */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={st.avatar} 
                            alt={st.name} 
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-primaryText truncate flex items-center gap-1.5">
                              <span>{st.name}</span>
                              {isMe && (
                                <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-secondaryText truncate">
                              {st.schoolName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Completed Exams */}
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                        {st.examsCompleted} টি
                      </td>

                      {/* Total Questions */}
                      <td className="py-3.5 px-3 text-center text-slate-600 hidden md:table-cell">
                        {st.totalQuestions}
                      </td>

                      {/* Correct Answers */}
                      <td className="py-3.5 px-3 text-center text-emerald-600 font-bold hidden sm:table-cell">
                        {st.correctAnswers}
                      </td>

                      {/* Average Score */}
                      <td className="py-3.5 px-3 text-center font-black text-slate-800">
                        {st.avgScore} <span className="text-[10px] text-slate-400 font-normal">/30</span>
                      </td>

                      {/* Total Points */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-black text-brand-700">
                        {st.totalPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= STUDENT PROFILE MODAL ================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cardBorder space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                শিক্ষার্থী প্রোফাইল বিশ্লেষণ
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-primaryText">{selectedStudent.name}</h3>
                <p className="text-xs text-secondaryText">{selectedStudent.schoolName}</p>
                <span className="inline-block mt-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  জাতীয় অবস্থান: #{selectedStudent.rank}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block">মোট সম্পন্ন পরীক্ষা</span>
                <span className="text-base font-black text-slate-800">{selectedStudent.examsCompleted} টি</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block">মোট অর্জিত পয়েন্ট</span>
                <span className="text-base font-black text-brand-600">{selectedStudent.totalPoints}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block">সঠিক উত্তরের হার</span>
                <span className="text-base font-black text-emerald-600">
                  {Math.round((selectedStudent.correctAnswers / selectedStudent.totalQuestions) * 100)}%
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block">পড়াশোনার স্ট্রিক</span>
                <span className="text-base font-black text-amber-600">🔥 {selectedStudent.streakDays} দিন</span>
              </div>
            </div>

            <div className="bg-brand-50/60 p-3.5 rounded-2xl border border-brand-200/60 text-xs">
              <span className="font-bold text-brand-800 block">সর্বাধিক দক্ষ বিষয়:</span>
              <p className="text-brand-950 font-semibold mt-0.5">{selectedStudent.bestSubject}</p>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-3 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-soft hover:bg-brand-700"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
