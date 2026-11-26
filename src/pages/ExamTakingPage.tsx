import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  HelpCircle,
  ShieldAlert,
  ArrowLeft,
  BookmarkCheck,
  ChevronUp,
  X
} from 'lucide-react';
import { Exam, Question } from '../types';
import { examService } from '../services/examService';

export const ExamTakingPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30 * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const sessionKey = examId ? `ssc_active_exam_session_${examId}` : '';

  // 1. Load Exam & Restore Session if active
  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      if (!examId) return;
      try {
        const data = await examService.getExamById(examId);
        if (data && data.exam) {
          setExam(data.exam);
          setQuestions(data.questions || []);

          // Check if user had an ongoing session saved in localStorage
          let initialTime = (data.exam.durationMinutes || 30) * 60;
          try {
            const savedSession = localStorage.getItem(`ssc_active_exam_session_${examId}`);
            if (savedSession) {
              const parsed = JSON.parse(savedSession);
              if (parsed.answers && typeof parsed.answers === 'object') {
                setAnswers(parsed.answers);
              }
              if (typeof parsed.timeLeftSeconds === 'number' && parsed.timeLeftSeconds > 0) {
                // Adjust for elapsed time since last save
                const elapsedSinceLastSave = Math.floor((Date.now() - (parsed.lastSavedAt || Date.now())) / 1000);
                const remaining = Math.max(10, parsed.timeLeftSeconds - elapsedSinceLastSave);
                initialTime = remaining;
              }
            }
          } catch {
            // ignore
          }

          setTimeLeftSeconds(initialTime);
          startTimeRef.current = Date.now() - (((data.exam.durationMinutes || 30) * 60) - initialTime) * 1000;
        }
      } catch (err) {
        console.error('Failed to load exam details', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId]);

  // 2. Real-time Auto-save answers & time to localStorage
  useEffect(() => {
    if (!sessionKey || loading || submitting || !exam) return;
    try {
      localStorage.setItem(sessionKey, JSON.stringify({
        answers,
        timeLeftSeconds,
        lastSavedAt: Date.now()
      }));
    } catch {
      // ignore
    }
  }, [sessionKey, answers, timeLeftSeconds, loading, submitting, exam]);

  // 3. Prevent accidental tab close or page navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitting && questions.length > 0) {
        e.preventDefault();
        e.returnValue = 'আপনার পরীক্ষা চলমান রয়েছে। বের হলে উত্তর মুছে যেতে পারে।';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [submitting, questions.length]);

  // 4. Final Submit Handler
  const handleFinalSubmit = useCallback(async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const res = await examService.submitExam(
        exam.id || exam.examId,
        answers,
        timeSpentSeconds,
        'শিক্ষার্থী'
      );
      // Clean up session storage after successful submission
      if (sessionKey) {
        localStorage.removeItem(sessionKey);
      }
      const attemptId = res.attempt.id || res.attempt.attemptId;
      navigate(`/exams/${exam.id || exam.examId}/result?attemptId=${attemptId}`);
    } catch (err) {
      console.error('Error submitting exam', err);
      alert('পরীক্ষা সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setSubmitting(false);
    }
  }, [exam, submitting, answers, navigate, sessionKey]);

  // 5. Live Countdown Timer
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

  const handleSelectOption = (questionKey: string, optionIndex: number) => {
    if (submitting) return;
    setAnswers(prev => ({
      ...prev,
      [questionKey]: optionIndex
    }));
  };

  const scrollToQuestion = (index: number) => {
    setMobilePaletteOpen(false);
    const element = document.getElementById(`question-card-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-bold text-sm">প্রশ্নপত্র লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <HelpCircle className="w-14 h-14 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">পরীক্ষার প্রশ্নপত্র পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">অনুগ্রহ করে বিষয় ও অধ্যায় নির্বাচন করে পুনরায় চেষ্টা করুন।</p>
        <Link
          to="/exams"
          className="mt-4 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-soft hover:bg-brand-700"
        >
          পরীক্ষার তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const remainingCount = Math.max(0, questions.length - answeredCount);
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isTimeCritical = timeLeftSeconds < 5 * 60; // less than 5 mins
  const optionLabels = ['A', 'B', 'C', 'D'];
  const banglaOptionLabels = ['ক', 'খ', 'গ', 'ঘ'];

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 select-none">
      
      {/* ================= STICKY TOP APP BAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cardBorder shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Left: Exit button & Exam title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-2 rounded-xl text-secondaryText hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              title="পরীক্ষা থেকে বের হন"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-primaryText truncate">
                {exam.title}
              </h1>
              <p className="text-[11px] text-secondaryText font-medium hidden sm:block">
                মোট প্রশ্ন: {questions.length} টি • পূর্ণমান: {exam.totalMarks} • নেগেটিভ মার্কিং: {exam.negativeMark || 0.25}
              </p>
            </div>
          </div>

          {/* Right: Live Timer, Progress & Submit */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            {/* Live Timer Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black border transition-colors ${
              isTimeCritical 
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' 
                : 'bg-brand-50 border-brand-200 text-brand-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Answered counter pill (hidden on smallest screens) */}
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
              <span className="text-emerald-700">উত্তর: {answeredCount}</span>
              <span>/</span>
              <span className="text-slate-500">বাকি: {remainingCount}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>সাবমিট করুন</span>
            </button>
          </div>

        </div>
      </header>

      {/* ================= MAIN EXAM CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* ================= LEFT / MAIN: ALL 30 QUESTIONS SIMULTANEOUSLY ================= */}
          <main className="lg:col-span-8 space-y-5 sm:space-y-6">
            
            {/* Notice Banner */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">গুরুত্বপূর্ণ নির্দেশনা:</p>
                <p className="mt-0.5 leading-relaxed text-amber-800">
                  নিচে সকল ৩০টি প্রশ্ন একসাথে দেওয়া রয়েছে। যেকোনো প্রশ্নে ক্লিক করে উত্তর প্রদান করতে পারেন। আপনার প্রতিটি উত্তর স্বয়ংক্রিয়ভাবে সেভ হচ্ছে।
                </p>
              </div>
            </div>

            {/* 30 Questions List Rendered Together */}
            {questions.map((q, qIndex) => {
              const qKey = q.id || q.questionId || `q-${qIndex}`;
              const selectedOpt = answers[qKey];
              const isAnswered = selectedOpt !== undefined && selectedOpt !== null;

              return (
                <div
                  key={qKey}
                  id={`question-card-${qIndex}`}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all duration-200 shadow-soft ${
                    isAnswered ? 'border-brand-300 ring-1 ring-brand-100' : 'border-cardBorder'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black flex items-center justify-center transition-colors ${
                        isAnswered ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {String(qIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        বহুনির্বাচনী প্রশ্ন {qIndex + 1} / {questions.length}
                      </span>
                    </div>

                    {isAnswered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        উত্তর দেওয়া হয়েছে
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
                        উত্তর বাকি
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h3 className="text-base sm:text-lg font-bold text-primaryText leading-relaxed mb-4">
                    {q.questionText || q.question}
                  </h3>

                  {q.image && (
                    <div className="mb-4">
                      <img src={q.image} alt="Question context" className="max-h-56 rounded-xl border border-slate-200" />
                    </div>
                  )}

                  {/* Options (A, B, C, D) as Radio Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {q.options.map((optText, optIdx) => {
                      const isSelected = selectedOpt === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(qKey, optIdx)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all active:scale-[0.99] touch-manipulation ${
                            isSelected
                              ? 'bg-gradient-to-r from-brand-50 to-indigo-50/60 border-brand-500 text-brand-950 font-bold ring-2 ring-brand-400/40 shadow-xs'
                              : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                              : 'bg-white border-slate-300 text-slate-600'
                          }`}>
                            {banglaOptionLabels[optIdx]}
                          </span>
                          <span className="flex-1 leading-snug pt-0.5">
                            {optText}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}

            {/* Bottom Submit Banner */}
            <div className="bg-white rounded-3xl p-6 border border-cardBorder shadow-soft text-center space-y-4">
              <h4 className="text-base font-bold text-primaryText">
                আপনি সকল ৩০টি প্রশ্নের উত্তর দেওয়ার পর চূড়ান্তভাবে জমা দিন
              </h4>
              <p className="text-xs text-secondaryText">
                উত্তর দেওয়া হয়েছে: <span className="font-bold text-emerald-600">{answeredCount}</span> টি • বাকি রয়েছে: <span className="font-bold text-rose-500">{remainingCount}</span> টি
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violetAccent text-white font-extrabold text-base shadow-soft hover:shadow-soft-hover transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>চূড়ান্তভাবে পরীক্ষা জমা দিন</span>
              </button>
            </div>

          </main>

          {/* ================= RIGHT SIDEBAR: QUESTION PALETTE (1-30) ================= */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl border border-cardBorder p-5 sm:p-6 shadow-soft space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold text-sm text-primaryText">প্রশ্ন প্যালেট (১-৩০)</h3>
                </div>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                  {answeredCount} / {questions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>অগ্রগতি</span>
                  <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Numbers Grid (1 to 30) */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {questions.map((q, idx) => {
                  const qKey = q.id || q.questionId || `q-${idx}`;
                  const isAnswered = answers[qKey] !== undefined && answers[qKey] !== null;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToQuestion(idx)}
                      className={`h-9 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 flex items-center justify-center border ${
                        isAnswered
                          ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                      title={`প্রশ্ন ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-brand-600" />
                  <span>উত্তর দেওয়া ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300" />
                  <span>বাকি ({remainingCount})</span>
                </div>
              </div>

              {/* Large Submit CTA */}
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                পরীক্ষা জমা দিন ({answeredCount}/{questions.length})
              </button>

            </div>
          </aside>

        </div>
      </div>

      {/* ================= MOBILE FLOATING PALETTE BAR ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cardBorder p-3 shadow-lg flex items-center justify-between gap-3">
        <button
          onClick={() => setMobilePaletteOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
        >
          <BookmarkCheck className="w-4 h-4 text-brand-600" />
          <span>প্রশ্ন প্যালেট ({answeredCount}/30)</span>
        </button>

        <button
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-soft"
        >
          <Send className="w-3.5 h-3.5" />
          <span>জমা দিন</span>
        </button>
      </div>

      {/* ================= MOBILE PALETTE BOTTOM SHEET ================= */}
      {mobilePaletteOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-primaryText">প্রশ্ন নির্বাচন করুন (১-৩০)</h3>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const qKey = q.id || q.questionId || `q-${idx}`;
                const isAnswered = answers[qKey] !== undefined && answers[qKey] !== null;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToQuestion(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center border ${
                      isAnswered
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBMIT CONFIRMATION MODAL ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cardBorder space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-primaryText">
                আপনি কি পরীক্ষা সাবমিট করতে প্রস্তুত?
              </h3>
              <p className="text-xs text-secondaryText">
                সাবমিট করার পর উত্তর আর পরিবর্তন করা যাবে না। সঙ্গে সঙ্গে ফলাফল ও ব্যাখ্যা দেখতে পাবেন।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">উত্তর দিয়েছেন</span>
                <span className="text-lg font-black text-emerald-600">{answeredCount} টি</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">উত্তর বাকি রয়েছে</span>
                <span className="text-lg font-black text-rose-500">{remainingCount} টি</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                পুনরায় চেক করব
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition-all disabled:opacity-50"
              >
                {submitting ? 'মূল্যায়ন হচ্ছে...' : 'হ্যাঁ, সাবমিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= INTENTIONAL EXIT WARNING MODAL ================= */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cardBorder space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-primaryText">
                পরীক্ষা বাতিল করে বের হতে চান?
              </h3>
              <p className="text-xs text-secondaryText leading-relaxed">
                আপনি {questions.length}টির মধ্যে <span className="font-bold text-brand-600">{answeredCount}টি</span> প্রশ্নের উত্তর দিয়েছেন। আপনার উত্তর সংরক্ষণ করা আছে, আপনি ফিরে আসলে পুনরায় চালু করতে পারবেন।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-soft hover:bg-brand-700 transition-all"
              >
                পরীক্ষা চালিয়ে যান
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  navigate(-1);
                }}
                className="flex-1 py-3 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors"
              >
                এখনই বের হন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
