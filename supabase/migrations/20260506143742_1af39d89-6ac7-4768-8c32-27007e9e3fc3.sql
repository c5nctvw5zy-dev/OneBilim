ALTER TABLE public.alphabet_book ADD COLUMN IF NOT EXISTS education_program text DEFAULT 'general';
ALTER TABLE public.alphabet_book ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.alphabet_book ADD COLUMN IF NOT EXISTS parent_name text;
ALTER TABLE public.alphabet_book ADD COLUMN IF NOT EXISTS parent_phone text;
ALTER TABLE public.alphabet_book ADD COLUMN IF NOT EXISTS gender text;