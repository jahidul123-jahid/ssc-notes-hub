import { CommunityPost, CommunityComment } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ssc-notebox-api.workers.dev';
const LOCAL_STORAGE_POSTS_KEY = 'ssc_community_posts_v1';

// Seed community posts for instant student engagement
const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    authorName: 'সাকিব আল হাসান',
    authorRole: 'student',
    title: 'পদার্থবিজ্ঞান ৩য় অধ্যায়: ভরবেগের নিত্যতা সূত্রের গাণিতিক প্রয়োগ',
    content: 'বন্দুক থেকে গুলি ছোঁড়া হলে পেছনের দিকে যে ধাক্কা লাগে, সেখানে মন্দন ও পশ্চাৎ বেগ নির্ণয় করার সহজ শর্টকাট টেকনিক কারো জানা থাকলে শেয়ার করবেন কি?',
    subject: 'Physics',
    chapter: 'অধ্যায় ৩: বল',
    upvotes: 18,
    commentsCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'approved'
  },
  {
    id: 'post_2',
    authorName: 'ফারিহা তানজিম',
    authorRole: 'student',
    title: 'রসায়ন পর্যায় সারণি মনে রাখার ছন্দ ও যোজনী নির্ণয়',
    content: 'গ্রুপ ১ ও গ্রুপ ২ এর মৌলগুলো মনে রাখার কিছু চমৎকার ছন্দ বানিয়েছি। এছাড়া গ্রুপ ১৪ ও ১৫ এর অক্সাইডের প্রকৃতি নিয়ে কারো নোট থাকলে দিলে উপকৃত হবো।',
    subject: 'Chemistry',
    chapter: 'অধ্যায় ৪: পর্যায় সারণি',
    upvotes: 24,
    commentsCount: 5,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'approved'
  },
  {
    id: 'post_3',
    authorName: 'তানভীর আহমেদ',
    authorRole: 'student',
    title: 'উচ্চতর গণিত ত্রিকোণমিতি ৮.৩ এর চতুর্ভাগ ও কোণ রূপান্তর',
    content: 'n * (π/2) ± θ নিয়মে অনুপাত পরিবর্তনের সময় কোন চতুর্ভাগে কোন অনুপাত ধনাত্মক বা ঋণাত্মক হবে, তা পরীক্ষার হলে ভুলে যাই। মনে রাখার কোনো সহজ নিয়ম আছে?',
    subject: 'Higher Mathematics',
    chapter: 'অধ্যায় ৮: ত্রিকোণমিতি',
    upvotes: 14,
    commentsCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'approved'
  }
];

export async function getCommunityPosts(subject?: string): Promise<CommunityPost[]> {
  // 1. Try Cloudflare Worker backend
  try {
    const url = new URL(`${API_BASE}/api/community/posts`);
    if (subject && subject !== 'all') {
      url.searchParams.set('subject', subject);
    }
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.posts) && data.posts.length > 0) {
        return data.posts;
      }
    }
  } catch {
    // Backend offline / development mode
  }

  // 2. Fallback to LocalStorage + Initial Seeds
  const saved = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
  let posts: CommunityPost[] = saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;

  if (subject && subject !== 'all') {
    posts = posts.filter(p => (p.subject || p.subjectId || '').toLowerCase() === subject.toLowerCase());
  }

  return posts;
}

export async function createCommunityPost(post: {
  authorName: string;
  title: string;
  content: string;
  subject: string;
  chapter?: string;
}): Promise<CommunityPost> {
  // Sanitize content against public emails/phone numbers
  const sanitizedContent = sanitizePostContent(post.content);

  const newPost: CommunityPost = {
    id: `post_${Date.now()}`,
    authorName: post.authorName.trim() || 'শিক্ষার্থী',
    authorRole: 'student',
    title: post.title.trim(),
    content: sanitizedContent,
    subject: post.subject,
    chapter: post.chapter?.trim(),
    upvotes: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    status: 'approved'
  };

  // Try API
  try {
    const res = await fetch(`${API_BASE}/api/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.post) return data.post;
    }
  } catch {
    // API not reachable
  }

  // Save to LocalStorage
  const saved = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
  const currentPosts: CommunityPost[] = saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
  const updated = [newPost, ...currentPosts];
  localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(updated));

  return newPost;
}

export async function upvotePost(postId: string): Promise<number> {
  const saved = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
  const currentPosts: CommunityPost[] = saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;

  let newUpvotes = 0;
  const updated = currentPosts.map(p => {
    if (p.id === postId) {
      p.upvotes += 1;
      newUpvotes = p.upvotes;
    }
    return p;
  });

  localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(updated));
  return newUpvotes;
}

function sanitizePostContent(text: string): string {
  // Filter phone numbers & direct emails for student safety
  const phoneRegex = /(\+?88)?01[3-9]\d{8}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  return text
    .replace(phoneRegex, '[ব্যক্তিগত নম্বর গোপন করা হয়েছে]')
    .replace(emailRegex, '[ইমেইল গোপন করা হয়েছে]');
}
