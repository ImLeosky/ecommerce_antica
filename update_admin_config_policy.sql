-- update_admin_config_policy.sql

-- Agregar política para permitir select público en admin_config para obtener settings como currency

CREATE POLICY "Allow public select on admin_config" ON public.admin_config FOR SELECT USING (true);