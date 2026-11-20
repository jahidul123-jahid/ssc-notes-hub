import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Subject, Chapter, Note } from '../types';
import { dataService } from '../services/dataService';
import {
  BookOpen,
  Upload,
  Search,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface SubjectDetailsPageProps {
  onOpenUpload: (subjectId?: string, chapterId?: string) => void;
}

export const SubjectDetailsPage: React.FC<SubjectDetailsPageProps> = ({ onOpenUpload }) => {
  const { subjectId } = useParams<{ subjectId: string }>();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'prose' | 'poem'>('all');
  const [searchChapter, setSearchChapter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!subjectId) return;
      try {
        const [allSubs, allChaps] = await Promise.all([
          dataService.getSubjects(),
          dataService.getChapters(subjectId)
        ]);

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
        setLoading(false);
      }
    };
    load();
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
        <h2 className="text-xl font-bold text-primaryText">বিষয়টি পাওয়া যায়নি</h2>
        <Link
          to="/subjects"
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm"
        >
          সকল বিষয় দেখুন
        </Link>
      </div>
    );
  }

  const isBangla1st = subject.subjectId === 'bangla-1st';

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
        <Link to="/" className="hover:text-brand-600 transition-colors py-1">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/subjects" className="hover:text-brand-600 transition-colors py-1">সকল বিষয়</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primaryText font-semibold py-1">{subject.name}</span>
      </nav>

      {/* Clean Subject Banner */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl bg-gradient-to-r ${subject.bannerGradient} p-5 sm:p-10 text-white shadow-soft overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6`}
      >
        <div className="relative z-10 space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-5xl font-extrabold text-amber-300 drop-shadow-md">
            {subject.name}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm font-medium">
            {subject.englishName}
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => onOpenUpload(subject.subjectId)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-brand-700 hover:bg-brand-50 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-soft hover:shadow-soft-hover transition-all min-h-[48px] active:scale-95"
          >
            <Upload className="w-5 h-5 text-brand-600" />
            <span>নোট শেয়ার করুন</span>
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
              গদ্য
            </button>

            <button
              onClick={() => setActiveTab('poem')}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px] flex items-center justify-center ${
                activeTab === 'poem'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-secondaryText hover:text-primaryText'
              }`}
            >
              পদ্য
            </button>
          </div>
        ) : (
          <h2 className="text-base sm:text-lg font-bold text-primaryText">
            অধ্যায়সমূহ
          </h2>
        )}

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchChapter}
            onChange={(e) => setSearchChapter(e.target.value)}
            placeholder={isBangla1st ? "গদ্য বা পদ্য খুঁজুন..." : "অধ্যায় খুঁজুন..."}
            className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Chapters / Poems / Prose Grid: Displaying ONLY the actual chapter/poem/prose name prominently in large bold Bengali text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredChapters.map((chap) => (
          <Link
            key={chap.chapterId}
            to={`/subject/${subject.subjectId}/chapter/${chap.chapterId}`}
            className="group block bg-white hover:bg-brand-50/40 p-6 sm:p-7 rounded-2xl border border-cardBorder hover:border-brand-300 shadow-soft hover:shadow-soft-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-primaryText group-hover:text-brand-600 transition-colors leading-snug">
                {chap.chapterName}
              </h3>
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <div className="bg-white rounded-2xl border border-cardBorder p-12 text-center">
          <BookOpen className="w-12 h-12 text-secondaryText mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-primaryText">কোনো অধ্যায় পাওয়া যায়নি</h3>
        </div>
      )}
    </div>
  );
};
