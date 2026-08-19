-- Login history
CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_name text,
  os text,
  browser text,
  ip_address text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.login_history TO authenticated;
GRANT ALL ON public.login_history TO service_role;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own login history" ON public.login_history FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "insert own login history" ON public.login_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Linked devices
CREATE TABLE public.user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_name text NOT NULL,
  device_type text,
  is_primary boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devices TO authenticated;
GRANT ALL ON public.user_devices TO service_role;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own devices" ON public.user_devices FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin')) WITH CHECK (user_id = auth.uid());

-- QR device link requests
CREATE TABLE public.device_link_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  requester_device text,
  requester_os text,
  requester_browser text,
  user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 minutes'),
  approved_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.device_link_requests TO anon, authenticated;
GRANT ALL ON public.device_link_requests TO service_role;
ALTER TABLE public.device_link_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can create link request" ON public.device_link_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "read link request by token" ON public.device_link_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner approves link request" ON public.device_link_requests FOR UPDATE TO authenticated USING (status = 'pending' AND expires_at > now()) WITH CHECK (user_id = auth.uid());

-- Suggestions from users / public
CREATE TABLE public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  category text,
  body text NOT NULL,
  created_by uuid,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suggestions TO authenticated;
GRANT INSERT ON public.suggestions TO anon;
GRANT ALL ON public.suggestions TO service_role;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send suggestion" ON public.suggestions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "super admin reads suggestions" ON public.suggestions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR created_by = auth.uid());
CREATE POLICY "super admin updates suggestions" ON public.suggestions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

-- Group chat
CREATE TABLE public.chat_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid,
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.chat_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  UNIQUE (group_id, user_id)
);
CREATE TABLE public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  from_user uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.group_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_groups, public.chat_group_members, public.group_messages, public.group_message_reads TO authenticated;
GRANT ALL ON public.chat_groups, public.chat_group_members, public.group_messages, public.group_message_reads TO service_role;
ALTER TABLE public.chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_reads ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_group_members m WHERE m.group_id = _group_id AND m.user_id = auth.uid())
$$;

CREATE POLICY "members read group" ON public.chat_groups FOR SELECT TO authenticated USING (public.is_group_member(id) OR created_by = auth.uid());
CREATE POLICY "staff create group" ON public.chat_groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "creator manages group" ON public.chat_groups FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "creator deletes group" ON public.chat_groups FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "members read membership" ON public.chat_group_members FOR SELECT TO authenticated USING (public.is_group_member(group_id) OR user_id = auth.uid());
CREATE POLICY "creator adds members" ON public.chat_group_members FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND g.created_by = auth.uid()));
CREATE POLICY "creator removes members" ON public.chat_group_members FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND g.created_by = auth.uid()));

CREATE POLICY "members read messages" ON public.group_messages FOR SELECT TO authenticated USING (public.is_group_member(group_id));
CREATE POLICY "members send messages" ON public.group_messages FOR INSERT TO authenticated WITH CHECK (from_user = auth.uid() AND public.is_group_member(group_id));

CREATE POLICY "own reads" ON public.group_message_reads FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Shifts (ауысымдар)
CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  start_time text NOT NULL,
  lesson_minutes integer NOT NULL DEFAULT 45,
  break_minutes integer NOT NULL DEFAULT 10,
  lessons_count integer NOT NULL DEFAULT 7,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school reads shifts" ON public.shifts FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
CREATE POLICY "admins manage shifts" ON public.shifts FOR ALL TO authenticated USING (school_id = public.get_my_school_id() AND (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'zavuch') OR public.has_role(auth.uid(),'super_admin'))) WITH CHECK (school_id = public.get_my_school_id());

-- Data access requests (рұқсаттар және келісімдер)
CREATE TABLE public.data_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid,
  requester_id uuid NOT NULL,
  requester_role text,
  parent_id uuid,
  student_name text NOT NULL,
  data_type text NOT NULL,
  purpose text,
  duration_days integer,
  status text NOT NULL DEFAULT 'pending',
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.data_access_requests TO authenticated;
GRANT ALL ON public.data_access_requests TO service_role;
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "involved read requests" ON public.data_access_requests FOR SELECT TO authenticated USING (requester_id = auth.uid() OR parent_id = auth.uid() OR public.has_role(auth.uid(),'director'));
CREATE POLICY "staff create requests" ON public.data_access_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "parent decides requests" ON public.data_access_requests FOR UPDATE TO authenticated USING (parent_id = auth.uid());

-- Psychological tests
CREATE TABLE public.psych_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.psych_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.psych_tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  student_name text,
  answers jsonb,
  score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.psych_tests, public.psych_test_results TO authenticated;
GRANT ALL ON public.psych_tests, public.psych_test_results TO service_role;
ALTER TABLE public.psych_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psych_test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "psychologist manages tests" ON public.psych_tests FOR ALL TO authenticated USING (school_id = public.get_my_school_id() AND public.has_role(auth.uid(),'psychologist')) WITH CHECK (school_id = public.get_my_school_id());
CREATE POLICY "school reads published tests" ON public.psych_tests FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() AND published = true);
CREATE POLICY "psychologist reads results" ON public.psych_test_results FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'psychologist') OR student_id = auth.uid());
CREATE POLICY "student submits result" ON public.psych_test_results FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- Assessment results (БЖБ/ТЖБ)
CREATE TABLE public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_name text,
  subject_name text NOT NULL,
  student_name text NOT NULL,
  student_id uuid,
  assessment_type text NOT NULL,
  quarter integer,
  section_name text,
  score numeric,
  max_score numeric,
  note text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_results TO authenticated;
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results FORCE ROW LEVEL SECURITY;
CREATE POLICY "school reads assessments" ON public.assessment_results FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
CREATE POLICY "staff manage assessments" ON public.assessment_results FOR ALL TO authenticated USING (school_id = public.get_my_school_id() AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'zavuch'))) WITH CHECK (school_id = public.get_my_school_id());

-- Lesson status + signature + login on profiles
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS lesson_status text NOT NULL DEFAULT 'planned';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS room text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS deleted_at timestamptz;