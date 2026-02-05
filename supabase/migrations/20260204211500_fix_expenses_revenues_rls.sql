-- Fix RLS policies for expenses and revenues to allow role-based access instead of user-scoped

-- Create new role-based policies for expenses (only if they don't exist)
DO $$ 
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
  
  -- Drop potentially existing new policies (for idempotency)
  DROP POLICY IF EXISTS "Admins and financeiro can view all expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Admins and financeiro can insert expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Admins and financeiro can update expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Admins and financeiro can delete expenses" ON public.expenses;
  
  -- Create new policies
  CREATE POLICY "Admins and financeiro can view all expenses"
  ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );

  CREATE POLICY "Admins and financeiro can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );

  CREATE POLICY "Admins and financeiro can update expenses"
  ON public.expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );

  CREATE POLICY "Admins and financeiro can delete expenses"
  ON public.expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );
END $$;

-- Create new role-based policies for revenues
DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Users can view their own revenues" ON public.revenues;
  DROP POLICY IF EXISTS "Users can insert their own revenues" ON public.revenues;
  DROP POLICY IF EXISTS "Users can update their own revenues" ON public.revenues;
  DROP POLICY IF EXISTS "Users can delete their own revenues" ON public.revenues;
  
  -- Drop potentially existing new policies (for idempotency)
  DROP POLICY IF EXISTS "Admins and financeiro can view all revenues" ON public.revenues;
  DROP POLICY IF EXISTS "Admins and financeiro can insert revenues" ON public.revenues;
  DROP POLICY IF EXISTS "Admins and financeiro can update revenues" ON public.revenues;
  DROP POLICY IF EXISTS "Admins and financeiro can delete revenues" ON public.revenues;
  
  -- Create new policies
  CREATE POLICY "Admins and financeiro can view all revenues"
  ON public.revenues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );

  CREATE POLICY "Admins and financeiro can insert revenues"
  ON public.revenues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );

  CREATE POLICY "Admins and financeiro can update revenues"
  ON public.revenues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );

  CREATE POLICY "Admins and financeiro can delete revenues"
  ON public.revenues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'financeiro')
    )
  );
END $$;
