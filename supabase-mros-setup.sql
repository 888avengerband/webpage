-- Monthly Routine Orders (MROs)
-- Run this once in the Supabase SQL Editor for the band portal.

CREATE TABLE IF NOT EXISTS public.monthly_routine_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  document_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_monthly_routine_orders_created_at
  ON public.monthly_routine_orders(created_at DESC);

ALTER TABLE public.monthly_routine_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view MROs" ON public.monthly_routine_orders;
CREATE POLICY "Authenticated users can view MROs"
ON public.monthly_routine_orders
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage MRO records" ON public.monthly_routine_orders;
CREATE POLICY "Admins can manage MRO records"
ON public.monthly_routine_orders
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Private bucket: documents are only delivered through short-lived signed URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mros', 'mros', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf'];

DROP POLICY IF EXISTS "Authenticated users can view MRO PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can view MRO PDFs"
ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'mros');

DROP POLICY IF EXISTS "Admins can upload MRO PDFs" ON storage.objects;
CREATE POLICY "Admins can upload MRO PDFs"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mros' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update MRO PDFs" ON storage.objects;
CREATE POLICY "Admins can update MRO PDFs"
ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'mros' AND public.is_admin())
WITH CHECK (bucket_id = 'mros' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete MRO PDFs" ON storage.objects;
CREATE POLICY "Admins can delete MRO PDFs"
ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'mros' AND public.is_admin());
