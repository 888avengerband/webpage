-- 888 Avenger Band: non-destructive migration for shared sheet music storage.
-- Run this once in Supabase Dashboard -> SQL Editor.
-- This does NOT drop or recreate any existing tables or music records.

-- Ensure the existing bucket can store PDFs, images, and the small combined-viewer HTML files.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sheet-music',
  'sheet-music',
  true,
  52428800,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/html']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Replace the bucket policies with explicit authenticated-read / admin-write rules.
DROP POLICY IF EXISTS "Authenticated can view sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update and delete sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Band members can view sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Band admins can upload sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Band admins can update sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Band admins can delete sheet music files" ON storage.objects;

CREATE POLICY "Band members can view sheet music files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'sheet-music');

CREATE POLICY "Band admins can upload sheet music files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sheet-music' AND public.is_admin());

CREATE POLICY "Band admins can update sheet music files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'sheet-music' AND public.is_admin())
WITH CHECK (bucket_id = 'sheet-music' AND public.is_admin());

CREATE POLICY "Band admins can delete sheet music files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'sheet-music' AND public.is_admin());

-- Indexes used by the shared catalogue and member music locker.
CREATE INDEX IF NOT EXISTS idx_sheet_music_title ON public.sheet_music(title);
CREATE INDEX IF NOT EXISTS idx_song_parts_song_id ON public.song_parts(song_id);
CREATE INDEX IF NOT EXISTS idx_part_assignments_profile ON public.part_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_part_assignments_part ON public.part_assignments(song_part_id);
