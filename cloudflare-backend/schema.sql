-- ==========================================================
-- SSC Note Box — Cloudflare D1 Database Schema
-- Complete SSC Learning Platform Extended Schema
-- ==========================================================

-- 1. Notes & Study Resources Table
CREATE TABLE IF NOT EXISTS notes (
  note_id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  student_name TEXT NOT NULL,
  roll_number TEXT DEFAULT '',
  section TEXT DEFAULT '',
  school_name TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT DEFAULT '',
  page_count INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  resource_type TEXT DEFAULT 'note', -- 'note', 'board_question', 'cq', 'mcq_sheet', 'suggestion', 'textbook'
  board_name TEXT DEFAULT '',
  board_year TEXT DEFAULT '',
  status TEXT DEFAULT 'approved',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes (subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_chapter ON notes (chapter_id);
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes (status);
CREATE INDEX IF NOT EXISTS idx_notes_resource_type ON notes (resource_type);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes (created_at DESC);

-- 2. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  report_id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  note_title TEXT DEFAULT '',
  reason TEXT NOT NULL,
  reason_text TEXT DEFAULT '',
  details TEXT DEFAULT '',
  reported_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- 3. Exams Table
CREATE TABLE IF NOT EXISTS exams (
  exam_id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  chapter_id TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  exam_type TEXT DEFAULT 'chapter', -- 'chapter', 'subject', 'model_test'
  duration_minutes INTEGER DEFAULT 15,
  total_marks INTEGER DEFAULT 20,
  pass_marks INTEGER DEFAULT 8,
  negative_mark REAL DEFAULT 0.25,
  question_count INTEGER DEFAULT 20,
  is_published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams (subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_type ON exams (exam_type);

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  question_id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  chapter_id TEXT DEFAULT '',
  question_text TEXT NOT NULL,
  options_json TEXT NOT NULL, -- JSON array of 4 strings: ["A", "B", "C", "D"]
  correct_option INTEGER NOT NULL, -- 0, 1, 2, or 3
  explanation TEXT DEFAULT '',
  marks INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions (exam_id);

-- 5. Exam Attempts Table (with server verification)
CREATE TABLE IF NOT EXISTS exam_attempts (
  attempt_id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_roll TEXT DEFAULT '',
  score REAL NOT NULL,
  total_marks INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL,
  unanswered_count INTEGER NOT NULL,
  percentage REAL NOT NULL,
  is_passed INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  answers_json TEXT NOT NULL, -- JSON object of questionId -> selectedOption
  completed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attempts_exam ON exam_attempts (exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON exam_attempts (student_name);
CREATE INDEX IF NOT EXISTS idx_attempts_completed ON exam_attempts (completed_at DESC);

-- 6. Community Discussion Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  post_id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  chapter_id TEXT DEFAULT '',
  author_name TEXT NOT NULL,
  author_school TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags_json TEXT DEFAULT '[]', -- JSON array of strings
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'flagged', 'resolved'
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_subject ON community_posts (subject_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts (created_at DESC);

-- 7. Community Comments Table
CREATE TABLE IF NOT EXISTS community_comments (
  comment_id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'student',
  content TEXT NOT NULL,
  is_accepted_answer INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments (post_id);

-- 8. Admin Users & Sessions Table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT 'Jahidul Islam',
  role TEXT DEFAULT 'owner',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);
