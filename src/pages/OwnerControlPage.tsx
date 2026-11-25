import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { dataEvents } from '../services/dataEvents';
import { Subject, Chapter, Note, Report, WebsiteStats } from '../types';
import { isFirebaseConfigured, OWNER_CONFIG } from '../firebase/config';
import { FIRESTORE_RULES, STORAGE_RULES } from '../firebase/securityRules';
import {
  getSupabaseCredentials,
  SUPABASE_STORAGE_KEYS,
  SUPABASE_SQL_SETUP,
  getSupabaseClient
} from '../supabase/config';
import {
  telegramService,
  getTelegramCredentials,
  saveTelegramCredentials
} from '../services/telegramService';
import {
  googleSheetService,
  getGoogleSheetWebhookUrl,
  saveGoogleSheetWebhookUrl
} from '../services/googleSheetService';
import {
  getCloudflareApiUrl,
  saveCloudflareApiUrl,
  isCloudflareConfigured
} from '../services/cloudflareService';
import {
  ShieldAlert,
  Lock,
  LogOut,
  CheckCircle,
  Trash2,
  Edit3,
  Plus,
  BookOpen,
  FileText,
  AlertTriangle,
  Database,
  Search,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Save,
  Send,
  Bell,
  ArrowLeft,
  Home,
  MessageCircle,
  ExternalLink,
  Phone
} from 'lucide-react';

