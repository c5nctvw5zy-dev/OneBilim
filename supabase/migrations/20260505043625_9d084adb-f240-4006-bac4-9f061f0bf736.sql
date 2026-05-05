CREATE TABLE public.timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  staff_name text NOT NULL,
  position text,
  period text NOT NULL,
  worked_days integer DEFAULT 0,
  worked_hours numeric DEFAULT 0,
  absences integer DEFAULT 0,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School view timesheets" ON public.timesheets FOR SELECT TO authenticated USING (school_id = get_my_school_id());
CREATE POLICY "Admin manage timesheets" ON public.timesheets FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'director'::app_role) OR has_role(auth.uid(),'zavuch'::app_role) OR has_role(auth.uid(),'hr'::app_role) OR has_role(auth.uid(),'secretary'::app_role)) AND school_id = get_my_school_id())
  WITH CHECK ((has_role(auth.uid(),'director'::app_role) OR has_role(auth.uid(),'zavuch'::app_role) OR has_role(auth.uid(),'hr'::app_role) OR has_role(auth.uid(),'secretary'::app_role)) AND school_id = get_my_school_id());
CREATE TRIGGER timesheets_updated BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();