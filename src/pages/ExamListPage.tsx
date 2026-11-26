import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Clock, 
  HelpCircle, 
  BookOpen, 
  Filter, 
  ChevronRight, 
  Flame, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Exam, ExamAttempt } from '../types';
import { getExams, getExamAttempts } from '../services/examService';

export const ExamListPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const [fetchedExams, fetchedAttempts] = await Promise.all([
          getExams(),
          getExamAttempts()
        ]);
        setExams(fetchedExams);
        setAttempts(fetchedAttempts);
      } catch (err) {
        console.error('Failed to load exams', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjects = ['all', ...Array.from(new Set(exams.map(e => e.subject || e.subjectId)))];

  const filteredExams = exams.filter(e => {
    const subj = e.subject || e.subjectId;
    const examType = e.type || e.examType;
    const matchesSubject = selectedSubject === 'all' || subj === selectedSubject;
    const matchesType = selectedType === 'all' || examType === selectedType;
    return matchesSubject && matchesType;
  });

  const getAttemptForExam = (examId: string) => {
    return attempts
      .filter(a => a.examId === examId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4">
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              SSC লাইভ এক্সাম প্ল্যাটফর্ম
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
              অনলাইন পরীক্ষা ও সেলফ এসেসমেন্ট
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              অধ্যায়ভিত্তিক MCQ, পূর্ণাঙ্গ মডেল টেস্ট এবং বিষয়ভিত্তিক প্রশ্নপত্রের মাধ্যমে তোমার প্রস্তুতিকে আরও নির্ভুল ও আত্মবিশ্বাসী করে তোলো।
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Clock className="w-4 h-4 text-amber-300" />
                রিয়েল-টাইম টাইমার
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 text-rose-300" />
                নেগেটিভ মার্কিং সাপোর্ট
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Award className="w-4 h-4 text-emerald-300" />
                তাৎক্ষণিক ফলাফল ও ব্যাখ্যা
              </div>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
            <Award className="w-72 h-72 text-white" />
          </div>
        </div>

        {/* Filters and Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/70">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Filter className="w-5 h-5 text-emerald-600" />
            <span>ফিল্টার করুন:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সকল বিষয়</option>
              {subjects.filter(s => s !== 'all').map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>

            {/* Exam Type Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                  selectedType === 'all' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব
              </button>
              <button
                onClick={() => setSelectedType('chapter')}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                  selectedType === 'chapter' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                অধ্যায়ভিত্তিক
              </button>
              <button
                onClick={() => setSelectedType('model_test')}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                  selectedType === 'model_test' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                মডেল টেস্ট
              </button>
            </div>
          </div>
        </div>

        {/* Exam Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">কোনো পরীক্ষা পাওয়া যায়নি</h3>
            <p className="text-sm text-slate-500 mt-1">অনুগ্রহ করে অন্য কোনো বিষয় বা ফিল্টার নির্বাচন করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const examKey = exam.id || exam.examId;
              const lastAttempt = getAttemptForExam(examKey);

              return (
                <div 
                  key={examKey}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-lg border border-emerald-100">
                        {exam.subject}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        exam.difficulty === 'easy' ? 'bg-blue-50 text-blue-700' :
                        exam.difficulty === 'hard' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {exam.difficulty === 'easy' ? 'সহজ' : exam.difficulty === 'hard' ? 'কঠিন' : 'মাঝারি'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {exam.title}
                    </h3>

                    {exam.chapter && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {exam.chapter}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {exam.description || 'বোর্ড স্ট্যান্ডার্ড অনুযায়ী প্রণীত MCQ পরীক্ষা।'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.totalQuestions} টি প্রশ্ন</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.durationMinutes} মিনিট</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>পূর্ণমান: {exam.totalMarks}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>ভুল: -{exam.negativeMarking}</span>
                      </div>
                    </div>
                  </div>

                  {/* Previous Result / Action Button */}
                  <div className="pt-5 mt-4 border-t border-slate-100 space-y-3">
                    {lastAttempt && (
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
                        <span className="text-slate-600 font-medium">পূর্ববর্তী স্কোর:</span>
                        <span className={`font-bold ${
                          lastAttempt.passed ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {lastAttempt.score} / {lastAttempt.totalMarks} ({Math.round(lastAttempt.percentage)}%)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/exams/${examKey}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
                      >
                        {lastAttempt ? (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            পুনরায় পরীক্ষা দিন
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            পরীক্ষা শুরু করুন
                          </>
                        )}
                      </Link>

                      {lastAttempt && (
                        <Link
                          to={`/exams/${examKey}/result?attemptId=${lastAttempt.id || lastAttempt.attemptId}`}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                          title="ফলাফল ও সমাধান দেখুন"
                        >
                          সমাধান
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
