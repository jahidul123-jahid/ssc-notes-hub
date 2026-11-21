import React from 'react';
import { Upload, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyNotesStateProps {
  title?: string;
  description?: string;
  chapterName?: string;
  subjectName?: string;
  onOpenUpload?: () => void;
  backLink?: string;
  backLinkText?: string;
}

export const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({
  title,
  description,
  chapterName,
  onOpenUpload,
  backLink,
  backLinkText = 'অধ্যায়ের তালিকায় ফিরুন'
}) => {
  const displayTitle =
    title ||
    (chapterName
      ? `দুঃখিত! "${chapterName}" অধ্যায়ে কোনো নোট নেই`
      : 'দুঃখিত! এই অধ্যায়ে কোনো নোট খুঁজে পাওয়া যায়নি');

  const displayDesc =
    description || 'আপনি কি নোট আপলোড করতে চান? এখনই আপলোড করুন।';

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white border border-cardBorder p-8 sm:p-12 text-center shadow-soft max-w-xl mx-auto my-6 space-y-4">
      {/* Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs border border-brand-100">
        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-brand-600" />
      </div>

      {/* Short & Clean Message */}
      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-2xl font-bold text-primaryText">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-secondaryText">
          {displayDesc}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {onOpenUpload && (
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-violetAccent hover:from-brand-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-soft hover:shadow-soft-hover transition-all text-sm cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>নোট আপলোড করুন</span>
          </button>
        )}

        {backLink && (
          <Link
            to={backLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-secondaryText hover:text-brand-600 font-semibold px-5 py-3 rounded-xl border border-cardBorder transition-all text-sm cursor-pointer"
          >
            <span>{backLinkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
};
