import React from 'react';
import {
  GraduationCap,
  Mail,
  ExternalLink,
  MessageCircle,
  Code2,
  CheckCircle2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-12">
      {/* Main Hero Spotlight Card with Photo, Logo & Bio - Clean High-Contrast Design */}
      <div className="bg-white text-primaryText rounded-2xl sm:rounded-3xl p-5 sm:p-12 shadow-soft relative overflow-hidden border border-cardBorder">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Photo & Identity Column */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-5">
            <div className="relative group">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-brand-200 shadow-soft relative bg-gradient-to-tr from-brand-50 to-brand-100 group-hover:border-brand-500 transition-all duration-300">
                <img
                  src="/assets/jahidul-profile.png?v=20261120"
                  alt="Jahidul Islam"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/jahidul-about.jpg?v=20261120';
                  }}
                />
              </div>
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-violetAccent text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>উদ্যোক্তা ও প্ল্যাটফর্ম নির্মাতা</span>
              </div>
            </div>

            <div className="pt-3">
              <img
                src="/assets/jahidul-islam-logo.png"
                alt="Jahidul Islam Official Brand Logo"
                className="w-48 sm:w-56 h-auto mx-auto object-contain drop-shadow-sm"
              />
            </div>
          </div>

          {/* Details & Biography Column */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-200">
                <span>FOUNDER & DEVELOPER PROFILE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-primaryText">
                জাহিদুল ইসলাম (Jahidul Islam)
              </h2>
              <p className="text-base font-semibold text-brand-600 mt-1">
                Class 10 Student • Fashion Gallery Moderator • AI Tech Explorer
              </p>
            </div>

            {/* School Badge */}
            <div className="flex flex-wrap gap-2.5 text-xs">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 font-semibold">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                <span>নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়</span>
              </div>
            </div>

            {/* Story / About */}
            <div className="space-y-3 text-sm sm:text-base text-secondaryText leading-relaxed">
              <p>
                আমি ব্রাহ্মণবাড়িয়ার সুপ্রাচীন ও ঐতিহ্যবাহী <strong className="text-primaryText font-bold">নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়ের</strong> শ্রেণি ১০ এর বিজ্ঞান বিভাগের শিক্ষার্থী। প্রাতিষ্ঠানিক পড়াশোনার পাশাপাশি তথ্যপ্রযুক্তি, ডিজিটাল ডিজাইন, কৃত্রিম বুদ্ধিমত্তা (AI) ও ওয়েব ডেভেলপমেন্টের প্রতি আমার গভীর ভালোবাসা রয়েছে।
              </p>
              <p>
                বাস্তব জীবনের অভিজ্ঞতা অর্জনের লক্ষ্যে আমি জনপ্রিয় ই-কমার্স প্রতিষ্ঠান <strong className="text-primaryText font-bold">Fashion Gallery Shop</strong>-এর ফেসবুক পেজ মডারেটর হিসেবে নিষ্ঠার সাথে কাজ করছি। একই সাথে প্রযুক্তি ব্যবহার করে কীভাবে শিক্ষার্থীদের জন্য ইতিবাচক কিছু সৃষ্টি করা যায়, সেই চিন্তা থেকেই <strong className="text-primaryText font-bold">SSC Notes Hub</strong> এর সূচনা।
              </p>
            </div>

            {/* Motto Box */}
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs sm:text-sm text-brand-900 font-medium italic leading-relaxed">
              💬 "Stay curious every single day, keep learning with an open mind, and use technology to create meaningful things."
            </div>

            {/* Direct Connect Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://www.facebook.com/share/1ML38tfbaT/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm hover:-translate-y-0.5"
              >
                <span>ফেসবুক প্রোফাইল</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://www.instagram.com/xahidul_0_0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm hover:-translate-y-0.5"
              >
                <span>ইনস্টাগ্রাম</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/?text=Hello%20Jahidul"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:-translate-y-0.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>হোয়াটসঅ্যাপ চ্যাট</span>
              </a>

              <a
                href="mailto:jahidulislamg.b.123@gmail.com"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-300 text-xs font-bold transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-brand-600" />
                <span>ইমেইল পাঠান</span>
              </a>

              <a
                href="https://github.com/jahidul123-jahid"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>গিটহাব প্রোফাইল</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
