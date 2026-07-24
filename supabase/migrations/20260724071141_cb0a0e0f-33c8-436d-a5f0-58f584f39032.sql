ALTER TABLE public.curriculum_rows
  ADD COLUMN IF NOT EXISTS teacher_names TEXT,
  ADD COLUMN IF NOT EXISTS group_name TEXT;

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS group_config JSONB;