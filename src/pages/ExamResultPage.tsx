import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Award, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  HelpCircle,
  Share2,
  Check,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { Exam, ExamAttempt, Question } from '../types';
import { getExamById, getExamAttempts } from '../services/examService';

export const ExamResultPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      if (!examId) return;
      try {
        const fetchedExamData = await getExamById(examId);
        if (fetchedExamData && fetchedExamData.exam) {
          const examObj = fetchedExamData.exam;
          examObj.questions = fetchedExamData.questions;
          setExam(examObj);
        }

        const attempts = await getExamAttempts();
        const found = attemptId 
          ? attempts.find(a => (a.id === attemptId || a.attemptId === attemptId))
          : attempts.filter(a => a.examId === examId).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
        
        setAttempt(found || null);
      } catch (err) {
        console.error('Error loading result', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId, attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam || !attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">পরীক্ষার ফলাফল খুঁজে পাওয়া যায়নি</h2>
        <Link
          to="/exams"
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
        >
          পরীক্ষার তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  const questions = exam.questions || [];
  const durationSec = attempt.timeSpentSeconds || attempt.timeTakenSeconds || 0;
  const minutesSpent = Math.floor(durationSec / 60);
  const secondsSpent = durationSec % 60;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `SSC Note Box: ${exam.title} এর ফলাফল`,
        text: `আমি "${exam.title}" পরীক্ষায় ${attempt.score}/${attempt.totalMarks} স্কোর পেয়েছি!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const qKey = q.id || q.questionId || '';
    const userAns = attempt.answers[qKey];
    const isAnswered = userAns !== undefined;
    const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption;
    const isCorrect = userAns === correctIdx;

    if (filterType === 'correct') return isCorrect;
    if (filterType === 'wrong') return isAnswered && !isCorrect;
    if (filterType === 'unanswered') return !isAnswered;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/exams"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            সকল পরীক্ষার তালিকা
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'লিংক কপি হয়েছে!' : 'শেয়ার করুন'}
          </button>
        </div>

        {/* Scorecard Hero */}
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl ${
          attempt.passed 
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900' 
            : 'bg-gradient-to-br from-rose-600 via-pink-700 to-rose-900'
        }`}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                {attempt.passed ? '🎉 অভিনন্দন! আপনি উত্তীর্ণ হয়েছেন' : 'পরবর্তীবারের জন্য আরও প্রস্তুতি প্রয়োজন'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">{exam.title}</h1>
              <p className="text-white/80 text-xs sm:text-sm">{exam.subject} • {exam.chapter || 'পূর্ণাঙ্গ পরীক্ষা'}</p>
            </div>

            <div className="flex items-baseline gap-2 bg-white/10 px-6 py-4 rounded-3xl border border-white/20 backdrop-blur-md self-start md:self-auto">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black tracking-tight">{attempt.score}</div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-white/80">মোট প্রাপ্ত নম্বর (পূর্ণমান: {attempt.totalMarks})</div>
              </div>
              <div className="text-2xl font-bold opacity-60">
                {Math.round(attempt.percentage)}%
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs">
            <div className="bg-black/20 p-3 rounded-2xl">
              <span className="text-white/70 block">সঠিক উত্তর</span>
              <span className="text-lg font-black text-emerald-300">{attempt.correctAnswers} টি</span>
            </div>
            <div className="bg-black/20 p-3 rounded-2xl">
              <span className="text-white/70 block">ভুল উত্তর</span>
              <span className="text-lg font-black text-rose-300">{attempt.incorrectAnswers} টি</span>
            </div>
            <div className="bg-black/20 p-3 rounded-2xl">
              <span className="text-white/70 block">উত্তর দেননি</span>
              <span className="text-lg font-black text-white/90">{attempt.unanswered} টি</span>
            </div>
            <div className="bg-black/20 p-3 rounded-2xl">
              <span className="text-white/70 block">ব্যয়িত সময়</span>
              <span className="text-lg font-black text-amber-300">{minutesSpent}মি. {secondsSpent}সে.</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/exams/${exam.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            পুনরায় পরীক্ষা দিন
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
          >
            <Award className="w-4 h-4 text-emerald-600" />
            স্টুডেন্ট ড্যাশবোর্ড দেখুন
          </Link>
        </div>

        {/* Question Review Section Header */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">প্রশ্নোত্তর ও সমাধান বিশ্লেষণ</h2>
            <p className="text-xs text-slate-500">প্রতিটি প্রশ্নের সঠিক উত্তর এবং ব্যাখ্যা মনোযোগ সহকারে পড়ুন</p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              সব ({questions.length})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              সঠিক ({attempt.correctAnswers})
            </button>
            <button
              onClick={() => setFilterType('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'wrong' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              ভুল ({attempt.incorrectAnswers})
            </button>
            <button
              onClick={() => setFilterType('unanswered')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'unanswered' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              উত্তরহীন ({attempt.unanswered})
            </button>
          </div>
        </div>

        {/* Questions Detailed Breakdown */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const qKey = q.id || q.questionId || '';
            const userAns = attempt.answers[qKey];
            const isAnswered = userAns !== undefined;
            const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption;
            const isCorrect = userAns === correctIdx;
            const optionLetters = ['ক', 'খ', 'গ', 'ঘ'];

            return (
              <div 
                key={qKey}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                  !isAnswered ? 'border-slate-200' :
                  isCorrect ? 'border-emerald-200 bg-emerald-50/20' :
                  'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Status Badge & Question Index */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">প্রশ্ন</span>
                  </div>

                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      সঠিক (+1)
                    </span>
                  ) : isAnswered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" />
                      ভুল (-{exam.negativeMarking})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      <MinusCircle className="w-3.5 h-3.5" />
                      উত্তর দেননি (0)
                    </span>
                  )}
                </div>

                {/* Question */}
                <div className="py-3">
                  <h3 className="font-bold text-slate-800 text-base leading-relaxed">
                    {q.questionText || q.question}
                  </h3>
                  {q.image && (
                    <img src={q.image} alt="Question context" className="max-h-48 rounded-xl border mt-2" />
                  )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const targetAns = q.correctOption !== undefined ? q.correctOption : (q.correctAnswer ?? 0);
                    const isRightOption = optIdx === targetAns;
                    const isUserPick = optIdx === userAns;

                    let optStyle = 'border-slate-200 bg-slate-50/60 text-slate-700';

                    if (isRightOption) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500';
                    } else if (isUserPick && !isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold ring-2 ring-rose-400';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${optStyle}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                          {['ক', 'খ', 'গ', 'ঘ'][optIdx] || optionLetters[optIdx]}
                        </span>
                        <div className="flex-1 leading-snug">
                          {opt}
                        </div>
                        {isRightOption && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                            সঠিক উত্তর
                          </span>
                        )}
                        {isUserPick && !isCorrect && (
                          <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                            আপনার ভুল নির্বাচন
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>ব্যাখ্যা ও বিশ্লেষণ:</span>
                    </div>
                    <p className="text-amber-950 font-medium leading-relaxed pl-5">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
