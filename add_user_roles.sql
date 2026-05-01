-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para user_roles
-- Solo los admins pueden leer y modificar los roles de todos
CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT TO authenticated 
USING ( auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin') );

-- Cada usuario puede leer su propio rol
CREATE POLICY "Users can view their own role" 
ON public.user_roles FOR SELECT TO authenticated 
USING ( user_id = auth.uid() );

-- Ejemplo de cómo insertar el primer admin (reemplazar con el ID real del usuario)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('TU_USER_ID_AQUI', 'admin');
