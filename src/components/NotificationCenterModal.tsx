import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, BookOpen, Award, MessageSquare, AlertCircle } from 'lucide-react';
import { AppNotification } from '../types';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'নতুন বোর্ড প্রশ্ন ও সমাধান যোগ করা হয়েছে',
    message: 'ঢাকা ও রাজশাহী বোর্ডের ২০২৩-২০২৪ সালের পদার্থবিজ্ঞান ও সাধারণ গণিত সৃজনশীল প্রশ্ন রিসোর্স সেন্টারে যুক্ত হয়েছে।',
    type: 'resource',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    link: '/resources'
  },
  {
    id: 'notif_2',
    title: 'পূর্ণাঙ্গ SSC মডেল টেস্ট লাইভ',
    message: 'বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পূর্ণাঙ্গ সিলেবাসের উপর ৫০ নম্বরের স্পেশাল মডেল টেস্ট এখন উন্মুক্ত।',
    type: 'exam',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    link: '/exams'
  },
  {
    id: 'notif_3',
    title: 'কমিউনিটি ফোরামে নতুন আলোচনা',
    message: 'রসায়ন ৪র্থ অধ্যায় পর্যায় সারণি নিয়ে নতুন প্রশ্নোত্তর যুক্ত হয়েছে। সহপাঠীদের সাহায্য করো!',
    type: 'community',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    link: '/community'
  }
];

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('ssc_notifications_v1');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('ssc_notifications_v1', JSON.stringify(updated));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? ({ ...n, read: true }) : n);
    setNotifications(updated);
    localStorage.setItem('ssc_notifications_v1', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-end p-4 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm">নোটিফিকেশন সেন্টার</h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              {notifications.filter(n => !n.read).length} নতুন
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-slate-300 hover:text-white underline decoration-slate-600"
            >
              সব পঠিত
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              কোনো নোটিফিকেশন নেই।
            </div>
          ) : (
            notifications.map(n => {
              const icon = 
                n.type === 'exam' ? <Award className="w-4 h-4 text-purple-600" /> :
                n.type === 'resource' ? <BookOpen className="w-4 h-4 text-emerald-600" /> :
                <MessageSquare className="w-4 h-4 text-teal-600" />;

              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                    n.read ? 'bg-white opacity-70' : 'bg-emerald-50/30'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
