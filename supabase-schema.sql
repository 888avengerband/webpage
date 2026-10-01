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
