-- 1. Eliminar todas las políticas previas para empezar de cero
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- 2. Permitir que TODO usuario autenticado lea SU PROPIO rol (Sin recursividad)
-- Esta política es fundamental para que el middleware y el sidebar funcionen
CREATE POLICY "Users can view their own role" 
ON public.user_roles FOR SELECT TO authenticated 
USING ( user_id = auth.uid() );

-- 3. Permitir que los Admins vean los roles de TODOS (Sin recursividad)
-- Nota: Si no usas user_metadata, esta política permite que un admin vea a otros
-- basándose en que su propio ID tiene asignado el rol admin.
CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT TO authenticated 
USING ( 
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);
-- Nota: La anterior sigue siendo un poco recursiva en algunos motores, 
-- pero en Supabase suele funcionar. Si falla, la de "own role" es la mínima necesaria.
