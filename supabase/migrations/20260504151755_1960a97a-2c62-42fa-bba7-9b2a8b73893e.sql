
-- LESSON HOURS (Бақылау тақтасы)
CREATE TABLE public.lesson_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  teacher_id uuid,
  class_id uuid,
  subject_name text NOT NULL,
  total_hours integer NOT NULL DEFAULT 0,
  conducted_hours integer NOT NULL DEFAULT 0,
  quarter integer,
  academic_year text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view hours" ON public.lesson_hours FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Teacher manage own hours" ON public.lesson_hours FOR ALL TO authenticated
  USING (school_id = get_my_school_id() AND (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = teacher_id)
    OR has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch')
  ))
  WITH CHECK (school_id = get_my_school_id());
CREATE TRIGGER lesson_hours_updated BEFORE UPDATE ON public.lesson_hours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ALPHABETICAL BOOK
CREATE TABLE public.alphabet_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  last_name text NOT NULL,
  first_name text NOT NULL,
  birth_date date,
  nationality text,
  address text,
  enroll_date date,
  exit_date date,
  alphabet_number integer,
  grade_level integer,
  section text,
  exit_order_no text,
  exit_order_date date,
  exit_reason text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alphabet_book ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view alphabet" ON public.alphabet_book FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Director manage alphabet" ON public.alphabet_book FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'secretary')) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'secretary')) AND school_id = get_my_school_id());
CREATE TRIGGER alphabet_updated BEFORE UPDATE ON public.alphabet_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDERS BOOK (Бұйрықтар)
CREATE TABLE public.orders_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  order_no text NOT NULL,
  order_date date NOT NULL,
  reason text NOT NULL,
  issued_by text,
  file_url text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders_book ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view orders" ON public.orders_book FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Admin manage orders" ON public.orders_book FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'secretary')) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'secretary')) AND school_id = get_my_school_id());

-- STAFF
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  full_name text NOT NULL,
  position text,
  phone text,
  iin text,
  hire_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view staff" ON public.staff FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Admin manage staff" ON public.staff FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'hr')) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'hr')) AND school_id = get_my_school_id());
CREATE TRIGGER staff_updated BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HIRE DOCUMENTS
CREATE TABLE public.hire_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  staff_id uuid,
  applicant_name text NOT NULL,
  doc_title text NOT NULL,
  file_url text,
  uploaded_by uuid NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hire_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HR manage hire docs" ON public.hire_documents FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'hr') OR has_role(auth.uid(),'director')) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(),'hr') OR has_role(auth.uid(),'director')) AND school_id = get_my_school_id());

-- EXTRACURRICULAR
CREATE TABLE public.extracurricular (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  teacher_name text,
  schedule text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.extracurricular_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  extracurricular_id uuid NOT NULL,
  student_name text NOT NULL,
  grade_level integer,
  joined_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.extracurricular ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracurricular_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view extra" ON public.extracurricular FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Admin manage extra" ON public.extracurricular FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch')) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch')) AND school_id = get_my_school_id());
CREATE POLICY "School view members" ON public.extracurricular_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM extracurricular e WHERE e.id = extracurricular_id AND e.school_id = get_my_school_id()));
CREATE POLICY "Admin manage members" ON public.extracurricular_members FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM extracurricular e WHERE e.id = extracurricular_id AND e.school_id = get_my_school_id() AND (has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch'))))
  WITH CHECK (EXISTS (SELECT 1 FROM extracurricular e WHERE e.id = extracurricular_id AND e.school_id = get_my_school_id()));

-- DISCIPLINE RECORDS (мектепішілік тіркеу)
CREATE TABLE public.discipline_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  record_type text NOT NULL,
  details text,
  parent_action text,
  status text NOT NULL DEFAULT 'open',
  recorded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.discipline_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin view discipline" ON public.discipline_records FOR SELECT TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'social_pedagogue') OR has_role(auth.uid(),'psychologist')) AND school_id = get_my_school_id());
CREATE POLICY "Admin manage discipline" ON public.discipline_records FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'social_pedagogue')) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'social_pedagogue')) AND school_id = get_my_school_id());
CREATE TRIGGER discipline_updated BEFORE UPDATE ON public.discipline_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STUDENT REPORTS (Табельдер)
CREATE TABLE public.student_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  quarter integer NOT NULL,
  subjects_summary jsonb DEFAULT '[]'::jsonb,
  rating text,
  homeroom_note text,
  remarks text,
  parent_acknowledged boolean DEFAULT false,
  parent_acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view reports" ON public.student_reports FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Admin/Teacher manage reports" ON public.student_reports FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch') OR has_role(auth.uid(),'teacher')) AND school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());
