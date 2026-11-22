export type ChapterType = 'chapter' | 'prose' | 'poem' | 'grammar' | 'unit' | 'writing';
export type SubjectGroup = 'compulsory' | 'science' | 'humanities' | 'business' | 'optional';
export type VerificationStatus = 'verified_nctb' | 'provisional' | 'unverified';

export interface Subject {
  subjectId: string;
  name: string; // e.g. "পদার্থবিজ্ঞান"
  englishName: string; // e.g. "Physics"
  textbookName: string; // e.g. "পদার্থবিজ্ঞান (নবম-দশম শ্রেণি, NCTB)"
  group: SubjectGroup; // 'compulsory' | 'science' | 'humanities' | 'business' | 'optional'
  subjectType: 'compulsory' | 'elective' | 'optional';
  curriculumYear: string; // e.g. "পরিমার্জিত জাতীয় শিক্ষাক্রম ২০১২ (SSC 2027 প্রযোজ্য)"
  sourceURL: string; // e.g. "https://nctb.gov.bd/pages/static-pages/695b99afc4774958d7b70612"
  verificationStatus: VerificationStatus;
  bannerGradient: string;
  accentColor: string;
  description: string;
  createdAt: string;
  badgeText?: string;
}

export interface Chapter {
  chapterId: string;
  subjectId: string;
  textbookName?: string;
  chapterNumber: number;
  chapterName: string; // e.g. "২য় অধ্যায়: গতি" or "কপোতাক্ষ নদ"
  author?: string; // For poems/prose (e.g. "মাইকেল মধুসূদন দত্ত")
  chapterType: ChapterType;
  description?: string;
  sourceURL?: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export type NoteStatus = 'pending' | 'approved' | 'rejected';
export type FileType = 'pdf' | 'jpg' | 'jpeg' | 'png' | 'docx';

export interface Note {
  noteId: string;
  studentName: string;
  rollNumber: string;
  section: string;
  schoolName: string;
  whatsappNumber?: string;
  subjectId: string;
  chapterId: string;
  title: string;
  description: string;
  fileURL: string;
  fileType: FileType;
  fileSize: string;
  createdAt: string;
  status: NoteStatus;
  downloadCount: number;
  reportCount?: number;
  pageCount?: number;
}

export interface Report {
  reportId: string;
  noteId: string;
  noteTitle: string;
  reason: 'wrong_notes' | 'inappropriate' | 'copyright' | 'other';
  reasonText: string;
  details?: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface WebsiteStats {
  totalSubjects: number;
  totalNotes: number;
  totalContributors: number;
  totalDownloads: number;
  pendingNotesCount: number;
  reportsCount: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'owner';
  name: string;
  createdAt: string;
}
