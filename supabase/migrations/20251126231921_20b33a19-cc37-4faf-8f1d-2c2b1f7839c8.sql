-- Create revenues table for additional income tracking
CREATE TABLE public.revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own revenues" 
ON public.revenues 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revenues" 
ON public.revenues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenues" 
ON public.revenues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenues" 
ON public.revenues 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_revenues_updated_at
BEFORE UPDATE ON public.revenues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();