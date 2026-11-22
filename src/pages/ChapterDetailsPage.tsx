import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Subject, Chapter, Note } from '../types';
import { dataService } from '../services/dataService';
import { dataEvents } from '../services/dataEvents';
import { NoteCard } from '../components/NoteCard';
import { EmptyNotesState } from '../components/EmptyNotesState';
import { useAudioReader } from '../context/AudioReaderContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronRight,
  Upload,
  Search,
  Filter,
  Volume2,
  Pause
} from 'lucide-react';

interface ChapterDetailsPageProps {
  onOpenUpload: (subjectId?: string, chapterId?: string) => void;
  onViewNote: (note: Note) => void;
  onDownloadNote: (note: Note) => void;
  onReportNote: (note: Note) => void;
}

export const ChapterDetailsPage: React.FC<ChapterDetailsPageProps> = ({
  onOpenUpload,
  onViewNote,
  onDownloadNote,
  onReportNote
}) => {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const { t, isBn } = useLanguage();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const { play, pause, isItemPlaying } = useAudioReader();

  useEffect(() => {
    let isMounted = true;
    const load = async (showLoading = true) => {
      if (!subjectId || !chapterId) return;
      if (showLoading) setLoading(true);
      try {
        const [subs, chaps, noteList] = await Promise.all([
          dataService.getSubjects(),
          dataService.getChapters(subjectId),
          dataService.getNotes('approved', subjectId, chapterId)
        ]);
        if (!isMounted) return;
        setSubject(subs.find(s => s.subjectId === subjectId) || null);
        setChapter(chaps.find(c => c.chapterId === chapterId) || null);
        setNotes(noteList);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    const unsubscribe = dataEvents.subscribe((event) => {
      if (event.type === 'notes' || event.type === 'chapters') {
        load(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subjectId, chapterId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-36 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!chapter || !subject) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-cardBorder text-center shadow-soft">
        <h2 className="text-xl font-bold text-primaryText">{t('chapter_not_found')}</h2>
        <Link
          to={`/subject/${subjectId || ''}`}
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm"
        >
          {t('back_to_chapters')}
        </Link>
      </div>
    );
  }

  const displaySubjectName = isBn ? subject.name : (subject.englishName || subject.name);

  // Filter
  const filteredNotes = notes.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedFileType === 'all' || n.fileType.toLowerCase() === selectedFileType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Breadcrumb Hierarchy Navigation */}
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-secondaryText font-medium">
        <Link to="/" className="hover:text-brand-600 transition-colors py-1">{t('breadcrumb_home')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/subjects" className="hover:text-brand-600 transition-colors py-1">{t('breadcrumb_all_subjects')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/subject/${subject.subjectId}`} className="hover:text-brand-600 transition-colors py-1">
          {displaySubjectName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primaryText font-semibold py-1">{chapter.chapterName}</span>
      </nav>

      {/* Chapter Header Card - Minimal & Clean */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-cardBorder p-5 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
            {displaySubjectName}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-primaryText leading-snug">
            {chapter.chapterName}
          </h1>
        </div>

        {/* Action Buttons: AI Audio & Upload Notes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => {
              if (isItemPlaying(chapter.chapterName)) {
                pause();
              } else {
                play(
                  `${subject.name} বিষয়ের ${chapter.chapterName} অধ্যায়। এসএসসি পরীক্ষার জন্য এই অধ্যায়ের গুরুত্বপূর্ণ নোট ও সহায়িকা নিচে দেওয়া হলো।`,
                  chapter.chapterName,
                  subject.name
                );
              }
            }}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base border transition-all min-h-[48px] active:scale-95 touch-manipulation select-none ${
              isItemPlaying(chapter.chapterName)
                ? 'bg-brand-600 text-white border-brand-600 shadow-soft animate-pulse'
                : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200'
            }`}
            title={t('listen_chapter')}
          >
            {isItemPlaying(chapter.chapterName) ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>{t('audio_pause')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('listen_chapter')}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenUpload(subject.subjectId, chapter.chapterId)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-soft hover:shadow-soft-hover transition-all text-sm sm:text-base min-h-[48px] active:scale-95 touch-manipulation select-none"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t('hero_share_note')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-cardBorder shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_notes_placeholder')}
            className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500 min-h-[44px]"
          />
        </div>

        {/* File Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs">
          <span className="text-secondaryText font-medium sm:hidden">{t('format_label')}</span>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-secondaryText hidden sm:inline" />
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="bg-slate-50 border border-cardBorder rounded-lg px-3 py-2 text-base sm:text-xs font-semibold text-primaryText focus:outline-none focus:border-brand-500 min-h-[44px]"
            >
              <option value="all">{t('filter_all')}</option>
              <option value="pdf">{t('filter_pdf')}</option>
              <option value="jpg">{t('filter_image')}</option>
              <option value="docx">{t('filter_docx')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid or Elegant Empty State */}
      {filteredNotes.length === 0 ? (
        <EmptyNotesState
          chapterName={chapter.chapterName}
          subjectName={subject.name}
          onOpenUpload={() => onOpenUpload(subject.subjectId, chapter.chapterId)}
          backLink={`/subject/${subject.subjectId}`}
          backLinkText={`${displaySubjectName} এর অধ্যায়ে ফিরুন`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
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
  );
};
