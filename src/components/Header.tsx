import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, Upload, ShieldAlert, ArrowRight, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isOwner } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_subjects'), path: '/subjects' },
    { name: t('nav_search'), path: '/search' },
    { name: t('nav_about'), path: '/about' },
    { name: t('nav_contact'), path: '/contact' },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Announcement Bar with Safe Area Support */}
      <div className="bg-brand-700 text-white text-[11px] sm:text-xs font-semibold py-2 px-3 sm:px-4 shadow-sm select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link
            to="/about"
            className="flex items-center gap-1.5 hover:text-amber-200 transition-colors mx-auto sm:mx-0 group text-center sm:text-left min-w-0"
          >
            <span className="truncate">
              {t('top_announcement')}
            </span>
            <ArrowRight className="w-3.5 h-3.5 inline shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Top Corner Language Quick Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold transition-all active:scale-95 border border-white/20"
              title={language === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span className={language === 'en' ? 'text-amber-300 font-extrabold' : 'opacity-70'}>EN</span>
              <span className="opacity-40">|</span>
              <span className={language === 'bn' ? 'text-amber-300 font-extrabold' : 'opacity-70'}>বাং</span>
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cardBorder shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
            {/* Logo and Brand */}
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none min-w-0 shrink"
              onClick={handleLinkClick}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-violetAccent flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200 shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-lg sm:text-2xl font-bold tracking-tight text-primaryText group-hover:text-brand-600 transition-colors truncate">
                SSC Notes Hub
              </span>
            </Link>

            {/* Desktop Navigation Quick Actions */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-semibold transition-colors py-2 ${
                    isActive(item.path) ? 'text-brand-600 font-bold' : 'text-primaryText hover:text-brand-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Language Switcher Pill in Navbar */}
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cardBorder bg-slate-50 hover:bg-slate-100 text-xs font-bold transition-all active:scale-95 min-h-[44px]"
                title={language === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
                aria-label="Toggle language"
              >
                <Globe className="w-4 h-4 text-brand-600" />
                <span className={language === 'en' ? 'text-brand-600 font-extrabold' : 'text-secondaryText'}>EN</span>
                <span className="text-slate-300">|</span>
                <span className={language === 'bn' ? 'text-brand-600 font-extrabold' : 'text-secondaryText'}>বাংলা</span>
              </button>

              {/* Upload CTA */}
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-soft hover:shadow-soft-hover transition-all duration-200 hover:-translate-y-0.5 text-sm min-h-[44px]"
              >
                <Upload className="w-4 h-4" />
                <span>{t('nav_upload')}</span>
              </button>

              {/* Owner Admin Access Button */}
              <Link
                to="/owner-control"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isOwner
                    ? 'bg-purple-100/80 text-brand-700 border-brand-300 ring-2 ring-brand-400/20'
                    : 'bg-purple-50 text-brand-600 border-brand-200 hover:bg-brand-100'
                }`}
                title={isOwner ? "অ্যাডমিন ড্যাশবোর্ড (লগইন করা আছে)" : "মালিক / অ্যাডমিন প্যানেল"}
                aria-label="Owner Control Panel"
              >
                <ShieldAlert className="w-5 h-5" />
              </Link>
            </div>

            {/* Mobile Actions (Guaranteed 44x44px minimum touch targets) */}
            <div className="flex items-center gap-1 sm:gap-2 lg:hidden shrink-0">
              {/* Mobile Language Button */}
              <button
                onClick={toggleLanguage}
                className="min-h-[44px] px-2.5 flex items-center gap-1 text-xs font-bold rounded-xl text-primaryText bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95 border border-cardBorder"
                aria-label="Toggle language"
              >
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>{language === 'en' ? 'EN' : 'বাং'}</span>
              </button>

              <button
                onClick={onOpenUpload}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors active:scale-95"
                aria-label="Upload Note"
              >
                <Upload className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-primaryText hover:text-brand-600 hover:bg-brand-50 focus:outline-none transition-colors active:scale-95"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Drawer Menu with Safe Area Support */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[56px] sm:top-[80px] z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white border-b border-cardBorder shadow-2xl p-5 sm:p-6 space-y-4 max-h-[calc(100dvh-60px)] overflow-y-auto pb-safe scroll-touch"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Upload action in menu */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenUpload();
              }}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-500 to-violetAccent text-white py-3.5 px-4 rounded-xl font-bold shadow-soft hover:opacity-95 min-h-[48px] text-base"
            >
              <Upload className="w-5 h-5" />
              <span>{t('nav_upload_btn')}</span>
            </button>

            {/* Language Switcher in Mobile Drawer */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-cardBorder">
              <span className="text-sm font-semibold text-primaryText flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600" />
                <span>ভাষা / Language:</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleLanguage()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === 'en'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-secondaryText border border-cardBorder'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => toggleLanguage()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === 'bn'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-secondaryText border border-cardBorder'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            <nav className="divide-y divide-cardBorder/60 pt-2">
              {navLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center min-h-[48px] py-3 px-3 rounded-xl text-base font-semibold transition-colors ${
                      active
                        ? 'text-brand-600 bg-brand-50 font-bold'
                        : 'text-primaryText hover:text-brand-600 hover:bg-brand-50/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Owner panel navigation */}
              <Link
                to="/owner-control"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 min-h-[48px] py-3 px-3.5 rounded-xl text-base font-bold mt-3 border transition-colors ${
                  isOwner
                    ? 'text-brand-800 bg-brand-50 border-brand-200'
                    : 'text-secondaryText bg-slate-50 border-cardBorder hover:text-brand-600'
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-brand-600" />
                <span>{t('owner_panel')}</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
