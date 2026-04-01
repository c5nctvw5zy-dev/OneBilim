
-- Schedules table
CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  teacher_id uuid,
  day_of_week integer NOT NULL,
  lesson_order integer NOT NULL,
  start_time text,
  end_time text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view schedules" ON public.schedules
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = schedules.school_id));

CREATE POLICY "Directors and zavuch can manage schedules" ON public.schedules
FOR ALL TO authenticated
USING (
  (has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'zavuch'))
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = schedules.school_id)
)
WITH CHECK (
  (has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'zavuch'))
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = schedules.school_id)
);

-- Tests table
CREATE TABLE public.tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  class_id uuid,
  duration_minutes integer DEFAULT 30,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their tests" ON public.tests
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = tests.teacher_id))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = tests.teacher_id));

CREATE POLICY "Students can view sent tests" ON public.tests
FOR SELECT TO authenticated
USING (tests.status = 'sent' AND EXISTS (
  SELECT 1 FROM student_classes sc JOIN profiles p ON p.id = sc.student_id
  WHERE p.user_id = auth.uid() AND sc.class_id = tests.class_id
));

-- Test questions
CREATE TABLE public.test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text,
  question_order integer DEFAULT 1
);

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test questions follow test access" ON public.test_questions
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM tests t JOIN profiles p ON p.id = t.teacher_id WHERE t.id = test_questions.test_id AND p.user_id = auth.uid()
));

CREATE POLICY "Students can view sent test questions" ON public.test_questions
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM tests t JOIN student_classes sc ON sc.class_id = t.class_id JOIN profiles p ON p.id = sc.student_id
  WHERE t.id = test_questions.test_id AND t.status = 'sent' AND p.user_id = auth.uid()
));

-- Documents table (real)
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text DEFAULT 'Жалпы',
  file_url text,
  file_name text,
  file_size text,
  uploaded_by uuid NOT NULL,
  school_id uuid NOT NULL,
  status text DEFAULT 'pending',
  signed_by uuid,
  signature_url text,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view documents" ON public.documents
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = documents.school_id));

CREATE POLICY "Teachers can upload documents" ON public.documents
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = documents.uploaded_by AND p.school_id = documents.school_id));

CREATE POLICY "Zavuch and director can manage documents" ON public.documents
FOR ALL TO authenticated
USING (
  (has_role(auth.uid(), 'zavuch') OR has_role(auth.uid(), 'director'))
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = documents.school_id)
)
WITH CHECK (
  (has_role(auth.uid(), 'zavuch') OR has_role(auth.uid(), 'director'))
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = documents.school_id)
);

-- Materials table
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_id uuid,
  file_url text,
  file_name text,
  file_type text,
  file_size text,
  uploaded_by uuid NOT NULL,
  school_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view materials" ON public.materials
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.school_id = materials.school_id));

CREATE POLICY "Teachers can manage materials" ON public.materials
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = materials.uploaded_by))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = materials.uploaded_by));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('documents', 'materials', 'signatures'));
CREATE POLICY "Anyone can view files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('documents', 'materials', 'signatures'));
CREATE POLICY "Owners can delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('documents', 'materials', 'signatures'));
