import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Subject, Chapter } from '../types';
import { dataService } from '../services/dataService';
import { dataEvents } from '../services/dataEvents';
import { useAudioReader } from '../context/AudioReaderContext';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  Upload,
  Search,
  ChevronRight,
  ArrowRight,
  Volume2,
  Pause
} from 'lucide-react';

interface SubjectDetailsPageProps {
  onOpenUpload: (subjectId?: string, chapterId?: string) => void;
}

export const SubjectDetailsPage: React.FC<SubjectDetailsPageProps> = ({ onOpenUpload }) => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { t, isBn } = useLanguage();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'prose' | 'poem'>('all');
  const [searchChapter, setSearchChapter] = useState('');
  const [loading, setLoading] = useState(true);

  const { play, pause, isItemPlaying } = useAudioReader();

  useEffect(() => {
    let isMounted = true;
    const load = async (showLoading = true) => {
      if (!subjectId) return;
      if (showLoading) setLoading(true);
      try {
        const [allSubs, allChaps] = await Promise.all([
          dataService.getSubjects(),
          dataService.getChapters(subjectId)
        ]);
        if (!isMounted) return;
        const currentSub = allSubs.find(s => s.subjectId === subjectId) || null;
        setSubject(currentSub);
        setChapters(allChaps);

        // If bangla-1st, default to prose tab
        if (subjectId === 'bangla-1st') {
          setActiveTab('prose');
        } else {
          setActiveTab('all');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    const unsubscribe = dataEvents.subscribe((event) => {
      if (event.type === 'chapters' || event.type === 'subjects' || event.type === 'notes') {
        load(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subjectId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-6">
        <div className="h-44 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-cardBorder text-center shadow-soft">
        <h2 className="text-xl font-bold text-primaryText">{t('subject_not_found')}</h2>
        <Link
          to="/subjects"
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm"
        >
          {t('all_subjects_link')}
        </Link>
      </div>
    );
  }

  const isBangla1st = subject.subjectId === 'bangla-1st';
  const displaySubjectName = isBn ? subject.name : (subject.englishName || subject.name);

  const filteredChapters = chapters.filter(c => {
    const matchesSearch = c.chapterName.toLowerCase().includes(searchChapter.toLowerCase());
    if (!matchesSearch) return false;

    if (isBangla1st) {
      if (activeTab === 'prose') return c.chapterType === 'prose';
      if (activeTab === 'poem') return c.chapterType === 'poem';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-secondaryText font-medium">
        <Link to="/" className="hover:text-brand-600 transition-colors py-1">{t('breadcrumb_home')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/subjects" className="hover:text-brand-600 transition-colors py-1">{t('breadcrumb_all_subjects')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primaryText font-semibold py-1">{displaySubjectName}</span>
      </nav>

      {/* Clean Subject Banner */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl bg-gradient-to-r ${subject.bannerGradient} p-5 sm:p-10 text-white shadow-soft overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6`}
      >
        <div className="relative z-10 space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-5xl font-extrabold text-amber-300 drop-shadow-md">
            {displaySubjectName}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm font-medium">
            {isBn ? subject.englishName : subject.name}
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => onOpenUpload(subject.subjectId)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-brand-700 hover:bg-brand-50 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-soft hover:shadow-soft-hover transition-all min-h-[48px] active:scale-95"
          >
            <Upload className="w-5 h-5 text-brand-600" />
            <span>{t('hero_share_note')}</span>
          </button>
        </div>
      </div>

      {/* Chapter Filter & Search Toolbar */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-cardBorder shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
        {/* Prose / Poem Tabs for Bangla 1st Paper */}
        {isBangla1st ? (
          <div className="grid grid-cols-2 sm:flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('prose')}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px] flex items-center justify-center ${
                activeTab === 'prose'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-secondaryText hover:text-primaryText'
              }`}
            >
              {t('tab_prose')}
            </button>

            <button
              onClick={() => setActiveTab('poem')}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px] flex items-center justify-center ${
                activeTab === 'poem'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-secondaryText hover:text-primaryText'
              }`}
            >
              {t('tab_poem')}
            </button>
          </div>
        ) : (
          <h2 className="text-base sm:text-lg font-bold text-primaryText">
            {t('chapters_heading')}
          </h2>
        )}

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchChapter}
            onChange={(e) => setSearchChapter(e.target.value)}
            placeholder={t('search_chapter_placeholder')}
            className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Chapters / Poems / Prose Grid: Displaying chapter name prominently */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredChapters.map((chap) => {
          const isPlaying = isItemPlaying(chap.chapterName);

          return (
            <div
              key={chap.chapterId}
              className="group bg-white hover:bg-brand-50/40 p-5 sm:p-7 rounded-2xl border border-cardBorder hover:border-brand-300 shadow-soft hover:shadow-soft-hover transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between gap-3"
            >
              <Link
                to={`/subject/${subject.subjectId}/chapter/${chap.chapterId}`}
                className="flex-1 min-w-0"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-primaryText group-hover:text-brand-600 transition-colors leading-snug">
                  {chap.chapterName}
                </h3>
              </Link>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isPlaying) {
                      pause();
                    } else {
                      const typeLabel = chap.chapterType === 'poem' ? 'কবিতা' : chap.chapterType === 'prose' ? 'গদ্য' : 'অধ্যায়';
                      play(`${subject.name} এর ${typeLabel}: ${chap.chapterName}।`, chap.chapterName, subject.name);
                    }
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'bg-brand-600 text-white shadow-soft animate-pulse'
                      : 'bg-brand-50 hover:bg-brand-100 text-brand-600 border border-brand-200/60'
                  }`}
                  title={`${chap.chapterName} ${t('btn_listen')}`}
                  aria-label={`Listen to ${chap.chapterName}`}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <Link
                  to={`/subject/${subject.subjectId}/chapter/${chap.chapterId}`}
                  className="w-9 h-9 rounded-xl bg-slate-50 text-secondaryText flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all"
                  aria-label={`Open ${chap.chapterName}`}
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChapters.length === 0 && (
        <div className="bg-white rounded-2xl border border-cardBorder p-12 text-center">
          <BookOpen className="w-12 h-12 text-secondaryText mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-primaryText">{t('no_chapters_found')}</h3>
        </div>
      )}
    </div>
  );
};
