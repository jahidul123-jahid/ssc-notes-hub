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
-- SSC NOTE BOX — COMPLETE SUPABASE REPAIR & UNLOCK SCRIPT
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ==========================================================

-- 1. Create public notes table if not exists
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
  whatsapp_number TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT DEFAULT '',
  page_count INT DEFAULT 1,
  download_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure all columns exist on notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS roll_number TEXT DEFAULT '';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS section TEXT DEFAULT '';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS school_name TEXT DEFAULT '';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS file_size TEXT DEFAULT '';
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS page_count INT DEFAULT 1;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS download_count INT DEFAULT 0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 3. Grant schema and table permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notes TO anon, authenticated, service_role;

-- 4. Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 5. Drop any old or restrictive policies
DROP POLICY IF EXISTS "Public read approved notes" ON public.notes;
DROP POLICY IF EXISTS "Public insert notes" ON public.notes;
DROP POLICY IF EXISTS "Public update notes" ON public.notes;
DROP POLICY IF EXISTS "Public delete notes" ON public.notes;
DROP POLICY IF EXISTS "Anon increment download only" ON public.notes;
DROP POLICY IF EXISTS "Service role only delete notes" ON public.notes;
DROP POLICY IF EXISTS "Allow anon upload notes" ON public.notes;
DROP POLICY IF EXISTS "Allow all select" ON public.notes;
DROP POLICY IF EXISTS "Allow all insert" ON public.notes;
DROP POLICY IF EXISTS "Allow all update" ON public.notes;
DROP POLICY IF EXISTS "Allow all delete" ON public.notes;

-- 6. Policy: Everyone can read notes (approved notes on website, pending notes in Admin panel)
CREATE POLICY "Allow all select" ON public.notes
  FOR SELECT
  USING (true);

-- 7. Policy: Students & visitors can upload notes
CREATE POLICY "Allow all insert" ON public.notes
  FOR INSERT
  WITH CHECK (true);

-- 8. Policy: Allow note approval and download count increments
CREATE POLICY "Allow all update" ON public.notes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 9. Policy: Allow Admin to delete / reject notes
CREATE POLICY "Allow all delete" ON public.notes
  FOR DELETE
  USING (true);

-- 10. Public Storage Bucket 'notes' & Storage Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

GRANT ALL ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON TABLE storage.objects TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'notes');

DROP POLICY IF EXISTS "Public storage upload" ON storage.objects;
CREATE POLICY "Public storage upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'notes');

DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
CREATE POLICY "Public storage update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'notes');

DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;
CREATE POLICY "Public storage delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'notes');
`;
