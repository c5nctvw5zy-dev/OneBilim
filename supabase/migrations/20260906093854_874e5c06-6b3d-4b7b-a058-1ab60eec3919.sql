CREATE TABLE IF NOT EXISTS public.system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  system_name text NOT NULL DEFAULT 'BilimApp',
  logo_url text,
  favicon_url text,
  default_language text NOT NULL DEFAULT 'kk',
  timezone text NOT NULL DEFAULT 'Asia/Almaty',
  datetime_format text NOT NULL DEFAULT 'dd.MM.yyyy HH:mm',
  academic_year text NOT NULL DEFAULT '2026-2027',
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_single_row CHECK (id = 1)
);

GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admin can insert system settings" ON public.system_settings;
CREATE POLICY "Super admin can insert system settings" ON public.system_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admin can update system settings" ON public.system_settings;
CREATE POLICY "Super admin can update system settings" ON public.system_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER system_settings_updated BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- schools: internal/external info fields for school profiles
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS director_name text,
  ADD COLUMN IF NOT EXISTS director_phone text,
  ADD COLUMN IF NOT EXISTS students_count integer,
  ADD COLUMN IF NOT EXISTS staff_count integer,
  ADD COLUMN IF NOT EXISTS classes_count integer,
  ADD COLUMN IF NOT EXISTS founded_year integer,
  ADD COLUMN IF NOT EXISTS language_of_instruction text,
  ADD COLUMN IF NOT EXISTS shifts_count integer,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS public_description text;

-- allow blocked-status self read so the app can enforce blocks at login
DROP POLICY IF EXISTS "Users can read own status" ON public.user_status;
CREATE POLICY "Users can read own status" ON public.user_status FOR SELECT TO authenticated USING (user_id = auth.uid());