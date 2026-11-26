import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Upload, ShieldAlert, Globe, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationCenterModal } from './NotificationCenterModal';

interface HeaderProps {
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [headerBottom, setHeaderBottom] = useState<number>(56);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  // Dynamically track exact header bottom coordinate to position the mobile drawer perfectly
  useEffect(() => {
    const updatePosition = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderBottom(Math.round(rect.bottom));
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen]);

  // Lock body scroll on mobile when menu drawer is open (prevents iOS/Android background scroll)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close menu on route change or Escape key
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAdminClick = () => {
    setIsOpen(false);
    navigate('/jahidul-secret-panel-2026?key=786');
  };

  const navLinks = [
    { name: t('nav_home'), path: '/' },
    { name: 'রিসোর্স সেন্টার', path: '/resources' },
    { name: 'পরীক্ষা', path: '/exams' },
    { name: 'কমিউনিটি', path: '/community' },
    { name: 'AI টিউটর', path: '/ai-tutor' },
    { name: 'ড্যাশবোর্ড', path: '/dashboard' },
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
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cardBorder shadow-sm transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
            {/* Logo and Brand - Compact & Responsive on Mobile */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 group focus:outline-none min-w-0 shrink"
              onClick={handleLinkClick}
            >
              <img
                src="/logo.png"
                alt="SSC Note Box"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform duration-200 shrink-0"
              />
              <span className="text-base sm:text-2xl font-bold tracking-tight text-primaryText group-hover:text-brand-600 transition-colors truncate">
                SSC Note Box
              </span>
            </Link>

            {/* Desktop Navigation Quick Actions (Preserved intact) */}
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cardBorder bg-slate-50 hover:bg-slate-100 text-xs font-bold transition-all active:scale-95 min-h-[44px] touch-manipulation"
                title={language === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
                aria-label="Toggle language"
              >
                <Globe className="w-4 h-4 text-brand-600" />
                <span className={language === 'en' ? 'text-brand-600 font-extrabold' : 'text-secondaryText'}>EN</span>
                <span className="text-slate-300">|</span>
                <span className={language === 'bn' ? 'text-brand-600 font-extrabold' : 'text-secondaryText'}>বাংলা</span>
              </button>

              {/* Notification Center Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2.5 rounded-xl border border-cardBorder bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all active:scale-95 touch-manipulation"
                title="নোটিফিকেশন সেন্টার"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full" />
              </button>

              {/* Upload CTA */}
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-soft hover:shadow-soft-hover transition-all duration-200 hover:-translate-y-0.5 text-sm min-h-[44px] touch-manipulation"
              >
                <Upload className="w-4 h-4" />
                <span>{t('nav_upload')}</span>
              </button>

              {/* Owner Admin Access Button - ONLY visible to logged-in Owner on their trusted device */}
              {isOwner && (
                <button
                  type="button"
                  onClick={handleAdminClick}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all min-h-[44px] cursor-pointer shadow-soft hover:scale-105 active:scale-95 bg-purple-100/90 hover:bg-purple-200 text-brand-700 border-brand-300 ring-2 ring-brand-400/20 font-bold text-xs touch-manipulation"
                  title="মালিক / অ্যাডমিন ড্যাশবোর্ড"
                  aria-label="Owner Control Panel"
                >
                  <ShieldAlert className="w-4 h-4 text-brand-600" />
                  <span>এডমিন প্যানেল</span>
                </button>
              )}
            </div>

            {/* Mobile Actions Cluster (Optimized spacing, touch area, and zero overflow) */}
            <div className="flex items-center gap-1.5 xs:gap-2 lg:hidden shrink-0">
              {/* Mobile Language Button */}
              <button
                onClick={toggleLanguage}
                className="h-10 px-2.5 flex items-center justify-center gap-1 text-xs font-bold rounded-xl text-primaryText bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95 border border-cardBorder touch-manipulation select-none"
                title={language === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
                aria-label="Toggle language"
              >
                <Globe className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>{language === 'en' ? 'EN' : 'বাং'}</span>
              </button>

              {/* Mobile Admin Panel Quick Button - ONLY visible to logged-in Owner */}
              {isOwner && (
                <button
                  type="button"
                  onClick={handleAdminClick}
                  className="h-10 px-2.5 flex items-center justify-center gap-1 text-xs font-bold rounded-xl border transition-all active:scale-95 cursor-pointer bg-purple-100 hover:bg-purple-200 text-brand-700 border-brand-300 touch-manipulation shadow-xs"
                  title="মালিক / অ্যাডমিন ড্যাশবোর্ড"
                  aria-label="Owner Control Panel"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-brand-600" />
                  <span className="text-[11px] font-extrabold">এডমিন</span>
                </button>
              )}

              {/* Mobile Notification Button */}
              <button
                onClick={() => setNotifOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-cardBorder bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
                title="নোটিফিকেশন"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-600 rounded-full" />
              </button>

              {/* Mobile Upload Note Button */}
              <button
                onClick={onOpenUpload}
                className="w-10 h-10 flex items-center justify-center text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-all active:scale-95 border border-brand-200/60 touch-manipulation shadow-xs"
                title={t('nav_upload')}
                aria-label="Upload Note"
              >
                <Upload className="w-5 h-5 shrink-0" />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 touch-manipulation select-none ${
                  isOpen
                    ? 'bg-brand-600 text-white shadow-soft ring-2 ring-brand-400/30'
                    : 'text-primaryText hover:text-brand-600 hover:bg-brand-50 bg-slate-100/90 border border-cardBorder'
                }`}
                title={isOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5 shrink-0" /> : <Menu className="w-5 h-5 shrink-0" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Drawer Menu with Dynamic Viewport-Top Positioning */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none invisible'
        }`}
        style={{ top: `${headerBottom}px` }}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      >
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" />

        {/* Drawer Panel */}
        <div
          className={`relative bg-white border-b border-cardBorder shadow-2xl p-4 sm:p-6 space-y-4 max-h-[calc(100dvh-${headerBottom}px)] overflow-y-auto overscroll-contain pb-safe scroll-touch transition-all duration-300 ease-out transform ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Upload action in menu */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenUpload();
            }}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white py-3 px-4 rounded-xl font-bold shadow-soft hover:shadow-soft-hover transition-all min-h-[48px] text-base active:scale-98 touch-manipulation"
          >
            <Upload className="w-5 h-5 shrink-0" />
            <span>{t('nav_upload_btn')}</span>
          </button>

          {/* Language Switcher in Mobile Drawer */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-cardBorder">
            <span className="text-sm font-semibold text-primaryText flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-600 shrink-0" />
              <span>ভাষা / Language:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleLanguage()}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all touch-manipulation active:scale-95 ${
                  language === 'en'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
                }`}
              >
                English
              </button>
              <button
                onClick={() => toggleLanguage()}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all touch-manipulation active:scale-95 ${
                  language === 'bn'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          <nav className="divide-y divide-cardBorder/60 pt-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between min-h-[48px] py-3 px-3.5 rounded-xl text-base font-semibold transition-all touch-manipulation ${
                    active
                      ? 'text-brand-600 bg-brand-50 font-bold'
                      : 'text-primaryText hover:text-brand-600 hover:bg-brand-50/40 active:bg-brand-50'
                  }`}
                >
                  <span>{item.name}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-brand-600' : 'text-slate-300'}`} />
                </Link>
              );
            })}

            {/* Owner panel navigation - ONLY visible to logged-in Owner */}
            {isOwner && (
              <button
                type="button"
                onClick={handleAdminClick}
                className="w-full flex items-center justify-between min-h-[48px] py-3 px-3.5 rounded-xl text-base font-bold mt-2.5 border transition-all text-left cursor-pointer text-brand-800 bg-brand-50 border-brand-200 active:scale-98 touch-manipulation"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>{t('owner_panel')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-600" />
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenterModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};
