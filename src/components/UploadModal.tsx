import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Plus, Image as ImageIcon, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, Chapter, FileType } from '../types';
import { dataService } from '../services/dataService';
import { useLanguage } from '../context/LanguageContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
  initialChapterId?: string;
  onUploadSuccess?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
  initialChapterId,
  onUploadSuccess
}) => {
  const { t, isBn } = useLanguage();
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [group, setGroup] = useState('বিজ্ঞান');
  const [sectionName, setSectionName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [subjectId, setSubjectId] = useState(initialSubjectId || '');
  const [chapterId, setChapterId] = useState(initialChapterId || '');
  const [customChapterName, setCustomChapterName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ id: string; url: string; name: string }[]>([]);
  const [fileSizeStr, setFileSizeStr] = useState('');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevProps, setPrevProps] = useState({ isOpen, initialSubjectId, initialChapterId });
  if (
    prevProps.isOpen !== isOpen ||
    prevProps.initialSubjectId !== initialSubjectId ||
    prevProps.initialChapterId !== initialChapterId
  ) {
    setPrevProps({ isOpen, initialSubjectId, initialChapterId });
    if (isOpen) {
      if (initialSubjectId) setSubjectId(initialSubjectId);
      if (initialChapterId) setChapterId(initialChapterId);
    }
  }

  // Load chapters for selected subject
  useEffect(() => {
    let isMounted = true;
    const fetchChapters = async () => {
      if (subjectId) {
        const list = await dataService.getChapters(subjectId);
        if (!isMounted) return;
        setChapters(list);
        if (!initialChapterId || list.every(c => c.chapterId !== initialChapterId)) {
          setChapterId(list[0]?.chapterId || '');
        }
      } else {
        if (!isMounted) return;
        setChapters([]);
        setChapterId('');
      }
    };
    fetchChapters();
    return () => {
      isMounted = false;
    };
  }, [subjectId, initialChapterId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    // Check if user selected PDF or DOCX
    const pdfFile = incoming.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const docxFile = incoming.find(f => f.name.toLowerCase().endsWith('.docx'));

    if (pdfFile) {
      setSelectedFiles([pdfFile]);
      setImagePreviews([]);
      const mb = (pdfFile.size / (1024 * 1024)).toFixed(1);
      setFileSizeStr(`${mb} MB`);
      return;
    }

    if (docxFile) {
      setSelectedFiles([docxFile]);
      setImagePreviews([]);
      const mb = (docxFile.size / (1024 * 1024)).toFixed(1);
      setFileSizeStr(`${mb} MB`);
      return;
    }

    // Otherwise, treat as images (unlimited pages)
    const validImages = incoming.filter(f =>
      f.type.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || '')
    );

    if (validImages.length === 0) {
      setErrorMessage('শুধুমাত্র PDF, JPG, JPEG, PNG, WEBP অথবা DOCX ফাইল নির্বাচন করুন।');
      return;
    }

    // Keep existing images and append new ones (allows adding more photos sequentially)
    const existingImages = selectedFiles.filter(f =>
      f.type.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || '')
    );

    const merged = [...existingImages, ...validImages];
    setSelectedFiles(merged);

    const previews = merged.map((file, idx) => ({
      id: `${file.name}-${idx}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImagePreviews(previews);

    const totalBytes = merged.reduce((acc, f) => acc + f.size, 0);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
    setFileSizeStr(`${totalMb} MB (${merged.length} পৃষ্ঠা)`);

    // Reset input value so user can click to add more files anytime
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePage = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);

    const previews = updated.map((file, idx) => ({
      id: `${file.name}-${idx}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImagePreviews(previews);

    if (updated.length === 0) {
      setFileSizeStr('');
    } else {
      const totalBytes = updated.reduce((acc, f) => acc + f.size, 0);
      const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
      setFileSizeStr(`${totalMb} MB (${updated.length} পৃষ্ঠা)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim()) {
      setErrorMessage('দয়া করে আপনার নাম লিখুন।');
      return;
    }
    if (/\d|[০-৯]/.test(studentName.trim())) {
      setErrorMessage('শিক্ষার্থীর নামে কোনো সংখ্যা গ্রহণযোগ্য নয়। শুধুমাত্র অক্ষর লিখুন।');
      return;
    }
    if (studentName.trim().length < 2) {
      setErrorMessage('দয়া করে সঠিক পূর্ণ নাম লিখুন।');
      return;
    }
    if (rollNumber.trim() && !/^[0-9০-৯]+$/.test(rollNumber.trim())) {
      setErrorMessage('রোল নম্বরে কোনো টেক্সট বা অক্ষর গ্রহণযোগ্য নয়। শুধুমাত্র সংখ্যা (যেমন: ১০১ বা 101) লিখুন।');
      return;
    }
    if (!schoolName.trim()) {
      setErrorMessage('দয়া করে আপনার স্কুলের নাম লিখুন।');
      return;
    }
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    if (!whatsappNumber.trim()) {
      setErrorMessage('দয়া করে আপনার হোয়াটসঅ্যাপ নম্বর (WhatsApp Number) লিখুন।');
      return;
    }
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setErrorMessage('দয়া করে একটি সঠিক মোবাইল বা হোয়াটসঅ্যাপ নম্বর লিখুন (যেমন: 017xxxxxxxx)।');
      return;
    }
    if (!subjectId) {
      setErrorMessage('দয়া করে বিষয় নির্বাচন করুন।');
      return;
    }
    if (!chapterId) {
      setErrorMessage('দয়া করে অধ্যায় বা পাঠ নির্বাচন করুন।');
      return;
    }
    if (chapterId === 'other' && !customChapterName.trim()) {
      setErrorMessage('দয়া করে আপনার অধ্যায় বা নোটের নামটি লিখুন।');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('নোটের শিরোনাম লিখুন।');
      return;
    }
    if (selectedFiles.length === 0) {
      setErrorMessage('দয়া করে নোটের ফাইল (PDF বা এক বা একাধিক ছবি) যুক্ত করুন।');
      return;
    }

    setLoading(true);
    setProgress(5);
    setStatusText('নোট প্রস্তুত করা হচ্ছে...');

    try {
      let finalChapterId = chapterId;

      // If user selected "Other / অন্যান্য", register a clean custom chapter
      if (chapterId === 'other') {
        const newChapId = `custom-${subjectId}-${Date.now()}`;
        const customName = customChapterName.trim();
        try {
          await dataService.addChapter({
            chapterId: newChapId,
            subjectId,
            textbookName: 'বিশেষ নোট ও সাজেশন',
            chapterNumber: (chapters.length || 0) + 1,
            chapterName: customName,
            chapterType: 'chapter',
            description: 'শিক্ষার্থী কর্তৃক সরাসরি আপলোডকৃত কাস্টম অধ্যায় বা নোট',
            verificationStatus: 'unverified',
            createdAt: new Date().toISOString()
          });
          finalChapterId = newChapId;
        } catch {
          finalChapterId = newChapId;
        }
      }

      const formattedSection = sectionName.trim()
        ? `${group} (${sectionName.trim()})`
        : group;

      const isImages = selectedFiles.some(f =>
        f.type.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || '')
      );

      setStatusText(isImages && selectedFiles.length > 1
        ? `ছবিগুলো(${selectedFiles.length} পৃষ্ঠা) থেকে PDF তৈরি করা হচ্ছে...`
        : 'নোট ফাইল আপলোড হচ্ছে...'
      );

      await dataService.uploadNote(
        {
          studentName: studentName.trim(),
          rollNumber: rollNumber.trim() || 'প্রযোজ্য নয়',
          section: formattedSection,
          schoolName: schoolName.trim(),
          whatsappNumber: whatsappNumber.trim(),
          subjectId,
          chapterId: finalChapterId,
          title: title.trim(),
          description: description.trim() || 'শিক্ষার্থী কর্তৃক সরাসরি আপলোডকৃত ক্লাস ১০ হ্যান্ডনোট।',
          fileType: isImages ? 'pdf' : (selectedFiles[0].name.split('.').pop()?.toLowerCase() as FileType) || 'pdf',
          fileSize: fileSizeStr || '২.০ MB',
          pageCount: isImages ? selectedFiles.length : 1
        },
        selectedFiles.length === 1 && !isImages ? selectedFiles[0] : selectedFiles,
        (p) => {
          setProgress(p);
          if (p < 50 && isImages) {
            setStatusText(`পৃষ্ঠা অপটিমাইজেশন ও PDF তৈরি চলছে... (${p}%)`);
          } else {
            setStatusText(`ক্লাউডে আপলোড হচ্ছে... (${p}%)`);
          }
        }
      );

      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setErrorMessage('নোট আপলোডে ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setStudentName('');
    setRollNumber('');
    setWhatsappNumber('');
    setGroup('বিজ্ঞান');
    setSectionName('');
    setSchoolName('');
    setTitle('');
    setDescription('');
    setCustomChapterName('');
    setSelectedFiles([]);
    setImagePreviews([]);
    setFileSizeStr('');
    setProgress(0);
    setStatusText('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 pb-safe animate-fade-in"
      onClick={handleResetAndClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-cardBorder overflow-hidden my-auto max-h-[92vh] max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-cardBorder flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-primaryText">{t('upload_modal_title')}</h2>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-secondaryText hover:text-primaryText hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Success State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-primaryText">নোট সফলভাবে জমা দেওয়া হয়েছে</h3>
              <p className="text-sm text-secondaryText max-w-md mx-auto leading-relaxed">
                আপনার নোটটি সফলভাবে সংরক্ষিত হয়েছে। অনুমোদনের পর এটি ওয়েবসাইটে প্রকাশিত হবে।
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleResetAndClose}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-soft"
                >
                  ঠিক আছে
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Student Information */}
              <div className="bg-white p-4 rounded-xl border border-cardBorder space-y-3">
                <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                  শিক্ষার্থীর তথ্য
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-primaryText mb-1">
                      শিক্ষার্থীর পূর্ণ নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => {
                        // Prevent numbers from being entered in the name field
                        const onlyLetters = e.target.value.replace(/[0-9০-৯]/g, '');
                        setStudentName(onlyLetters);
                      }}
                      placeholder="যেমন: রাফসান আহমেদ"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white"
                    />
                    <span className="text-[11px] text-secondaryText mt-0.5 block">
                      নামে শুধু অক্ষর গ্রহণযোগ্য (কোনো সংখ্যা নয়)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1">
                      রোল নম্বর
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rollNumber}
                      onChange={(e) => {
                        // Prevent text/letters from being entered in roll number (only numbers allowed)
                        const onlyDigits = e.target.value.replace(/[^0-9০-৯]/g, '');
                        setRollNumber(onlyDigits);
                      }}
                      placeholder="যেমন: ১০১"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white font-mono"
                    />
                    <span className="text-[11px] text-secondaryText mt-0.5 block">
                      শুধুমাত্র সংখ্যা (কোনো টেক্সট নয়)
                    </span>
                  </div>
                </div>

                {/* WhatsApp Number Contact Field */}
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp Number) *</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      যোগাযোগের জন্য
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => {
                      const cleanDigits = e.target.value.replace(/[^0-9+]/g, '');
                      setWhatsappNumber(cleanDigits);
                    }}
                    placeholder="যেমন: 017xxxxxxxx বা +88017xxxxxxxx"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 bg-white font-mono font-medium"
                  />
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    💡 নোটে কোনো সমস্যা বা সংশোধনের প্রয়োজন হলে অ্যাডমিন আপনার সাথে হোয়াটসঅ্যাপে যোগাযোগ করবে।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1">
                      বিভাগ (Group) *
                    </label>
                    <select
                      required
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white font-medium"
                    >
                      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (Science)</option>
                      <option value="মানবিক">মানবিক বিভাগ (Humanities)</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ (Business Studies)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1">
                      শাখা (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      placeholder="যেমন: ক / খ / A"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1">
                      স্কুল / শিক্ষা প্রতিষ্ঠানের নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="যেমন: নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Subject & Chapter Selection */}
              <div className="bg-white p-4 rounded-xl border border-cardBorder space-y-3">
                <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                  বিষয় ও অধ্যায় নির্বাচন
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1">
                      বিষয় *
                    </label>
                    <select
                      required
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {subjects.map((sub) => (
                        <option key={sub.subjectId} value={sub.subjectId}>
                          {sub.name} ({sub.englishName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1">
                      অধ্যায় / কবিতা / গদ্য *
                    </label>
                    <select
                      required
                      value={chapterId}
                      onChange={(e) => setChapterId(e.target.value)}
                      disabled={!subjectId}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white disabled:bg-slate-100"
                    >
                      <option value="">
                        {subjectId ? 'অধ্যায় বা পাঠ নির্বাচন করুন' : 'আগে বিষয় নির্বাচন করুন'}
                      </option>
                      {chapters.map((chap) => (
                        <option key={chap.chapterId} value={chap.chapterId}>
                          {chap.chapterType === 'poem' ? 'পদ্য: ' : chap.chapterType === 'prose' ? 'গদ্য: ' : ''}
                          {chap.chapterName}
                        </option>
                      ))}
                      <option value="other" className="font-bold text-brand-700 bg-brand-50">
                        ✨ অন্যান্য (তালিকায় নেই / কাস্টম নোটের নাম)
                      </option>
                    </select>

                    {chapterId === 'other' && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 animate-fade-in space-y-1.5">
                        <label className="block text-xs font-bold text-amber-900">
                          অধ্যায় বা নোটের নাম লিখুন *
                        </label>
                        <input
                          type="text"
                          required
                          value={customChapterName}
                          onChange={(e) => setCustomChapterName(e.target.value)}
                          placeholder="যেমন: মডেল টেস্ট / ফাইনাল সাজেশন / বিশেষ শর্টকাট টেকনিক"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-amber-300 focus:outline-none focus:border-brand-600 bg-white"
                        />
                        <span className="text-[11px] text-amber-800 block">
                          তালিকায় না থাকলে এখানে যে নামটি লিখবেন সেটিই ওয়েবসাইটে এই বিষয়ের অধ্যায় হিসেবে দেখাবে।
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Note Details & File Upload */}
              <div className="bg-white p-4 rounded-xl border border-cardBorder space-y-3">
                <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                  নোটের তথ্য ও ফাইল
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-primaryText mb-1">
                    নোটের শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: গতির সকল গাণিতিক সূত্র ও শর্টকাট টেকনিক"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primaryText mb-1">
                    সংক্ষিপ্ত বিবরণ
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="নোটটিতে কী কী অন্তর্ভুক্ত রয়েছে সংক্ষেপে লিখুন..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-cardBorder focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                {/* File Upload Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-primaryText">
                      নোটের ফাইল যুক্ত করুন *
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      যেকোনো সাইজ • যতখুশি পৃষ্ঠা/ছবি
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                    className="hidden"
                  />

                  {/* Case 1: Image Gallery (Unlimited Multi-Page) */}
                  {imagePreviews.length > 0 ? (
                    <div className="border border-brand-200 rounded-2xl p-3.5 bg-brand-50/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700">
                          <ImageIcon className="w-4 h-4" />
                          <span>নির্বাচিত পৃষ্ঠা সমূহ ({imagePreviews.length} টি ছবি)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-2.5 py-1 rounded-lg shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>আরও ছবি যোগ করুন</span>
                        </button>
                      </div>

                      {/* Image Thumbnails Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1">
                        {imagePreviews.map((preview, idx) => (
                          <div key={preview.id} className="relative group rounded-xl overflow-hidden border border-cardBorder bg-white shadow-soft">
                            <img
                              src={preview.url}
                              alt={`পৃষ্ঠা ${idx + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              পৃঃ {idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-110 transition-all shadow"
                              title="এই ছবিটি বাদ দিন"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {/* Add More Tile */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-24 rounded-xl border-2 border-dashed border-brand-300 hover:border-brand-500 bg-white hover:bg-brand-50 flex flex-col items-center justify-center gap-1 text-brand-600 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-[11px] font-bold">+ আরও যোগ</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-brand-800 bg-white p-2.5 rounded-xl border border-brand-100 flex items-center justify-between">
                        <span>
                          ✨ <strong>অটোমেটিক PDF:</strong> সব ছবি ক্রমানুসারে একত্রিত ও কম্প্রেস হয়ে একটি চমৎকার A4 PDF বই তৈরি হবে।
                        </span>
                        <span className="font-bold shrink-0 ml-2">সাইজ: {fileSizeStr}</span>
                      </div>
                    </div>
                  ) : selectedFiles.length > 0 ? (
                    /* Case 2: Single PDF / Document */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-brand-300 hover:border-brand-500 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-brand-50/20 hover:bg-brand-50/40"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center shadow-soft">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm text-primaryText truncate max-w-sm">
                          {selectedFiles[0].name}
                        </span>
                        <span className="text-xs text-secondaryText">
                          সাইজ: {fileSizeStr} • পরিবর্তন করতে ক্লিক করুন
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Case 3: Empty Dropzone */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-brand-200 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-brand-50/20 hover:bg-brand-50/50 group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 group-hover:scale-110 flex items-center justify-center transition-transform shadow-soft">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-primaryText">
                          নোটের ফাইল বেছে নিন বা ছবিগুলো নির্বাচন করুন
                        </span>
                        <p className="text-xs text-secondaryText max-w-md">
                          যেকোনো সাইজের <strong>PDF</strong> অথবা খাতার পাতার <strong>যতখুশি ছবি (PNG / JPG / WEBP)</strong> একসাথে নির্বাচন করুন। ছবিগুলো স্বয়ংক্রিয়ভাবে সাজানো PDF তৈরি হয়ে যাবে।
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Progress Indicator */}
                {loading && (
                  <div className="space-y-1.5 pt-2 animate-fade-in">
                    <div className="flex justify-between text-xs text-secondaryText font-medium">
                      <span>{statusText || 'আপলোড হচ্ছে...'}</span>
                      <span className="font-bold text-brand-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-violetAccent h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="min-h-[44px] px-4 py-2.5 text-sm font-semibold text-secondaryText hover:text-primaryText active:scale-95 transition-all"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{loading ? t('btn_uploading') : t('btn_submit_note')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
