-- ============================================================================
-- VENDITUS - Database Setup Script
-- ============================================================================
-- Este arquivo consolida todas as migrations do sistema Venditus
-- Gerado automaticamente em: 2026-02-03 15:49:33
-- 
-- INSTRUÃ‡Ã•ES:
-- 1. Copie TODO o conteÃºdo deste arquivo
-- 2. Acesse o SQL Editor do Supabase
-- 3. Cole e execute (clique em "Run")
-- ============================================================================


-- ============================================================================
-- Migration 1/18: 20251126203502_remix_migration_from_pg_dump.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    event_date date NOT NULL,
    location text,
    capacity integer DEFAULT 0,
    leads_count integer DEFAULT 0,
    confirmed_count integer DEFAULT 0,
    attended_count integer DEFAULT 0,
    negotiation_count integer DEFAULT 0,
    purchased_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    interaction_type text NOT NULL,
    interaction_date timestamp with time zone DEFAULT now(),
    description text NOT NULL,
    outcome text,
    next_action text,
    next_action_date date,
    created_by text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT interactions_interaction_type_check CHECK ((interaction_type = ANY (ARRAY['call'::text, 'email'::text, 'meeting'::text, 'whatsapp'::text, 'event'::text, 'sale'::text, 'follow_up'::text, 'other'::text])))
);


--
-- Name: lead_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    event_id uuid NOT NULL,
    status text DEFAULT 'invited'::text,
    registered_at timestamp with time zone DEFAULT now(),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT lead_events_status_check CHECK ((status = ANY (ARRAY['invited'::text, 'confirmed'::text, 'attended'::text, 'no_show'::text, 'cancelled'::text])))
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    status text DEFAULT 'lead'::text NOT NULL,
    event_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    product_id uuid NOT NULL,
    sold_value numeric DEFAULT 0 NOT NULL,
    outstanding_value numeric DEFAULT 0 NOT NULL,
    net_value numeric DEFAULT 0 NOT NULL,
    sale_date date DEFAULT CURRENT_DATE NOT NULL,
    expected_payment_date date,
    paid_date date,
    payment_status text DEFAULT 'pending'::text,
    seller_name text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT sales_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'partial'::text, 'paid'::text])))
);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: interactions interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_pkey PRIMARY KEY (id);


--
-- Name: lead_events lead_events_lead_id_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_events
    ADD CONSTRAINT lead_events_lead_id_event_id_key UNIQUE (lead_id, event_id);


--
-- Name: lead_events lead_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_events
    ADD CONSTRAINT lead_events_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: idx_interactions_interaction_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_interaction_date ON public.interactions USING btree (interaction_date);


--
-- Name: idx_interactions_lead_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_lead_id ON public.interactions USING btree (lead_id);


--
-- Name: idx_lead_events_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lead_events_event_id ON public.lead_events USING btree (event_id);


--
-- Name: idx_lead_events_lead_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lead_events_lead_id ON public.lead_events USING btree (lead_id);


--
-- Name: idx_lead_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lead_events_status ON public.lead_events USING btree (status);


--
-- Name: idx_sales_expected_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_expected_payment_date ON public.sales USING btree (expected_payment_date);


--
-- Name: idx_sales_lead_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_lead_id ON public.sales USING btree (lead_id);


--
-- Name: idx_sales_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_payment_status ON public.sales USING btree (payment_status);


--
-- Name: idx_sales_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_product_id ON public.sales USING btree (product_id);


