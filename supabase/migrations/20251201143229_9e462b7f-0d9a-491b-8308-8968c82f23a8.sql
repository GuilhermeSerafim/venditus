-- Remover o constraint antigo completamente
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Adicionar novo constraint com os valores corretos
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('Lead Novo', 'Cliente Ativo', 'Ex-Cliente'));