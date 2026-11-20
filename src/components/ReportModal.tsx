import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Note } from '../types';
import { dataService } from '../services/dataService';

interface ReportModalProps {
  note: Note | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ note, onClose }) => {
  const [reason, setReason] = useState<'wrong_notes' | 'inappropriate' | 'copyright' | 'other'>('wrong_notes');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!note) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const reasonTitles = {
      wrong_notes: 'ভুল বা বিভ্রান্তিকর নোট',
      inappropriate: 'অনুপযুক্ত বিষয়বস্তু',
      copyright: 'কপিরাইট বা অনুমতিহীন উপাদান',
      other: 'অন্যান্য সমস্যা'
    };

    try {
      await dataService.submitReport({
        noteId: note.noteId,
        noteTitle: note.title,
        reason,
        reasonText: reasonTitles[reason],
        details: details.trim()
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Report submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-cardBorder overflow-hidden my-auto p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-cardBorder">
          <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
            <Flag className="w-5 h-5" />
            <span>নোট রিপোর্ট করুন</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-secondaryText hover:text-primaryText hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-primaryText">রিপোর্ট গৃহীত হয়েছে</h4>
            <p className="text-xs text-secondaryText leading-relaxed">
              সচেতনতার সাথে রিপোর্ট করার জন্য ধন্যবাদ। অ্যাডমিন দ্রুত বিষয়টি যাচাই করে ব্যবস্থা গ্রহণ করবেন।
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="bg-brand-600 text-white font-semibold px-5 py-2 rounded-xl text-sm"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div>
              <span className="text-xs font-semibold text-secondaryText block mb-1">
                রিপোর্টের বিষয়: <strong className="text-primaryText">{note.title}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-primaryText">
                রিপোর্টের কারণ নির্বাচন করুন *
              </label>

              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-cardBorder hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === 'wrong_notes'}
                    onChange={() => setReason('wrong_notes')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>ভুল তথ্য বা বিভ্রান্তিকর নোট (Wrong notes)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-cardBorder hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === 'inappropriate'}
                    onChange={() => setReason('inappropriate')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>অনুপযুক্ত বিষয়বস্তু (Inappropriate content)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-cardBorder hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === 'copyright'}
                    onChange={() => setReason('copyright')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>কপিরাইট সমস্যা (Copyright issue)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-cardBorder hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === 'other'}
                    onChange={() => setReason('other')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>অন্যান্য কারণ (Other)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1">
                অতিরিক্ত বিবরণ (ঐচ্ছিক)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="সমস্যাটি সম্পর্কে বিস্তারিত লিখুন..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-secondaryText hover:text-primaryText"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-sm transition-all"
              >
                {loading ? 'প্রেরণ হচ্ছে...' : 'রিপোর্ট জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
