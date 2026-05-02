-- News module
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  content text,
  image_url text,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published news" ON public.news FOR SELECT USING (published = true);
CREATE POLICY "Super admins manage news" ON public.news FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE TRIGGER news_updated BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Announcements
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all', -- 'all'|'school'|'students'|'teachers'|'parents'
  school_id uuid, -- null = system-wide
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view relevant announcements" ON public.announcements FOR SELECT TO authenticated
  USING (
    school_id IS NULL
    OR school_id = get_my_school_id()
  );
CREATE POLICY "Super admins broadcast system" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) AND school_id IS NULL);
CREATE POLICY "Director/Zavuch broadcast school" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (
    (has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'zavuch'::app_role))
    AND school_id = get_my_school_id()
  );
CREATE POLICY "Super admin delete announcements" ON public.announcements FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Director/Zavuch delete own school" ON public.announcements FOR DELETE TO authenticated
  USING ((has_role(auth.uid(), 'director'::app_role) OR has_role(auth.uid(), 'zavuch'::app_role))
    AND school_id = get_my_school_id());

-- Announcement read tracking
CREATE TABLE public.announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reads" ON public.announcement_reads FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Audit logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins view audit" ON public.audit_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Authenticated insert audit" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- School security
CREATE TABLE public.school_security (
  school_id uuid PRIMARY KEY,
  protected boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.school_security ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage security" ON public.school_security FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "School views own security" ON public.school_security FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

-- User status (block/active)
CREATE TABLE public.user_status (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'active', -- 'active'|'blocked'
  protected boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage user status" ON public.user_status FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "User views own status" ON public.user_status FOR SELECT TO authenticated
  USING (user_id = auth.uid());