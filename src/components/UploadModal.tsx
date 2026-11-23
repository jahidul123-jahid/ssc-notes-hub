import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Plus, Image as ImageIcon, BookOpen } from 'lucide-react';
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
  const [group, setGroup] = useState('বিজ্ঞান');
  const [subjectId, setSubjectId] = useState(initialSubjectId || '');
  const [chapterId, setChapterId] = useState(initialChapterId || '');
  const [customChapterName, setCustomChapterName] = useState('');

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

  const selectedChapter = chapters.find(c => c.chapterId === chapterId);
  const derivedTitle = chapterId === 'other'
    ? (customChapterName.trim() || 'বিশেষ নোট')
    : (selectedChapter ? selectedChapter.chapterName : '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    // Check if user selected PDF or DOCX
    const pdfFile = incoming.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const docxFile = incoming.find(f => f.name.toLowerCase().endsWith('.docx'));

    if (pdfFile) {
      if (pdfFile.size > 50 * 1024 * 1024) {
        setErrorMessage('ফাইলের সাইজ ৫০ MB এর বেশি। ৫০ MB এর কম সাইজের PDF ফাইল নির্বাচন করুন।');
        return;
      }
      setSelectedFiles([pdfFile]);
      setImagePreviews([]);
      const mb = (pdfFile.size / (1024 * 1024)).toFixed(1);
      setFileSizeStr(`${mb} MB`);
      return;
    }

    if (docxFile) {
      if (docxFile.size > 50 * 1024 * 1024) {
        setErrorMessage('ফাইলের সাইজ ৫০ MB এর বেশি। ৫০ MB এর কম সাইজের ফাইল নির্বাচন করুন।');
        return;
      }
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
    if (loading) return;
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

    const autoTitle = chapterId === 'other'
      ? customChapterName.trim()
      : (selectedChapter ? selectedChapter.chapterName : 'ক্লাস ১০ হ্যান্ডনোট');

    if (!autoTitle) {
      setErrorMessage('দয়া করে অধ্যায় নির্বাচন করুন।');
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorMessage('দয়া করে নোটের ফাইল (PDF বা এক বা একাধিক ছবি) যুক্ত করুন।');
      return;
    }

    // Check individual or total file sizes
    const isSingleDoc = selectedFiles.length === 1 && (selectedFiles[0].type === 'application/pdf' || selectedFiles[0].name.toLowerCase().endsWith('.pdf') || selectedFiles[0].name.toLowerCase().endsWith('.docx'));
    if (isSingleDoc && selectedFiles[0].size > 50 * 1024 * 1024) {
      setErrorMessage(`ফাইলের সাইজ ${(selectedFiles[0].size / (1024 * 1024)).toFixed(1)} MB। সর্বোচ্চ ৫০ MB অনুমোদিত।`);
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

      const isImages = selectedFiles.some(f =>
        f.type.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || '')
      );

      setStatusText(isImages && selectedFiles.length > 1
        ? `ছবিগুলো (${selectedFiles.length} পৃষ্ঠা) অপটিমাইজ করে PDF তৈরি করা হচ্ছে...`
        : 'নোট ফাইল আপলোড হচ্ছে...'
      );

      await dataService.uploadNote(
        {
          studentName: studentName.trim(),
          rollNumber: '',
          section: `${group} বিভাগ`,
          schoolName: '',
          whatsappNumber: '',
          subjectId,
          chapterId: finalChapterId,
          title: autoTitle,
          description: '',
          fileType: isImages ? 'pdf' : (selectedFiles[0].name.split('.').pop()?.toLowerCase() as FileType) || 'pdf',
          fileSize: fileSizeStr || '২.০ MB',
          pageCount: isImages ? selectedFiles.length : 1
        },
        selectedFiles.length === 1 && !isImages ? selectedFiles[0] : selectedFiles,
        (p) => {
          setProgress(p);
          if (p < 40 && isImages) {
            setStatusText(`পৃষ্ঠা অপটিমাইজেশন ও PDF তৈরি চলছে... (${p}%)`);
          } else {
            setStatusText(`ক্লাউড সার্ভারে নিরাপদে আপলোড হচ্ছে... (${p}%)`);
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
      console.error("Upload error caught:", err);
      let message = 'নোট আপলোডে ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।';
      if (err?.message) {
        if (err.message.includes('৫০ MB') || err.message.includes('50MB') || err.message.includes('৫০MB') || err.message.includes('৫০')) {
          message = err.message;
        } else if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('connection') || err.message.includes('সংযোগ')) {
          message = 'ইন্টারনেট সংযোগে সমস্যা দেখা দিয়েছে। ইন্টারনেট সংযোগ নিশ্চিত করে পুনরায় চেষ্টা করুন।';
        } else {
          message = err.message;
        }
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setStudentName('');
    setGroup('বিজ্ঞান');
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
        <div className="p-4 sm:p-5 border-b border-cardBorder flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-primaryText">
                {isBn ? 'নোট আপলোড করুন' : 'Upload Note'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 flex items-center justify-center text-secondaryText hover:text-primaryText hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
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
                আপনার নোটটি সফলভাবে সংরক্ষিত হয়েছে। পর্যালোচনার পর এটি ওয়েবসাইটে প্রকাশিত হবে।
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Content */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cardBorder space-y-3.5 shadow-2xs">
                {/* 1. Name & Group (বিভাগ) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1.5">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="যেমন: রাফসান আহমেদ"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-slate-50/50 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1.5">
                      বিভাগ *
                    </label>
                    <select
                      required
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-slate-50/50 focus:bg-white transition-colors font-medium"
                    >
                      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
                      <option value="মানবিক">মানবিক বিভাগ</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-cardBorder/60" />

                {/* 2. Subject & Chapter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primaryText mb-1.5">
                      বিষয় *
                    </label>
                    <select
                      required
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-slate-50/50 focus:bg-white transition-colors font-medium"
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
                    <label className="block text-xs font-semibold text-primaryText mb-1.5">
                      অধ্যায় বা পাঠ *
                    </label>
                    <select
                      required
                      value={chapterId}
                      onChange={(e) => setChapterId(e.target.value)}
                      disabled={!subjectId}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 bg-slate-50/50 focus:bg-white transition-colors font-medium disabled:opacity-50"
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
                        ✨ অন্যান্য (তালিকায় নেই)
                      </option>
                    </select>

                    {chapterId === 'other' && (
                      <div className="mt-2 animate-fade-in">
                        <input
                          type="text"
                          required
                          value={customChapterName}
                          onChange={(e) => setCustomChapterName(e.target.value)}
                          placeholder="অধ্যায় বা নোটের নাম লিখুন"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-brand-300 focus:outline-none focus:border-brand-500 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Auto-derived Note Title Display */}
                <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-brand-700 block">
                      নোটের শিরোনাম (অধ্যায়ের নাম অনুযায়ী স্বয়ংক্রিয়ভাবে নির্ধারিত হবে):
                    </span>
                    <span className="text-sm font-bold text-primaryText block truncate mt-0.5">
                      {derivedTitle || (subjectId ? 'অধ্যায় নির্বাচন করুন' : 'বিষয় ও অধ্যায় নির্বাচন করুন')}
                    </span>
                  </div>
                </div>

                {/* 4. File Upload Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-primaryText mb-1.5">
                    নোটের ফাইল যুক্ত করুন *
                  </label>

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
                          ছবিগুলো ক্রমানুসারে একটি পরিষ্কার PDF ফাইলে রূপান্তর হবে।
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
                      className="border-2 border-dashed border-cardBorder hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-brand-50/30 group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 group-hover:scale-105 flex items-center justify-center transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-primaryText">
                          নোটের ফাইল বা ছবি নির্বাচন করুন
                        </span>
                        <p className="text-xs text-secondaryText">
                          PDF ফাইল অথবা খাতার একাধিক পাতার ছবি (JPG, PNG)
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
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-sm font-semibold text-secondaryText hover:text-primaryText active:scale-95 transition-all text-center touch-manipulation"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-violetAccent hover:from-brand-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50 active:scale-95 touch-manipulation"
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
