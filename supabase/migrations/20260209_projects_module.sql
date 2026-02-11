-- ============================================================================
-- Migration: Projects Module
-- Description: Add projects and project_tasks tables for project management
-- Date: 2026-02-09
-- ============================================================================

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  priority TEXT NOT NULL DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  actual_end_date DATE,
  budget NUMERIC(10,2) DEFAULT 0,
  estimated_hours NUMERIC(10,2) DEFAULT 0,
  actual_hours NUMERIC(10,2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT projects_status_check CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  CONSTRAINT projects_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create project_tasks table
CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  estimated_hours NUMERIC(10,2) DEFAULT 0,
  actual_hours NUMERIC(10,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT project_tasks_status_check CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
  CONSTRAINT project_tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_priority ON public.projects(priority);
CREATE INDEX idx_projects_start_date ON public.projects(start_date);
CREATE INDEX idx_projects_end_date ON public.projects(end_date);

CREATE INDEX idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX idx_project_tasks_assigned_to ON public.project_tasks(assigned_to);
CREATE INDEX idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX idx_project_tasks_due_date ON public.project_tasks(due_date);
CREATE INDEX idx_project_tasks_order_index ON public.project_tasks(order_index);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for project_tasks
-- Users can view tasks of their projects
CREATE POLICY "Users can view tasks of their projects"
ON public.project_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert tasks to their projects"
ON public.project_tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update tasks of their projects"
ON public.project_tasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tasks of their projects"
ON public.project_tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
BEFORE UPDATE ON public.project_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.projects IS 'Projects linked to leads/clients';
COMMENT ON TABLE public.project_tasks IS 'Tasks within a project';
COMMENT ON COLUMN public.projects.progress_percentage IS 'Project completion percentage (0-100)';
COMMENT ON COLUMN public.project_tasks.order_index IS 'Order of tasks within a project';
