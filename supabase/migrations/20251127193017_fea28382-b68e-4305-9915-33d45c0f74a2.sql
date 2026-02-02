-- Corrigir RLS de user_roles para evitar recursão e liberar acesso do admin

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);