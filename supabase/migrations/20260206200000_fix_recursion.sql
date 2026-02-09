-- Migration: Fix Recursive RLS on user_roles
-- Description: Introduces is_admin() helper to safely check roles without RLS recursion.

-- 1. Create is_admin() helper function
-- This function runs as the owner (SECURITY DEFINER), bypassing RLS.
-- This allows us to check if the current user is an admin without triggering the RLS on user_roles again.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  );
END;
$$;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- 3. Re-create the policy using the safe helper
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
    organization_id = public.get_auth_organization_id()
    AND public.is_admin()
);

-- 4. Also fix 'Organizations' update policy just in case (it also checked roles)
DROP POLICY IF EXISTS "Admins can update their own organization" ON public.organizations;

CREATE POLICY "Admins can update their own organization"
ON public.organizations FOR UPDATE
TO authenticated
USING (
    id = public.get_auth_organization_id() 
    AND public.is_admin()
);
