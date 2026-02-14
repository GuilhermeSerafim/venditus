-- ============================================================================
-- Migration: Social Selling Engine & Mesa de Negócios
-- Description: Creates the scoring engine, business table, penalty automation,
--              and KPI views for the Venditus Social Selling module.
-- Author: Agente C (Backend & Automations Senior Engineer)
-- Date: 2026-02-14
-- ============================================================================

-- ============================================================================
-- 1. ENUM: situacao_negocio
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE public.situacao_negocio AS ENUM ('NEGOCIANDO', 'GANHO', 'PERDIDO');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. TABLE: mesa_negocios
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mesa_negocios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    responsavel_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
    empresa text NOT NULL,
    data_reuniao timestamp with time zone NOT NULL,
    compareceu boolean DEFAULT false,
    pix_compromisso boolean DEFAULT false,
    situacao public.situacao_negocio DEFAULT 'NEGOCIANDO',
    motivo_perda text,
    valor_negocio numeric(12,2) DEFAULT 0,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for mesa_negocios
CREATE INDEX IF NOT EXISTS idx_mesa_negocios_org ON public.mesa_negocios(organization_id);
CREATE INDEX IF NOT EXISTS idx_mesa_negocios_responsavel ON public.mesa_negocios(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_mesa_negocios_situacao ON public.mesa_negocios(situacao);
CREATE INDEX IF NOT EXISTS idx_mesa_negocios_data_reuniao ON public.mesa_negocios(data_reuniao);

-- ============================================================================
-- 3. TABLE: score_config (modular weights — Admin adjustable)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.score_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    event_type text NOT NULL,
    points integer NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(organization_id, event_type)
);

