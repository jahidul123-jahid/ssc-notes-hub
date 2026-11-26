import React from 'react';
import { Eye, Download, FileText, User, School, Flag, Volume2, Pause } from 'lucide-react';
import { Note } from '../types';
import { useAudioReader } from '../context/AudioReaderContext';
import { useLanguage } from '../context/LanguageContext';

interface NoteCardProps {
  note: Note;
  onView: (note: Note) => void;
  onDownload: (note: Note) => void;
  onReport?: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onView,
  onDownload,
  onReport
}) => {
  const { play, pause, isItemPlaying } = useAudioReader();
  const { t, isBn } = useLanguage();
  const isPlaying = isItemPlaying(note.title);

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      const fullText = isBn
        ? `${note.title}। নোটের বিবরণ: ${note.description}`
        : `${note.title}. Note details: ${note.description}`;
      play(fullText, note.title);
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return t('format_tag_pdf');
      case 'jpg':
      case 'jpeg':
      case 'png':
        return t('format_tag_image');
      case 'docx':
        return t('format_tag_word');
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-cardBorder shadow-soft hover:shadow-soft-hover transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Note Header & Title - Clickable for fast reading */}
      <div 
        onClick={() => onView(note)}
        className="p-5 pb-4 cursor-pointer select-none"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/80">
              <FileText className="w-3 h-3" />
              <span>{getFileTypeLabel(note.fileType)}</span>
            </span>

            {note.resourceType && note.resourceType !== 'note' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                note.resourceType === 'board_question'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : note.resourceType === 'cq'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : note.resourceType === 'mcq_sheet'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : note.resourceType === 'suggestion'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {note.resourceType === 'board_question' && 'বোর্ড প্রশ্ন'}
                {note.resourceType === 'cq' && 'সৃজনশীল (CQ)'}
                {note.resourceType === 'mcq_sheet' && 'MCQ শিট'}
                {note.resourceType === 'suggestion' && 'সাজেশন'}
                {note.resourceType === 'model_test' && 'মডেল টেস্ট'}
                {note.resourceType === 'textbook' && 'পাঠ্যবই'}
              </span>
            )}

            {note.boardName && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                {note.boardName} {note.boardYear || ''}
              </span>
            )}

            {note.downloadCount !== undefined && note.downloadCount > 0 && (
              <span className="text-[11px] font-medium text-secondaryText flex items-center gap-0.5">
                <Download className="w-3 h-3 text-slate-400" />
                <span>{note.downloadCount}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleAudioClick}
              className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 touch-manipulation active:scale-95 ${
                isPlaying
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-secondaryText hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-200/60'
              }`}
              title={isPlaying ? t('btn_pause') : t('btn_listen')}
              aria-label={t('btn_listen')}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current shrink-0" /> : <Volume2 className="w-3.5 h-3.5 shrink-0" />}
              <span className="text-[11px] font-medium hidden sm:inline">
                {isPlaying ? t('btn_pause') : t('btn_listen')}
              </span>
            </button>

            {onReport && (
              <button
                onClick={() => onReport(note)}
                className="text-secondaryText/60 hover:text-rose-500 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-rose-50 transition-colors touch-manipulation active:scale-95"
                title={t('tooltip_report')}
                aria-label="Report note"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-primaryText group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
          {note.title}
        </h3>

        {/* Contributor Information */}
        <div className="mt-4 pt-3 border-t border-cardBorder/60 space-y-1.5 text-xs text-secondaryText">
          <div className="flex items-center gap-1.5 font-semibold text-primaryText">
            <User className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{note.studentName}</span>
          </div>

          {note.schoolName && (
            <div className="flex items-center gap-1.5 truncate">
              <School className="w-3.5 h-3.5 text-secondaryText shrink-0" />
              <span className="truncate">{note.schoolName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Optimized for mobile tap comfort */}
      <div className="p-3.5 sm:p-4 pt-0 grid grid-cols-2 gap-2 sm:gap-2.5 bg-white">
        <button
          onClick={() => onView(note)}
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all border border-brand-200/60 active:scale-95 touch-manipulation shadow-xs select-none"
        >
          <Eye className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="truncate">{t('btn_view_note')}</span>
        </button>

        <button
          onClick={() => onDownload(note)}
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all shadow-soft hover:shadow-soft-hover active:scale-95 touch-manipulation select-none"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="truncate">{t('btn_download')}</span>
        </button>
      </div>
    </div>
  );
};
