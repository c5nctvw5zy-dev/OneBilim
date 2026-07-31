CREATE OR REPLACE FUNCTION public.is_same_school(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.school_id IS NOT NULL
      AND p.school_id = public.get_my_school_id()
  )
$$;

DROP POLICY IF EXISTS "School members can view school profiles" ON public.profiles;
CREATE POLICY "School members can view school profiles"
ON public.profiles FOR SELECT TO authenticated
USING (school_id IS NOT NULL AND school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "School members can view school roles" ON public.user_roles;
CREATE POLICY "School members can view school roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_same_school(user_id));