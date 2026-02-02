-- Apenas remover o constraint existente
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;