
-- Fix the view policy to require authentication
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
CREATE POLICY "Authenticated users can view files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id IN ('documents', 'materials', 'signatures'));
