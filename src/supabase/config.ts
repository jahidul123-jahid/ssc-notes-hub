import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage key for dynamic dashboard configuration
export const SUPABASE_STORAGE_KEYS = {
  URL: 'ssc_hub_supabase_url',
  ANON_KEY: 'ssc_hub_supabase_anon_key'
};

// Default project credentials (configured for live SSC Note Box)
const DEFAULT_SUPABASE_URL = 'https://dwgbjgetvzbplmqesnzd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_KBJuwv05q761VfOhjWHj8w_DOq2b-nb';

// Retrieve configuration from Vite environment variables, localStorage, or defaults
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY) || '' : '';

  const url = localUrl.trim() || envUrl.trim() || DEFAULT_SUPABASE_URL;
  const anonKey = localKey.trim() || envKey.trim() || DEFAULT_SUPABASE_ANON_KEY;

  return { url, anonKey };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || url === 'your_supabase_url_here') {
    return null;
  }

  // Reuse existing instance if credentials haven't changed
  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error("Supabase client initialization error:", err);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseClient() !== null;
};

// Export direct client helper
export const supabase = getSupabaseClient();

// Ready-to-use SQL Schema for 1-click database setup in Supabase SQL Editor
export const SUPABASE_SQL_SETUP = `-- ==========================================================
-- SSC NOTE BOX — SUPABASE DATABASE & STORAGE SCHEMA
-- Run this script in your Supabase SQL Editor
-- ==========================================================

-- 1. Create public notes table
CREATE TABLE IF NOT EXISTS public.notes (
  note_id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  student_name TEXT NOT NULL,
  roll_number TEXT DEFAULT '',
  section TEXT DEFAULT '',
  school_name TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT DEFAULT '',
  page_count INT DEFAULT 1,
  download_count INT DEFAULT 0,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Grant permissions to public roles
GRANT ALL ON TABLE public.notes TO anon, authenticated, service_role;

-- 3. Allow everyone to view approved notes
DROP POLICY IF EXISTS "Public read approved notes" ON public.notes;
CREATE POLICY "Public read approved notes" ON public.notes
  FOR SELECT USING (true);

-- 4. Allow any student to upload notes
DROP POLICY IF EXISTS "Public insert notes" ON public.notes;
CREATE POLICY "Public insert notes" ON public.notes
  FOR INSERT WITH CHECK (true);

-- 5. Allow updating download counts and note statuses
DROP POLICY IF EXISTS "Public update notes" ON public.notes;
CREATE POLICY "Public update notes" ON public.notes
  FOR UPDATE USING (true);

-- 6. Allow deleting notes
DROP POLICY IF EXISTS "Public delete notes" ON public.notes;
CREATE POLICY "Public delete notes" ON public.notes
  FOR DELETE USING (true);

-- 7. Create Public Storage Bucket 'notes'
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Storage Policies: Allow public file downloads and uploads
DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects
  FOR SELECT USING (bucket_id = 'notes');

DROP POLICY IF EXISTS "Public storage upload" ON storage.objects;
CREATE POLICY "Public storage upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'notes');
`;
