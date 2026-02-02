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


