-- ==============================================================================
-- 888 AVENGER ROYAL CANADIAN AIR CADET SQUADRON (RCACS) BAND
-- SUPABASE DATABASE INITIALIZATION & ROW LEVEL SECURITY (RLS) SCRIPT
-- ==============================================================================
-- Dual Role: Admin (Band Officers & Band Seniors) vs Member (Cadet Musicians)
-- Run this directly in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up any existing tables if re-running
DROP TABLE IF EXISTS public.excused_absences CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.part_assignments CASCADE;
DROP TABLE IF EXISTS public.song_parts CASCADE;
DROP TABLE IF EXISTS public.sheet_music CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create Tables
-- 2.1 Profiles (linked 1:1 with auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    rank TEXT NOT NULL DEFAULT 'Cdt' CHECK (rank IN ('Cdt', 'LAC', 'Cpl', 'FCpl', 'Sgt', 'FSgt', 'WO2', 'WO1', 'CV', 'CI', 'Officer')),
    cadet365_email TEXT UNIQUE NOT NULL,
    instrument TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 Sheet Music (master songs)
CREATE TABLE public.sheet_music (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    composer TEXT NOT NULL DEFAULT 'Traditional / Arranged',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Song Parts (instrument-specific PDF parts linked to a song)
CREATE TABLE public.song_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID NOT NULL REFERENCES public.sheet_music(id) ON DELETE CASCADE,
    instrument_part TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 Part Assignments (maps song_parts to individual cadet profiles; many-to-many)
CREATE TABLE public.part_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_part_id UUID NOT NULL REFERENCES public.song_parts(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_part_cadet UNIQUE (song_part_id, profile_id)
);

-- 2.5 Attendance (rehearsals & parade attendance log)
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Late', 'Absent', 'Absent Excused - AE')),
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_attendance_cadet_date UNIQUE (profile_id, date)
);

-- 2.6 Excused Absences (cadet submitted absence requests)
CREATE TABLE public.excused_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_absence DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast queries
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_cadet365 ON public.profiles(cadet365_email);
CREATE INDEX idx_song_parts_song_id ON public.song_parts(song_id);
CREATE INDEX idx_part_assignments_profile ON public.part_assignments(profile_id);
CREATE INDEX idx_part_assignments_part ON public.part_assignments(song_part_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_profile ON public.attendance(profile_id);
CREATE INDEX idx_excused_absences_profile ON public.excused_absences(profile_id);
CREATE INDEX idx_excused_absences_date ON public.excused_absences(date_of_absence);

-- 4. Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 5. Trigger on auth.users to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    rank,
    cadet365_email,
    instrument,
    role,
    phone
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Cadet'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Musician'),
    COALESCE(NEW.raw_user_meta_data->>'rank', 'Cdt'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'instrument', 'Clarinet 1'),
    'member',
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excused_absences ENABLE ROW LEVEL SECURITY;

-- 6.1 Profiles Policies
CREATE POLICY "Admins full access to all profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Members can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 6.2 Sheet Music Policies
CREATE POLICY "Admins full access to sheet_music"
ON public.sheet_music FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members can view assigned sheet music"
ON public.sheet_music FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.song_parts sp
    JOIN public.part_assignments pa ON pa.song_part_id = sp.id
    WHERE sp.song_id = sheet_music.id AND pa.profile_id = auth.uid()
  )
);

-- 6.3 Song Parts Policies
CREATE POLICY "Admins full access to song_parts"
ON public.song_parts FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members can view assigned song parts"
ON public.song_parts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.part_assignments pa
    WHERE pa.song_part_id = song_parts.id AND pa.profile_id = auth.uid()
  )
);

-- 6.4 Part Assignments Policies
CREATE POLICY "Admins full access to part_assignments"
ON public.part_assignments FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members can view own part_assignments"
ON public.part_assignments FOR SELECT TO authenticated
USING (profile_id = auth.uid());

-- 6.5 Attendance Policies
CREATE POLICY "Admins full access to attendance"
ON public.attendance FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members can view own attendance records"
ON public.attendance FOR SELECT TO authenticated
USING (profile_id = auth.uid());

-- 6.6 Excused Absences Policies
CREATE POLICY "Admins full access to excused_absences"
ON public.excused_absences FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members can view own excused absences"
ON public.excused_absences FOR SELECT TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Members can submit excused absence"
ON public.excused_absences FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

-- 7. Supabase Storage Bucket ('sheet-music')
DROP POLICY IF EXISTS "Authenticated can view sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload sheet music files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update and delete sheet music files" ON storage.objects;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('sheet-music', 'sheet-music', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Authenticated can view sheet music files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'sheet-music');

CREATE POLICY "Admins can upload sheet music files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sheet-music' AND public.is_admin());

CREATE POLICY "Admins can update and delete sheet music files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'sheet-music' AND public.is_admin())
WITH CHECK (bucket_id = 'sheet-music' AND public.is_admin());
