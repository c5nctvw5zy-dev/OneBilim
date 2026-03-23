
-- Fix permissive INSERT policy on applications - require email to be provided
DROP POLICY "Anyone can submit applications" ON public.applications;
CREATE POLICY "Anyone can submit applications" ON public.applications FOR INSERT WITH CHECK (email IS NOT NULL AND school_name IS NOT NULL);
