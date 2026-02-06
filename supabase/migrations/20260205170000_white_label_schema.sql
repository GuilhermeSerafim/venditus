-- Migration: White Label SaaS Transformation
-- Description: Adds organizations table, links users to organizations, and implements multi-tenancy RLS.

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    theme_config jsonb DEFAULT '{"primaryColor": "hsl(43 74% 49%)", "logoUrl": null}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Insert default organization (Venditus)
DO $$
DECLARE
    default_org_id uuid;
BEGIN
    INSERT INTO public.organizations (name, slug)
    VALUES ('Venditus', 'venditus')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO default_org_id;

    -- If we didn't insert (because it exists), get the ID
    IF default_org_id IS NULL THEN
        SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'venditus';
    END IF;

    -- 3. Add organization_id to tables and migrate existing data
    
    -- profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') THEN
        ALTER TABLE public.profiles ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.profiles SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.profiles ALTER COLUMN organization_id SET NOT NULL;
    END IF;

    -- user_roles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'organization_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.user_roles SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.user_roles ALTER COLUMN organization_id SET NOT NULL;
    END IF;

    -- Data Tables List: leads, products, events, sales, lead_events, interactions, expenses, revenues
    
    -- leads
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'organization_id') THEN
        ALTER TABLE public.leads ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.leads SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.leads ALTER COLUMN organization_id SET NOT NULL;
    END IF;

    -- products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'organization_id') THEN
        ALTER TABLE public.products ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.products SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.products ALTER COLUMN organization_id SET NOT NULL;
    END IF;

    -- events
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organization_id') THEN
        ALTER TABLE public.events ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.events SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.events ALTER COLUMN organization_id SET NOT NULL;
    END IF;

    -- sales
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'organization_id') THEN
        ALTER TABLE public.sales ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.sales SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.sales ALTER COLUMN organization_id SET NOT NULL;
    END IF;
    
    -- lead_events
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_events' AND column_name = 'organization_id') THEN
        ALTER TABLE public.lead_events ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.lead_events SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.lead_events ALTER COLUMN organization_id SET NOT NULL;
    END IF;

    -- interactions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interactions' AND column_name = 'organization_id') THEN
        ALTER TABLE public.interactions ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        UPDATE public.interactions SET organization_id = default_org_id WHERE organization_id IS NULL;
        ALTER TABLE public.interactions ALTER COLUMN organization_id SET NOT NULL;
    END IF;

    -- expenses (check if table exists first just in case, though we saw RLS for it)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'organization_id') THEN
            ALTER TABLE public.expenses ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
            UPDATE public.expenses SET organization_id = default_org_id WHERE organization_id IS NULL;
            ALTER TABLE public.expenses ALTER COLUMN organization_id SET NOT NULL;
        END IF;
    END IF;

    -- revenues
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenues') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenues' AND column_name = 'organization_id') THEN
            ALTER TABLE public.revenues ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
            UPDATE public.revenues SET organization_id = default_org_id WHERE organization_id IS NULL;
            ALTER TABLE public.revenues ALTER COLUMN organization_id SET NOT NULL;
        END IF;
    END IF;

END $$;

-- 4. Create Helper Function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_auth_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 5. Drop existing policies to be safe (Clean Slate for RLS)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."' || r.tablename || '"';
    END LOOP;
END $$;

-- 6. Create New RLS Policies (Multi-tenancy)

-- Organizations
-- Users can view their own organization
CREATE POLICY "Users can view their own organization"
ON public.organizations FOR SELECT
TO authenticated
USING (id = public.get_auth_organization_id());

-- Admins can update their own organization
CREATE POLICY "Admins can update their own organization"
ON public.organizations FOR UPDATE
TO authenticated
USING (
    id = public.get_auth_organization_id() 
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Profiles
-- Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles FOR SELECT
TO authenticated
USING (organization_id = public.get_auth_organization_id());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- User Roles
-- Users can view roles in their organization
CREATE POLICY "Users can view roles in their organization"
ON public.user_roles FOR SELECT
TO authenticated
USING (organization_id = public.get_auth_organization_id());

-- Admins can manage roles in their organization
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
    organization_id = public.get_auth_organization_id()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Data Tables Generic Policies
-- We'll create a macro-like structure by repeating for each table for clarity
-- Note: 'dashboard' view might need adjustment if it exists, but here we focus on tables.

-- Leads
CREATE POLICY "Users can view leads in their organization" ON public.leads FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert leads in their organization" ON public.leads FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update leads in their organization" ON public.leads FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete leads in their organization" ON public.leads FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- Products
CREATE POLICY "Users can view products in their organization" ON public.products FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert products in their organization" ON public.products FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update products in their organization" ON public.products FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete products in their organization" ON public.products FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- Events
CREATE POLICY "Users can view events in their organization" ON public.events FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert events in their organization" ON public.events FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update events in their organization" ON public.events FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete events in their organization" ON public.events FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- Sales
CREATE POLICY "Users can view sales in their organization" ON public.sales FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert sales in their organization" ON public.sales FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update sales in their organization" ON public.sales FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete sales in their organization" ON public.sales FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- Lead Events
CREATE POLICY "Users can view lead_events in their organization" ON public.lead_events FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert lead_events in their organization" ON public.lead_events FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update lead_events in their organization" ON public.lead_events FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete lead_events in their organization" ON public.lead_events FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- Interactions
CREATE POLICY "Users can view interactions in their organization" ON public.interactions FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert interactions in their organization" ON public.interactions FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update interactions in their organization" ON public.interactions FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete interactions in their organization" ON public.interactions FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- Expenses
CREATE POLICY "Users can view expenses in their organization" ON public.expenses FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert expenses in their organization" ON public.expenses FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update expenses in their organization" ON public.expenses FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete expenses in their organization" ON public.expenses FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- Revenues
CREATE POLICY "Users can view revenues in their organization" ON public.revenues FOR SELECT TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can insert revenues in their organization" ON public.revenues FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can update revenues in their organization" ON public.revenues FOR UPDATE TO authenticated USING (organization_id = public.get_auth_organization_id());
CREATE POLICY "Users can delete revenues in their organization" ON public.revenues FOR DELETE TO authenticated USING (organization_id = public.get_auth_organization_id());

-- 7. Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    org_id uuid;
BEGIN
    -- For now, assign everyone to the default 'Venditus' organization
    -- In a real multi-tenant onboarding, we might create a new org here
    -- or look up an invite code.
    
    -- Check if it's the specific admin user (legacy behavior)
    -- We'll keep the admin assignment but ensure they get an org.
    
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'venditus' LIMIT 1;
    
    -- If no default org exists (shouldn't happen due to migration), create one
    IF org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug) VALUES ('Venditus', 'venditus')
        RETURNING id INTO org_id;
    END IF;

    INSERT INTO public.profiles (user_id, email, name, organization_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        org_id
    );
  
    -- If this is matheus.silva.sg7@gmail.com, make them admin
    IF NEW.email = 'matheus.silva.sg7@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role, organization_id)
        VALUES (NEW.id, 'admin', org_id);
    ELSE
        -- Default role for new users? Maybe 'somente_leitura' or nothing?
        -- For now, let's not auto-assign role unless specified, to match previous behavior
        NULL;
    END IF;
  
  RETURN NEW;
END;
$$;
