-- Add new fields to leads table
ALTER TABLE public.leads ADD COLUMN company_name TEXT;
ALTER TABLE public.leads ADD COLUMN has_partner BOOLEAN DEFAULT false;
ALTER TABLE public.leads ADD COLUMN partner_name TEXT;

-- Make company_name required
ALTER TABLE public.leads ALTER COLUMN company_name SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN company_name SET DEFAULT '';

-- Update existing records to have empty company_name
UPDATE public.leads SET company_name = '' WHERE company_name IS NULL;

-- Create expenses table for the Caixa module
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create user-scoped policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for expenses updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();