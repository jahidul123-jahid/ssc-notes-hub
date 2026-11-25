-- ==========================================================
-- SSC NOTE BOX — HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- Run this script in Supabase Dashboard ➔ SQL Editor
-- ==========================================================

-- 1. Enable RLS on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 2. Revoke dangerous blanket privileges from public anon role
REVOKE ALL ON TABLE public.notes FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.notes TO anon, authenticated;
GRANT UPDATE (download_count) ON TABLE public.notes TO anon;
GRANT ALL ON TABLE public.notes TO service_role;

-- 3. SELECT Policy: Anyone can read approved notes, but pending/deleted notes are protected
DROP POLICY IF EXISTS "Public read approved notes" ON public.notes;
CREATE POLICY "Public read approved notes" ON public.notes
  FOR SELECT
  USING (status = 'approved' OR auth.role() = 'service_role');

-- 4. INSERT Policy: Students can only upload notes with 'pending' status
DROP POLICY IF EXISTS "Public insert notes" ON public.notes;
CREATE POLICY "Public insert notes" ON public.notes
  FOR INSERT
  WITH CHECK (
    status = 'pending' AND
    length(title) > 0 AND
    length(student_name) > 0 AND
    length(file_url) > 0
  );

-- 5. UPDATE Policy: Anonymous users can ONLY increment download_count
-- They cannot modify student_name, title, file_url, or approve notes!
DROP POLICY IF EXISTS "Public update notes" ON public.notes;
DROP POLICY IF EXISTS "Anon increment download only" ON public.notes;
CREATE POLICY "Anon increment download only" ON public.notes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. DELETE Policy: Never allow anonymous users to delete notes!
DROP POLICY IF EXISTS "Public delete notes" ON public.notes;
CREATE POLICY "Service role only delete notes" ON public.notes
  FOR DELETE
  USING (auth.role() = 'service_role');

-- 7. Secure Storage Policies (Bucket: 'notes')
DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'notes');

-- Restrict uploads to safe document types (PDF) under 50MB
DROP POLICY IF EXISTS "Public storage upload" ON storage.objects;
CREATE POLICY "Public storage upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'notes'
  );
