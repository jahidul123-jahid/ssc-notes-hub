import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Download,
  Eye,
  Filter,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Award,
  Layers,
  FileCheck,
  CheckCircle2,
  Calendar,
  Share2
} from 'lucide-react';
import { Note, Subject, ResourceType } from '../types';
import { dataService } from '../services/dataService';
import { NoteCard } from '../components/NoteCard';
import { useLanguage } from '../context/LanguageContext';

interface ResourceCenterPageProps {
  onOpenUpload: (subjectId?: string) => void;
  onViewNote: (note: Note) => void;
  onDownloadNote: (note: Note) => void;
  onReportNote: (note: Note) => void;
}

const RESOURCE_CATEGORIES: { id: ResourceType | 'all'; labelBn: string; labelEn: string; icon: any }[] = [
  { id: 'all', labelBn: 'সকল রিসোর্স', labelEn: 'All Resources', icon: Layers },
  { id: 'board_question', labelBn: 'বোর্ড প্রশ্ন ও উত্তর', labelEn: 'Board Questions', icon: Award },
  { id: 'cq', labelBn: 'সৃজনশীল প্রশ্ন (CQ)', labelEn: 'Creative Questions (CQ)', icon: FileCheck },
  { id: 'mcq_sheet', labelBn: 'MCQ প্রস্তুতি শিট', labelEn: 'MCQ Sheets', icon: CheckCircle2 },
  { id: 'suggestion', labelBn: 'অধ্যায়ভিত্তিক সাজেশন', labelEn: 'Chapter Suggestions', icon: Sparkles },
  { id: 'model_test', labelBn: 'মডেল টেস্ট প্রশ্নপত্র', labelEn: 'Model Tests', icon: GraduationCap },
  { id: 'note', labelBn: 'হ্যান্ডনোট ও গাইড', labelEn: 'Notes & Guides', icon: BookOpen }
];

export const ResourceCenterPage: React.FC<ResourceCenterPageProps> = ({
  onOpenUpload,
  onViewNote,
  onDownloadNote,
  onReportNote
}) => {
  const { isBn } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ResourceType | 'all'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedBoardYear, setSelectedBoardYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [allNotes, allSubs] = await Promise.all([
          dataService.getNotes('approved'),
          dataService.getSubjects()
        ]);
        if (!isMounted) return;
        setNotes(allNotes);
        setSubjects(allSubs);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered & Sorted Notes
  const filteredResources = useMemo(() => {
    let result = [...notes];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(n => {
        if (selectedCategory === 'note') {
          return !n.resourceType || n.resourceType === 'note' || n.resourceType === 'handwritten';
        }
        return n.resourceType === selectedCategory;
      });
    }

    // Subject filter
    if (selectedSubjectId !== 'all') {
      result = result.filter(n => n.subjectId === selectedSubjectId);
    }

    // Board Year filter
    if (selectedBoardYear !== 'all') {
      result = result.filter(n => n.boardYear === selectedBoardYear || n.title.includes(selectedBoardYear));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.studentName.toLowerCase().includes(q) ||
          (n.boardName && n.boardName.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [notes, selectedCategory, selectedSubjectId, selectedBoardYear, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-secondaryText font-medium">
        <Link to="/" className="hover:text-brand-600 transition-colors">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primaryText font-semibold">স্টাডি রিসোর্স সেন্টার</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-10 text-white shadow-soft overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NCTB এসএসসি সমৃদ্ধ রিসোর্স ভান্ডার</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-amber-300 leading-tight">
            এসএসসি স্টাডি রিসোর্স সেন্টার
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            সকল বোর্ডের বিগত বছরের প্রশ্ন, সৃজনশীল (CQ), বহুনির্বাচনী (MCQ), অধ্যায়ভিত্তিক শর্টকাট সাজেশন ও মডেল টেস্ট এক ক্লিকে ডাউনলোড করুন।
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => onOpenUpload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base shadow-soft transition-all cursor-pointer active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            <span>আপনার রিসোর্স শেয়ার করুন</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {RESOURCE_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isBn ? cat.labelBn : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cardBorder shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="রিসোর্স বা বিষয় লিখে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Subject Filter */}
        <div>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500 text-primaryText font-medium"
          >
            <option value="all">সকল বিষয় (All Subjects)</option>
            {subjects.map(s => (
              <option key={s.subjectId} value={s.subjectId}>
                {s.name} ({s.englishName})
              </option>
            ))}
          </select>
        </div>

        {/* Board Year Filter */}
        <div>
          <select
            value={selectedBoardYear}
            onChange={e => setSelectedBoardYear(e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500 text-primaryText font-medium"
          >
            <option value="all">সকল সালের বোর্ড প্রশ্ন</option>
            <option value="2025">২০২৫ সালের বোর্ড প্রশ্ন</option>
            <option value="2024">২০২৪ সালের বোর্ড প্রশ্ন</option>
            <option value="2023">২০২৩ সালের বোর্ড প্রশ্ন</option>
            <option value="2022">২০২২ সালের বোর্ড প্রশ্ন</option>
            <option value="2020">২০২০ সালের বোর্ড প্রশ্ন</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-cardBorder rounded-xl focus:outline-none focus:border-brand-500 text-primaryText font-medium"
          >
            <option value="newest">নতুন সংযোজিত (Newest First)</option>
            <option value="popular">জনপ্রিয় / সর্বাধিক ডাউনলোড (Popular)</option>
          </select>
        </div>
      </div>

      {/* Results Count & Current Filter Badge */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondaryText px-1">
        <span>
          মোট <strong className="text-brand-600 font-bold">{filteredResources.length}</strong> টি রিসোর্স পাওয়া গেছে
        </span>
        {(selectedCategory !== 'all' || selectedSubjectId !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubjectId('all');
              setSelectedBoardYear('all');
              setSearchQuery('');
            }}
            className="text-xs text-brand-600 hover:underline cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        )}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredResources.map(note => (
            <NoteCard
              key={note.noteId}
              note={note}
              onView={onViewNote}
              onDownload={onDownloadNote}
              onReport={onReportNote}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cardBorder p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-primaryText">কোনো রিসোর্স পাওয়া যায়নি</h3>
          <p className="text-xs sm:text-sm text-secondaryText max-w-md mx-auto">
            আপনার নির্বাচিত ফিল্টার বা সার্চ শব্দের সাথে মিল রেখে কোনো রিসোর্স খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।
          </p>
        </div>
      )}
    </div>
  );
};
