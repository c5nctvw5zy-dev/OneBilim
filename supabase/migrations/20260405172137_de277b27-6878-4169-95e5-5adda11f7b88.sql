ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS face_id_registered boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS face_id_data text;