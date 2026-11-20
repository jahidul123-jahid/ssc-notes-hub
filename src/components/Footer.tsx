import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-cardBorder mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-cardBorder/60">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violetAccent flex items-center justify-center text-white shadow-soft">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primaryText">
              SSC Notes Hub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-secondaryText">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              হোম
            </Link>
            <Link to="/subjects" className="hover:text-brand-600 transition-colors">
              সকল বিষয়
            </Link>
            <Link to="/search" className="hover:text-brand-600 transition-colors">
              নোট খুঁজুন
            </Link>
            <Link to="/about" className="hover:text-brand-600 transition-colors">
              আমাদের সম্পর্কে
            </Link>
            <Link to="/contact" className="hover:text-brand-600 transition-colors">
              যোগাযোগ
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondaryText">
          <p>
            © {new Date().getFullYear()} SSC Notes Hub. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p>
            প্রতিষ্ঠাতা: <strong className="text-primaryText font-semibold">জাহিদুল ইসলাম</strong> (নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়)
          </p>
        </div>
      </div>
    </footer>
  );
};
