import React from 'react';
import { Eye, Download, FileText, User, School, Flag, Volume2, Pause } from 'lucide-react';
import { Note } from '../types';
import { useAudioReader } from '../context/AudioReaderContext';

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
  const isPlaying = isItemPlaying(note.title);

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      const fullText = `${note.title}। নোটের বিবরণ: ${note.description}`;
      play(fullText, note.title);
    }
  };
  const getFileTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'PDF';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'ছবি';
      case 'docx':
        return 'Word';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-cardBorder shadow-soft hover:shadow-soft-hover transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Note Header & Title */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/80">
            <FileText className="w-3 h-3" />
            <span>{getFileTypeLabel(note.fileType)}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleAudioClick}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                isPlaying
                  ? 'bg-brand-600 text-white'
                  : 'text-secondaryText hover:text-brand-600 hover:bg-brand-50'
              }`}
              title="এআই দিয়ে শুনুন"
              aria-label="Listen with AI"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-medium hidden sm:inline">শুনুন</span>
            </button>

            {onReport && (
              <button
                onClick={() => onReport(note)}
                className="text-secondaryText/60 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="রিপোর্ট করুন"
                aria-label="Report note"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-primaryText group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
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

      {/* Action Buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2.5 bg-white">
        <button
          onClick={() => onView(note)}
          className="inline-flex items-center justify-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-2.5 px-3 rounded-xl text-sm transition-colors border border-brand-200/60"
        >
          <Eye className="w-4 h-4 text-brand-600" />
          <span>নোট দেখুন</span>
        </button>

        <button
          onClick={() => onDownload(note)}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white font-semibold py-2.5 px-3 rounded-xl text-sm transition-all shadow-sm hover:shadow-soft"
        >
          <Download className="w-4 h-4" />
          <span>ডাউনলোড</span>
        </button>
      </div>
    </div>
  );
};
