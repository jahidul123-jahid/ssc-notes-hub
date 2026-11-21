import React from 'react';
import {
  Mail,
  MessageCircle
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-12">
      {/* Main Profile Card - Clean & Direct */}
      <div className="bg-white text-primaryText rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-soft relative overflow-hidden border border-cardBorder">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Photo & Signature Column */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-brand-200 shadow-soft relative bg-gradient-to-tr from-brand-50 to-brand-100 group-hover:border-brand-500 transition-all duration-300">
                <img
                  src="/assets/jahidul-profile.jpg?v=20261121"
                  alt="জাহিদুল ইসলাম"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/jahidul-profile.png';
                  }}
                />
              </div>
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-violetAccent text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                প্রতিষ্ঠাতা • SSC Notes Hub
              </div>
            </div>

            {/* Clean Hand-drawn Signature */}
            <div className="pt-3 flex flex-col items-center select-none">
              <svg
                viewBox="0 0 260 70"
                className="w-48 sm:w-56 h-auto text-primaryText drop-shadow-sm fill-none stroke-current"
                style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
                aria-label="Jahidul Islam Signature"
              >
                {/* J flourish */}
                <path d="M 38 18 C 28 18, 24 28, 36 26 C 54 24, 58 16, 54 36 C 50 54, 34 68, 22 62 C 16 58, 20 50, 30 48 C 42 45, 52 50, 64 44" strokeWidth="2.8" />
                {/* ahidul cursive path */}
                <path d="M 64 44 C 68 38, 74 36, 78 44 C 81 50, 84 38, 86 30 L 87 50 C 88 40, 92 38, 96 46 C 99 38, 102 41, 103 48 C 105 40, 108 34, 110 28 L 110 50 C 112 44, 116 42, 120 47 C 122 42, 126 40, 128 48" strokeWidth="2.4" />
                <circle cx="103" cy="33" r="1.5" fill="currentColor" stroke="none" />
                {/* Islam flourish */}
                <path d="M 142 22 C 134 24, 136 32, 148 26 C 158 22, 154 38, 148 52" strokeWidth="2.8" />
                <path d="M 148 52 C 152 42, 158 42, 160 49 C 162 40, 166 32, 169 25 L 169 52 C 172 45, 177 43, 180 48 C 184 44, 188 44, 192 48 C 195 44, 200 44, 204 50" strokeWidth="2.4" />
                {/* Signature underline curve */}
                <path d="M 35 60 C 80 54, 170 52, 235 46 C 245 45, 220 63, 160 67" strokeWidth="2.2" strokeOpacity="0.85" />
              </svg>
            </div>
          </div>

          {/* Details & Direct Story Column */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-primaryText tracking-tight">
                জাহিদুল ইসলাম
              </h1>
              <p className="text-base sm:text-lg font-semibold text-brand-600 mt-1">
                প্রতিষ্ঠাতা, এসএসসি নোটস হাব
              </p>
            </div>

            {/* User-provided Authentic Bio */}
            <div className="space-y-4 text-sm sm:text-base text-secondaryText leading-relaxed pt-1">
              <p>
                আমি জাহিদুল ইসলাম। ব্রাহ্মণবাড়িয়ার নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়ের দশম শ্রেণির বিজ্ঞান বিভাগের একজন শিক্ষার্থী।
              </p>
              <p>
                শিক্ষার্থীদের পড়াশোনা সহজ ও সুন্দর করতে তৈরি করেছি <strong className="text-primaryText font-semibold">SSC Notes Hub</strong>—একটি বিনামূল্যের শিক্ষামূলক ওয়েবসাইট, যেখানে সবাই নোট পড়তে ও নিজের নোট শেয়ার করতে পারে।
              </p>
              <p>
                ওয়েবসাইট ব্যবহার করতে কোনো সমস্যা হলে বা কোনো পরামর্শ থাকলে নির্দ্বিধায় আমাকে মেসেজ দিতে পারেন।
              </p>
            </div>

            {/* Direct Messaging & Social Icons */}
            <div className="pt-2 flex items-center gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1ML38tfbaT/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-cardBorder hover:border-[#1877F2] flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-95"
                title="Facebook"
                aria-label="Facebook Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/xahidul_0_0/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-[#E1306C] hover:text-white border border-cardBorder hover:border-transparent flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-95"
                title="Instagram"
                aria-label="Instagram Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/?text=Hello%20Jahidul"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-cardBorder hover:border-[#25D366] flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-95"
                title="WhatsApp"
                aria-label="WhatsApp Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              {/* Email */}
              <a
                href="mailto:jahidulislamg.b.123@gmail.com"
                className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-brand-600 text-brand-600 hover:text-white border border-cardBorder hover:border-brand-600 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-95"
                title="Email"
                aria-label="Send Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
