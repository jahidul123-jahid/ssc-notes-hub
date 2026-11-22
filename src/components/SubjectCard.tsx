import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Subject } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SubjectCardProps {
  subject: Subject;
  chapterCount?: number;
  noteCount?: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const { isBn } = useLanguage();
  const displayName = isBn ? subject.name : (subject.englishName || subject.name);

  return (
    <Link
      to={`/subject/${subject.subjectId}`}
      className="group block bg-white rounded-xl sm:rounded-2xl border border-cardBorder shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden touch-manipulation active:scale-[0.98] select-none"
    >
      {/* Subject Banner */}
      <div
        className={`relative h-28 sm:h-44 md:h-48 w-full bg-gradient-to-br ${subject.bannerGradient} p-3 sm:p-6 flex flex-col justify-center items-center text-center overflow-hidden select-none`}
      >
        {/* Subtle geometric line overlay / watermark */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-3xl sm:text-6xl md:text-7xl font-black uppercase tracking-widest text-white whitespace-nowrap">
            {subject.englishName}
          </span>
        </div>

        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-24 sm:w-36 h-24 sm:h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Subject Name in active language */}
        <div className="relative z-10 my-auto px-1">
          <h3 className="text-sm sm:text-2xl lg:text-3xl font-extrabold text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wide group-hover:scale-105 transition-transform duration-300 line-clamp-2 leading-tight">
            {displayName}
          </h3>
        </div>
      </div>

      {/* Clean White Card Footer */}
      <div className="p-2.5 sm:p-4 bg-white flex items-center justify-between gap-1.5">
        <span className="text-xs sm:text-base font-bold text-primaryText group-hover:text-brand-600 transition-colors truncate">
          {displayName}
        </span>
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all shrink-0">
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
