export type ChapterType = 'chapter' | 'prose' | 'poem' | 'grammar' | 'unit' | 'writing' | 'sahapath';
export type SubjectGroup = 'compulsory' | 'science' | 'humanities' | 'business' | 'optional';
export type VerificationStatus = 'verified_nctb' | 'provisional' | 'unverified';

export interface Subject {
  subjectId: string;
  name: string; // e.g. "পদার্থবিজ্ঞান"
  englishName: string; // e.g. "Physics"
  textbookName: string; // e.g. "পদার্থবিজ্ঞান (নবম-দশম শ্রেণি, NCTB)"
  group: SubjectGroup;
  subjectType: 'compulsory' | 'elective' | 'optional';
  curriculumYear: string;
  sourceURL: string;
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
  chapterName: string;
  author?: string;
  chapterType: ChapterType;
  description?: string;
  sourceURL?: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export type NoteStatus = 'pending' | 'approved' | 'rejected' | 'deleted';
export type FileType = 'pdf' | 'jpg' | 'jpeg' | 'png' | 'docx';
export type ResourceType =
  | 'note'
  | 'handwritten'
  | 'board_question'
  | 'cq'
  | 'mcq_sheet'
  | 'suggestion'
  | 'model_test'
  | 'textbook';

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
  viewCount?: number;
  reportCount?: number;
  pageCount?: number;
  resourceType?: ResourceType;
  boardName?: string; // e.g. "Dhaka", "Chattogram", "All Boards"
  boardYear?: string; // e.g. "2024", "2023"
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
  totalExams?: number;
  totalQuestions?: number;
  totalDiscussions?: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'owner';
  name: string;
  createdAt: string;
}

// ==========================================
// ONLINE EXAMINATION SYSTEM TYPES
// ==========================================
export type ExamType = 'chapter' | 'subject' | 'model_test';

export interface Question {
  questionId: string;
  id?: string;
  examId: string;
  subjectId: string;
  chapterId?: string;
  questionText: string;
  question?: string;
  options: string[] | [string, string, string, string]; // options: A, B, C, D
  correctOption: number; // 0, 1, 2, 3
  correctAnswer?: number;
  explanation: string;
  marks: number;
  image?: string;
}

export interface Exam {
  examId: string;
  id?: string;
  subjectId: string;
  subject?: string;
  chapterId?: string;
  chapter?: string;
  title: string;
  description: string;
  examType: ExamType;
  type?: ExamType;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  negativeMark: number; // e.g. 0.25
  negativeMarking?: number;
  questionCount: number;
  totalQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isPublished: boolean;
  createdAt: string;
  questions?: Question[];
}

export interface ExamAttempt {
  attemptId: string;
  id?: string;
  examId: string;
  examTitle: string;
  subjectId: string;
  studentName: string;
  studentRoll?: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  correctAnswers?: number;
  incorrectCount: number;
  incorrectAnswers?: number;
  unansweredCount: number;
  unanswered?: number;
  percentage: number;
  isPassed: boolean;
  passed?: boolean;
  timeTakenSeconds: number;
  timeSpentSeconds?: number;
  totalQuestions?: number;
  answers: Record<string, number>; // questionId -> selectedOption index
  completedAt: string;
}

// ==========================================
// STUDENT DASHBOARD & GAMIFICATION TYPES
// ==========================================
export interface StudentStats {
  studentName: string;
  totalExamsTaken: number;
  averageScore: number;
  bestScore: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  studyStreakDays: number;
  lastStudyDate: string;
  points: number;
  badges: string[]; // badge IDs
  recentAttempts: ExamAttempt[];
}

export interface AchievementBadge {
  id: string;
  title?: string;
  name?: string;
  titleBn?: string;
  description: string;
  iconName?: string;
  icon?: string;
  requiredPoints?: number;
  isUnlocked?: boolean;
  unlockedAt?: string;
}

// ==========================================
// COMMUNITY & DISCUSSION TYPES
// ==========================================
export interface CommunityComment {
  commentId: string;
  id?: string;
  postId: string;
  authorName: string;
  authorRole?: string;
  content: string;
  isAcceptedAnswer?: boolean;
  upvotes: number;
  createdAt: string;
}

export interface CommunityPost {
  postId?: string;
  id?: string;
  subjectId?: string;
  subject?: string;
  chapterId?: string;
  chapter?: string;
  authorName: string;
  authorRole?: string;
  authorSchool?: string;
  title: string;
  content: string;
  tags?: string[];
  upvotes: number;
  commentCount?: number;
  commentsCount?: number;
  comments?: CommunityComment[];
  status: 'active' | 'flagged' | 'resolved' | 'approved';
  createdAt: string;
}

// ==========================================
// STUDY PLANNER & COUNTDOWN TYPES
// ==========================================
export interface StudyTask {
  taskId?: string;
  id?: string;
  title: string;
  subjectId?: string;
  subject?: string;
  targetDate?: string;
  dueDate?: string;
  isCompleted?: boolean;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  createdAt?: string;
}

// ==========================================
// NOTIFICATIONS TYPES
// ==========================================
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'exam' | 'note' | 'achievement' | 'alert' | 'resource' | 'community';
  link?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

// ==========================================
// AI STUDY ASSISTANT TYPES
// ==========================================
export interface ChatMessage {
  id: string;
  role?: 'user' | 'assistant' | 'system';
  sender?: 'user' | 'bot' | 'system';
  content?: string;
  text?: string;
  timestamp: string;
  topic?: string;
}
