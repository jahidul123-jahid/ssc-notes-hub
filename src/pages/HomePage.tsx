import React, { useState, useEffect, useRef } from 'react';
import { Hero } from '../components/Hero';
import { SubjectCard } from '../components/SubjectCard';
import { NoteCard } from '../components/NoteCard';
import { ExamCountdownBanner } from '../components/ExamCountdownBanner';
import { StudyPlannerWidget } from '../components/StudyPlannerWidget';
import { Subject, Note } from '../types';
import { dataService } from '../services/dataService';
import { dataEvents } from '../services/dataEvents';
import { BookOpen, Upload, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  onOpenUpload: (subjectId?: string, chapterId?: string) => void;
  onViewNote: (note: Note) => void;
  onDownloadNote: (note: Note) => void;
  onReportNote: (note: Note) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenUpload,
  onViewNote,
  onDownloadNote,
  onReportNote
}) => {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const subjectsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const [subList, noteList] = await Promise.all([
          dataService.getSubjects(),
          dataService.getNotes('approved')
        ]);
        if (!isMounted) return;
        setSubjects(subList);
        setNotes(noteList);
      } catch (err) {
        console.error("Home page data fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();

    // Auto-update content seamlessly without requiring manual browser reload
    const unsubscribe = dataEvents.subscribe((event) => {
      if (event.type === 'notes' || event.type === 'subjects') {
        loadData(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleScrollToSubjects = () => {
    subjectsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-12">
      {/* Hero Section */}
      <Hero
        onOpenUpload={() => onOpenUpload()}
        onScrollToSubjects={handleScrollToSubjects}
      />

      {/* SSC Exam Live Countdown Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ExamCountdownBanner />
      </section>

      {/* Main Subjects Section */}
      <section ref={subjectsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primaryText">
              {t('class_10_subjects')}
            </h2>
          </div>

          <Link
            to="/subjects"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 group transition-colors py-2 px-1 min-h-[40px] touch-manipulation select-none"
          >
            <span>{t('all_subjects_link')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid of Subject Cards - 2 per row on mobile */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 sm:h-64 bg-slate-100 rounded-xl sm:rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {subjects.map((sub) => (
              <SubjectCard
                key={sub.subjectId}
                subject={sub}
              />
            ))}
          </div>
        )}
      </section>

      {/* Daily Study Planner & Smart AI Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StudyPlannerWidget />
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-soft flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-bold">24/7 লাইভ অ্যাসিস্ট্যান্ট</span>
              <h3 className="text-xl font-black">SSC AI স্টাডি টিউটর</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                গণিত, বিজ্ঞান ও ইংরেজির যেকোনো কঠিন টপিক বা অংক বুঝতে তাৎক্ষণিক সহায়তা নাও এআই টিউটরের কাছে।
              </p>
            </div>
            <Link
              to="/ai-tutor"
              className="w-full py-3 bg-white text-emerald-800 hover:bg-emerald-50 text-center rounded-xl font-bold text-xs shadow-md transition-all"
            >
              এআই টিউটরের সাথে কথা বলুন →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Notes Showcase */}
      <section className="bg-slate-50/70 py-14 border-y border-cardBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primaryText">
              {t('recent_notes')}
            </h2>

            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 group transition-colors"
            >
              <span>{t('view_all_notes')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {notes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cardBorder p-10 text-center shadow-soft space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-primaryText">
                {t('no_notes_yet')}
              </h3>
              <div className="pt-2">
                <button
                  onClick={() => onOpenUpload()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent text-white font-bold px-6 py-2.5 rounded-xl shadow-soft hover:shadow-soft-hover"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('hero_share_note')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {notes.slice(0, 4).map((note) => (
                <NoteCard
                  key={note.noteId}
                  note={note}
                  onView={onViewNote}
                  onDownload={onDownloadNote}
                  onReport={onReportNote}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
