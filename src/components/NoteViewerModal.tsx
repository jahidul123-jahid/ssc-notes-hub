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
  ZoomIn,
  BookOpen,
  Volume2,
  Pause
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
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { play, pause, isItemPlaying } = useAudioReader();
  const { t, isBn } = useLanguage();

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
          text: `${note.title} — SSC Notes Hub`,
          url: shareUrl,
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const isImage = ['jpg', 'jpeg', 'png'].includes(note.fileType.toLowerCase());

  const formattedDate = new Date(note.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const displaySubjectName = subject ? (isBn ? subject.name : (subject.englishName || subject.name)) : '';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 pb-safe animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-cardBorder overflow-hidden my-auto max-h-[92vh] max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-cardBorder flex items-center justify-between bg-white shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-100/70 text-brand-700 uppercase">
                  {note.fileType.toUpperCase()}
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
              <h2 className="text-sm sm:text-lg font-bold text-primaryText truncate mt-0.5">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            {/* AI Audio Reader Button */}
            <button
              onClick={handleToggleAudio}
              className={`min-h-[44px] px-3 flex items-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                isCurrentNotePlaying
                  ? 'bg-brand-600 text-white shadow-soft animate-pulse'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/80'
              }`}
              title={isCurrentNotePlaying ? t('btn_pause') : t('listen_chapter')}
              aria-label="Listen with AI Voice"
            >
              {isCurrentNotePlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">{t('btn_pause')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('btn_listen')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-secondaryText hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors relative active:scale-95"
              title={t('tooltip_copy')}
              aria-label="Copy link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                  {t('copied_alert')}
                </span>
              )}
            </button>

            <button
              onClick={handleShare}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-secondaryText hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors active:scale-95"
              title={t('tooltip_share')}
              aria-label="Share note"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => onReport(note)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-secondaryText hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
              title={t('tooltip_report')}
              aria-label="Report note"
            >
              <Flag className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-secondaryText hover:text-primaryText hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
          {/* Document / Image Viewer Canvas */}
          <div className="bg-white rounded-xl border border-cardBorder shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[340px] sm:min-h-[460px] relative">
            {isImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-3">
                <img
                  src={note.fileURL}
                  alt={note.title}
                  className={`max-h-[500px] w-auto object-contain rounded-lg transition-transform duration-300 ${
                    isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm text-xs flex items-center gap-1.5"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>{isZoomed ? t('zoom_out') : t('zoom_in')}</span>
                </button>
              </div>
            ) : (
              /* PDF & Document Interactive Reader */
              <div className="w-full flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-inner">
                {/* PDF In-Viewer Top Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 bg-slate-800 text-white text-xs border-b border-slate-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-slate-100 truncate">
                      {isBn ? 'অনলাইনে সরাসরি পড়ুন' : 'Read Document Online'} ({note.fileType.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleToggleAudio}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCurrentNotePlaying
                          ? 'bg-brand-600 text-white animate-pulse'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                      title={isCurrentNotePlaying ? t('btn_pause') : t('listen_chapter')}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isCurrentNotePlaying ? t('btn_pause') : (isBn ? 'অডিও শুনুন' : 'Listen')}</span>
                    </button>

                    {note.fileURL.startsWith('http') && (
                      <a
                        href={note.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs transition-colors"
                        title={isBn ? 'নতুন ট্যাবে বড় করে পড়ুন' : 'Open in new tab'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ফুলস্ক্রিন' : 'Fullscreen'}</span>
                      </a>
                    )}

                    <button
                      onClick={handleDownloadClick}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-soft transition-all active:scale-95 disabled:opacity-75"
                    >
                      <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                      <span>{isDownloading ? (isBn ? 'হচ্ছে...' : 'Downloading...') : (isBn ? 'ডাউনলোড' : 'Download')}</span>
                    </button>
                  </div>
                </div>

                {/* Embedded PDF Canvas / Viewer */}
                {note.fileURL.toLowerCase().includes('.pdf') || note.fileType.toLowerCase() === 'pdf' ? (
                  <div className="relative w-full h-[480px] sm:h-[620px] bg-slate-800">
                    <iframe
                      src={note.fileURL.startsWith('http') 
                        ? `${note.fileURL}#toolbar=1&navpanes=0&scrollbar=1` 
                        : note.fileURL}
                      className="w-full h-full border-0 bg-white"
                      title={note.title}
                    />
                  </div>
                ) : (
                  /* Other document types preview */
                  <div className="w-full min-h-[360px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-brand-50/30 to-white text-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-200 text-brand-600 flex items-center justify-center mb-3 shadow-soft">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-primaryText max-w-md">
                      {note.title}
                    </h4>
                    <p className="text-xs text-secondaryText mt-1 max-w-lg leading-relaxed">
                      {note.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 font-semibold">
                        {note.fileType.toUpperCase()}
                      </span>
                      {note.fileSize && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {note.fileSize}
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <button
                        onClick={handleDownloadClick}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-soft hover:shadow-soft-hover transition-all text-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isBn ? 'সরাসরি ফাইল ডাউনলোড করুন' : 'Download File'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Note Info & Contributor Details */}
          <div className="bg-white rounded-xl border border-cardBorder p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-primaryText mb-3">{t('note_details_title')}</h3>
            <p className="text-sm text-secondaryText leading-relaxed">
              {note.description}
            </p>

            <div className="mt-6 pt-5 border-t border-cardBorder grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contributor Profile */}
              <div className="bg-brand-50/60 p-4 rounded-xl border border-brand-200/50 space-y-2">
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                  {t('contributor_student')}
                </span>
                <div className="flex items-center gap-2 text-base font-bold text-primaryText">
                  <User className="w-4 h-4 text-brand-500" />
                  <span>{note.studentName}</span>
                </div>
                <div className="text-xs text-secondaryText flex items-center gap-2">
                  <span>{t('roll_number')}: <strong>{note.rollNumber}</strong></span>
                  <span>•</span>
                  <span>{t('section')}: <strong>{note.section}</strong></span>
                </div>
                <div className="text-xs text-secondaryText flex items-center gap-1.5 pt-1">
                  <School className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span className="font-medium text-primaryText">{note.schoolName}</span>
                </div>
              </div>

              {/* Subject & Meta Information */}
              <div className="bg-slate-50 p-4 rounded-xl border border-cardBorder space-y-2">
                <span className="text-[11px] font-bold text-secondaryText uppercase tracking-wider block">
                  {t('curriculum_meta')}
                </span>
                {subject && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-primaryText">
                    <BookOpen className="w-4 h-4 text-brand-500" />
                    <span>{t('subject')}: {displaySubjectName}</span>
                  </div>
                )}
                {chapter && (
                  <div className="text-xs text-secondaryText">
                    {t('chapter')}: <strong className="text-primaryText">{chapter.chapterName}</strong>
                  </div>
                )}
                <div className="text-xs text-secondaryText flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  <span>{t('upload_date')}: {formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3.5 sm:p-4 border-t border-cardBorder bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-secondaryText">
            <span className="font-semibold text-primaryText">বিনামূল্যে SSC প্রস্তুতি:</span>
            <span>সব নোট বিনামূল্যে পড়া ও ডাউনলোড করা যায়।</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-secondaryText hover:text-primaryText transition-colors active:scale-95"
            >
              {t('btn_close')}
            </button>

            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-soft hover:shadow-soft-hover transition-all active:scale-95 disabled:opacity-75"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Downloading...') : (isBn ? 'ডাউনলোড করুন (ফ্রি)' : 'Download Free')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
