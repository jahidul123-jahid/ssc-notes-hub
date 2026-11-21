import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

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
              {t('nav_home')}
            </Link>
            <Link to="/subjects" className="hover:text-brand-600 transition-colors">
              {t('nav_subjects')}
            </Link>
            <Link to="/search" className="hover:text-brand-600 transition-colors">
              {t('nav_search')}
            </Link>
            <Link to="/about" className="hover:text-brand-600 transition-colors">
              {t('nav_about')}
            </Link>
            <Link to="/contact" className="hover:text-brand-600 transition-colors">
              {t('nav_contact')}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondaryText">
          <p>
            © {new Date().getFullYear()} SSC Notes Hub. {t('footer_copyright')}
          </p>
          <p>
            {t('footer_founder')}
          </p>
        </div>
      </div>
    </footer>
  );
};
