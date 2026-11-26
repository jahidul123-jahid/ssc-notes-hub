import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Search, 
  Plus, 
  ShieldCheck, 
  Filter, 
  Clock, 
  BookOpen, 
  AlertCircle,
  X,
  Share2
} from 'lucide-react';
import { CommunityPost } from '../types';
import { getCommunityPosts, createCommunityPost, upvotePost } from '../services/communityService';

export const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await getCommunityPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error loading community posts', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpvote = async (id: string) => {
    const newCount = await upvotePost(id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, upvotes: newCount } : p));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || submitting) return;
    setSubmitting(true);

    try {
      const created = await createCommunityPost({
        authorName: authorName.trim() || 'এসএসসি শিক্ষার্থী',
        title: newTitle.trim(),
        content: newContent.trim(),
        subject: newSubject,
        chapter: newChapter.trim() || undefined
      });

      setPosts([created, ...posts]);
      setShowAskModal(false);
      setNewTitle('');
      setNewContent('');
      setNewChapter('');
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const postSubj = p.subject || p.subjectId || '';
    const matchesSubject = selectedSubject === 'all' || postSubj.toLowerCase() === selectedSubject.toLowerCase();
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const subjects = [
    { id: 'all', label: 'সকল বিষয়' },
    { id: 'Physics', label: 'পদার্থবিজ্ঞান' },
    { id: 'Chemistry', label: 'রসায়ন' },
    { id: 'Mathematics', label: 'সাধারণ গণিত' },
    { id: 'Higher Mathematics', label: 'উচ্চতর গণিত' },
    { id: 'Biology', label: 'জীববিজ্ঞান' },
    { id: 'English', label: 'ইংরেজি' },
    { id: 'ICT', label: 'আইসিটি' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Community Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
                <Users className="w-4 h-4 text-emerald-300" />
                SSC স্টুডেন্ট ফোরাম
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                প্রশ্নোত্তর ও একাডেমিক ডিসকাশন
              </h1>
              <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
                কোনো অংক বা ধারণায় আটকে গেছো? সহপাঠীদের সাথে আলোচনা করো, প্রশ্ন করো এবং সঠিক উত্তর খুঁজে নাও।
              </p>
            </div>

            <button
              onClick={() => setShowAskModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-800 hover:bg-emerald-50 active:scale-95 text-xs sm:text-sm font-bold shadow-lg transition-all self-start md:self-auto shrink-0"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              প্রশ্ন পোস্ট করুন
            </button>
          </div>
        </div>

        {/* Controls Bar: Search & Subject Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আলোচনা বা প্রশ্ন খুঁজুন (যেমন: গতি, পর্যায় সারণি, ত্রিকোণমিতি)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedSubject === s.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">কোনো আলোচনা পাওয়া যায়নি</h3>
            <p className="text-xs">আপনার মনে কোনো প্রশ্ন থাকলে প্রথম প্রশ্নটি পোস্ট করুন!</p>
            <button
              onClick={() => setShowAskModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
            >
              এখনই প্রশ্ন করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-100">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{post.authorName}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-100">
                      {post.subject}
                    </span>
                    {post.chapter && (
                      <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                        {post.chapter}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpvote(post.id || post.postId || '')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors font-semibold"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                      <span>সহায়ক ({post.upvotes})</span>
                    </button>

                    <div className="flex items-center gap-1 text-slate-500 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.commentsCount || 0} টি উত্তর</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ভেরিফাইড পোস্ট</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">নতুন প্রশ্ন বা আলোচনা তৈরি করুন</h3>
              <button
                onClick={() => setShowAskModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="আপনার নাম বা পরিচয়"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিষয়</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Physics">পদার্থবিজ্ঞান</option>
                    <option value="Chemistry">রসায়ন</option>
                    <option value="Mathematics">সাধারণ গণিত</option>
                    <option value="Higher Mathematics">উচ্চতর গণিত</option>
                    <option value="Biology">জীববিজ্ঞান</option>
                    <option value="English">ইংরেজি</option>
                    <option value="ICT">আইসিটি</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যায় (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={newChapter}
                    onChange={e => setNewChapter(e.target.value)}
                    placeholder="যেমন: ৩য় অধ্যায়"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="প্রশ্নের মূল বিষয় সংক্ষেপে লিখুন"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="আপনার প্রশ্ন বা আলোচনার বিস্তারিত ব্যাখ্যা দিন... (ব্যক্তিগত ফোন বা ইমেইল শেয়ার করবেন না)"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'পোস্ট হচ্ছে...' : 'পোস্ট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
