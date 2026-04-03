
-- Fix 1: Protect test correct answers from students
-- Create a secure view that excludes correct_answer for students
CREATE OR REPLACE VIEW public.test_questions_student_view AS
SELECT id, test_id, question_order, question_text, option_a, option_b, option_c, option_d
FROM public.test_questions;

-- Drop the existing student policy
DROP POLICY IF EXISTS "Students can view sent test questions" ON public.test_questions;

-- Revoke direct SELECT on correct_answer from authenticated role
REVOKE SELECT (correct_answer) ON public.test_questions FROM authenticated;

-- Re-grant SELECT on all other columns to authenticated
GRANT SELECT (id, test_id, question_order, question_text, option_a, option_b, option_c, option_d) ON public.test_questions TO authenticated;

-- Re-create the student policy without correct_answer access
CREATE POLICY "Students can view sent test questions"
ON public.test_questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM tests t
    JOIN student_classes sc ON sc.class_id = t.class_id
    JOIN profiles p ON p.id = sc.student_id
    WHERE t.id = test_questions.test_id
      AND t.status = 'sent'
      AND p.user_id = auth.uid()
  )
);

-- Fix 2: Make storage buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('documents', 'materials', 'signatures');