CREATE TRIGGER reports_updated BEFORE UPDATE ON public.student_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CURRICULUM PLANS (ҚМЖ/КТЖ)
CREATE TABLE public.curriculum_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  plan_type text NOT NULL,
  class_name text,
  group_name text,
  subject_name text NOT NULL,
  teacher_name text,
  academic_year text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.curriculum_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  row_no integer NOT NULL,
  lesson_date date,
  lesson_type text,
  topic text,
  topic_count integer DEFAULT 1,
  homework_type text,
  homework text
);
ALTER TABLE public.curriculum_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view plans" ON public.curriculum_plans FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Teacher manage plans" ON public.curriculum_plans FOR ALL TO authenticated
  USING (school_id = get_my_school_id() AND (created_by = auth.uid() OR has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch')))
  WITH CHECK (school_id = get_my_school_id() AND created_by = auth.uid());
CREATE POLICY "School view rows" ON public.curriculum_rows FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM curriculum_plans p WHERE p.id = plan_id AND p.school_id = get_my_school_id()));
CREATE POLICY "Plan owner manage rows" ON public.curriculum_rows FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM curriculum_plans p WHERE p.id = plan_id AND p.school_id = get_my_school_id() AND (p.created_by = auth.uid() OR has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch'))))
  WITH CHECK (EXISTS (SELECT 1 FROM curriculum_plans p WHERE p.id = plan_id AND p.school_id = get_my_school_id()));

-- DIRECT MESSAGES
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid,
  from_user uuid NOT NULL,
  to_user uuid NOT NULL,
  subject text,
  body text NOT NULL,
  file_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipient/sender view" ON public.direct_messages FOR SELECT TO authenticated
  USING (from_user = auth.uid() OR to_user = auth.uid());
CREATE POLICY "Auth send" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (from_user = auth.uid());
CREATE POLICY "Recipient mark read" ON public.direct_messages FOR UPDATE TO authenticated USING (to_user = auth.uid());

-- PSYCHOLOGIST CONSULTATIONS
CREATE TABLE public.psych_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  consultation_text text NOT NULL,
  recommendation text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.psych_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Psych manage" ON public.psych_consultations FOR ALL TO authenticated
  USING (has_role(auth.uid(),'psychologist') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(),'psychologist') AND school_id = get_my_school_id());
CREATE POLICY "Director view psych" ON public.psych_consultations FOR SELECT TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch')) AND school_id = get_my_school_id());

-- SOCIAL RECORDS
CREATE TABLE public.social_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  family_status text,
  income_level text,
  parent_contact text,
  notes text,
  needs_support boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.social_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Social manage" ON public.social_records FOR ALL TO authenticated
  USING (has_role(auth.uid(),'social_pedagogue') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(),'social_pedagogue') AND school_id = get_my_school_id());
CREATE POLICY "Director view social" ON public.social_records FOR SELECT TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch')) AND school_id = get_my_school_id());
CREATE TRIGGER social_updated BEFORE UPDATE ON public.social_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MEDICAL RECORDS
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  blood_type text,
  allergies text,
  chronic_conditions text,
  vaccinations text,
  notes text,
  created_by uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nurse manage med" ON public.medical_records FOR ALL TO authenticated
  USING (has_role(auth.uid(),'nurse') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(),'nurse') AND school_id = get_my_school_id());
CREATE POLICY "Director view med" ON public.medical_records FOR SELECT TO authenticated
  USING ((has_role(auth.uid(),'director')) AND school_id = get_my_school_id());
CREATE TRIGGER medical_updated BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.first_aid_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  reason text NOT NULL,
  treatment text,
  visit_date timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);
ALTER TABLE public.first_aid_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nurse manage aid" ON public.first_aid_log FOR ALL TO authenticated
  USING (has_role(auth.uid(),'nurse') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(),'nurse') AND school_id = get_my_school_id());

CREATE TABLE public.health_check_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  check_date date NOT NULL,
  height_cm numeric,
  weight_kg numeric,
  vision text,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.health_check_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nurse manage checks" ON public.health_check_results FOR ALL TO authenticated
  USING (has_role(auth.uid(),'nurse') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(),'nurse') AND school_id = get_my_school_id());

-- INCLUSIVE SESSIONS
CREATE TABLE public.inclusive_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  session_date date NOT NULL,
  topic text,
  notes text,
  progress text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inclusive_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Speech manage" ON public.inclusive_sessions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'speech_therapist') AND school_id = get_my_school_id())
  WITH CHECK (has_role(auth.uid(),'speech_therapist') AND school_id = get_my_school_id());
CREATE POLICY "Director view inc" ON public.inclusive_sessions FOR SELECT TO authenticated
  USING ((has_role(auth.uid(),'director') OR has_role(auth.uid(),'zavuch')) AND school_id = get_my_school_id());
