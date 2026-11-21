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
      className="group block bg-white rounded-2xl border border-cardBorder shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Subject Banner */}
      <div
        className={`relative h-44 sm:h-48 w-full bg-gradient-to-br ${subject.bannerGradient} p-6 flex flex-col justify-center items-center text-center overflow-hidden select-none`}
      >
        {/* Subtle geometric line overlay / watermark */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-6xl sm:text-7xl font-black uppercase tracking-widest text-white whitespace-nowrap">
            {subject.englishName}
          </span>
        </div>

        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Subject Name in active language */}
        <div className="relative z-10 my-auto">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] tracking-wide group-hover:scale-105 transition-transform duration-300">
            {displayName}
          </h3>
        </div>
      </div>

      {/* Clean White Card Footer */}
      <div className="p-4 sm:p-5 bg-white flex items-center justify-between">
        <span className="text-base sm:text-lg font-bold text-primaryText group-hover:text-brand-600 transition-colors">
          {displayName}
        </span>
        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
