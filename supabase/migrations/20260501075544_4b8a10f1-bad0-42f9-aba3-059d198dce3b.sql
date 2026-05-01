-- Add birth_date and gender to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS gender text;

-- One-time password resets log
CREATE TABLE IF NOT EXISTS public.password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  iin text NOT NULL,
  temp_password_hash text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 hour')
);

ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view password resets"
  ON public.password_resets FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_password_resets_iin ON public.password_resets(iin);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON public.password_resets(user_id);
