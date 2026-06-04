
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS order_no TEXT,
  ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS hours_per_week INTEGER;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS description TEXT;

DROP POLICY IF EXISTS "Director manage school subjects" ON public.subjects;
CREATE POLICY "Director manage school subjects" ON public.subjects
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'zavuch'::app_role)) AND (school_id IS NULL OR school_id = get_my_school_id()))
  WITH CHECK ((has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'zavuch'::app_role)) AND (school_id IS NULL OR school_id = get_my_school_id()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
