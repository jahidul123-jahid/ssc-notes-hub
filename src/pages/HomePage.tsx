import React, { useState, useEffect, useRef } from 'react';
import { Hero } from '../components/Hero';
import { SubjectCard } from '../components/SubjectCard';
import { NoteCard } from '../components/NoteCard';
import { Subject, Note } from '../types';
import { dataService } from '../services/dataService';
import { BookOpen, Upload, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const subjectsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subList, noteList] = await Promise.all([
          dataService.getSubjects(),
          dataService.getNotes('approved')
        ]);
        setSubjects(subList);
        setNotes(noteList);
      } catch (err) {
        console.error("Home page data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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

      {/* Main Subjects Section */}
      <section ref={subjectsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primaryText">
              শ্রেণি ১০ বিষয়সমূহ
            </h2>
          </div>

          <Link
            to="/subjects"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 group transition-colors"
          >
            <span>সকল বিষয়</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid of Subject Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {subjects.map((sub) => (
              <SubjectCard
                key={sub.subjectId}
                subject={sub}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Notes Showcase */}
      <section className="bg-slate-50/70 py-14 border-y border-cardBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primaryText">
              সাম্প্রতিক নোট
            </h2>

            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 group transition-colors"
            >
              <span>সকল নোট দেখুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {notes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cardBorder p-10 text-center shadow-soft space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-primaryText">
                এখনই কোনো নোট আপলোড করা হয়নি
              </h3>
              <div className="pt-2">
                <button
                  onClick={() => onOpenUpload()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent text-white font-bold px-6 py-2.5 rounded-xl shadow-soft hover:shadow-soft-hover"
                >
                  <Upload className="w-4 h-4" />
                  <span>নোট শেয়ার করুন</span>
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