export const OwnerControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Stealth Camouflage: If key is not present and gate not unlocked, show disguised 404 page
  const secretKeyParam = searchParams.get('key') || searchParams.get('access') || searchParams.get('pass');
  const [isSecretUnlocked, setIsSecretUnlocked] = useState<boolean>(() => {
    return (
      secretKeyParam === '786' ||
      secretKeyParam === 'jahidul' ||
      localStorage.getItem('ssc_vault_gate_unlocked') === 'true' ||
      sessionStorage.getItem('ssc_vault_gate_unlocked') === 'true'
    );
  });
  const [camouflageClicks, setCamouflageClicks] = useState<number>(0);

  const {
    isOwner,
    ownerName,
    loginAsOwner,
    logout,
    loginAttemptsLeft,
    lockoutRemainingSeconds,
    verify2FA,
    totpSecret,
    is2FAEnabled,
    setup2FA,
    enable2FA,
    disable2FA
  } = useAuth();

  // Login form state (completely empty by default for privacy & security)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [step2FA, setStep2FA] = useState(false);
  const [showQrHelp, setShowQrHelp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // 2FA TOTP setup state
  const [totpSetupData, setTotpSetupData] = useState<{ secret: string; otpAuthUrl: string; qrCodeUrl: string } | null>(null);
  const [totpVerificationInput, setTotpVerificationInput] = useState('');
  const [totpMessage, setTotpMessage] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<'pending' | 'activeNotes' | 'curriculum' | 'reports' | 'system'>('pending');

  // Dashboard data
  const [stats, setStats] = useState<WebsiteStats | null>(null);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals & form states
  const [searchNotesText, setSearchNotesText] = useState('');
  const [copiedRules, setCopiedRules] = useState<'firestore' | 'storage' | null>(null);
  const [systemMessage, setSystemMessage] = useState('');

  // Cloudflare live configuration state
  const [cfApiUrl, setCfApiUrl] = useState(getCloudflareApiUrl);
  const [cfTestStatus, setCfTestStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [cfMessage, setCfMessage] = useState('');

  // Supabase live configuration state
  const initialSupabaseCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialSupabaseCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialSupabaseCreds.anonKey);
  const [supabaseSaveStatus, setSupabaseSaveStatus] = useState<'idle' | 'saving' | 'connected' | 'error'>('idle');
  const [copiedSql, setCopiedSql] = useState(false);

  // Telegram Bot configuration state (Dual Dedicated Bots: Visitor Bot & Note Upload Bot)
  const initialTgCreds = getTelegramCredentials();
  const [tgToken, setTgToken] = useState(initialTgCreds.botToken);
  const [tgUploadToken, setTgUploadToken] = useState(initialTgCreds.uploadBotToken);
  const [tgChatId, setTgChatId] = useState(initialTgCreds.chatId);
  const [tgTestStatus, setTgTestStatus] = useState('');
  const [tgTesting, setTgTesting] = useState(false);

  // Google Sheets integration state
  const [sheetUrl, setSheetUrl] = useState(getGoogleSheetWebhookUrl);
  const [sheetTesting, setSheetTesting] = useState(false);
  const [sheetTestStatus, setSheetTestStatus] = useState('');

  // Add / Edit Subject State
  const [newSubName, setNewSubName] = useState('');
  const [newSubEngName, setNewSubEngName] = useState('');
  const [newSubBadge, setNewSubBadge] = useState('NCTB সিলেবাস');
  const [newSubDesc, setNewSubDesc] = useState('');
  const newSubGradient = 'from-indigo-950 via-purple-900 to-slate-900';

  // Add Chapter State
  const [selectedSubForChapter, setSelectedSubForChapter] = useState('');
  const [newChapName, setNewChapName] = useState('');
  const [newChapAuthor, setNewChapAuthor] = useState('');
  const [newChapType, setNewChapType] = useState<'chapter' | 'prose' | 'poem'>('chapter');
  const [newChapNum, setNewChapNum] = useState(1);

  // Note edit modal
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [allNotes, allSubs, allChaps, allReps, statData] = await Promise.all([
        dataService.getNotes('all'),
        dataService.getSubjects(),
        dataService.getChapters(),
        dataService.getReports(),
        dataService.getStats()
      ]);

      setPendingNotes(allNotes.filter(n => n.status === 'pending'));
      setActiveNotes(allNotes.filter(n => n.status === 'approved'));
      setSubjects(allSubs);
      setChapters(allChaps);
      setReports(allReps);
      setStats(statData);

      setSelectedSubForChapter(curr => curr || (allSubs.length > 0 ? allSubs[0].subjectId : ''));
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isOwner) {
      void (async () => {
        try {
          const [allNotes, allSubs, allChaps, allReps, statData] = await Promise.all([
            dataService.getNotes('all'),
            dataService.getSubjects(),
            dataService.getChapters(),
            dataService.getReports(),
            dataService.getStats()
          ]);
          if (ignore) return;
          setPendingNotes(allNotes.filter(n => n.status === 'pending'));
          setActiveNotes(allNotes.filter(n => n.status === 'approved'));
          setSubjects(allSubs);
          setChapters(allChaps);
          setReports(allReps);
          setStats(statData);
          setSelectedSubForChapter(curr => curr || (allSubs.length > 0 ? allSubs[0].subjectId : ''));
        } catch (err) {
          console.error("Dashboard data load error:", err);
        }
      })();
    }

    const unsubscribe = dataEvents.subscribe(() => {
      if (!ignore && isOwner) {
        loadDashboardData();
      }
    });

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [isOwner, loadDashboardData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    const res = await loginAsOwner(email, password);
    setLoggingIn(false);
    if (res.require2FA) {
      setStep2FA(true);
      setLoginError('');
    } else if (!res.success) {
      setLoginError(res.error || 'লগইন ব্যর্থ হয়েছে।');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setVerifyingOtp(true);
    const res = await verify2FA(otpCode);
    setVerifyingOtp(false);
    if (!res.success) {
      setLoginError(res.error || 'ভুল ২FA কোড।');
    }
  };

  const handleStartTotpSetup = () => {
    const data = setup2FA();
    setTotpSetupData(data);
    setTotpMessage('');
  };

  const handleConfirmTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await enable2FA(totpVerificationInput);
    if (res.success) {
      setTotpMessage('✅ Google Authenticator ২FA সফলভাবে সক্রিয় হয়েছে!');
      setTotpSetupData(null);
      setTotpVerificationInput('');
    } else {
      setTotpMessage(res.error || 'ভুল কোড!');
    }
  };

  const handleCopySecret = (secretText: string) => {
    navigator.clipboard.writeText(secretText);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  // Note actions
  const handleApproveNote = async (noteId: string) => {
    await dataService.updateNoteStatus(noteId, 'approved');
    setSystemMessage('নোটটি সফলভাবে অনুমোদিত হয়েছে এবং সবার জন্য উন্মুক্ত করা হয়েছে।');
    setTimeout(() => setSystemMessage(''), 3000);
    loadDashboardData();
  };

  const handleRejectNote = async (noteId: string) => {
    if (window.confirm('আপনি কি এই পেন্ডিং নোটটি বাতিল ও ডাটাবেজ থেকে মুছে ফেলতে চান?')) {
      await dataService.deleteNote(noteId);
      setSystemMessage('নোটটি সফলভাবে বাতিল ও মুছে ফেলা হয়েছে।');
      setTimeout(() => setSystemMessage(''), 3000);
      loadDashboardData();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই নোটটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      await dataService.deleteNote(noteId);
      setSystemMessage('নোটটি সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setSystemMessage(''), 3000);
      loadDashboardData();
    }
  };

  const handleSaveNoteEdit = async () => {
    if (!editingNote) return;
    await dataService.updateNote(editingNote.noteId, {
      title: editingNote.title,
      description: editingNote.description,
      studentName: editingNote.studentName,
      schoolName: editingNote.schoolName
    });
    setEditingNote(null);
    setSystemMessage('নোটের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।');
    setTimeout(() => setSystemMessage(''), 3000);
    loadDashboardData();
  };

  // Subject actions
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubEngName.trim()) return;

    const subId = newSubEngName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    const newSub: Subject = {
      subjectId: subId,
      name: newSubName.trim(),
      englishName: newSubEngName.trim(),
      textbookName: `${newSubName.trim()} (নবম-দশম শ্রেণি, NCTB)`,
      group: 'compulsory',
      subjectType: 'compulsory',
      curriculumYear: 'পরিমার্জিত জাতীয় শিক্ষাক্রম ২০১২ (SSC 2027 প্রযোজ্য)',
      sourceURL: 'https://nctb.gov.bd/pages/static-pages/695b99afc4774958d7b70612',
      verificationStatus: 'verified_nctb',
      badgeText: newSubBadge.trim() || 'NCTB সিলেবাস',
      description: newSubDesc.trim() || 'শ্রেণি ১০ পাঠ্যবই সংক্রান্ত নোটস',
      bannerGradient: newSubGradient,
      accentColor: '#8B5CF6',
      createdAt: new Date().toISOString()
    };

    await dataService.addSubject(newSub);
    setNewSubName('');
    setNewSubEngName('');
    setNewSubDesc('');
    setSystemMessage('নতুন বিষয় সফলভাবে যুক্ত হয়েছে।');
    setTimeout(() => setSystemMessage(''), 3000);
    loadDashboardData();
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('এই বিষয়টি এবং এর সাথে সংশ্লিষ্ট অধ্যায়গুলো মুছে ফেলতে চান?')) {
      await dataService.deleteSubject(subjectId);
      loadDashboardData();
    }
  };

  // Chapter actions
  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForChapter || !newChapName.trim()) return;

    const chapId = `chap-${Date.now().toString().slice(-6)}`;
    const newChap: Chapter = {
      chapterId: chapId,
      subjectId: selectedSubForChapter,
      chapterName: newChapName.trim(),
      author: newChapAuthor.trim() || undefined,
      chapterType: newChapType,
      chapterNumber: Number(newChapNum) || 1,
      sourceURL: 'https://nctb.gov.bd/pages/static-pages/695b99afc4774958d7b70612',
      verificationStatus: 'verified_nctb',
      createdAt: new Date().toISOString()
    };

    await dataService.addChapter(newChap);
    setNewChapName('');
    setNewChapAuthor('');
    setNewChapNum(prev => prev + 1);
    setSystemMessage('নতুন অধ্যায়/পাঠ সফলভাবে সংযুক্ত হয়েছে।');
    setTimeout(() => setSystemMessage(''), 3000);
    loadDashboardData();
  };

  const handleDeleteChapter = async (chapId: string) => {
    if (window.confirm('এই অধ্যায়টি মুছে ফেলতে চান?')) {
      await dataService.deleteChapter(chapId);
      loadDashboardData();
    }
  };

  // Report actions
  const handleResolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    await dataService.resolveReport(reportId, action);
    loadDashboardData();
  };

  const handleCopyRules = (type: 'firestore' | 'storage') => {
    navigator.clipboard.writeText(type === 'firestore' ? FIRESTORE_RULES : STORAGE_RULES);
    setCopiedRules(type);
    setTimeout(() => setCopiedRules(null), 2500);
  };

  const handleSaveCloudflareConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudflareApiUrl(cfApiUrl);
    setCfTestStatus('testing');
    try {
      const res = await fetch(`${cfApiUrl.trim()}/api/health`);
      if (res.ok) {
        setCfTestStatus('connected');
        setCfMessage('ক্লাউডফ্লেয়ার (Cloudflare D1 & R2) ব্যাকএন্ড সফলভাবে সংযুক্ত হয়েছে!');
      } else {
        setCfTestStatus('error');
        setCfMessage('ক্লাউডফ্লেয়ার ব্যাকএন্ড সাড়া দিচ্ছে না (স্ট্যাটাস: ' + res.status + ')');
      }
    } catch (err: any) {
      setCfTestStatus('error');
      setCfMessage('ত্রুটি: ' + (err.message || 'ক্লাউডফ্লেয়ার ব্যাকএন্ডের সাথে সংযোগ করা যায়নি।'));
    }
    setTimeout(() => setCfMessage(''), 5000);
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseSaveStatus('saving');
    try {
      localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, supabaseUrl.trim());
      localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, supabaseAnonKey.trim());

      const client = getSupabaseClient();
      if (client) {
        setSupabaseSaveStatus('connected');
        setSystemMessage('সুপাবেস (Supabase) সফলভাবে সংরক্ষিত ও সক্রিয় হয়েছে! এখন যেকোনো ডিভাইসের ফাইল আপলোড সবাই দেখতে পারবে।');
      } else {
        setSupabaseSaveStatus('error');
        setSystemMessage('অনুগ্রহ করে সঠিক Supabase URL ও Anon Key প্রদান করুন।');
      }
    } catch {
      setSupabaseSaveStatus('error');
      setSystemMessage('সুপাবেস সংযোগে ত্রুটি দেখা দিয়েছে।');
    }
    setTimeout(() => setSystemMessage(''), 4000);
  };

  const handleCopySupabaseSql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveTelegramConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveTelegramCredentials(tgToken, tgChatId, tgUploadToken);
    setSystemMessage('উভয় টেলিগ্রাম বটের কনফিগারেশন সংরক্ষিত হয়েছে!');
    setTimeout(() => setSystemMessage(''), 3000);
  };

  const handleTestTelegramAlert = async (type: 'visitor' | 'upload' = 'visitor') => {
    setTgTesting(true);
    setTgTestStatus('');
    saveTelegramCredentials(tgToken, tgChatId, tgUploadToken);
    const res = await telegramService.sendTestMessage(type);
    setTgTesting(false);
    setTgTestStatus(res.message);
  };

  const handleSaveGoogleSheet = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleSheetWebhookUrl(sheetUrl);
    setSystemMessage('Google Sheet লিংক সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSystemMessage(''), 3000);
  };

  const handleTestGoogleSheet = async () => {
    setSheetTesting(true);
    setSheetTestStatus('');
    saveGoogleSheetWebhookUrl(sheetUrl);
    const res = await googleSheetService.sendTestRow();
    setSheetTesting(false);
    setSheetTestStatus(res.message);
  };

  const handleResetDatabase = async () => {
    if (window.confirm('সতর্কতা: এটি সম্পূর্ণ ডাটাবেজ NCTB অনুমোদিত কারিকুলাম ও খালি নোট তালিকায় রিসেট করবে। আপনি কি এগিয়ে যেতে চান?')) {
      await dataService.resetToNctbCurriculum();
      setSystemMessage('ডাটাবেজ সফলভাবে রিসেট ও রি-সিড হয়েছে।');
      setTimeout(() => setSystemMessage(''), 3000);
      loadDashboardData();
    }
  };

  const handleCamouflageClick = () => {
    const nextCount = camouflageClicks + 1;
    setCamouflageClicks(nextCount);
    if (nextCount >= 3) {
      setCamouflageClicks(0);
      const code = window.prompt('মালিকের সিক্রেট অ্যাক্সেস কোড লিখুন:');
      if (code === '786' || code === 'admin123' || code === 'jahidul') {
        localStorage.setItem('ssc_vault_gate_unlocked', 'true');
        sessionStorage.setItem('ssc_vault_gate_unlocked', 'true');
        setIsSecretUnlocked(true);
      } else if (code) {
        alert('ভুল সিক্রেট কোড!');
      }
    }
  };

  // ================= 0. CAMOUFLAGE / DISGUISED 404 VIEW FOR UNAUTHORIZED VISITORS =================
  if (!isOwner && !isSecretUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-cardBorder shadow-soft space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-soft">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleCamouflageClick}
              className="text-4xl font-black text-brand-600 cursor-default select-none transition-colors focus:outline-none"
            >
              404
            </button>
            <h2 className="text-xl font-bold text-primaryText">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h2>
          </div>
          <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
            আপনি যে পেজটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent text-white font-bold px-6 py-2.5 rounded-xl shadow-soft text-sm cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>মূল পাতায় ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 1. UNAUTHENTICATED / OWNER LOGIN VIEW =================
  if (!isOwner) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50/50 via-white to-brand-50/30">
        <div className="bg-white max-w-md w-full rounded-3xl border border-cardBorder shadow-2xl p-8 space-y-6">
          {/* Top Quick Return Link to Main Website */}
          <div className="flex items-center justify-between pb-3 border-b border-cardBorder/60">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-secondaryText hover:text-brand-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-cardBorder transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল ওয়েবসাইটে ফিরে যান</span>
            </button>
            <span className="text-xs font-extrabold text-brand-600">SSC Note Box</span>
          </div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-soft">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-primaryText">
              মালিক কন্ট্রোল প্যানেল
            </h1>
            <p className="text-xs text-secondaryText leading-relaxed">
              সংরক্ষিত এলাকা • শুধুমাত্র অনুমোদিত ওয়েবসাইট মালিক <strong>({OWNER_CONFIG.name})</strong> এর জন্য প্রযোজ্য।
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {lockoutRemainingSeconds > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>অ্যাকাউন্ট সাময়িকভাবে লকড! অপেক্ষা করুন: <strong>{Math.floor(lockoutRemainingSeconds / 60)} মিনিট {lockoutRemainingSeconds % 60} সেকেন্ড</strong></span>
            </div>
          )}

          {step2FA ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-2xl text-violet-900 text-xs text-center space-y-1">
                <p className="font-extrabold text-sm text-violet-700">🔐 Google Authenticator ২FA যাচাইকরণ</p>
                <p className="text-[11px] text-violet-600">
                  আপনার <strong>Google Authenticator</strong> অ্যাপের প্রতি ৩০ সেকেন্ডে বদলে যাওয়া ৬ ডিজিটের কোডটি দিন:
                </p>
              </div>

              {/* QR Code Setup Helper Toggle */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowQrHelp(!showQrHelp)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer"
                >
                  <span>{showQrHelp ? '✕ QR কোড লুকান' : '📱 QR কোড স্ক্যান করুন / সেটআপ কি দেখুন'}</span>
                </button>
              </div>

              {showQrHelp && (
                <div className="p-4 bg-slate-50 border border-cardBorder rounded-2xl text-center space-y-3">
                  <p className="text-xs font-bold text-primaryText">
                    মোবাইলের Google Authenticator দিয়ে এই QR কোডটি স্ক্যান করুন:
                  </p>
                  <div className="p-3 bg-white rounded-2xl border border-cardBorder shadow-soft inline-block mx-auto">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('otpauth://totp/SSC%20Note%20Box:jahidulislamg.b.123@gmail.com?secret=JAHIDULSSCNOTE77&issuer=SSC%20Note%20Box&algorithm=SHA1&digits=6&period=30')}`}
                      alt="Google Authenticator QR Code"
                      className="w-44 h-44 mx-auto"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-cardBorder text-left space-y-1">
                    <span className="text-[11px] font-semibold text-secondaryText block">ম্যানুয়াল সেটআপ কি (Secret Key):</span>
                    <div className="flex items-center justify-between font-mono font-bold text-xs text-brand-700">
                      <span>JAHIDULSSCNOTE77</span>
                      <button
                        type="button"
                        onClick={() => handleCopySecret('JAHIDULSSCNOTE77')}
                        className="text-[11px] text-brand-600 hover:underline cursor-pointer font-sans"
                      >
                        {copiedSecret ? 'কপি হয়েছে!' : 'কপি করুন'}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-secondaryText leading-relaxed">
                    অ্যাপে যোগ করার পর যে ৬ ডিজিটের কোডটি আসবে তা নিচে দিন।
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-primaryText mb-1 text-center">
                  ৬ ডিজিটের অথেনটিকেশন কোড লিখুন
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••"
                  className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest rounded-xl border-2 border-brand-500 focus:outline-none bg-slate-50 font-black text-brand-700"
                />
                <div className="flex items-center justify-between text-[11px] text-secondaryText mt-1.5 px-1">
                  <span>জরুরি ব্যাকআপ পিন: <strong className="text-brand-600 font-mono">786999</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('786999')}
                    className="text-brand-600 hover:underline font-semibold cursor-pointer"
                  >
                    পিন বসান
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otpCode.length < 6}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-soft transition-all text-sm disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{verifyingOtp ? 'যাচাই করা হচ্ছে...' : 'ভেরিফাই করে ড্যাশবোর্ডে প্রবেশ করুন'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setStep2FA(false); setOtpCode(''); setLoginError(''); }}
                  className="text-xs font-semibold text-secondaryText hover:text-primaryText underline cursor-pointer"
                >
                  ← পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-primaryText mb-1">
                  মালিকের ইমেইল অ্যাড্রেস
                </label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার অনুমোদিত ইমেইল দিন"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primaryText mb-1">
                  নিরাপদ অ্যাডমিন পাসওয়ার্ড
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  disabled={lockoutRemainingSeconds > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-white disabled:bg-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn || lockoutRemainingSeconds > 0}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-violetAccent hover:from-brand-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-soft hover:shadow-soft-hover transition-all text-sm disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>{loggingIn ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন প্যানেলে প্রবেশ করুন'}</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-cardBorder/60 space-y-2">
            <div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline transition-colors cursor-pointer"
              >
                ← সাধারণ ওয়েবসাইট ব্রাউজ করুন (প্রস্থান)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. AUTHENTICATED OWNER DASHBOARD VIEW =================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl border border-cardBorder p-6 sm:p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              মালিক সেশন সক্রিয়
            </span>
            <span className="text-xs text-secondaryText">
              {isFirebaseConfigured ? '🔥 লাইভ ফায়ারবেস সংযুক্ত' : '💾 লোকাল ডেভ সিমুলেশন'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-primaryText">
            মালিক ড্যাশবোর্ড — {ownerName}
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            নোট অনুমোদন, বিষয় ও অধ্যায় ব্যবস্থাপনা, রিপোর্ট পর্যালোচনা ও ওয়েবসাইট পরিচালনা
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Direct Exit Back to Front Public Website */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-violetAccent hover:from-brand-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-soft hover:shadow-soft-hover transition-all text-xs sm:text-sm cursor-pointer active:scale-95"
            title="ওয়েবসাইটের মূল পাতায় ফিরে যান"
          >
            <Home className="w-4 h-4" />
            <span>মূল ওয়েবসাইট দেখুন</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2.5 text-secondaryText hover:text-brand-600 bg-slate-50 hover:bg-brand-50 rounded-xl transition-colors border border-cardBorder disabled:opacity-50 cursor-pointer"
            title="তথ্য রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2.5 rounded-xl border border-rose-200 transition-colors text-xs sm:text-sm cursor-pointer"
            title="লগআউট করে সাধারণ ওয়েবসাইটে ফিরে যান"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট ও প্রস্থান</span>
          </button>
        </div>
      </div>

      {/* System Toast Notification */}
      {systemMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{systemMessage}</span>
          </div>
          <button onClick={() => setSystemMessage('')} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Pending Notes */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-50 border-amber-300 shadow-soft ring-2 ring-amber-400/40'
              : 'bg-white border-cardBorder hover:shadow'
          }`}
        >
          <span className="text-xs font-bold text-amber-700 uppercase block mb-1">
            পেন্ডিং নোট
          </span>
          <div className="text-2xl font-black text-amber-700">
            {pendingNotes.length}
          </div>
          <span className="text-[10px] text-secondaryText">অনুমোদনের অপেক্ষায়</span>
        </div>

        {/* Active Approved Notes */}
        <div
          onClick={() => setActiveTab('activeNotes')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'activeNotes'
              ? 'bg-brand-50 border-brand-300 shadow-soft ring-2 ring-brand-400/40'
              : 'bg-white border-cardBorder hover:shadow'
          }`}
        >
          <span className="text-xs font-bold text-brand-700 uppercase block mb-1">
            অনুমোদিত নোট
          </span>
          <div className="text-2xl font-black text-brand-700">
            {activeNotes.length}
          </div>
          <span className="text-[10px] text-secondaryText">পাবলিকলি দৃশ্যমান</span>
        </div>

        {/* Total Subjects */}
        <div
          onClick={() => setActiveTab('curriculum')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'curriculum'
              ? 'bg-violet-50 border-violet-300 shadow-soft ring-2 ring-violet-400/40'
              : 'bg-white border-cardBorder hover:shadow'
          }`}
        >
          <span className="text-xs font-bold text-violet-700 uppercase block mb-1">
            মোট বিষয়
          </span>
          <div className="text-2xl font-black text-violet-700">
            {subjects.length}
          </div>
          <span className="text-[10px] text-secondaryText">{chapters.length} টি অধ্যায়</span>
        </div>

        {/* Contributors */}
        <div className="bg-white p-4 rounded-2xl border border-cardBorder">
          <span className="text-xs font-bold text-secondaryText uppercase block mb-1">
            অবদানকারী
          </span>
          <div className="text-2xl font-black text-primaryText">
            {stats ? stats.totalContributors : '০'}
          </div>
          <span className="text-[10px] text-secondaryText">শিক্ষার্থী সংখ্যা</span>
        </div>

        {/* Total Downloads */}
        <div className="bg-white p-4 rounded-2xl border border-cardBorder">
          <span className="text-xs font-bold text-secondaryText uppercase block mb-1">
            মোট ডাউনলোড
          </span>
          <div className="text-2xl font-black text-primaryText">
            {stats ? stats.totalDownloads.toLocaleString() : '০'}
          </div>
          <span className="text-[10px] text-secondaryText">সর্বমোট নোট সংগ্রহ</span>
        </div>

        {/* Reports */}
        <div
          onClick={() => setActiveTab('reports')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'reports'
              ? 'bg-rose-50 border-rose-300 shadow-soft ring-2 ring-rose-400/40'
              : 'bg-white border-cardBorder hover:shadow'
          }`}
        >
          <span className="text-xs font-bold text-rose-700 uppercase block mb-1">
            রিপোর্ট
          </span>
          <div className="text-2xl font-black text-rose-700">
            {reports.filter(r => r.status === 'pending').length}
          </div>
          <span className="text-[10px] text-secondaryText">অপেক্ষমাণ অভিযোগ</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cardBorder pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>পেন্ডিং নোট কিউ ({pendingNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activeNotes')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'activeNotes'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>সক্রিয় নোটসমূহ ({activeNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'curriculum'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>বিষয় ও অধ্যায় সিলেবাস</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>শিক্ষার্থী রিপোর্ট ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ফায়ারবেস ও ব্যাকএন্ড রুলস</span>
        </button>
      </div>

      {/* ================= TAB 1: PENDING NOTES QUEUE ================= */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primaryText">
              অনুমোদনের জন্য অপেক্ষমাণ নোট ({pendingNotes.length} টি)
            </h2>
            <span className="text-xs text-secondaryText">
              অনুমোদনের পর নোটগুলো তাৎক্ষণিকভাবে পাবলিক সাইটে দৃশ্যমান হবে।
            </span>
          </div>

          {pendingNotes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cardBorder p-12 text-center shadow-soft">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-primaryText">কোনো পেন্ডিং নোট নেই</h3>
              <p className="text-xs sm:text-sm text-secondaryText mt-1">
                সকল নতুন আপলোড যথাযথভাবে পর্যালোচনা ও অনুমোদন করা হয়েছে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingNotes.map((note) => {
                const sub = subjects.find(s => s.subjectId === note.subjectId);
                const chap = chapters.find(c => c.chapterId === note.chapterId);
                const uploadDate = new Date(note.createdAt).toLocaleString('bn-BD', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                });

                return (
                  <div
                    key={note.noteId}
                    className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-soft space-y-4 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            ⏳ অনুমোদনের অপেক্ষায়
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {note.fileType.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-primaryText mt-2">
                          {note.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-secondaryText shrink-0">
                        {note.fileSize}
                      </span>
                    </div>

                    <p className="text-xs text-secondaryText leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <strong>নোটের বিবরণ:</strong> {note.description || 'শিক্ষার্থী কোনো অতিরিক্ত বিবরণ দেয়নি।'}
                    </p>

                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-secondaryText border border-cardBorder">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                        <span className="font-semibold text-slate-500">শিক্ষার্থী:</span>
                        <strong className="text-primaryText font-bold text-sm">{note.studentName}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-500">রোল নম্বর: </span>
                          <strong className="text-primaryText">{note.rollNumber || 'দেওয়া হয়নি'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">বিভাগ / শাখা: </span>
                          <strong className="text-brand-700">{note.section || 'সাধারণ'}</strong>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">বিদ্যালয়: </span>
                        <strong className="text-primaryText">{note.schoolName || 'দেওয়া হয়নি'}</strong>
                      </div>
                      {note.whatsappNumber ? (
                        <div className="flex items-center justify-between pt-1 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/80">
                          <span className="text-emerald-950 font-bold flex items-center gap-1.5 text-xs">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>হোয়াটসঅ্যাপ:</span>
                            <span className="font-mono text-emerald-800 font-semibold">{note.whatsappNumber}</span>
                          </span>
                          <a
                            href={`https://wa.me/${(note.whatsappNumber || '').replace(/[^0-9]/g, '').startsWith('880') ? (note.whatsappNumber || '').replace(/[^0-9]/g, '') : (note.whatsappNumber || '').replace(/[^0-9]/g, '').startsWith('0') ? '88' + (note.whatsappNumber || '').replace(/[^0-9]/g, '') : (note.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${note.studentName}, SSC Note Box-এ আপনার "${note.title}" নোট সংক্রান্ত:`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md shadow-2xs transition-all active:scale-95"
                            title="শিক্ষার্থীর হোয়াটসঅ্যাপে সরাসরি মেসেজ পাঠান"
                          >
                            <span>মেসেজ দিন</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : null}
                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-brand-800 font-bold">
                          {sub?.name || note.subjectId} • {chap?.chapterName || note.chapterId}
                        </span>
                        <span className="text-slate-400">{uploadDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-cardBorder">
                      <a
                        href={note.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl border border-brand-200 transition-colors"
                        title="নতুন ট্যাবে সম্পূর্ণ নোটের ফাইলটি খুলে পরীক্ষা করুন"
                      >
                        <Eye className="w-4 h-4" />
                        <span>নোট পরীক্ষা করুন (PDF)</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectNote(note.noteId)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                          title="এই নোটটি বাতিল ও ডাটাবেজ থেকে মুছে ফেলুন"
                        >
                          বাতিল করুন
                        </button>

                        <button
                          onClick={() => handleApproveNote(note.noteId)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                          title="অনুমোদন করুন, এর সাথে সাথেই নোটটি সবার জন্য ওয়েবসাইটে লাইভ হয়ে যাবে"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>অনুমোদন করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: ACTIVE APPROVED NOTES ================= */}
      {activeTab === 'activeNotes' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-cardBorder flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNotesText}
                onChange={(e) => setSearchNotesText(e.target.value)}
                placeholder="সক্রিয় নোট খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-cardBorder rounded-xl focus:outline-none"
              />
            </div>
            <span className="text-xs text-secondaryText font-medium">
              মোট সক্রিয় নোট: {activeNotes.length} টি
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-cardBorder shadow-soft overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-cardBorder text-secondaryText uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-3.5">শিরোনাম ও বিবরণ</th>
                  <th className="p-3.5">বিষয় ও অধ্যায়</th>
                  <th className="p-3.5">শিক্ষার্থী ও স্কুল</th>
                  <th className="p-3.5">ডাউনলোড</th>
                  <th className="p-3.5 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBorder">
                {activeNotes
                  .filter(n =>
                    n.title.toLowerCase().includes(searchNotesText.toLowerCase()) ||
                    n.studentName.toLowerCase().includes(searchNotesText.toLowerCase()) ||
                    n.schoolName.toLowerCase().includes(searchNotesText.toLowerCase())
                  )
                  .map((note) => {
                    const sub = subjects.find(s => s.subjectId === note.subjectId);
                    const chap = chapters.find(c => c.chapterId === note.chapterId);

                    return (
                      <tr key={note.noteId} className="hover:bg-slate-50/60">
                        <td className="p-3.5 max-w-xs">
                          <span className="font-bold text-primaryText block line-clamp-1">{note.title}</span>
                          <span className="text-[11px] text-secondaryText block line-clamp-1 mt-0.5">{note.description}</span>
                          <span className="text-[10px] text-brand-700 font-semibold">{note.fileType.toUpperCase()} • {note.fileSize}</span>
                        </td>
                        <td className="p-3.5 text-secondaryText">
                          <span className="font-semibold text-primaryText block">{sub?.name || note.subjectId}</span>
                          <span className="text-[11px]">{chap?.chapterName || note.chapterId}</span>
                        </td>
                        <td className="p-3.5 text-secondaryText">
                          <span className="font-semibold text-primaryText block">{note.studentName}</span>
                          <span className="text-[11px] line-clamp-1">{note.schoolName}</span>
                          {note.whatsappNumber && (
                            <a
                              href={`https://wa.me/${(note.whatsappNumber || '').replace(/[^0-9]/g, '').startsWith('880') ? (note.whatsappNumber || '').replace(/[^0-9]/g, '') : (note.whatsappNumber || '').replace(/[^0-9]/g, '').startsWith('0') ? '88' + (note.whatsappNumber || '').replace(/[^0-9]/g, '') : (note.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${note.studentName}, SSC Note Box-এ আপনার "${note.title}" নোট সংক্রান্ত:`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold hover:underline mt-0.5"
                              title="শিক্ষার্থীর সাথে হোয়াটসঅ্যাপে চ্যাট করুন"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>{note.whatsappNumber}</span>
                            </a>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-primaryText">
                          {note.downloadCount}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingNote(note)}
                              className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.noteId)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SUBJECTS & CHAPTERS MANAGEMENT ================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Top Curriculum Banner */}
          <div className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>NCTB অফিসিয়াল ডাটাবেজ • SSC 2027 প্রস্তুত</span>
              </div>
              <h2 className="text-xl font-bold">পাঠ্যক্রম ও বিষয়ভিত্তিক কারিকুলাম ব্যবস্থাপনা</h2>
              <p className="text-xs text-white/80 mt-0.5">
                পরিমার্জিত জাতীয় শিক্ষাক্রম ২০১২ • বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা ও ঐচ্ছিক বিষয়সমূহ
              </p>
            </div>
            <button
              onClick={async () => {
                if (window.confirm('আপনি কি নিশ্চিত যে NCTB অনুমোদিত ফ্রেশ কারিকুলামে ডাটাবেজ রিসেট করতে চান?')) {
                  await dataService.resetToNctbCurriculum();
                  setSystemMessage('NCTB অফিশিয়াল সিলেবাস অনুযায়ী ডাটাবেজ সফলভাবে রিসেট হয়েছে!');
                  setTimeout(() => setSystemMessage(''), 3000);
                  loadDashboardData();
                }
              }}
              className="inline-flex items-center gap-2 bg-white text-brand-900 hover:bg-slate-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>NCTB ফ্রেশ কারিকুলাম রি-সিড</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Subject Form */}
            <div className="bg-white p-6 rounded-2xl border border-cardBorder shadow-soft space-y-4">
              <h3 className="text-base font-bold text-primaryText flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" />
                <span>নতুন বিষয় সংযুক্ত করুন</span>
              </h3>

              <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-primaryText mb-1">বাংলা বিষয়ের নাম *</label>
                  <input
                    type="text"
                    required
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="যেমন: পৌরনীতি ও নাগরিকতা"
                    className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primaryText mb-1">ইংরেজি নাম *</label>
                  <input
                    type="text"
                    required
                    value={newSubEngName}
                    onChange={(e) => setNewSubEngName(e.target.value)}
                    placeholder="যেমন: Civics & Citizenship"
                    className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primaryText mb-1">ব্যানার ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={newSubBadge}
                    onChange={(e) => setNewSubBadge(e.target.value)}
                    placeholder="যেমন: NCTB সিলেবাস নোটস"
                    className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primaryText mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <textarea
                    rows={2}
                    value={newSubDesc}
                    onChange={(e) => setNewSubDesc(e.target.value)}
                    placeholder="বিষয়ের সংক্ষিপ্ত বিবরণ..."
                    className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 text-white font-bold py-2.5 rounded-xl shadow-soft"
                >
                  বিষয় যুক্ত করুন
                </button>
              </form>

              {/* List of existing subjects */}
              <div className="pt-4 border-t border-cardBorder space-y-2">
                <h4 className="text-xs font-bold text-secondaryText uppercase">বর্তমান বিষয়সমূহ ({subjects.length})</h4>
                <div className="max-h-72 overflow-y-auto divide-y divide-cardBorder">
                  {subjects.map(s => (
                    <div key={s.subjectId} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-primaryText">{s.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700">
                            {s.group}
                          </span>
                        </div>
                        <span className="text-secondaryText text-[11px] block">{s.textbookName || s.englishName}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(s.subjectId)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Chapter Form */}
            <div className="bg-white p-6 rounded-2xl border border-cardBorder shadow-soft space-y-4">
              <h3 className="text-base font-bold text-primaryText flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" />
                <span>নতুন অধ্যায় / গদ্য / পদ্য সংযুক্ত করুন</span>
              </h3>

              <form onSubmit={handleAddChapter} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-primaryText mb-1">বিষয় নির্বাচন করুন *</label>
                  <select
                    value={selectedSubForChapter}
                    onChange={(e) => setSelectedSubForChapter(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s.subjectId} value={s.subjectId}>{s.name} ({s.englishName})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-primaryText mb-1">ক্যাটাগরি টাইপ *</label>
                    <select
                      value={newChapType}
                      onChange={(e) => setNewChapType(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                    >
                      <option value="chapter">অধ্যায় (Chapter)</option>
                      <option value="prose">গদ্য (Prose)</option>
                      <option value="poem">পদ্য (Poem)</option>
                      <option value="grammar">ব্যাকরণ (Grammar)</option>
                      <option value="unit">ইউনিট (Unit)</option>
                      <option value="writing">নির্মিতি / রাইটিং</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-primaryText mb-1">অধ্যায় ক্রম নম্বর</label>
                    <input
                      type="number"
                      value={newChapNum}
                      onChange={(e) => setNewChapNum(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-primaryText mb-1">অধ্যায় বা কবিতা/গদ্যের নাম *</label>
                  <input
                    type="text"
                    required
                    value={newChapName}
                    onChange={(e) => setNewChapName(e.target.value)}
                    placeholder="যেমন: ৩য় অধ্যায়: পদার্থের গঠন"
                    className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primaryText mb-1">রচয়িতা / কবি (যদি থাকে)</label>
                  <input
                    type="text"
                    value={newChapAuthor}
                    onChange={(e) => setNewChapAuthor(e.target.value)}
                    placeholder="যেমন: রবীন্দ্রনাথ ঠাকুর"
                    className="w-full p-2.5 rounded-lg border border-cardBorder bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 text-white font-bold py-2.5 rounded-xl shadow-soft"
                >
                  অধ্যায় সংরক্ষণ করুন
                </button>
              </form>

              {/* List of chapters under selected subject */}
              <div className="pt-4 border-t border-cardBorder space-y-2">
                <h4 className="text-xs font-bold text-secondaryText uppercase">
                  নির্বাচিত বিষয়ের অধ্যায়সমূহ ({chapters.filter(c => c.subjectId === selectedSubForChapter).length})
                </h4>
                <div className="max-h-72 overflow-y-auto divide-y divide-cardBorder">
                  {chapters
                    .filter(c => c.subjectId === selectedSubForChapter)
                    .map(c => (
                      <div key={c.chapterId} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-primaryText">{c.chapterName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {c.chapterType}
                            </span>
                          </div>
                          {c.author && <span className="text-secondaryText text-[11px] block">লেখক/কবি: {c.author}</span>}
                        </div>
                        <button
                          onClick={() => handleDeleteChapter(c.chapterId)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ================= TAB 4: STUDENT REPORTS ================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-primaryText">
            শিক্ষার্থীদের জমাকৃত অভিযোগ ও রিপোর্টসমূহ ({reports.length} টি)
          </h2>

          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cardBorder p-12 text-center shadow-soft">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-primaryText">কোনো অমীমাংসিত রিপোর্ট নেই</h3>
              <p className="text-xs text-secondaryText mt-1">সবকিছু স্বাভাবিকভাবে পরিচালিত হচ্ছে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <div key={rep.reportId} className="bg-white p-5 rounded-2xl border border-rose-200 shadow-soft space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                        {rep.reasonText}
                      </span>
                      <h4 className="font-bold text-primaryText text-sm mt-1">
                        নোট: {rep.noteTitle}
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-secondaryText">
                      {new Date(rep.reportedAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  {rep.details && (
                    <p className="text-xs text-secondaryText bg-slate-50 p-3 rounded-xl border border-cardBorder">
                      "{rep.details}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-cardBorder text-xs">
                    <span className="font-semibold text-secondaryText">
                      স্ট্যাটাস: <strong>{rep.status}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.reportId, 'dismissed')}
                        className="px-3 py-1 rounded-lg text-secondaryText hover:bg-slate-100"
                      >
                        খারিজ করুন
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.reportId, 'resolved')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold"
                      >
                        সমাধান চিহ্নিত করুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: SYSTEM & SECURITY SETUP ================= */}
      {activeTab === 'system' && (
        <div className="space-y-8">
          {/* GOOGLE AUTHENTICATOR (2FA) SETUP CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cardBorder">
              <div>
                <h2 className="text-xl font-bold text-primaryText flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  <span>গুগল অথেন্টিকেটর (Google Authenticator 2FA) সিকিউরিটি</span>
                </h2>
                <p className="text-xs sm:text-sm text-secondaryText mt-1">
                  আপনার মোবাইল ফোনের Google Authenticator বা Microsoft Authenticator অ্যাপ দিয়ে স্ক্যান করে অতিরিক্ত নিরাপত্তা স্তর চালু করুন।
                </p>
              </div>

              <div className="shrink-0">
                {is2FAEnabled ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>২FA সম্পূর্ণ সক্রিয় (Protected)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>২FA নিষ্ক্রিয়</span>
                  </span>
                )}
              </div>
            </div>

            {totpMessage && (
              <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {totpMessage}
              </div>
            )}

            {!is2FAEnabled && !totpSetupData && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div className="text-xs text-indigo-900">
                  <p className="font-bold">Google Authenticator ২FA সেটআপ করতে চান?</p>
                  <p className="text-secondaryText text-[11px] mt-0.5">লগইন করার সময় পাসওয়ার্ডের পর মোবাইল অ্যাপের ৬ ডিজিটের কোড প্রয়োজন হবে।</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartTotpSetup}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-soft transition-all shrink-0 cursor-pointer"
                >
                  QR কোড দেখুন ও সেটআপ শুরু করুন
                </button>
              </div>
            )}

            {totpSetupData && !is2FAEnabled && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-cardBorder space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-white rounded-2xl border border-cardBorder shadow-soft">
                      <img
                        src={totpSetupData.qrCodeUrl}
                        alt="Google Authenticator QR Code"
                        className="w-48 h-48 rounded-xl object-contain"
                      />
                    </div>
                    <span className="text-xs text-secondaryText font-medium">
                      📱 আপনার মোবাইলের <strong>Google Authenticator</strong> অ্যাপ দিয়ে এই QR কোডটি স্ক্যান করুন
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-primaryText mb-1">
                        ম্যানুয়াল এন্ট্রি সিক্রেট কি (Secret Key):
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 text-xs font-mono bg-white rounded-xl border border-cardBorder font-bold text-brand-700 break-all select-all">
                          {totpSetupData.secret}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopySecret(totpSetupData.secret)}
                          className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-primaryText flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSecret ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleConfirmTotp} className="space-y-3">
                      <label className="block text-xs font-bold text-primaryText">
                        অ্যাপের ৬ ডিজিটের কোডটি লিখে কনফার্ম করুন:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={totpVerificationInput}
                          onChange={(e) => setTotpVerificationInput(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123456"
                          className="flex-1 px-3.5 py-2 text-sm font-mono tracking-widest text-center font-bold rounded-xl border border-cardBorder bg-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={totpVerificationInput.length < 6}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                        >
                          সক্রিয় করুন
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {is2FAEnabled && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div className="text-xs text-emerald-900">
                  <p className="font-extrabold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Google Authenticator আপনার অ্যাকাউন্টে সক্রিয় আছে</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">লগইন করার সময় আপনার ফোনের ৬ ডিজিটের কোড প্রয়োজন হবে।</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('আপনি কি নিশ্চিত যে ২FA নিষ্ক্রিয় করতে চান?')) {
                      disable2FA();
                      setTotpMessage('২FA নিষ্ক্রিয় করা হয়েছে।');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer"
                >
                  নিষ্ক্রিয় করুন
                </button>
              </div>
            )}
          </div>
          {/* CLOUDFLARE (D1 & R2) INTEGRATION CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-orange-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cardBorder">
              <div>
                <h2 className="text-xl font-bold text-primaryText flex items-center gap-2">
                  <Database className="w-5 h-5 text-orange-600" />
                  <span>ক্লাউডফ্লেয়ার (Cloudflare D1 & R2) হাই-স্পিড ব্যাকএন্ড</span>
                </h2>
                <p className="text-xs sm:text-sm text-secondaryText mt-1">
                  Cloudflare Workers, D1 Database এবং R2 Object Storage দিয়ে চালিত আল্ট্রা-ফাস্ট ও সিকিউর ব্যাকএন্ড।
                </p>
              </div>

              <div className="shrink-0">
                {cfApiUrl ? (
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${cfTestStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                    <span className={`w-2 h-2 rounded-full ${cfTestStatus === 'connected' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`} />
                    <span>{cfTestStatus === 'connected' ? 'ক্লাউডফ্লেয়ার সংযুক্ত' : 'কনফিগার করা আছে'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>কনফিগার করা নেই</span>
                  </span>
                )}
              </div>
            </div>

            {cfMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold ${cfTestStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {cfMessage}
              </div>
            )}

            {/* Cloudflare Configuration Form */}
            <form onSubmit={handleSaveCloudflareConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primaryText mb-1.5">
                  Cloudflare Worker API URL *
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="url"
                    value={cfApiUrl}
                    onChange={(e) => setCfApiUrl(e.target.value)}
                    placeholder="https://ssc-notebox-api.your-name.workers.dev"
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>সংরক্ষণ ও সংযোগ পরীক্ষা</span>
                  </button>
                </div>
                <span className="text-[11px] text-secondaryText mt-1.5 block">
                  Cloudflare Workers এ ডিপ্লয় করা API-এর লিংক প্রদান করুন (যেমন: https://ssc-notebox-api.workers.dev)
                </span>
              </div>
            </form>
          </div>

          {/* SUPABASE LIVE CLOUD INTEGRATION CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cardBorder shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cardBorder">
              <div>
                <h2 className="text-xl font-bold text-primaryText flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>সুপাবেস (Supabase) লাইভ ক্লাউড ডাটাবেজ ও ফাইল স্টোরেজ</span>
                </h2>
                <p className="text-xs sm:text-sm text-secondaryText mt-1">
                  সুপাবেস সক্রিয় থাকলে যেকোনো ডিভাইস (মোবাইল বা কম্পিউটার) থেকে আপলোড করা ফাইল সরাসরি ক্লাউডে জমা হবে এবং সাথে সাথে সব ভিজিটর তা দেখতে পারবে।
                </p>
              </div>

              <div className="shrink-0">
                {supabaseUrl && supabaseAnonKey ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>সুপাবেস কনফিগার করা হয়েছে</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>সুপাবেস কী যুক্ত করুন</span>
                  </span>
                )}
              </div>
            </div>

            {/* Supabase Configuration Form */}
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primaryText mb-1.5">
                    Supabase Project URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <span className="text-[11px] text-secondaryText mt-1 block">
                    Supabase Dashboard ➔ Project Settings ➔ API ➔ Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primaryText mb-1.5">
                    Supabase Anon Public Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <span className="text-[11px] text-secondaryText mt-1 block">
                    Supabase Dashboard ➔ Project Settings ➔ API ➔ anon public key
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopySupabaseSql}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-colors"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-brand-600" />}
                  <span>{copiedSql ? 'SQL স্ক্রিপ্ট কপি হয়েছে!' : '১-ক্লিকে SQL টেবিল স্ক্রিপ্ট কপি করুন'}</span>
                </button>

                <button
                  type="submit"
                  disabled={supabaseSaveStatus === 'saving'}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-soft transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{supabaseSaveStatus === 'saving' ? 'সংরক্ষণ হচ্ছে...' : 'সুপাবেস সংরক্ষণ ও কানেক্ট করুন'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* TELEGRAM DUAL BOT NOTIFICATIONS CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cardBorder shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cardBorder/60">
              <div>
                <h2 className="text-xl font-bold text-primaryText flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-500" />
                  <span>টেলিগ্রাম পৃথক নোটিফিকেশন বট সিস্টেম (Dual Bots)</span>
                </h2>
                <p className="text-xs sm:text-sm text-secondaryText mt-1">
                  আপনার নির্দেশনা অনুযায়ী ভিজিটর এবং নোট আপলোডের জন্য সম্পূর্ণ পৃথক ২টি ডেডিকেটেড বট সক্রিয় রয়েছে।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  <span>ভিজিটর বট: @note_book_note_bot</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>আপলোড বট: @note_submit_bot</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1.5">
                <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <span>🌐 ১. ভিজিটর নোটিফিকেশন বট</span>
                </h4>
                <p className="text-xs text-sky-800 leading-relaxed">
                  কেউ ওয়েবসাইটে ঢুকলে শুধুমাত্র এই বটের মধ্যে ভিজিটরের ডিভাইস, আইপি ও লোকেশন এলার্ট আসবে। বট লিঙ্ক:{' '}
                  <a 
                    href="https://t.me/note_book_note_bot" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-bold underline text-sky-700 hover:text-sky-900"
                  >
                    @note_book_note_bot
                  </a>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span>📚 ২. নোট আপলোড অ্যালার্ট বট</span>
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  কোনো শিক্ষার্থী নোট আপলোড করলে শুধুমাত্র এই বটে মেসেজ যাবে। মেসেজ পেতে একবার বটে গিয়ে START চাপুন:{' '}
                  <a 
                    href="https://t.me/note_submit_bot" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-bold underline text-emerald-700 hover:text-emerald-900"
                  >
                    @note_submit_bot
                  </a>
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTelegramConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primaryText mb-1.5">
                    ভিজিটর বট টোকেন (Visitor Bot Token)
                  </label>
                  <input
                    type="text"
                    required
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    placeholder="9085137422:AAEL..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <span className="text-[11px] text-secondaryText mt-1 block">
                    ভিজিটর অ্যালার্ট (@note_book_note_bot)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primaryText mb-1.5">
                    নোট আপলোড বট টোকেন (Upload Bot Token)
                  </label>
                  <input
                    type="text"
                    required
                    value={tgUploadToken}
                    onChange={(e) => setTgUploadToken(e.target.value)}
                    placeholder="9259492359:AAEZe..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-secondaryText mt-1 block">
                    নোট আপলোড অ্যালার্ট (@note_submit_bot)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primaryText mb-1.5">
                    আপনার Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    required
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    placeholder="5856234447"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <span className="text-[11px] text-secondaryText mt-1 block">
                    আপনার ব্যক্তিগত টেলিগ্রাম আইডি
                  </span>
                </div>
              </div>

              {tgTestStatus && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold ${
                  tgTestStatus.includes('সফল') 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {tgTestStatus}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTestTelegramAlert('visitor')}
                    disabled={tgTesting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-sky-600" />
                    <span>{tgTesting ? 'পরীক্ষা চলছে...' : 'ভিজিটর বট টেস্ট করুন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestTelegramAlert('upload')}
                    disabled={tgTesting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>{tgTesting ? 'পরীক্ষা চলছে...' : 'আপলোড বট টেস্ট করুন'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-soft transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>টেলিগ্রাম সেটিংস সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* GOOGLE SHEETS AUTOMATIC SYNC CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cardBorder shadow-soft space-y-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primaryText">
                    Google Sheets অটোমেটিক ডাটা সিঙ্ক
                  </h2>
                  <p className="text-xs text-secondaryText mt-0.5">
                    শিক্ষার্থীরা নোট আপলোড করলেই তাদের সব তথ্য তারিখ ও সময়সহ সরাসরি আপনার গুগল শিটে স্বয়ংক্রিয়ভাবে জমা হবে।
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveGoogleSheet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primaryText mb-1.5">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[11px] text-secondaryText mt-1 block">
                  আপনার গুগল শিটের Apps Script থেকে প্রাপ্ত Web App URL টি এখানে পেস্ট করুন।
                </span>
              </div>

              {sheetTestStatus && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold ${
                  sheetTestStatus.includes('সফল') 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {sheetTestStatus}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestGoogleSheet}
                  disabled={sheetTesting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>{sheetTesting ? 'পাঠানো হচ্ছে...' : 'শিটে টেস্ট ডাটা পাঠান'}</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-soft transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Google Sheet লিংক সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* FIREBASE INTEGRATION CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cardBorder shadow-soft space-y-8">
            <div>
              <h2 className="text-xl font-bold text-primaryText flex items-center gap-2">
                <Database className="w-5 h-5 text-brand-600" />
                <span>ফায়ারবেস ব্যাকএন্ড ইন্টিগ্রেশন ও সিকিউরিটি রুলস</span>
              </h2>
              <p className="text-xs sm:text-sm text-secondaryText mt-1">
                প্রোডাকশনে সম্পূর্ণ ডাটাবেজ সুরক্ষার জন্য নিচের কনফিগারেশন এবং সিকিউরিটি রুলস সরাসরি Firebase Console এ পেস্ট করুন।
              </p>
            </div>

            {/* Connection Status Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-secondaryText uppercase tracking-wider block">
                  বর্তমান সংযোগ স্ট্যাটাস:
                </span>
                <span className="text-base font-bold text-primaryText flex items-center gap-2 mt-0.5">
                  {isFirebaseConfigured ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ফায়ারবেস ক্লাউড সক্রিয় (Firestore & Storage Connected)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>হাইব্রিড মোড (লোকাল স্টোরেজ সক্রিয় • .env ফাইলে কী কনফিগার করুন)</span>
                    </>
                  )}
                </span>
              </div>

              <button
                onClick={handleResetDatabase}
                className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-primaryText text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ডাটাবেজ রি-সিড করুন</span>
              </button>
            </div>

          {/* Copyable Firestore Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primaryText">
                ১. Cloud Firestore Security Rules (কপি করে পেস্ট করুন)
              </h3>
              <button
                onClick={() => handleCopyRules('firestore')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
              >
                {copiedRules === 'firestore' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRules === 'firestore' ? 'কপি হয়েছে!' : 'রুলস কপি করুন'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-56">
              {FIRESTORE_RULES}
            </pre>
          </div>

          {/* Copyable Storage Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primaryText">
                ২. Firebase Storage Security Rules (কপি করে পেস্ট করুন)
              </h3>
              <button
                onClick={() => handleCopyRules('storage')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
              >
                {copiedRules === 'storage' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRules === 'storage' ? 'কপি হয়েছে!' : 'রুলস কপি করুন'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-56">
              {STORAGE_RULES}
            </pre>
          </div>
        </div>
      </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-primaryText">নোট সম্পাদনা করুন</h3>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1">শিরোনাম</label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-cardBorder bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1">বিবরণ</label>
              <textarea
                rows={3}
                value={editingNote.description}
                onChange={(e) => setEditingNote({ ...editingNote, description: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-cardBorder bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-primaryText mb-1">শিক্ষার্থীর নাম</label>
                <input
                  type="text"
                  value={editingNote.studentName}
                  onChange={(e) => setEditingNote({ ...editingNote, studentName: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-cardBorder bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primaryText mb-1">স্কুলের নাম</label>
                <input
                  type="text"
                  value={editingNote.schoolName}
                  onChange={(e) => setEditingNote({ ...editingNote, schoolName: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-cardBorder bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 text-xs font-semibold text-secondaryText"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveNoteEdit}
                className="inline-flex items-center gap-1.5 bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerControlPage;
