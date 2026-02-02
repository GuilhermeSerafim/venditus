-- Adicionar campo notes (observações) na tabela events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ajustar políticas RLS para permitir visualização compartilhada de dados
-- Leads: todos os usuários com permissão podem ver todos os leads
DROP POLICY IF EXISTS "Admins and comercial can view leads" ON public.leads;
CREATE POLICY "Admins and comercial can view leads"
ON public.leads
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'comercial'::app_role])
);

-- Sales: todos os usuários com permissão podem ver todas as vendas
DROP POLICY IF EXISTS "Admins, comercial and financeiro can view sales" ON public.sales;
CREATE POLICY "Admins, comercial and financeiro can view sales"
ON public.sales
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'comercial'::app_role, 'financeiro'::app_role])
);

-- Revenues: todos os usuários com permissão podem ver todas as receitas
DROP POLICY IF EXISTS "Admins and financeiro can view revenues" ON public.revenues;
CREATE POLICY "Admins and financeiro can view revenues"
ON public.revenues
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'financeiro'::app_role])
);

-- Expenses: todos os usuários com permissão podem ver todas as despesas
DROP POLICY IF EXISTS "Admins and financeiro can view expenses" ON public.expenses;
CREATE POLICY "Admins and financeiro can view expenses"
ON public.expenses
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'financeiro'::app_role])
);