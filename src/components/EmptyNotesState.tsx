import React from 'react';
import { Upload, BookOpen, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyNotesStateProps {
  title?: string;
  description?: string;
  subjectName?: string;
  chapterName?: string;
  onOpenUpload?: () => void;
  backLink?: string;
  backLinkText?: string;
}

export const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({
  title,
  description,
  subjectName,
  chapterName,
  onOpenUpload,
  backLink,
  backLinkText = 'অন্যান্য বিষয়সমূহ দেখুন'
}) => {
  const displayTitle =
    title ||
    (chapterName
      ? `দুঃখিত! "${chapterName}" অধ্যায়ে এখনও কোনো নোট খুঁজে পাওয়া যায়নি`
      : subjectName
      ? `দুঃখিত! "${subjectName}" বিষয়ে এখনও কোনো নোট প্রকাশ করা হয়নি`
      : 'দুঃখিত! এখানে এখনও কোনো নোট খুঁজে পাওয়া যায়নি');

  const displayDesc =
    description ||
    'আপনি কি এই বিষয়ের গুরুত্বপূর্ণ তথ্য বা খাতার নোট সবার সাথে শেয়ার করতে চান? এখনই আপনার খাতার ছবি বা পিডিএফ আপলোড করে সহপাঠীদের পাশে দাঁড়ান ও প্রথম অবদানকারী হোন!';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-50/70 via-white to-brand-50/30 border-2 border-dashed border-brand-200/90 p-8 sm:p-12 text-center shadow-soft">
      {/* Ambient background soft glowing blobs */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto space-y-5">
        {/* Animated Badge & Icon */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-brand-600 via-violetAccent to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/25 ring-8 ring-brand-100/60 animate-bounce-slow">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md font-bold text-xs ring-4 ring-white">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200/70 shadow-xs mb-1">
            <span>📭</span>
            <span>এখনও কোনো নোট প্রকাশিত হয়নি</span>
          </span>
        </div>

        {/* Main Heading */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-3xl font-black text-primaryText tracking-tight leading-snug">
            {displayTitle}
          </h3>
          <p className="text-xs sm:text-base text-secondaryText leading-relaxed">
            {displayDesc}
          </p>
        </div>

        {/* Three Quick Contributor Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-left">
          <div className="flex items-center gap-2 p-2.5 bg-white/90 rounded-xl border border-cardBorder shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 font-black">
              ✓
            </div>
            <span className="text-[11px] font-bold text-primaryText">ছবি বা পিডিএফ আপলোড</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-white/90 rounded-xl border border-cardBorder shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs shrink-0 font-black">
              ★
            </div>
            <span className="text-[11px] font-bold text-primaryText">প্রথম অবদানকারীর মর্যাদা</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-white/90 rounded-xl border border-cardBorder shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs shrink-0 font-black">
              ♥
            </div>
            <span className="text-[11px] font-bold text-primaryText">সহপাঠীদের সরাসরি সাহায্য</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onOpenUpload && (
            <button
              type="button"
              onClick={onOpenUpload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-600 via-violetAccent to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-soft hover:shadow-soft-hover transition-all duration-200 hover:-translate-y-0.5 text-sm sm:text-base cursor-pointer active:scale-95 ring-2 ring-brand-300/40"
            >
              <Upload className="w-5 h-5" />
              <span>নোট আপলোড করুন</span>
            </button>
          )}

          {backLink && (
            <Link
              to={backLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-secondaryText hover:text-brand-600 font-bold px-6 py-3.5 rounded-2xl border border-cardBorder transition-all text-sm cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>{backLinkText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
