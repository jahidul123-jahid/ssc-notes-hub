-- ==========================================================
-- SSC Note Box — Cloudflare D1 Database Schema
-- Replaces Supabase PostgreSQL 'notes' table
-- ==========================================================

-- 1. Notes Table
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
  status TEXT DEFAULT 'approved',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes (subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_chapter ON notes (chapter_id);
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes (status);
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

-- 3. Admin Users Table (For Better Auth / Admin Protection)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT 'Jahidul Islam',
  role TEXT DEFAULT 'owner',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);
