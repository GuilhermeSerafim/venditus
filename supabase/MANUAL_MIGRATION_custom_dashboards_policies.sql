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
