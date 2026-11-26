import React, { useState } from 'react';
import { User, Sparkles, AlertCircle } from 'lucide-react';
import { studentService } from '../services/studentService';

interface StudentNameModalProps {
  isOpen: boolean;
  onSuccess: (name: string) => void;
  onCancel?: () => void;
}

export const StudentNameModal: React.FC<StudentNameModalProps> = ({
  isOpen,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }

    if (trimmed.length < 2) {
      setError('নাম কমপক্ষে ২ অক্ষরের হতে হবে');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await studentService.registerStudentName(trimmed);
      onSuccess(trimmed);
    } catch (err: any) {
      setError(err?.message || 'নাম সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-brand-200/60 dark:border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-5 relative z-10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-brand-500 to-violetAccent flex items-center justify-center text-white shadow-soft">
            <User className="w-6 h-6" />
          </div>
          <h3 id="modal-title" className="text-xl font-black text-primaryText tracking-tight">
            Enter Your Name
          </h3>
          <p className="text-xs text-secondaryText mt-1">
            লিডারবোর্ড ও পরীক্ষার ফলাফলের জন্য আপনার নাম একবারই প্রয়োজন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              আপনার নাম
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Your Name"
              className="w-full px-4 py-3 text-sm rounded-xl border border-cardBorder focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition-colors"
              >
                বাতিল
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 shadow-soft hover:shadow-soft-hover transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'Continue to Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
