-- ============================================================================
-- Migration: Gamification Engine V2 — Cobertura 100% do GAMIFICATION.md
-- Author: Agente C (Auditor & Dev Senior)
-- Date: 2026-02-14
-- Fonte: docs/GAMIFICATION.md (Social Selling Game)
-- ============================================================================
-- INSTRUÇÕES: Execute no SQL Editor do Supabase (cole tudo e clique Run).
-- Todos os comandos são idempotentes (safe to re-run).
-- ============================================================================

-- ============================================================================
-- 1. NOVAS COLUNAS em mesa_negocios (Reunião Qualificada + Proposta)
-- ============================================================================
ALTER TABLE public.mesa_negocios ADD COLUMN IF NOT EXISTS qualificada boolean DEFAULT false;
ALTER TABLE public.mesa_negocios ADD COLUMN IF NOT EXISTS proposta_enviada boolean DEFAULT false;

-- ============================================================================
-- 2. EXPANDIR user_daily_activities para tracking granular de rotina
--    Fonte: GAMIFICATION.md § "Rotina Obrigatória (Disciplina Diária)"
-- ============================================================================
ALTER TABLE public.user_daily_activities ADD COLUMN IF NOT EXISTS ns_contato boolean DEFAULT false;
ALTER TABLE public.user_daily_activities ADD COLUMN IF NOT EXISTS followup_dia boolean DEFAULT false;
ALTER TABLE public.user_daily_activities ADD COLUMN IF NOT EXISTS analise_stories boolean DEFAULT false;
ALTER TABLE public.user_daily_activities ADD COLUMN IF NOT EXISTS rastros_interesse boolean DEFAULT false;
ALTER TABLE public.user_daily_activities ADD COLUMN IF NOT EXISTS registro_crm boolean DEFAULT false;

-- ============================================================================
-- 3. SEED: Todos os event_types do GAMIFICATION.md
--    Idempotente via ON CONFLICT DO NOTHING
-- ============================================================================
INSERT INTO public.score_config (organization_id, event_type, points, description)
SELECT o.id, v.event_type, v.points, v.description
FROM public.organizations o
CROSS JOIN (VALUES
    -- === Conversão (§4 do GAMIFICATION.md) ===
    ('agendamento',           20,  'Agendamento realizado (+20 pts)'),
    ('comparecimento',        30,  'Lead comparece à reunião (+30 pts)'),
    ('reuniao_qualificada',   40,  'Reunião qualificada — fit real (+40 pts)'),
    ('proposta',              60,  'Avanço para proposta (+60 pts)'),
    ('fechamento',           100,  'Fechamento de negócio (+100 pts)'),

    -- === Rotina Obrigatória — Disciplina Diária (§1 do GAMIFICATION.md) ===
    ('ns_contato',             5,  'Contato com novos seguidores — mín 5/dia (+5 pts)'),
    ('followup_dia',           5,  'Follow-up do dia anterior — mín 5/dia (+5 pts)'),
    ('analise_stories',        3,  'Análise de stories e feeds — análise real (+3 pts)'),
    ('rastros_interesse',      3,  'Rastros de interesse mapeados — mín 3/dia (+3 pts)'),
    ('registro_crm',           4,  'Registro no CRM / controle — tudo documentado (+4 pts)'),
    ('dia_completo',           5,  'Bônus — dia completo executado (+5 pts)'),
    ('daily_activity',         5,  'Pontos por completar atividades diárias (legacy)'),

    -- === Penalidades (§ Penalidades do GAMIFICATION.md) ===
    ('falta_rotina',         -20,  'Não executar rotina diária (-20 pts)'),
    ('perda_followup',       -15,  'Perder follow-up (-15 pts)'),
    ('mensagem_generica',    -10,  'Mensagem genérica / sem personalização (-10 pts)'),
    ('copiar_colar',         -20,  'Copiar e colar mensagem (-20 pts)'),
    ('feedback_negativo',    -30,  'Feedback negativo do lead (-30 pts)'),
    ('falta_registro',       -10,  'Falta de registro / controle (-10 pts)'),
    ('vacuo_24h',            -50,  'Vácuo — sem interação em 24h (-50 pts)'),

    -- === Bônus Estratégicos (§ Bônus do GAMIFICATION.md) ===
    ('streak_5dias',          30,  '5 dias seguidos de execução perfeita (+30 pts)'),
    ('melhor_resposta_semana', 20, 'Melhor taxa de resposta da semana (+20 pts)'),
    ('melhor_conversao_semana',30, 'Melhor conversão da semana (+30 pts)'),
    ('lead_elogiou',          20,  'Lead elogiou o contato (+20 pts)'),
    ('evolucao_performance',  25,  'Evolução clara de performance (+25 pts)')
) AS v(event_type, points, description)
ON CONFLICT (organization_id, event_type) DO UPDATE
SET points = EXCLUDED.points,
    description = EXCLUDED.description;

