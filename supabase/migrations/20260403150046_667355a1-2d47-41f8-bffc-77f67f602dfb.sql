
-- Fix 1: Applications table - restrict the INSERT policy to anon role only
-- and ensure no broad SELECT is possible
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;
CREATE POLICY "Anyone can submit applications" ON public.applications
FOR INSERT TO anon
WITH CHECK (email IS NOT NULL AND school_name IS NOT NULL);

-- Fix 2: Storage - replace broad policies with school-scoped ones
-- Files are stored as: {school_id}/filename, so we check the path prefix

-- Drop existing broad policies
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete files" ON storage.objects;

-- SELECT: authenticated users can view files in their school's folder
CREATE POLICY "Users can view own school files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id IN ('documents', 'materials', 'signatures')
  AND (storage.foldername(name))[1] = get_my_school_id()::text
);

-- INSERT: authenticated users can upload to their school's folder
CREATE POLICY "Users can upload to own school" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('documents', 'materials', 'signatures')
  AND (storage.foldername(name))[1] = get_my_school_id()::text
);

-- DELETE: only directors/zavuch can delete files in their school
CREATE POLICY "Managers can delete school files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('documents', 'materials', 'signatures')
  AND (storage.foldername(name))[1] = get_my_school_id()::text
  AND (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'zavuch'::app_role))
);
