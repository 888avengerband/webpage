export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
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
    rank TEXT NOT NULL DEFAULT 'Cdt' CHECK (rank IN ('Cdt', 'LAC', 'Cpl', 'FCpl', 'Sgt', 'FSgt', 'WO2', 'WO1', 'CV', 'CI', 'OCdt', '2Lt', 'Lt', 'Capt', 'Maj')),
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
`;
