import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Crown, ArrowRight, GraduationCap } from 'lucide-react';
import { getLeaderboard } from '../services/examService';

export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  completedExams: number;
}

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data || []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const firstPlace = leaderboard.find((s) => s.rank === 1);
  const secondPlace = leaderboard.find((s) => s.rank === 2);
  const thirdPlace = leaderboard.find((s) => s.rank === 3);

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Minimal Clean Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold border border-brand-200/60 shadow-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            SSC মেধা তালিকা
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-primaryText tracking-tight">
            লিডারবোর্ড
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText font-medium">
            সম্পন্ন পরীক্ষার সংখ্যা অনুযায়ী শীর্ষ শিক্ষার্থীদের তালিকা।
          </p>
        </div>

        {/* Top 3 Positions Highlight */}
        {leaderboard.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            
            {/* 2nd Position */}
            {secondPlace && (
              <div className="order-2 sm:order-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft text-center flex flex-col items-center justify-center relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3 shadow-xs">
                  <Medal className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  2nd Position
                </span>
                <h3 className="text-lg font-black text-primaryText truncate max-w-[200px]">
                  {secondPlace.studentName}
                </h3>
                <div className="mt-3 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                  {secondPlace.completedExams} Completed Exams
                </div>
              </div>
            )}

            {/* 1st Position (Champion) */}
            {firstPlace && (
              <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-50/80 to-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-soft text-center flex flex-col items-center justify-center relative scale-100 sm:scale-105 z-10">
                <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-black text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Champion
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 shadow-sm mt-1">
                  <Trophy className="w-7 h-7 text-amber-500" />
                </div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                  1st Position
                </span>
                <h3 className="text-xl font-black text-primaryText truncate max-w-[220px]">
                  {firstPlace.studentName}
                </h3>
                <div className="mt-3 px-4 py-1.5 bg-amber-400/20 text-amber-900 rounded-full text-xs font-extrabold">
                  {firstPlace.completedExams} Completed Exams
                </div>
              </div>
            )}

            {/* 3rd Position */}
            {thirdPlace && (
              <div className="order-3 sm:order-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft text-center flex flex-col items-center justify-center relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 shadow-xs">
                  <Medal className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-[11px] font-bold text-amber-700/80 uppercase tracking-wider mb-1">
                  3rd Position
                </span>
                <h3 className="text-lg font-black text-primaryText truncate max-w-[200px]">
                  {thirdPlace.studentName}
                </h3>
                <div className="mt-3 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-800">
                  {thirdPlace.completedExams} Completed Exams
                </div>
              </div>
            )}

          </div>
        )}

        {/* Minimal Responsive Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-primaryText flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              সকল মেধা তালিকা
            </h2>
            <span className="text-xs text-secondaryText font-medium">
              মোট: {leaderboard.length} জন শিক্ষার্থী
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-secondaryText font-medium animate-pulse">
              মেধা তালিকা লোড হচ্ছে...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-brand-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-primaryText">এখনো কোনো পরীক্ষার রেকর্ড নেই</h3>
                <p className="text-xs text-secondaryText max-w-sm mx-auto">
                  আপনিই প্রথম শিক্ষার্থী হিসেবে একটি MCQ পরীক্ষায় অংশগ্রহণ করে লিডারবোর্ডের শীর্ষে নিজের নাম যুক্ত করুন!
                </p>
              </div>
              <Link
                to="/exams"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-violetAccent text-white text-xs font-bold shadow-soft hover:shadow-soft-hover transition-all active:scale-95"
              >
                <span>পরীক্ষা শুরু করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-6 w-20">Rank</th>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6 text-right w-44">Completed Exams</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {leaderboard.map((student) => {
                    const isTop1 = student.rank === 1;
                    const isTop2 = student.rank === 2;
                    const isTop3 = student.rank === 3;

                    return (
                      <tr
                        key={`${student.rank}-${student.studentName}`}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isTop1 ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black ${
                              isTop1
                                ? 'bg-amber-400 text-slate-900 shadow-xs'
                                : isTop2
                                ? 'bg-slate-200 text-slate-700'
                                : isTop3
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-600 bg-slate-100'
                            }`}
                          >
                            {student.rank}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="py-4 px-6">
                          <span className="font-bold text-primaryText block">
                            {student.studentName}
                          </span>
                        </td>

                        {/* Completed Exams */}
                        <td className="py-4 px-6 text-right font-black text-slate-800 font-mono">
                          {student.completedExams}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
