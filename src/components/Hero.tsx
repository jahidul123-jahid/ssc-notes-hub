import React from 'react';
import { BookOpen, Upload } from 'lucide-react';
import { WebsiteStats } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  stats?: WebsiteStats | null;
  onOpenUpload: () => void;
  onScrollToSubjects: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenUpload, onScrollToSubjects }) => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 bg-gradient-to-b from-brand-50/60 via-white to-white">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-violet-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold text-primaryText tracking-tight leading-tight sm:leading-tight mb-4 sm:mb-5">
          <span className="block">{t('hero_title_1')}</span>
          <span className="text-gradient">{t('hero_title_2')}</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-xl text-secondaryText leading-relaxed mb-6 sm:mb-10 px-2">
          {t('hero_subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
          <button
            onClick={onScrollToSubjects}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white px-7 py-3.5 rounded-xl font-bold text-base sm:text-lg shadow-soft hover:shadow-soft-hover transition-all duration-200 hover:-translate-y-0.5 min-h-[48px] active:scale-95"
          >
            <BookOpen className="w-5 h-5" />
            <span>{t('hero_view_subjects')}</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white text-brand-600 border-2 border-brand-200 hover:border-brand-500 hover:bg-brand-50/50 px-7 py-3.5 rounded-xl font-bold text-base sm:text-lg shadow-sm hover:shadow-soft transition-all duration-200 min-h-[48px] active:scale-95"
          >
            <Upload className="w-5 h-5 text-brand-500" />
            <span>{t('hero_share_note')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
