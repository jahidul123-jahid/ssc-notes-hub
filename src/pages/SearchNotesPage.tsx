import React, { useState, useEffect, useMemo } from 'react';
import { Subject, Chapter, Note } from '../types';
import { dataService } from '../services/dataService';
import { dataEvents } from '../services/dataEvents';
import { NoteCard } from '../components/NoteCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Filter,
  BookOpen,
  RefreshCw
} from 'lucide-react';

interface SearchNotesPageProps {
  onViewNote: (note: Note) => void;
  onDownloadNote: (note: Note) => void;
  onReportNote: (note: Note) => void;
}

export const SearchNotesPage: React.FC<SearchNotesPageProps> = ({
  onViewNote,
  onDownloadNote,
  onReportNote
}) => {
  const { isBn } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadData = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const [subList, chapList, noteList] = await Promise.all([
          dataService.getSubjects(),
          dataService.getChapters(),
          dataService.getNotes('approved')
        ]);
        if (!isMounted) return;
        setSubjects(subList);
        setChapters(chapList);
        setNotes(noteList);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();

    const unsubscribe = dataEvents.subscribe((event) => {
      if (event.type === 'notes' || event.type === 'subjects' || event.type === 'chapters') {
        loadData(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Filtered chapters according to selected subject
  const availableChapters = useMemo(() => {
    if (selectedSubject === 'all') return chapters;
    return chapters.filter(c => c.subjectId === selectedSubject);
  }, [chapters, selectedSubject]);

  // Filter & Search Logic
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const q = query.toLowerCase().trim();

      if (q) {
        const title = n.title.toLowerCase();
        const student = n.studentName.toLowerCase();
        const school = n.schoolName.toLowerCase();

        const match = title.includes(q) || student.includes(q) || school.includes(q);
        if (!match) return false;
      }

      if (selectedSubject !== 'all' && n.subjectId !== selectedSubject) {
        return false;
      }

      if (selectedChapter !== 'all' && n.chapterId !== selectedChapter) {
        return false;
      }

      if (selectedFileType !== 'all' && n.fileType.toLowerCase() !== selectedFileType.toLowerCase()) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, query, selectedSubject, selectedChapter, selectedFileType]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedSubject('all');
    setSelectedChapter('all');
    setSelectedFileType('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-primaryText">
          {isBn ? 'নোট অনুসন্ধান' : 'Search Notes'}
        </h1>

        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isBn ? 'নোট শিরোনাম বা শিক্ষার্থীর নাম দিয়ে খুঁজুন...' : 'Search by note title or student name...'}
            className="w-full pl-10 pr-4 py-2.5 text-base sm:text-sm bg-white rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 shadow-sm min-h-[44px]"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-cardBorder shadow-soft space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-cardBorder/60">
          <div className="flex items-center gap-2 text-xs font-bold text-primaryText">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            <span>{isBn ? 'ফিল্টার' : 'Filters'}</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg hover:bg-brand-50 active:scale-95 touch-manipulation transition-all select-none"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isBn ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedChapter('all');
              }}
              className="w-full bg-slate-50 border border-cardBorder rounded-xl p-2.5 font-medium text-primaryText focus:outline-none focus:border-brand-500 text-base sm:text-xs min-h-[44px]"
            >
              <option value="all">{isBn ? 'সকল বিষয়' : 'All Subjects'}</option>
              {subjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {isBn ? s.name : (s.englishName || s.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={selectedSubject === 'all'}
              className="w-full bg-slate-50 border border-cardBorder rounded-xl p-2.5 font-medium text-primaryText focus:outline-none focus:border-brand-500 disabled:opacity-50 text-base sm:text-xs min-h-[44px]"
            >
              <option value="all">{isBn ? 'সকল অধ্যায়' : 'All Chapters'}</option>
              {availableChapters.map((c) => (
                <option key={c.chapterId} value={c.chapterId}>
                  {c.chapterName}
                </option>
              ))}
            </select>
          </div>

          {/* File Type Filter */}
          <div>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full bg-slate-50 border border-cardBorder rounded-xl p-2.5 font-medium text-primaryText focus:outline-none focus:border-brand-500 text-base sm:text-xs min-h-[44px]"
            >
              <option value="all">{isBn ? 'সকল ফাইল ফরম্যাট' : 'All File Formats'}</option>
              <option value="pdf">PDF</option>
              <option value="jpg">{isBn ? 'ছবি (JPG/PNG)' : 'Images (JPG/PNG)'}</option>
              <option value="docx">DOCX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cardBorder p-12 text-center shadow-soft">
          <BookOpen className="w-12 h-12 text-secondaryText mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-primaryText">{isBn ? 'কোনো নোট পাওয়া যায়নি' : 'No notes found'}</h3>
        </div>
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
