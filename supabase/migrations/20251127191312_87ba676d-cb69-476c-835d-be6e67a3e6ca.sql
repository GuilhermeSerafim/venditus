-- Atualizar políticas RLS para compartilhar dados entre usuários conforme permissões

-- ============= LEADS =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins and comercial can view leads"
ON public.leads FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins and comercial can insert leads"
ON public.leads FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins and comercial can update leads"
ON public.leads FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
);

CREATE POLICY "Admins and comercial can delete leads"
ON public.leads FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
);

-- ============= SALES =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON public.sales;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins, comercial and financeiro can view sales"
ON public.sales FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins, comercial and financeiro can insert sales"
ON public.sales FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins, comercial and financeiro can update sales"
ON public.sales FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
);

CREATE POLICY "Admins, comercial and financeiro can delete sales"
ON public.sales FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
);

-- ============= EXPENSES =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins and financeiro can view expenses"
ON public.expenses FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can insert expenses"
ON public.expenses FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can update expenses"
ON public.expenses FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);

CREATE POLICY "Admins and financeiro can delete expenses"
ON public.expenses FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);

-- ============= REVENUES =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can insert their own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can update their own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can delete their own revenues" ON public.revenues;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins and financeiro can view revenues"
ON public.revenues FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can insert revenues"
ON public.revenues FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can update revenues"
ON public.revenues FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);

CREATE POLICY "Admins and financeiro can delete revenues"
ON public.revenues FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);