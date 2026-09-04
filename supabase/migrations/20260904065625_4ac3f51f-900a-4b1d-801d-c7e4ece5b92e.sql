
ALTER TABLE public.user_devices
  ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS device_key text,
  ADD COLUMN IF NOT EXISTS login_method text;

CREATE UNIQUE INDEX IF NOT EXISTS user_devices_user_key_uidx
  ON public.user_devices (user_id, device_key) WHERE device_key IS NOT NULL;

ALTER TABLE public.device_link_requests
  ADD COLUMN IF NOT EXISTS device_key text,
  ADD COLUMN IF NOT EXISTS short_code text;

CREATE INDEX IF NOT EXISTS device_link_requests_short_code_idx ON public.device_link_requests (short_code);

ALTER TABLE public.homework ADD COLUMN IF NOT EXISTS created_by uuid;

ALTER PUBLICATION supabase_realtime ADD TABLE public.device_link_requests;
ALTER TABLE public.device_link_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_devices;
ALTER TABLE public.user_devices REPLICA IDENTITY FULL;