--
-- Name: idx_sales_sale_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_sale_date ON public.sales USING btree (sale_date);


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: interactions update_interactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON public.interactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lead_events update_lead_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lead_events_updated_at BEFORE UPDATE ON public.lead_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales update_sales_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: interactions interactions_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: lead_events lead_events_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_events
    ADD CONSTRAINT lead_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: lead_events lead_events_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_events
    ADD CONSTRAINT lead_events_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: leads leads_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: sales sales_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: sales sales_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: events Authenticated users can delete events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete events" ON public.events FOR DELETE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: interactions Authenticated users can delete interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete interactions" ON public.interactions FOR DELETE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: lead_events Authenticated users can delete lead_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete lead_events" ON public.lead_events FOR DELETE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: leads Authenticated users can delete leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete leads" ON public.leads FOR DELETE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: products Authenticated users can delete products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: sales Authenticated users can delete sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete sales" ON public.sales FOR DELETE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: events Authenticated users can insert events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: interactions Authenticated users can insert interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert interactions" ON public.interactions FOR INSERT TO authenticated WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: lead_events Authenticated users can insert lead_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert lead_events" ON public.lead_events FOR INSERT TO authenticated WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: leads Authenticated users can insert leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: products Authenticated users can insert products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: sales Authenticated users can insert sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: events Authenticated users can update events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update events" ON public.events FOR UPDATE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: interactions Authenticated users can update interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update interactions" ON public.interactions FOR UPDATE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: lead_events Authenticated users can update lead_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update lead_events" ON public.lead_events FOR UPDATE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: leads Authenticated users can update leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: products Authenticated users can update products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: sales Authenticated users can update sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update sales" ON public.sales FOR UPDATE TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: events Authenticated users can view events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view events" ON public.events FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: interactions Authenticated users can view interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view interactions" ON public.interactions FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: lead_events Authenticated users can view lead_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view lead_events" ON public.lead_events FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: leads Authenticated users can view leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: products Authenticated users can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: sales Authenticated users can view sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: interactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

--
-- Name: lead_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




-- ============================================================================
-- Migration 2/18: 20251126205001_013caad5-0361-4959-9bcf-ac2991c4d919.sql
-- ============================================================================

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

-- ============================================================================
-- Migration 3/18: 20251126205734_d23c0d90-fcac-4838-8c02-04ad002463c0.sql
-- ============================================================================

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

-- ============================================================================
-- Migration 4/18: 20251126231921_20b33a19-cc37-4faf-8f1d-2c2b1f7839c8.sql
-- ============================================================================

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

-- ============================================================================
-- Migration 5/18: 20251127162041_19eaece6-a44c-4f44-8dd2-1eb3ce505c29.sql
-- ============================================================================

-- Add cost field to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cost numeric DEFAULT 0;

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'comercial', 'financeiro', 'somente_leitura');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any of specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- If this is matheus.silva.sg7@gmail.com, make them admin
  IF NEW.email = 'matheus.silva.sg7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin role for existing matheus.silva.sg7@gmail.com user if exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'matheus.silva.sg7@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Insert profile if not exists
    INSERT INTO public.profiles (user_id, email, name)
    VALUES (admin_user_id, 'matheus.silva.sg7@gmail.com', 'Matheus Silva')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- Migration 6/18: 20251127181637_51aa0bf6-6912-4d20-87ca-d08e968044fc.sql
-- ============================================================================

-- Adicionar política para usuários verem sua própria role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- Migration 7/18: 20251127191312_87ba676d-cb69-476c-835d-be6e67a3e6ca.sql
-- ============================================================================

-- Atualizar políticas RLS para compartilhar dados entre usuários conforme permissões

-- ============= LEADS =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins and comercial can view leads"
ON public.leads FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins and comercial can insert leads"
ON public.leads FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins and comercial can update leads"
ON public.leads FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
);

CREATE POLICY "Admins and comercial can delete leads"
ON public.leads FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial']::app_role[])
);

-- ============= SALES =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON public.sales;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins, comercial and financeiro can view sales"
ON public.sales FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins, comercial and financeiro can insert sales"
ON public.sales FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins, comercial and financeiro can update sales"
ON public.sales FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
);

CREATE POLICY "Admins, comercial and financeiro can delete sales"
ON public.sales FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'comercial', 'financeiro']::app_role[])
);

-- ============= EXPENSES =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins and financeiro can view expenses"
ON public.expenses FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can insert expenses"
ON public.expenses FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can update expenses"
ON public.expenses FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);

CREATE POLICY "Admins and financeiro can delete expenses"
ON public.expenses FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);

-- ============= REVENUES =============
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can insert their own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can update their own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can delete their own revenues" ON public.revenues;

-- Criar novas políticas baseadas em roles
CREATE POLICY "Admins and financeiro can view revenues"
ON public.revenues FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  OR auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can insert revenues"
ON public.revenues FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
  AND auth.uid() = user_id
);

CREATE POLICY "Admins and financeiro can update revenues"
ON public.revenues FOR UPDATE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);

CREATE POLICY "Admins and financeiro can delete revenues"
ON public.revenues FOR DELETE
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'financeiro']::app_role[])
);

-- ============================================================================
-- Migration 8/18: 20251127193017_fea28382-b68e-4305-9915-33d45c0f74a2.sql
-- ============================================================================

