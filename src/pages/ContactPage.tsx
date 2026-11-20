import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Sparkles, MessageCircle, ExternalLink, GraduationCap } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
      <div className="text-center space-y-2 sm:space-y-3 px-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-primaryText">
          যোগাযোগ
        </h1>
        <p className="text-sm sm:text-base text-secondaryText max-w-lg mx-auto">
          যেকোনো তথ্য বা সহায়তার জন্য প্রতিষ্ঠাতা জাহিদুল ইসলামের সাথে যোগাযোগ করতে পারেন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Contact Info Cards */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-primaryText">সরাসরি ইমেইল</h4>
            <p className="text-xs text-secondaryText">যেকোনো বার্তা বা অ্যাকাডেমিক সহায়তার জন্য:</p>
            <a
              href="mailto:jahidulislamg.b.123@gmail.com"
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:underline block break-all min-h-[36px] flex items-center"
            >
              jahidulislamg.b.123@gmail.com
            </a>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-primaryText">হোয়াটসঅ্যাপ চ্যাট</h4>
            <p className="text-xs text-secondaryText">দ্রুত মেসেজের জন্য সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন:</p>
            <a
              href="https://wa.me/?text=Hello%20Jahidul"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors min-h-[44px]"
            >
              <span>হোয়াটসঅ্যাপে মেসেজ পাঠান</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violetAccent flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-primaryText">প্রতিষ্ঠান ও অবস্থান</h4>
            <p className="text-xs font-semibold text-primaryText">
              নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়
            </p>
            <p className="text-xs text-secondaryText flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>নবীনগর, ব্রাহ্মণবাড়িয়া, চট্টগ্রাম বিভাগ</span>
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-cardBorder shadow-soft">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-primaryText">বার্তা সফলভাবে পাঠানো হয়েছে!</h3>
              <p className="text-sm text-secondaryText max-w-md mx-auto">
                আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ। জাহিদুল ইসলাম শীঘ্রই আপনার বার্তার উত্তর প্রদান করবেন।
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold min-h-[44px]"
              >
                আরেকটি বার্তা পাঠান
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-primaryText mb-2">বার্তা লিখুন</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primaryText mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primaryText mb-1">ইমেইল ঠিকানা *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primaryText mb-1">বিষয় *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="যেমন: পদার্থবিজ্ঞান বা গণিত নোট সংক্রান্ত প্রশ্ন"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primaryText mb-1">বার্তা বা মন্তব্য *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার বক্তব্য বিস্তারিতভাবে লিখুন..."
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent text-white px-8 py-3.5 rounded-xl font-bold shadow-soft hover:shadow-soft-hover transition-all min-h-[48px] active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>বার্তা প্রেরণ করুন</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
