CREATE TABLE public.custom_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'BarChart3',
  color TEXT DEFAULT '#F2C94C',
  data_source TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  formula TEXT NOT NULL,
  visualization_type TEXT NOT NULL,
  order_position INTEGER DEFAULT 0,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)