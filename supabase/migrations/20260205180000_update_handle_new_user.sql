-- Migration: Update handle_new_user for White Label Signup
-- Description: Updates the trigger function to create a new organization if 'org_name' is provided in metadata.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    org_id uuid;
    org_name text;
    org_slug text;
BEGIN
    -- Check for organization name in metadata
    org_name := NEW.raw_user_meta_data->>'org_name';
    
    IF org_name IS NOT NULL AND length(org_name) > 0 THEN
        -- Create a new organization for this user
        -- Generate a slug from the name (simplified slugify)
        org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]', '-', 'g'));
        -- Ensure uniqueness (append random suffix if needed? For now, let constraint fail or we handle it)
        -- To be safe, we might append random chars if collision, but let's assume unique for now or let UI handle error.
        -- Actually, slug collision on signup is bad UX. Let's append a random string.
        org_slug := org_slug || '-' || substr(md5(random()::text), 1, 4);

        INSERT INTO public.organizations (name, slug)
        VALUES (org_name, org_slug)
        RETURNING id INTO org_id;
        
        -- Admin role for the creator
        INSERT INTO public.user_roles (user_id, role, organization_id)
        VALUES (NEW.id, 'admin', org_id);

    ELSE
        -- Fallback: Assign to default 'Venditus' organization (Legacy/Invite flow)
        -- Logic: If they weren't invited (no invite logic here yet), and didn't provide org name...
        -- Maybe force them to provide org name in UI?
        -- For now, keep fallback.
        
        SELECT id INTO org_id FROM public.organizations WHERE slug = 'venditus' LIMIT 1;
        
        IF org_id IS NULL THEN
            -- Should create default if missing
            INSERT INTO public.organizations (name, slug) VALUES ('Venditus', 'venditus')
            RETURNING id INTO org_id;
        END IF;
        
        -- If specific admin email, make admin (Legacy)
        IF NEW.email = 'matheus.silva.sg7@gmail.com' THEN
             INSERT INTO public.user_roles (user_id, role, organization_id)
             VALUES (NEW.id, 'admin', org_id)
             ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- Create Profile
    INSERT INTO public.profiles (user_id, email, name, organization_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        org_id
    );
  
  RETURN NEW;
END;
$$;
