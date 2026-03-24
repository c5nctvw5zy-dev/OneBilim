-- Tighten access to user_roles so only super admins can create/update/delete roles
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Restrict directors to only view profiles inside their own school
DROP POLICY IF EXISTS "Directors can view profiles" ON public.profiles;

CREATE POLICY "Directors can view school profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'director')
  AND EXISTS (
    SELECT 1
    FROM public.profiles AS me
    WHERE me.user_id = auth.uid()
      AND me.school_id IS NOT NULL
      AND me.school_id = profiles.school_id
  )
);

-- Do not expose sensitive school data publicly
DROP POLICY IF EXISTS "Anyone can view approved schools" ON public.schools;

CREATE POLICY "Authenticated users can view approved schools"
ON public.schools
FOR SELECT
TO authenticated
USING (status = 'approved');