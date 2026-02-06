-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT, -- 'lead', 'sale', 'interaction'
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    trigger_date TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to handle interaction triggers
CREATE OR REPLACE FUNCTION public.handle_interaction_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- If next_action_date is set and it's a new interaction or date changed
    IF NEW.next_action_date IS NOT NULL AND (
        TG_OP = 'INSERT' OR 
        old.next_action_date IS DISTINCT FROM new.next_action_date
    ) THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            description,
            reference_id,
            reference_type,
            link,
            trigger_date
        )
        VALUES (
            NEW.created_by_user_id, -- Assuming interactions has this field, verified in previous read
            'Lembrete: ' || COALESCE(NEW.next_action, 'Ação Necessária'),
            'Interação com ' || (SELECT name FROM public.leads WHERE id = NEW.lead_id),
            NEW.id,
            'interaction',
            '/leads', -- In a real app deep link to lead
            NEW.next_action_date
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_interaction_created_or_updated ON public.interactions;
CREATE TRIGGER on_interaction_created_or_updated
    AFTER INSERT OR UPDATE ON public.interactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_interaction_trigger();