-- ============================================================================
-- 4. TABLE: score_events (ledger / audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.score_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    event_type text NOT NULL,
    points integer NOT NULL,
    reference_id uuid,
    reference_table text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Indexes for score_events (ranking queries must be fast)
CREATE INDEX IF NOT EXISTS idx_score_events_user ON public.score_events(user_id);
CREATE INDEX IF NOT EXISTS idx_score_events_org ON public.score_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_score_events_type ON public.score_events(event_type);
CREATE INDEX IF NOT EXISTS idx_score_events_created ON public.score_events(created_at);

-- ============================================================================
-- 5. TABLE: user_scores (cached totals — updated by trigger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_scores (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    total_score integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_scores_org ON public.user_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_ranking ON public.user_scores(organization_id, total_score DESC);

-- ============================================================================
-- 6. TABLE: user_daily_activities (Social Selling daily tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_daily_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    activity_date date NOT NULL DEFAULT CURRENT_DATE,
    posts_count integer DEFAULT 0,
    interactions_count integer DEFAULT 0,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_activities_user ON public.user_daily_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_org ON public.user_daily_activities(organization_id);

-- ============================================================================
-- 7. SEED: Default score_config for all existing organizations
-- ============================================================================
INSERT INTO public.score_config (organization_id, event_type, points, description)
SELECT o.id, v.event_type, v.points, v.description
FROM public.organizations o
CROSS JOIN (VALUES
    ('agendamento',       20,  'Pontos por agendar reunião na mesa de negócios'),
    ('comparecimento',    30,  'Pontos por comparecimento confirmado na reunião'),
    ('fechamento',       100,  'Pontos por fechar negócio (situação GANHO)'),
    ('daily_activity',     5,  'Pontos por completar atividades diárias de social selling'),
    ('vacuo_24h',        -50,  'Penalidade por não responder lead em 24h'),
    ('mensagem_generica', -20, 'Penalidade por mensagem genérica/copy-paste')
) AS v(event_type, points, description)
ON CONFLICT (organization_id, event_type) DO NOTHING;

-- ============================================================================
-- 8. HELPER FUNCTION: Get score points from config
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_score_points(
    _org_id uuid,
    _event_type text
) RETURNS integer
LANGUAGE sql STABLE
AS $$
    SELECT COALESCE(
        (SELECT points FROM public.score_config
         WHERE organization_id = _org_id
           AND event_type = _event_type
           AND is_active = true),
        0
    );
$$;

-- ============================================================================
-- 9. FUNCTION: Record score event and update cache
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_score_event(
    _user_id uuid,
    _org_id uuid,
    _event_type text,
    _reference_id uuid DEFAULT NULL,
    _reference_table text DEFAULT NULL,
    _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _points integer;
BEGIN
    -- Get points from config
    _points := public.get_score_points(_org_id, _event_type);

    -- Skip if event type is not configured or has 0 points
    IF _points = 0 THEN
        RETURN;
    END IF;

    -- Insert audit event
    INSERT INTO public.score_events (user_id, organization_id, event_type, points, reference_id, reference_table, metadata)
    VALUES (_user_id, _org_id, _event_type, _points, _reference_id, _reference_table, _metadata);

    -- Upsert cached score
    INSERT INTO public.user_scores (user_id, organization_id, total_score, updated_at)
    VALUES (_user_id, _org_id, _points, now())
    ON CONFLICT (user_id) DO UPDATE
    SET total_score = public.user_scores.total_score + _points,
        updated_at = now();
END;
$$;

-- ============================================================================
-- 10. TRIGGER FUNCTION: Mesa de Negócios INSERT (+agendamento)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_score_mesa_insert()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.record_score_event(
        NEW.responsavel_id,
        NEW.organization_id,
        'agendamento',
        NEW.id,
        'mesa_negocios',
        jsonb_build_object('empresa', NEW.empresa, 'data_reuniao', NEW.data_reuniao)
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mesa_negocios_insert ON public.mesa_negocios;
CREATE TRIGGER trg_mesa_negocios_insert
    AFTER INSERT ON public.mesa_negocios
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_score_mesa_insert();

-- ============================================================================
-- 11. TRIGGER FUNCTION: Mesa de Negócios UPDATE (comparecimento + fechamento)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_score_mesa_update()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Comparecimento: +30 when compareceu changes from false to true
    IF NEW.compareceu = true AND (OLD.compareceu IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(
            NEW.responsavel_id,
            NEW.organization_id,
            'comparecimento',
            NEW.id,
            'mesa_negocios',
            jsonb_build_object('empresa', NEW.empresa)
        );
    END IF;

    -- Fechamento: +100 when situacao changes to GANHO
    IF NEW.situacao = 'GANHO' AND (OLD.situacao IS DISTINCT FROM 'GANHO') THEN
        PERFORM public.record_score_event(
            NEW.responsavel_id,
            NEW.organization_id,
            'fechamento',
            NEW.id,
            'mesa_negocios',
            jsonb_build_object('empresa', NEW.empresa, 'valor', NEW.valor_negocio)
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mesa_negocios_update ON public.mesa_negocios;
CREATE TRIGGER trg_mesa_negocios_update
    AFTER UPDATE ON public.mesa_negocios
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_score_mesa_update();

-- ============================================================================
-- 12. TRIGGER FUNCTION: Daily Activity completion (+5 pts)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_score_daily_activity()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only score when activity is marked as completed
    IF NEW.completed = true AND (OLD IS NULL OR OLD.completed IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(
            NEW.user_id,
            NEW.organization_id,
            'daily_activity',
            NEW.id,
            'user_daily_activities',
            jsonb_build_object('activity_date', NEW.activity_date, 'posts', NEW.posts_count, 'interactions', NEW.interactions_count)
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_daily_activity_insert ON public.user_daily_activities;
CREATE TRIGGER trg_daily_activity_insert
    AFTER INSERT ON public.user_daily_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_score_daily_activity();

DROP TRIGGER IF EXISTS trg_daily_activity_update ON public.user_daily_activities;
CREATE TRIGGER trg_daily_activity_update
    AFTER UPDATE ON public.user_daily_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_score_daily_activity();

-- ============================================================================
-- 13. FUNCTION: Penalty — Vácuo 24h (leads without interaction)
-- Designed to be called by pg_cron or Edge Function cron
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_check_vacuo_leads()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
BEGIN
    -- Find leads created > 24h ago with NO interactions AND not yet penalized
    FOR r IN
        SELECT
            l.id AS lead_id,
            l.user_id,
            l.organization_id,
            l.name AS lead_name
        FROM public.leads l
        WHERE l.created_at < (now() - INTERVAL '24 hours')
          AND NOT EXISTS (
              SELECT 1 FROM public.interactions i WHERE i.lead_id = l.id
          )
          AND NOT EXISTS (
              -- Don't penalize twice for the same lead
              SELECT 1 FROM public.score_events se
              WHERE se.reference_id = l.id
                AND se.reference_table = 'leads'
                AND se.event_type = 'vacuo_24h'
          )
    LOOP
        PERFORM public.record_score_event(
            r.user_id,
            r.organization_id,
            'vacuo_24h',
            r.lead_id,
            'leads',
            jsonb_build_object('lead_name', r.lead_name, 'reason', 'Sem interação em 24h')
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- 14. TRIGGER FUNCTION: Penalty — Mensagem genérica (repeated text)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_check_mensagem_generica()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _hash text;
    _count integer;
    _created_by_user uuid;
BEGIN
    -- Get the user who created the interaction
    _created_by_user := (
        SELECT p.user_id FROM public.profiles p WHERE p.email = NEW.created_by LIMIT 1
    );

    -- If we can't identify the user, skip
    IF _created_by_user IS NULL THEN
        RETURN NEW;
    END IF;

    -- Hash the description
    _hash := md5(lower(trim(NEW.description)));

    -- Count how many times this exact hash was used by the same user this month
    SELECT COUNT(*) INTO _count
    FROM public.interactions i
    WHERE md5(lower(trim(i.description))) = _hash
      AND i.created_by = NEW.created_by
      AND i.id != NEW.id
      AND i.created_at >= date_trunc('month', now())
      AND i.organization_id = NEW.organization_id;

    -- If 3+ repetitions (this is the 3rd+ time), penalize
    -- Only penalize once per occurrence (check if already penalized for this interaction)
    IF _count >= 2 THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.score_events
            WHERE reference_id = NEW.id
              AND event_type = 'mensagem_generica'
        ) THEN
            PERFORM public.record_score_event(
                _created_by_user,
                NEW.organization_id,
                'mensagem_generica',
                NEW.id,
                'interactions',
                jsonb_build_object('hash', _hash, 'repetitions', _count + 1)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_mensagem_generica ON public.interactions;
CREATE TRIGGER trg_check_mensagem_generica
    AFTER INSERT ON public.interactions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_check_mensagem_generica();

-- ============================================================================
-- 15. VIEW: vw_negocio_kpi (for Analytics Agent / ERP)
-- ============================================================================
CREATE OR REPLACE VIEW public.vw_negocio_kpi AS
SELECT
    mn.organization_id,
    mn.responsavel_id,
    p.name AS responsavel_name,
    mn.empresa,
    mn.valor_negocio,
    mn.situacao::text AS situacao,
    mn.data_reuniao,
    mn.compareceu,
    mn.pix_compromisso,
    mn.motivo_perda,
    COALESCE(us.total_score, 0) AS total_score,
    mn.created_at
FROM public.mesa_negocios mn
JOIN public.profiles p ON p.user_id = mn.responsavel_id
LEFT JOIN public.user_scores us ON us.user_id = mn.responsavel_id
WHERE mn.situacao = 'GANHO';

-- ============================================================================
-- 16. RLS POLICIES
-- ============================================================================

-- mesa_negocios
ALTER TABLE public.mesa_negocios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mesa_negocios in their organization"
    ON public.mesa_negocios FOR SELECT TO authenticated
    USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can insert mesa_negocios in their organization"
    ON public.mesa_negocios FOR INSERT TO authenticated
    WITH CHECK (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can update mesa_negocios in their organization"
    ON public.mesa_negocios FOR UPDATE TO authenticated
    USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can delete mesa_negocios in their organization"
    ON public.mesa_negocios FOR DELETE TO authenticated
    USING (organization_id = public.get_auth_organization_id());

-- score_config
ALTER TABLE public.score_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view score_config in their organization"
    ON public.score_config FOR SELECT TO authenticated
    USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Admins can manage score_config"
    ON public.score_config FOR ALL TO authenticated
    USING (
        organization_id = public.get_auth_organization_id()
        AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- score_events
ALTER TABLE public.score_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view score_events in their organization"
    ON public.score_events FOR SELECT TO authenticated
    USING (organization_id = public.get_auth_organization_id());

-- user_scores
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view user_scores in their organization"
    ON public.user_scores FOR SELECT TO authenticated
    USING (organization_id = public.get_auth_organization_id());

-- user_daily_activities
ALTER TABLE public.user_daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view daily_activities in their organization"
    ON public.user_daily_activities FOR SELECT TO authenticated
    USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can insert their own daily_activities"
    ON public.user_daily_activities FOR INSERT TO authenticated
    WITH CHECK (
        organization_id = public.get_auth_organization_id()
        AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own daily_activities"
    ON public.user_daily_activities FOR UPDATE TO authenticated
    USING (
        organization_id = public.get_auth_organization_id()
        AND user_id = auth.uid()
    );

-- ============================================================================
-- 17. UPDATED_AT TRIGGERS (reuse existing function)
-- ============================================================================
CREATE TRIGGER update_mesa_negocios_updated_at
    BEFORE UPDATE ON public.mesa_negocios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_score_config_updated_at
    BEFORE UPDATE ON public.score_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
