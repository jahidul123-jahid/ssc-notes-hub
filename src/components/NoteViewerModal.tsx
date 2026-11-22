import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Flag,
  User,
  School,
  Calendar,
  FileText,
  ExternalLink,
  BookOpen,
  Volume2,
  Pause,
  ArrowLeft,
  Eye,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Note, Subject, Chapter } from '../types';
import { useAudioReader } from '../context/AudioReaderContext';
import { useLanguage } from '../context/LanguageContext';

interface NoteViewerModalProps {
  note: Note | null;
  subject?: Subject;
  chapter?: Chapter;
  onClose: () => void;
  onDownload: (note: Note) => void;
  onReport: (note: Note) => void;
}

export const NoteViewerModal: React.FC<NoteViewerModalProps> = ({
  note,
  subject,
  chapter,
  onClose,
  onDownload,
  onReport
}) => {
  // Step 1: 'overview' (First interface with summary & View Note CTA)
  // Step 2: 'reading' (Distraction-free, easy-to-read interactive PDF reader)
  const [viewStep, setViewStep] = useState<'overview' | 'reading'>('overview');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { play, pause, stop, isItemPlaying } = useAudioReader();
  const { t, isBn } = useLanguage();

  // Stop voice playback immediately when closing or unmounting the viewer
  const handleClose = () => {
    stop();
    onClose();
  };

  React.useEffect(() => {
    return () => {
      if (note) {
        stop();
      }
    };
  }, [note, stop]);

  if (!note) return null;

  const isCurrentNotePlaying = isItemPlaying(note.title);

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      await onDownload(note);
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handleToggleAudio = () => {
    if (isCurrentNotePlaying) {
      pause();
    } else {
      const subjectPart = subject ? `${t('subject')}: ${isBn ? subject.name : (subject.englishName || subject.name)}. ` : '';
      const chapterPart = chapter ? `${t('chapter')}: ${chapter.chapterName}. ` : '';
      const fullText = `${note.title}. ${subjectPart} ${chapterPart} ${note.description}`;
      play(fullText, note.title, isBn ? (subject?.name || 'এসএসসি নোট') : (subject?.englishName || 'SSC Note'));
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/?noteId=${note.noteId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?noteId=${note.noteId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: `${note.title} — SSC Note Box`,
          url: shareUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const displaySubjectName = subject ? (isBn ? subject.name : (subject.englishName || subject.name)) : '';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 pb-safe animate-fade-in"
      onClick={handleClose}
    >
      <div
        className={`relative bg-white w-full rounded-2xl sm:rounded-3xl shadow-2xl border border-cardBorder overflow-hidden my-auto flex flex-col transition-all duration-300 ${
          viewStep === 'reading' 
            ? 'max-w-5xl h-[94vh] h-[94dvh]' 
            : 'max-w-3xl max-h-[90vh] max-h-[90dvh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* HEADER BAR (Adapts based on Overview vs Reading Mode)    */}
        {/* ======================================================== */}
        <div className="p-3.5 sm:p-4 border-b border-cardBorder flex items-center justify-between bg-white shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {viewStep === 'reading' ? (
              <button
                onClick={() => setViewStep('overview')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-primaryText text-xs font-bold transition-all shrink-0 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-brand-600" />
                <span>{isBn ? 'তথ্য ইন্টারফেসে ফিরুন' : 'Back to Info'}</span>
              </button>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  PDF নোট
                </span>
                {subject && (
                  <span className="text-xs font-medium text-secondaryText truncate hidden sm:inline">
                    • {displaySubjectName}
                  </span>
                )}
                {chapter && (
                  <span className="text-xs font-medium text-secondaryText truncate hidden sm:inline">
                    • {chapter.chapterName}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-primaryText truncate mt-0.5">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* AI Audio Reader Button */}
            <button
              onClick={handleToggleAudio}
              className={`min-h-[40px] px-3 flex items-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                isCurrentNotePlaying
                  ? 'bg-brand-600 text-white shadow-soft animate-pulse'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/80'
              }`}
              title={isCurrentNotePlaying ? t('btn_pause') : t('listen_chapter')}
              aria-label="Listen with AI Voice"
            >
              {isCurrentNotePlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">{t('btn_pause')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isBn ? 'অডিও শুনুন' : 'Listen'}</span>
                </>
              )}
            </button>

            {/* Direct Fullscreen Link (when in reading mode) */}
            {viewStep === 'reading' && note.fileURL.startsWith('http') && (
              <a
                href={note.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] px-3 hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-primaryText text-xs font-bold transition-colors"
                title="নতুন ট্যাবে সম্পূর্ণ বড় পর্দায় পড়ুন"
              >
                <Maximize2 className="w-3.5 h-3.5 text-brand-600" />
                <span>ফুলস্ক্রিন</span>
              </a>
            )}

            <button
              onClick={handleCopyLink}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-secondaryText hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors relative active:scale-95"
              title={t('tooltip_copy')}
              aria-label="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                  {t('copied_alert')}
                </span>
              )}
            </button>

            <button
              onClick={handleShare}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-secondaryText hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors active:scale-95"
              title={t('tooltip_share')}
              aria-label="Share note"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {onReport && (
              <button
                onClick={() => onReport(note)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-secondaryText hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
                title={t('tooltip_report')}
                aria-label="Report note"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleClose}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-secondaryText hover:text-primaryText hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODE 1: CLEAN & SMART OVERVIEW INTERFACE                 */}
        {/* ======================================================== */}
        {viewStep === 'overview' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-4">
            {/* Top Clean Smart Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-cardBorder shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-primaryText leading-snug">
                  {note.title}
                </h3>
                <p className="text-xs sm:text-sm text-secondaryText font-medium">
                  পিডিএফটি অনলাইনে পড়ুন অথবা ডাউনলোড করুন
                </p>
              </div>

              {/* Primary Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setViewStep('reading')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-soft hover:shadow-soft-hover transition-all active:scale-95 min-h-[44px]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>পিডিএফটি পড়ুন</span>
                </button>

                <button
                  onClick={handleDownloadClick}
                  disabled={isDownloading}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-primaryText font-bold px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-75 min-h-[44px]"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce text-brand-600' : ''}`} />
                  <span>{isDownloading ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড'}</span>
                </button>
              </div>
            </div>

            {/* Student Details Card */}
            <div className="bg-white p-5 rounded-2xl border border-cardBorder shadow-soft space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-cardBorder/60">
                <User className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-bold text-primaryText uppercase tracking-wider">
                  শিক্ষার্থীর বিবরণ
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-secondaryText block mb-0.5">শিক্ষার্থীর নাম</span>
                  <span className="font-bold text-primaryText text-base">{note.studentName || '—'}</span>
                </div>

                <div>
                  <span className="text-xs text-secondaryText block mb-0.5">স্কুল / শিক্ষাপ্রতিষ্ঠান</span>
                  <span className="font-semibold text-primaryText">{note.schoolName || '—'}</span>
                </div>

                <div>
                  <span className="text-xs text-secondaryText block mb-0.5">বিভাগ ও রোল</span>
                  <span className="font-semibold text-primaryText">
                    {note.section || 'বিজ্ঞান বিভাগ'}{note.rollNumber ? ` • রোল: ${note.rollNumber}` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-secondaryText block mb-0.5">ফাইল সাইজ ও ফরম্যাট</span>
                  <span className="font-semibold text-primaryText">
                    {note.fileSize || 'PDF'} • ফরম্যাট: {note.fileType?.toUpperCase() || 'PDF'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: INTERACTIVE DISTRACTION-FREE PDF READER (পড়ার মোড) */}
        {/* ======================================================== */}
        {viewStep === 'reading' && (
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
            {/* Embedded In-Browser PDF Canvas */}
            <iframe
              src={note.fileURL.startsWith('http') 
                ? `${note.fileURL}#toolbar=1&navpanes=0&scrollbar=1` 
                : note.fileURL}
              className="w-full flex-1 border-0 bg-white"
              title={note.title}
            />

            {/* Bottom Quick-Action Floating Strip */}
            <div className="p-3 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">
                  {isBn ? 'সহজে পড়তে মাউস বা আঙুল দিয়ে স্ক্রল করুন।' : 'Scroll to read pages smoothly.'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {note.fileURL.startsWith('http') && (
                  <a
                    href={note.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>নতুন ট্যাবে দেখুন</span>
                  </a>
                )}

                <button
                  onClick={handleDownloadClick}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow active:scale-95 disabled:opacity-75"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড করুন (PDF)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BOTTOM FOOTER BAR (When in Overview Mode)                */}
        {/* ======================================================== */}
        {viewStep === 'overview' && (
          <div className="p-3 sm:p-4 border-t border-cardBorder bg-white flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold text-secondaryText hover:text-primaryText transition-colors active:scale-95 touch-manipulation text-center"
            >
              {t('btn_close')}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {note.fileURL.startsWith('http') && (
                <a
                  href={note.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-primaryText text-xs sm:text-sm font-bold transition-all active:scale-95 touch-manipulation text-center"
                >
                  <ExternalLink className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="truncate">অন্য একটা নতুন ট্যাবে দেখুন</span>
                </a>
              )}

              <button
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="flex-1 sm:flex-initial min-h-[42px] inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-soft transition-all active:scale-95 disabled:opacity-75 touch-manipulation text-center"
              >
                <Download className={`w-4 h-4 shrink-0 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span className="truncate">{isDownloading ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড করুন'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