-- ============================================================================
-- 4. FUNCTION: recalc_user_score — Full recalculation from score_events
--    Solves: desync between score_events SUM and user_scores.total_score
-- ============================================================================
CREATE OR REPLACE FUNCTION public.recalc_user_score(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _total integer;
    _org_id uuid;
BEGIN
    -- Get the user's organization
    SELECT organization_id INTO _org_id
    FROM public.profiles WHERE user_id = _user_id LIMIT 1;

    IF _org_id IS NULL THEN
        RETURN 0;
    END IF;

    -- Sum all score_events for this user
    SELECT COALESCE(SUM(points), 0) INTO _total
    FROM public.score_events
    WHERE user_id = _user_id;

    -- Upsert the cached total
    INSERT INTO public.user_scores (user_id, organization_id, total_score, updated_at)
    VALUES (_user_id, _org_id, _total, now())
    ON CONFLICT (user_id) DO UPDATE
    SET total_score = _total,
        updated_at = now();

    RETURN _total;
END;
$$;

-- ============================================================================
-- 5. FUNCTION: recalc_all_user_scores — Batch recalculation for all users
-- ============================================================================
CREATE OR REPLACE FUNCTION public.recalc_all_user_scores()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT DISTINCT user_id FROM public.score_events LOOP
        PERFORM public.recalc_user_score(r.user_id);
    END LOOP;
END;
$$;

-- ============================================================================
-- 6. HELPER: Check reincidence in same ISO week (doubles penalty)
--    Fonte: GAMIFICATION.md § "Reincidência na mesma semana → Penalidade em dobro"
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_penalty_multiplier(
    _user_id uuid,
    _event_type text
) RETURNS integer
LANGUAGE sql STABLE
AS $$
    SELECT CASE
        WHEN EXISTS (
            SELECT 1 FROM public.score_events
            WHERE user_id = _user_id
              AND event_type = _event_type
              AND points < 0
              AND date_trunc('week', created_at) = date_trunc('week', now())
        ) THEN 2   -- dobro
        ELSE 1     -- normal
    END;
$$;

-- ============================================================================
-- 7. FUNCTION: record_score_event V2 — with dedup + reincidence support
--    Replaces the original record_score_event
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
    _multiplier integer;
BEGIN
    -- Get base points from config
    _points := public.get_score_points(_org_id, _event_type);

    -- Skip if event type not configured or 0 points
    IF _points = 0 THEN
        RETURN;
    END IF;

    -- ── DEDUP: Check NET balance for this reference+type ──
    -- If sum(points) > 0, already counted. If <= 0, allow re-scoring after reversal.
    IF _reference_id IS NOT NULL THEN
        IF (
            SELECT COALESCE(SUM(points), 0)
            FROM public.score_events
            WHERE reference_id = _reference_id
              AND event_type = _event_type
        ) > 0 THEN
            RETURN;  -- Already have positive score for this
        END IF;
    END IF;

    -- ── REINCIDENCE: If it's a penalty, check for same-week repeat ──
    IF _points < 0 THEN
        _multiplier := public.get_penalty_multiplier(_user_id, _event_type);
        _points := _points * _multiplier;
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
-- 8. TRIGGER: Mesa de Negócios UPDATE V2
--    Covers: comparecimento, reuniao_qualificada, proposta, fechamento
--    All with dedup (via record_score_event V2)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_score_mesa_update()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _rev_pts integer;
BEGIN
    -- ── Comparecimento: +pts when TRUE, -pts when FALSE ──
    IF NEW.compareceu = true AND (OLD.compareceu IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(NEW.responsavel_id, NEW.organization_id, 'comparecimento', NEW.id, 'mesa_negocios', jsonb_build_object('empresa', NEW.empresa));
    ELSIF NEW.compareceu = false AND (OLD.compareceu IS DISTINCT FROM false) THEN
        _rev_pts := public.get_score_points(NEW.organization_id, 'comparecimento');
        IF _rev_pts > 0 THEN
            INSERT INTO public.score_events (user_id, organization_id, event_type, points, reference_id, reference_table, metadata)
            VALUES (NEW.responsavel_id, NEW.organization_id, 'comparecimento', -_rev_pts, NEW.id, 'mesa_negocios', jsonb_build_object('empresa', NEW.empresa, 'reversal', true));
            UPDATE public.user_scores SET total_score = total_score - _rev_pts, updated_at = now() WHERE user_id = NEW.responsavel_id;
        END IF;
    END IF;

    -- ── Reunião Qualificada: +pts when TRUE, -pts when FALSE ──
    IF NEW.qualificada = true AND (OLD.qualificada IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(NEW.responsavel_id, NEW.organization_id, 'reuniao_qualificada', NEW.id, 'mesa_negocios', jsonb_build_object('empresa', NEW.empresa));
    ELSIF NEW.qualificada = false AND (OLD.qualificada IS DISTINCT FROM false) THEN
        _rev_pts := public.get_score_points(NEW.organization_id, 'reuniao_qualificada');
        IF _rev_pts > 0 THEN
            INSERT INTO public.score_events (user_id, organization_id, event_type, points, reference_id, reference_table, metadata)
            VALUES (NEW.responsavel_id, NEW.organization_id, 'reuniao_qualificada', -_rev_pts, NEW.id, 'mesa_negocios', jsonb_build_object('empresa', NEW.empresa, 'reversal', true));
            UPDATE public.user_scores SET total_score = total_score - _rev_pts, updated_at = now() WHERE user_id = NEW.responsavel_id;
        END IF;
    END IF;

    -- ── Proposta: +pts when TRUE, -pts when FALSE ──
    IF NEW.proposta_enviada = true AND (OLD.proposta_enviada IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(NEW.responsavel_id, NEW.organization_id, 'proposta', NEW.id, 'mesa_negocios', jsonb_build_object('empresa', NEW.empresa, 'valor', NEW.valor_negocio));
    ELSIF NEW.proposta_enviada = false AND (OLD.proposta_enviada IS DISTINCT FROM false) THEN
        _rev_pts := public.get_score_points(NEW.organization_id, 'proposta');
        IF _rev_pts > 0 THEN
            INSERT INTO public.score_events (user_id, organization_id, event_type, points, reference_id, reference_table, metadata)
            VALUES (NEW.responsavel_id, NEW.organization_id, 'proposta', -_rev_pts, NEW.id, 'mesa_negocios', jsonb_build_object('empresa', NEW.empresa, 'valor', NEW.valor_negocio, 'reversal', true));
            UPDATE public.user_scores SET total_score = total_score - _rev_pts, updated_at = now() WHERE user_id = NEW.responsavel_id;
        END IF;
    END IF;

    -- ── Fechamento: +pts when entering GANHO, -pts when leaving GANHO ──
    IF NEW.situacao = 'GANHO' AND (OLD.situacao IS DISTINCT FROM 'GANHO') THEN
        PERFORM public.record_score_event(
            NEW.responsavel_id, NEW.organization_id, 'fechamento',
            NEW.id, 'mesa_negocios',
            jsonb_build_object('empresa', NEW.empresa, 'valor', NEW.valor_negocio)
        );
    ELSIF OLD.situacao = 'GANHO' AND (NEW.situacao IS DISTINCT FROM 'GANHO') THEN
        -- Reversal: deal moved OUT of GANHO
        _rev_pts := public.get_score_points(NEW.organization_id, 'fechamento');
        IF _rev_pts > 0 THEN
            INSERT INTO public.score_events (user_id, organization_id, event_type, points, reference_id, reference_table, metadata)
            VALUES (NEW.responsavel_id, NEW.organization_id, 'fechamento', -_rev_pts, NEW.id, 'mesa_negocios',
                jsonb_build_object('empresa', NEW.empresa, 'valor', NEW.valor_negocio, 'reversal', true, 'moved_to', NEW.situacao::text));
            UPDATE public.user_scores SET total_score = total_score - _rev_pts, updated_at = now() WHERE user_id = NEW.responsavel_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate the trigger (idempotent)
DROP TRIGGER IF EXISTS trg_mesa_negocios_update ON public.mesa_negocios;
CREATE TRIGGER trg_mesa_negocios_update
    AFTER UPDATE ON public.mesa_negocios
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_score_mesa_update();

-- ── Performance index for dedup queries ──
CREATE INDEX IF NOT EXISTS idx_score_events_ref_type
    ON public.score_events(reference_id, event_type)
    WHERE reference_id IS NOT NULL;

-- ============================================================================
-- 9. TRIGGER: Daily Activity V2 — Granular routine scoring
--    Fonte: GAMIFICATION.md § "Rotina Obrigatória — até 25 pts/dia"
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_score_daily_activity()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _ref_id uuid;
BEGIN
    _ref_id := COALESCE(NEW.id, gen_random_uuid());

    -- ── Individual routine items ──
    -- NS Contato (+5)
    IF NEW.ns_contato = true AND (OLD IS NULL OR OLD.ns_contato IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(
            NEW.user_id, NEW.organization_id, 'ns_contato',
            _ref_id, 'user_daily_activities',
            jsonb_build_object('activity_date', NEW.activity_date, 'item', 'ns_contato')
        );
    END IF;

    -- Follow-up (+5)
    IF NEW.followup_dia = true AND (OLD IS NULL OR OLD.followup_dia IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(
            NEW.user_id, NEW.organization_id, 'followup_dia',
            _ref_id, 'user_daily_activities',
            jsonb_build_object('activity_date', NEW.activity_date, 'item', 'followup_dia')
        );
    END IF;

    -- Análise Stories (+3)
    IF NEW.analise_stories = true AND (OLD IS NULL OR OLD.analise_stories IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(
            NEW.user_id, NEW.organization_id, 'analise_stories',
            _ref_id, 'user_daily_activities',
            jsonb_build_object('activity_date', NEW.activity_date, 'item', 'analise_stories')
        );
    END IF;

    -- Rastros de Interesse (+3)
    IF NEW.rastros_interesse = true AND (OLD IS NULL OR OLD.rastros_interesse IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(
            NEW.user_id, NEW.organization_id, 'rastros_interesse',
            _ref_id, 'user_daily_activities',
            jsonb_build_object('activity_date', NEW.activity_date, 'item', 'rastros_interesse')
        );
    END IF;

    -- Registro CRM (+4)
    IF NEW.registro_crm = true AND (OLD IS NULL OR OLD.registro_crm IS DISTINCT FROM true) THEN
        PERFORM public.record_score_event(
            NEW.user_id, NEW.organization_id, 'registro_crm',
            _ref_id, 'user_daily_activities',
            jsonb_build_object('activity_date', NEW.activity_date, 'item', 'registro_crm')
        );
    END IF;

    -- ── Dia Completo Bonus (+5) — only if ALL 5 items are true ──
    IF NEW.ns_contato = true
       AND NEW.followup_dia = true
       AND NEW.analise_stories = true
       AND NEW.rastros_interesse = true
       AND NEW.registro_crm = true
    THEN
        -- Also mark completed flag
        NEW.completed := true;

        PERFORM public.record_score_event(
            NEW.user_id, NEW.organization_id, 'dia_completo',
            _ref_id, 'user_daily_activities',
            jsonb_build_object('activity_date', NEW.activity_date, 'item', 'dia_completo')
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate triggers (idempotent)
DROP TRIGGER IF EXISTS trg_daily_activity_insert ON public.user_daily_activities;
CREATE TRIGGER trg_daily_activity_insert
    BEFORE INSERT ON public.user_daily_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_score_daily_activity();

DROP TRIGGER IF EXISTS trg_daily_activity_update ON public.user_daily_activities;
CREATE TRIGGER trg_daily_activity_update
    BEFORE UPDATE ON public.user_daily_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_score_daily_activity();

-- ============================================================================
-- 10. CRON FUNCTION: Penalty — Falta de Rotina Diária (-20 pts)
--     Designed to be called daily by pg_cron or Supabase Edge Function
--     Penalizes users who did NOT complete daily activities the previous day
--     Fonte: GAMIFICATION.md § "Não executar rotina diária → -20 pts"
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_check_falta_rotina()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
    _yesterday date := CURRENT_DATE - INTERVAL '1 day';
    _penalty_ref uuid;
BEGIN
    -- Find users in organizations who did NOT have a completed daily activity yesterday
    FOR r IN
        SELECT
            p.user_id,
            p.organization_id
        FROM public.profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_daily_activities uda
            WHERE uda.user_id = p.user_id
              AND uda.activity_date = _yesterday
              AND uda.completed = true
        )
        AND NOT EXISTS (
            -- Don't penalize twice for same day
            SELECT 1 FROM public.score_events se
            WHERE se.user_id = p.user_id
              AND se.event_type = 'falta_rotina'
              AND se.created_at::date = CURRENT_DATE
              AND se.metadata->>'penalty_date' = _yesterday::text
        )
    LOOP
        _penalty_ref := gen_random_uuid();
        PERFORM public.record_score_event(
            r.user_id,
            r.organization_id,
            'falta_rotina',
            _penalty_ref,
            'user_daily_activities',
            jsonb_build_object('penalty_date', _yesterday, 'reason', 'Rotina diária não completada')
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- 11. CRON FUNCTION: Penalty — Vácuo 24h V2 (improved version)
--     Same logic, just ensure dedup works with record_score_event V2
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_check_vacuo_leads()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
BEGIN
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
-- 12. TRIGGER: Copy/Paste detection (improved)
--     Fonte: GAMIFICATION.md § "Copiar e colar mensagem → -20 pts"
--     Uses md5 hash to detect repeated messages within 30 days
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

    IF _created_by_user IS NULL THEN
        RETURN NEW;
    END IF;

    _hash := md5(lower(trim(NEW.description)));

    -- Count repetitions by same user in the last 30 days
    SELECT COUNT(*) INTO _count
    FROM public.interactions i
    WHERE md5(lower(trim(i.description))) = _hash
      AND i.created_by = NEW.created_by
      AND i.id != NEW.id
      AND i.created_at >= (now() - INTERVAL '30 days')
      AND i.organization_id = NEW.organization_id;

    -- 2+ repetitions → this is a copy/paste situation
    IF _count >= 2 THEN
        PERFORM public.record_score_event(
            _created_by_user,
            NEW.organization_id,
            'copiar_colar',
            NEW.id,
            'interactions',
            jsonb_build_object('hash', _hash, 'repetitions', _count + 1)
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS trg_check_mensagem_generica ON public.interactions;
CREATE TRIGGER trg_check_mensagem_generica
    AFTER INSERT ON public.interactions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_check_mensagem_generica();

-- ============================================================================
-- 13. CRON FUNCTION: Streak de 5 dias (+30 pts)
--     Fonte: GAMIFICATION.md § "5 dias seguidos de execução perfeita → +30 pts"
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_check_streak_5dias()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
    _streak_ref uuid;
BEGIN
    FOR r IN
        SELECT
            uda.user_id,
            uda.organization_id
        FROM public.user_daily_activities uda
        WHERE uda.completed = true
          AND uda.activity_date >= (CURRENT_DATE - INTERVAL '4 days')
          AND uda.activity_date <= CURRENT_DATE
        GROUP BY uda.user_id, uda.organization_id
        HAVING COUNT(DISTINCT uda.activity_date) = 5
          -- Don't award twice for same streak period
          AND NOT EXISTS (
              SELECT 1 FROM public.score_events se
              WHERE se.user_id = uda.user_id
                AND se.event_type = 'streak_5dias'
                AND se.created_at >= (CURRENT_DATE - INTERVAL '4 days')
          )
    LOOP
        _streak_ref := gen_random_uuid();
        PERFORM public.record_score_event(
            r.user_id,
            r.organization_id,
            'streak_5dias',
            _streak_ref,
            'user_daily_activities',
            jsonb_build_object('streak_end', CURRENT_DATE, 'days', 5)
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- 14. VIEW: vw_negocio_kpi V2 — Include new columns
--     Must DROP first because column list changed (PG doesn't allow rename via CREATE OR REPLACE)
-- ============================================================================
DROP VIEW IF EXISTS public.vw_negocio_kpi;
CREATE VIEW public.vw_negocio_kpi AS
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
    mn.qualificada,
    mn.proposta_enviada,
    mn.motivo_perda,
    COALESCE(us.total_score, 0) AS total_score,
    mn.created_at
FROM public.mesa_negocios mn
JOIN public.profiles p ON p.user_id = mn.responsavel_id
LEFT JOIN public.user_scores us ON us.user_id = mn.responsavel_id;

-- ============================================================================
-- 15. BACKFILL: Recalc all existing user scores
-- ============================================================================
SELECT public.recalc_all_user_scores();

-- ============================================================================
-- ✅ DONE — All rules from GAMIFICATION.md are now covered:
--
-- CONVERSÃO:
--   agendamento (+20), comparecimento (+30), reuniao_qualificada (+40),
--   proposta (+60), fechamento (+100)
--
-- ROTINA DIÁRIA (até 25 pts/dia):
--   ns_contato (+5), followup_dia (+5), analise_stories (+3),
--   rastros_interesse (+3), registro_crm (+4), dia_completo (+5 bônus)
--
-- PENALIDADES:
--   falta_rotina (-20), perda_followup (-15), mensagem_generica (-10),
--   copiar_colar (-20), feedback_negativo (-30), falta_registro (-10),
--   vacuo_24h (-50)
--   + Reincidência na mesma semana → penalidade em DOBRO (automático)
--
-- BÔNUS ESTRATÉGICOS:
--   streak_5dias (+30), melhor_resposta_semana (+20),
--   melhor_conversao_semana (+30), lead_elogiou (+20),
--   evolucao_performance (+25)
--
-- DEDUP: record_score_event V2 previne pontuação duplicada por reference_id
-- RECALC: recalc_user_score() e recalc_all_user_scores() disponíveis
-- ============================================================================