-- Corrigir RLS de user_roles para evitar recursão e liberar acesso do admin

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- Migration 9/18: 20251127200522_67838900-698b-402e-ab75-4931f52d6d69.sql
-- ============================================================================

-- Adicionar campo notes (observações) na tabela events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ajustar políticas RLS para permitir visualização compartilhada de dados
-- Leads: todos os usuários com permissão podem ver todos os leads
DROP POLICY IF EXISTS "Admins and comercial can view leads" ON public.leads;
CREATE POLICY "Admins and comercial can view leads"
ON public.leads
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'comercial'::app_role])
);

-- Sales: todos os usuários com permissão podem ver todas as vendas
DROP POLICY IF EXISTS "Admins, comercial and financeiro can view sales" ON public.sales;
CREATE POLICY "Admins, comercial and financeiro can view sales"
ON public.sales
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'comercial'::app_role, 'financeiro'::app_role])
);

-- Revenues: todos os usuários com permissão podem ver todas as receitas
DROP POLICY IF EXISTS "Admins and financeiro can view revenues" ON public.revenues;
CREATE POLICY "Admins and financeiro can view revenues"
ON public.revenues
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'financeiro'::app_role])
);

-- Expenses: todos os usuários com permissão podem ver todas as despesas
DROP POLICY IF EXISTS "Admins and financeiro can view expenses" ON public.expenses;
CREATE POLICY "Admins and financeiro can view expenses"
ON public.expenses
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'financeiro'::app_role])
);

-- ============================================================================
-- Migration 10/18: 20251201134959_09514f0f-53a0-4fbe-bee0-d335940ba567.sql
-- ============================================================================

-- Add lead_source column to leads table
ALTER TABLE public.leads
ADD COLUMN lead_source TEXT NOT NULL DEFAULT 'Outros'
CHECK (lead_source IN ('Indicação', 'Palestra', 'Instagram', 'Google', 'Anúncio Pago', 'Evento Externo', 'Outros'));

-- ============================================================================
-- Migration 11/18: 20251201142920_4ee3b91a-f314-424c-83e6-e1508eaba162.sql
-- ============================================================================

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

-- ============================================================================
-- Migration 12/18: 20251201143229_9e462b7f-0d9a-491b-8308-8968c82f23a8.sql
-- ============================================================================

-- Remover o constraint antigo completamente
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Adicionar novo constraint com os valores corretos
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('Lead Novo', 'Cliente Ativo', 'Ex-Cliente'));

-- ============================================================================
-- Migration 13/18: 20251201143944_d4d48296-569c-4034-bd47-53f3fdf8e290.sql
-- ============================================================================

-- Apenas remover o constraint existente
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- ============================================================================
-- Migration 14/18: 20251201144142_3669cb9f-c714-48aa-adcc-b266bce0b2c1.sql
-- ============================================================================

-- Adicionar constraint com valores corretos (snake_case)
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('lead', 'cliente_ativo', 'ex_cliente'));

-- ============================================================================
-- Migration 15/18: 20251201152057_fb29ee79-ae01-4484-9edc-a65773bb92f5.sql
-- ============================================================================

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
);

-- ============================================================================
-- Migration 16/18: 20251201152142_5590d48a-b450-4e12-bdb6-c25f00d0ec7e.sql
-- ============================================================================

ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Migration 17/18: 20251201163947_23de7579-c3e6-45b9-8228-9de06b1aec25.sql
-- ============================================================================

ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Migration 18/18: 20251204213221_d7c03379-d4c0-4365-90ca-4d7d71f969a9.sql
-- ============================================================================

-- Add CPF and CNPJ fields to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Add payment method and installments fields to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS installments_count INTEGER DEFAULT 1;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS installments_status JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- Migration 19/19: MANUAL_MIGRATION_custom_dashboards_policies.sql
-- ============================================================================

-- IMPORTANTE: Execute este SQL manualmente no Supabase para adicionar as políticas de segurança
-- Vá em: Lovable Cloud (backend) -> Database -> SQL Editor
-- Cole este código e execute

-- Criar políticas RLS para custom_dashboards
CREATE POLICY "Users can view own or shared dashboards"
ON public.custom_dashboards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Users can insert own dashboards"
ON public.custom_dashboards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboards"
ON public.custom_dashboards
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dashboards"
ON public.custom_dashboards
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Adicionar trigger para updated_at
CREATE TRIGGER update_custom_dashboards_updated_at
  BEFORE UPDATE ON public.custom_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

