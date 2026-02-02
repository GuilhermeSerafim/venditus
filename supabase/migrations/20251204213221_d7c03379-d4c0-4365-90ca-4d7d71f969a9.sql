-- Add CPF and CNPJ fields to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Add payment method and installments fields to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS installments_count INTEGER DEFAULT 1;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS installments_status JSONB DEFAULT '[]'::jsonb;