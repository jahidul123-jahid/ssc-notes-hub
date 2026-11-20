import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, Upload, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isOwner } = useAuth();

  const navLinks = [
    { name: 'হোম', path: '/' },
    { name: 'সকল বিষয়', path: '/subjects' },
    { name: 'নোট খুঁজুন', path: '/search' },
    { name: 'আমাদের সম্পর্কে', path: '/about' },
    { name: 'যোগাযোগ', path: '/contact' },
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
              আমাদের সম্পর্কে ও প্রতিষ্ঠাতা জাহিদুল ইসলামের সকল পরিচিতি দেখতে ক্লিক করুন
            </span>
            <ArrowRight className="w-3.5 h-3.5 inline shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="hidden md:block text-[11px] text-white/80 shrink-0">
            <span>SSC Notes Hub</span>
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

              {/* Upload CTA */}
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-soft hover:shadow-soft-hover transition-all duration-200 hover:-translate-y-0.5 text-sm min-h-[44px]"
              >
                <Upload className="w-4 h-4" />
                <span>নোট শেয়ার করুন</span>
              </button>

              {/* Private indicator shown only if authenticated as Owner */}
              {isOwner && (
                <Link
                  to="/owner-control"
                  className="p-2.5 rounded-xl bg-purple-50 text-brand-600 border border-brand-200 hover:bg-brand-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Owner Dashboard Active"
                >
                  <ShieldAlert className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Mobile Actions (Guaranteed 44x44px minimum touch targets) */}
            <div className="flex items-center gap-1 sm:gap-2 lg:hidden shrink-0">
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
              <span>নোট আপলোড করুন</span>
            </button>

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

              {/* If owner is already logged in, show Owner panel */}
              {isOwner && (
                <Link
                  to="/owner-control"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 min-h-[48px] py-3 px-3 rounded-xl text-base font-bold text-amber-700 bg-amber-50 mt-2"
                >
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>মালিক কন্ট্রোল প্যানেল</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
