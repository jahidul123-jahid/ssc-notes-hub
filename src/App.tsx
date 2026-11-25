import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioReaderProvider } from './context/AudioReaderContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollRestorationManager } from './components/ScrollRestorationManager';
import { AIAudioPlayer } from './components/AIAudioPlayer';
import { NoteViewerModal } from './components/NoteViewerModal';
import { UploadModal } from './components/UploadModal';
import { ReportModal } from './components/ReportModal';
import { HomePage } from './pages/HomePage';
import { SubjectsPage } from './pages/SubjectsPage';
import { SubjectDetailsPage } from './pages/SubjectDetailsPage';
import { ChapterDetailsPage } from './pages/ChapterDetailsPage';
import { SearchNotesPage } from './pages/SearchNotesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { OwnerControlPage } from './pages/OwnerControlPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Subject, Chapter, Note } from './types';
import { dataService, initSupabaseRealtime } from './services/dataService';
import { dataEvents } from './services/dataEvents';
import { telegramService } from './services/telegramService';

const AppContent: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadSubjectId, setUploadSubjectId] = useState<string | undefined>();
  const [uploadChapterId, setUploadChapterId] = useState<string | undefined>();

  const [activeNoteForView, setActiveNoteForView] = useState<Note | null>(null);
  const [activeNoteForReport, setActiveNoteForReport] = useState<Note | null>(null);

  // Check URL params for direct shared note links (e.g. /?noteId=note-phy-01)
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Initialize live realtime sync
    initSupabaseRealtime();

    const loadInitData = async () => {
      const [subs, chaps] = await Promise.all([
        dataService.getSubjects(),
        dataService.getChapters()
      ]);
      setSubjects(subs);
      setChapters(chaps);

      // Check for noteId query
      const noteIdParam = searchParams.get('noteId');
      if (noteIdParam) {
        const targetNote = await dataService.getNoteById(noteIdParam);
        if (targetNote) {
          setActiveNoteForView(targetNote);
        }
      }
      // Notify owner of new visitor in background
      telegramService.notifyVisitor().catch(() => {});
    };
    loadInitData();

    // Subscribe to curriculum changes (new subjects, chapters) to update state automatically
    const unsubscribe = dataEvents.subscribe((event) => {
      if (event.type === 'subjects' || event.type === 'chapters') {
        dataService.getSubjects().then(setSubjects);
        dataService.getChapters().then(setChapters);
      }
    });

    return () => unsubscribe();
  }, [searchParams]);

  const handleOpenUpload = (subjectId?: string, chapterId?: string) => {
    setUploadSubjectId(subjectId);
    setUploadChapterId(chapterId);
    setUploadOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setActiveNoteForView(note);
  };

  const handleDownloadNote = async (note: Note) => {
    // 1. Increment download count in database
    const newCount = await dataService.incrementDownload(note.noteId);
    if (activeNoteForView && activeNoteForView.noteId === note.noteId) {
      setActiveNoteForView({ ...activeNoteForView, downloadCount: newCount });
    }

    // 2. Reliable direct download for mobile & desktop
    if (!note.fileURL) return;

    try {
      // Fetch as blob to force real file download rather than opening in tab
      const res = await fetch(note.fileURL);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const cleanFileName = `${note.title.replace(/[/\\?%*:|"<>]/g, '_')}.${note.fileType || 'pdf'}`;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      // Fallback for cross-origin restricted URLs: direct window open or anchor
      const link = document.createElement('a');
      link.href = note.fileURL;
      link.download = `${note.title.replace(/[/\\?%*:|"<>]/g, '_')}.${note.fileType || 'pdf'}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReportNote = (note: Note) => {
    setActiveNoteForReport(note);
  };

  // Get current active note's subject & chapter for the modal header
  const currentSubject = activeNoteForView
    ? subjects.find(s => s.subjectId === activeNoteForView.subjectId)
    : undefined;

  const currentChapter = activeNoteForView
    ? chapters.find(c => c.chapterId === activeNoteForView.chapterId)
    : undefined;

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-white">
      {/* Scroll restoration manager ensuring page opens at top and preserves back/forward history */}
      <ScrollRestorationManager />

      {/* Global Header */}
      <Header onOpenUpload={() => handleOpenUpload()} />

      {/* Main Page Routing */}
      <main className="flex-1">
        <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onOpenUpload={handleOpenUpload}
                  onViewNote={handleViewNote}
                  onDownloadNote={handleDownloadNote}
                  onReportNote={handleReportNote}
                />
              }
            />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route
              path="/subject/:subjectId"
              element={
                <SubjectDetailsPage
                  onOpenUpload={handleOpenUpload}
                  onViewNote={handleViewNote}
                  onDownloadNote={handleDownloadNote}
                  onReportNote={handleReportNote}
                />
              }
            />
            <Route
              path="/subject/:subjectId/chapter/:chapterId"
              element={
                <ChapterDetailsPage
                  onOpenUpload={handleOpenUpload}
                  onViewNote={handleViewNote}
                  onDownloadNote={handleDownloadNote}
                  onReportNote={handleReportNote}
                />
              }
            />
            <Route
              path="/search"
              element={
                <SearchNotesPage
                  onViewNote={handleViewNote}
                  onDownloadNote={handleDownloadNote}
                  onReportNote={handleReportNote}
                />
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Owner Admin Secret Gateway (Public routes like /admin and /owner are removed and 404) */}
            <Route path="/jahidul-secret-panel-2026" element={<OwnerControlPage />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating Global AI Audio Player */}
      <AIAudioPlayer />

      {/* Interactive Note Viewer Modal */}
      <NoteViewerModal
        note={activeNoteForView}
        subject={currentSubject}
        chapter={currentChapter}
        onClose={() => setActiveNoteForView(null)}
        onDownload={handleDownloadNote}
        onReport={handleReportNote}
      />

      {/* Upload Note Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        subjects={subjects}
        initialSubjectId={uploadSubjectId}
        initialChapterId={uploadChapterId}
        onUploadSuccess={async () => {
          const [subs, chaps] = await Promise.all([
            dataService.getSubjects(),
            dataService.getChapters()
          ]);
          setSubjects(subs);
          setChapters(chaps);
        }}
      />

      {/* Report Note Modal */}
      <ReportModal
        note={activeNoteForReport}
        onClose={() => setActiveNoteForReport(null)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AudioReaderProvider>
            <AppContent />
          </AudioReaderProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
