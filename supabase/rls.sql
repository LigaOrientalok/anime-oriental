-- ============================================================
-- Anime Oriental - Políticas RLS (Row Level Security)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE animes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_later ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCIÓN HELPER: is_admin (bypasses RLS con SECURITY DEFINER)
-- ============================================================
-- Las políticas NO deben hacer subconsultas a profiles
-- porque eso causa infinite recursion (RLS se dispara de nuevo).
-- Esta función corre con permisos del creador (SECURITY DEFINER)
-- y bypassea RLS para verificar el rol.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
-- Usuarios: leer su propio perfil
CREATE POLICY "Usuarios pueden leer su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Administradores: leer todos los perfiles (usa is_admin())
CREATE POLICY "Admins pueden leer todos los perfiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Usuarios: actualizar su propio perfil (sin cambiar el role)
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND (role IS NOT DISTINCT FROM 'user' OR public.is_admin()));

-- Solo admins pueden cambiar roles (usa is_admin())
CREATE POLICY "Solo admins pueden cambiar roles"
  ON profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- ANIMES
-- ============================================================
-- Todos pueden leer animes
CREATE POLICY "Todos pueden leer animes"
  ON animes FOR SELECT
  USING (TRUE);

-- Solo administradores pueden insertar/modificar/eliminar animes
CREATE POLICY "Admins pueden insertar animes"
  ON animes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins pueden actualizar animes"
  ON animes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins pueden eliminar animes"
  ON animes FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- EPISODES
-- ============================================================
-- Todos pueden leer episodios
CREATE POLICY "Todos pueden leer episodios"
  ON episodes FOR SELECT
  USING (TRUE);

-- Solo admins pueden insertar/modificar/eliminar episodios
CREATE POLICY "Admins pueden insertar episodios"
  ON episodes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins pueden actualizar episodios"
  ON episodes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins pueden eliminar episodios"
  ON episodes FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- FAVORITES
-- ============================================================
-- Usuarios: solo ven sus propios favoritos
CREATE POLICY "Usuarios pueden leer sus favoritos"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios: insertar sus propios favoritos
CREATE POLICY "Usuarios pueden agregar favoritos"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios: eliminar sus propios favoritos
CREATE POLICY "Usuarios pueden eliminar sus favoritos"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- HISTORY
-- ============================================================
-- Usuarios: solo ven su propio historial
CREATE POLICY "Usuarios pueden leer su historial"
  ON history FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios: insertar/actualizar su propio historial
CREATE POLICY "Usuarios pueden insertar historial"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar historial"
  ON history FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- WATCH_LATER
-- ============================================================
-- Usuarios: solo ven su propia lista
CREATE POLICY "Usuarios pueden leer ver después"
  ON watch_later FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar ver después"
  ON watch_later FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar ver después"
  ON watch_later FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
-- Todos pueden leer comentarios
CREATE POLICY "Todos pueden leer comentarios"
  ON comments FOR SELECT
  USING (TRUE);

-- Usuarios autenticados pueden insertar comentarios
CREATE POLICY "Usuarios pueden insertar comentarios"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios: actualizar sus propios comentarios
CREATE POLICY "Usuarios pueden actualizar sus comentarios"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios: eliminar sus propios comentarios
CREATE POLICY "Usuarios pueden eliminar sus comentarios"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admins: pueden eliminar cualquier comentario (usa is_admin())
CREATE POLICY "Admins pueden eliminar comentarios"
  ON comments FOR DELETE
  USING (public.is_admin());
