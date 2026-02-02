-- Atualizar valores de status existentes para o novo formato
UPDATE public.leads 
SET status = CASE 
  WHEN status = 'lead' THEN 'Lead Novo'
  WHEN status = 'cliente_ativo' THEN 'Cliente Ativo'
  WHEN status = 'ex_cliente' THEN 'Ex-Cliente'
  ELSE status
END
WHERE status IN ('lead', 'cliente_ativo', 'ex_cliente');

-- Atualizar o constraint para aceitar apenas os novos valores
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('Lead Novo', 'Cliente Ativo', 'Ex-Cliente'));