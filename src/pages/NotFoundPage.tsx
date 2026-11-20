import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-cardBorder shadow-soft space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-soft">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-4xl font-black text-brand-600">404</span>
          <h2 className="text-xl font-bold text-primaryText">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h2>
        </div>
        <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
          আপনি যে পেজটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent text-white font-bold px-6 py-2.5 rounded-xl shadow-soft text-sm"
          >
            <Home className="w-4 h-4" />
            <span>মূল পাতায় ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
