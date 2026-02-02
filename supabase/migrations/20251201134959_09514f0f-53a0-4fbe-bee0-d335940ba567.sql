-- Add lead_source column to leads table
ALTER TABLE public.leads
ADD COLUMN lead_source TEXT NOT NULL DEFAULT 'Outros'
CHECK (lead_source IN ('Indicação', 'Palestra', 'Instagram', 'Google', 'Anúncio Pago', 'Evento Externo', 'Outros'));