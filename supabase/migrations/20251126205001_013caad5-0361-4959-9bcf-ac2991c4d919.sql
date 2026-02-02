-- Add user_id columns to leads and sales tables for user-scoped access
ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.sales ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set user_id for existing records to the first user (for migration purposes)
-- In production, you'd want to assign these properly
UPDATE public.leads SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE public.sales SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting values
ALTER TABLE public.leads ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.sales ALTER COLUMN user_id SET NOT NULL;

-- Drop existing overly permissive policies for leads
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

-- Create user-scoped policies for leads
CREATE POLICY "Users can view their own leads" 
ON public.leads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
ON public.leads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
ON public.leads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing overly permissive policies for sales
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can delete sales" ON public.sales;

-- Create user-scoped policies for sales
CREATE POLICY "Users can view their own sales" 
ON public.sales 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" 
ON public.sales 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" 
ON public.sales 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" 
ON public.sales 
FOR DELETE 
USING (auth.uid() = user_id);