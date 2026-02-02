-- Adicionar constraint com valores corretos (snake_case)
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('lead', 'cliente_ativo', 'ex_cliente'));