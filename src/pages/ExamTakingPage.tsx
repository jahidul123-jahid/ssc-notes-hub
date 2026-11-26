import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  Flag,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { Exam, Question } from '../types';
import { getExamById, submitExam } from '../services/examService';

export const ExamTakingPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Load Exam
  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      if (!examId) return;
      try {
        const data = await getExamById(examId);
        if (data && data.exam) {
          setExam(data.exam);
          setQuestions(data.questions || []);
          setTimeLeftSeconds(data.exam.durationMinutes * 60);
          startTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error('Failed to load exam details', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId]);

  // Anti-cheat / Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitting) {
        setWarningCount(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [submitting]);

  // Auto Submission Handler
  const handleFinalSubmit = useCallback(async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const res = await submitExam(exam.id || exam.examId, answers, timeSpentSeconds, 'শিক্ষার্থী');
      const attemptId = res.attempt.id || res.attempt.attemptId;
      navigate(`/exams/${exam.id || exam.examId}/result?attemptId=${attemptId}`);
    } catch (err) {
      console.error('Error submitting exam', err);
      alert('পরীক্ষা সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setSubmitting(false);
    }
  }, [exam, submitting, answers, navigate]);

  // Countdown Timer
  useEffect(() => {
    if (loading || !exam || submitting) return;

    if (timeLeftSeconds <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, exam, timeLeftSeconds, submitting, handleFinalSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">পরীক্ষা বা প্রশ্ন খুঁজে পাওয়া যায়নি</h2>
        <button
          onClick={() => navigate('/exams')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
        >
          পরীক্ষার তালিকায় ফিরে যান
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentQId = currentQ?.id || currentQ?.questionId || `q_${currentIndex}`;
  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isUrgent = timeLeftSeconds <= 180; // 3 minutes left

  const handleSelectOption = (index: number) => {
    if (!currentQId) return;
    setAnswers(prev => ({
      ...prev,
      [currentQId]: index
    }));
  };

  const toggleReview = () => {
    if (!currentQId) return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQId]: !prev[currentQId]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              {exam.subject}
            </span>
            <h1 className="font-bold text-slate-900 text-base sm:text-lg line-clamp-1 mt-0.5">
              {exam.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold shadow-xs border ${
              isUrgent 
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">সাবমিট করুন</span>
              <span className="sm:hidden">সাবমিট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Anti-cheat tab switch warning banner */}
      {warningCount > 0 && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>সতর্কতা: আপনি {warningCount} বার ট্যাব পরিবর্তন করেছেন! পরীক্ষা চলাকালীন অন্য ট্যাব খোলা নিয়মবহির্ভূত।</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Question Card & Controls (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Question Top Info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {currentIndex + 1}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  প্রশ্ন {currentIndex + 1} / {questions.length}
                </span>
              </div>

              <button
                onClick={toggleReview}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  markedForReview[currentQId]
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {markedForReview[currentQId] ? 'রিভিউ মার্ক করা' : 'রিভিউ মার্ক করুন'}
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed">
                {currentQ.question || currentQ.questionText}
              </h2>
              {currentQ.image && (
                <div className="my-3">
                  <img src={currentQ.image} alt="Question context" className="max-h-60 rounded-xl border" />
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQId] === idx;
                const optionLetters = ['ক', 'খ', 'গ', 'ঘ'];

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {optionLetters[idx] || (idx + 1)}
                    </span>
                    <span className={`text-sm sm:text-base font-medium flex-1 pt-0.5 ${
                      isSelected ? 'text-emerald-950 font-semibold' : 'text-slate-800'
                    }`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Stepper Navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-all shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              পূর্ববর্তী
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-xs"
              >
                পরবর্তী
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-xs"
              >
                সবগুলো সাবমিট করুন
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette (1 col on lg) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              <span>প্রশ্ন প্যালেট</span>
              <span className="text-xs text-slate-500 font-normal">
                {answeredCount}/{questions.length} উত্তরকৃত
              </span>
            </h3>

            {/* Status Legends */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                <span>উত্তর দেওয়া হয়েছে</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400"></span>
                <span>রিভিউ রাখা</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200"></span>
                <span>বাকি আছে</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md border-2 border-emerald-600"></span>
                <span>বর্তমান প্রশ্ন</span>
              </div>
            </div>

            {/* Question Buttons Matrix */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const qKey = q.id || q.questionId || `q_${idx}`;
                const isAnswered = answers[qKey] !== undefined;
                const isMarked = markedForReview[qKey];
                const isCurrent = idx === currentIndex;

                let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isAnswered) bgClass = 'bg-emerald-500 text-white';
                if (isMarked) bgClass = 'bg-amber-400 text-slate-900';

                return (
                  <button
                    key={qKey}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${bgClass} ${
                      isCurrent ? 'ring-2 ring-emerald-600 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                ফলাফল দেখতে সাবমিট করুন
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">আপনি কি পরীক্ষা সমাপ্ত করতে চান?</h3>
              <p className="text-xs text-slate-500">
                সাবমিট করার পর আপনার উত্তর মূল্যায়ন করা হবে এবং সঠিক উত্তর ও বিশ্লেষণ দেখতে পাবেন।
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>মোট প্রশ্ন:</span>
                <span className="font-bold text-slate-800">{questions.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>উত্তর দিয়েছেন:</span>
                <span className="font-bold text-emerald-600">{answeredCount} টি</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>উত্তর দেননি:</span>
                <span className="font-bold text-rose-500">{questions.length - answeredCount} টি</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {submitting ? 'মূল্যায়ন চলছে...' : 'হ্যাঁ, সাবমিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
