import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MapPin, MessageCircle, ExternalLink, GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { isBn } = useLanguage();
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
          {isBn ? 'যোগাযোগ' : 'Contact Us'}
        </h1>
        <p className="text-sm sm:text-base text-secondaryText max-w-lg mx-auto">
          {isBn
            ? 'যেকোনো তথ্য বা সহায়তার জন্য প্রতিষ্ঠাতা জাহিদুল ইসলামের সাথে যোগাযোগ করতে পারেন।'
            : 'For any feedback, questions, or collaboration, feel free to reach out to Founder Jahidul Islam.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Contact Info Cards */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-primaryText">
              {isBn ? 'সরাসরি ইমেইল' : 'Direct Email'}
            </h4>
            <p className="text-xs text-secondaryText">
              {isBn ? 'যেকোনো বার্তা বা অ্যাকাডেমিক সহায়তার জন্য:' : 'For general queries and academic suggestions:'}
            </p>
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
            <h4 className="text-base font-bold text-primaryText">
              {isBn ? 'হোয়াটসঅ্যাপ চ্যাট' : 'WhatsApp Chat'}
            </h4>
            <p className="text-xs text-secondaryText">
              {isBn ? 'দ্রুত মেসেজের জন্য সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন:' : 'For urgent queries, message directly on WhatsApp:'}
            </p>
            <a
              href="https://wa.me/?text=Hello%20Jahidul"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors min-h-[44px] touch-manipulation select-none"
            >
              <span>{isBn ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান' : 'Chat on WhatsApp'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violetAccent flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-primaryText">
              {isBn ? 'প্রতিষ্ঠান ও অবস্থান' : 'Institution & Location'}
            </h4>
            <p className="text-xs font-semibold text-primaryText">
              {isBn ? 'নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়' : 'Nabinagar Govt. Pilot High School'}
            </p>
            <p className="text-xs text-secondaryText flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>{isBn ? 'নবীনগর, ব্রাহ্মণবাড়িয়া, চট্টগ্রাম বিভাগ' : 'Nabinagar, Brahmanbaria, Chittagong Division'}</span>
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
              <h3 className="text-2xl font-bold text-primaryText">
                {isBn ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}
              </h3>
              <p className="text-sm text-secondaryText max-w-md mx-auto">
                {isBn
                  ? 'আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ। জাহিদুল ইসলাম শীঘ্রই আপনার বার্তার উত্তর প্রদান করবেন।'
                  : 'Thank you for reaching out. Jahidul Islam will get back to you shortly.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold min-h-[44px]"
              >
                {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-primaryText mb-2">
                {isBn ? 'বার্তা লিখুন' : 'Send a Message'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primaryText mb-1">
                    {isBn ? 'আপনার নাম *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'আপনার নাম' : 'Your Name'}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primaryText mb-1">
                    {isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                  </label>
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
                <label className="block text-xs font-semibold text-primaryText mb-1">
                  {isBn ? 'বিষয় *' : 'Subject *'}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isBn ? 'যেমন: পদার্থবিজ্ঞান বা গণিত নোট সংক্রান্ত প্রশ্ন' : 'e.g. Question regarding Physics notes'}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primaryText mb-1">
                  {isBn ? 'বার্তা বা মন্তব্য *' : 'Message *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isBn ? 'আপনার বক্তব্য বিস্তারিতভাবে লিখুন...' : 'Write your message in detail...'}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent text-white px-8 py-3.5 rounded-xl font-bold shadow-soft hover:shadow-soft-hover transition-all min-h-[48px] active:scale-95 touch-manipulation select-none"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'বার্তা প্রেরণ করুন' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
