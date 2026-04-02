
-- Create a security definer function to get current user's school_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Directors can view school profiles" ON public.profiles;

-- Recreate without self-referencing subquery
CREATE POLICY "Directors can view school profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'director'::app_role)
  AND school_id IS NOT NULL
  AND school_id = get_my_school_id()
);

-- Also fix similar patterns in other tables that reference profiles in subqueries
-- Fix classes "School members can view classes" - uses profiles which has recursion
DROP POLICY IF EXISTS "School members can view classes" ON public.classes;
CREATE POLICY "School members can view classes"
ON public.classes FOR SELECT
TO authenticated
USING (school_id = get_my_school_id());

-- Fix classes "Directors can manage classes"
DROP POLICY IF EXISTS "Directors can manage classes" ON public.classes;
CREATE POLICY "Directors can manage classes"
ON public.classes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'director'::app_role) AND school_id = get_my_school_id())
WITH CHECK (has_role(auth.uid(), 'director'::app_role) AND school_id = get_my_school_id());

-- Fix student_classes policies
DROP POLICY IF EXISTS "School members can view student classes" ON public.student_classes;
CREATE POLICY "School members can view student classes"
ON public.student_classes FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM classes c WHERE c.id = student_classes.class_id AND c.school_id = get_my_school_id()
));

DROP POLICY IF EXISTS "Directors can manage student classes" ON public.student_classes;
CREATE POLICY "Directors can manage student classes"
ON public.student_classes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'director'::app_role) AND EXISTS (
  SELECT 1 FROM classes c WHERE c.id = student_classes.class_id AND c.school_id = get_my_school_id()
))
WITH CHECK (has_role(auth.uid(), 'director'::app_role) AND EXISTS (
  SELECT 1 FROM classes c WHERE c.id = student_classes.class_id AND c.school_id = get_my_school_id()
));

-- Fix schedules policies
DROP POLICY IF EXISTS "School members can view schedules" ON public.schedules;
CREATE POLICY "School members can view schedules"
ON public.schedules FOR SELECT
TO authenticated
USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "Directors and zavuch can manage schedules" ON public.schedules;
CREATE POLICY "Directors and zavuch can manage schedules"
ON public.schedules FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'zavuch'::app_role))
  AND school_id = get_my_school_id()
)
WITH CHECK (
  (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'zavuch'::app_role))
  AND school_id = get_my_school_id()
);

-- Fix documents policies
DROP POLICY IF EXISTS "School members can view documents" ON public.documents;
CREATE POLICY "School members can view documents"
ON public.documents FOR SELECT
TO authenticated
USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "Zavuch and director can manage documents" ON public.documents;
CREATE POLICY "Zavuch and director can manage documents"
ON public.documents FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'zavuch'::app_role) OR has_role(auth.uid(), 'director'::app_role))
  AND school_id = get_my_school_id()
)
WITH CHECK (
  (has_role(auth.uid(), 'zavuch'::app_role) OR has_role(auth.uid(), 'director'::app_role))
  AND school_id = get_my_school_id()
);

DROP POLICY IF EXISTS "Teachers can upload documents" ON public.documents;
CREATE POLICY "Teachers can upload documents"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = documents.uploaded_by)
  AND school_id = get_my_school_id()
);

-- Fix materials policies
DROP POLICY IF EXISTS "School members can view materials" ON public.materials;
CREATE POLICY "School members can view materials"
ON public.materials FOR SELECT
TO authenticated
USING (school_id = get_my_school_id());

-- Fix journals policies
DROP POLICY IF EXISTS "School members can view journals" ON public.journals;
CREATE POLICY "School members can view journals"
ON public.journals FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM classes c WHERE c.id = journals.class_id AND c.school_id = get_my_school_id()
));

-- Fix attendance policies  
DROP POLICY IF EXISTS "School members can view attendance" ON public.attendance;
CREATE POLICY "School members can view attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM classes c WHERE c.id = attendance.class_id AND c.school_id = get_my_school_id()
));

-- Fix homework policies
DROP POLICY IF EXISTS "School members can view homework" ON public.homework;
CREATE POLICY "School members can view homework"
ON public.homework FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM classes c WHERE c.id = homework.class_id AND c.school_id = get_my_school_id()
));

-- Add zavuch can manage classes policy
CREATE POLICY "Zavuch can manage classes"
ON public.classes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'zavuch'::app_role) AND school_id = get_my_school_id())
WITH CHECK (has_role(auth.uid(), 'zavuch'::app_role) AND school_id = get_my_school_id());
