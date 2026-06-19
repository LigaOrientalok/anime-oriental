-- ============================================================
-- FIX: Infinite recursion en políticas RLS de profiles
-- ============================================================
-- El problema: las políticas que verifican si un usuario es admin
-- hacen "SELECT 1 FROM profiles" lo que dispara RLS de nuevo,
-- causando recursión infinita.
--
-- Solución: función SECURITY DEFINER que bypassea RLS.
-- ============================================================

-- 1. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Admins pueden leer todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Solo admins pueden cambiar roles" ON profiles;
DROP POLICY IF EXISTS "Admins pueden insertar animes" ON animes;
DROP POLICY IF EXISTS "Admins pueden actualizar animes" ON animes;
DROP POLICY IF EXISTS "Admins pueden eliminar animes" ON animes;
DROP POLICY IF EXISTS "Admins pueden insertar episodios" ON episodes;
DROP POLICY IF EXISTS "Admins pueden actualizar episodios" ON episodes;
DROP POLICY IF EXISTS "Admins pueden eliminar episodios" ON episodes;
DROP POLICY IF EXISTS "Admins pueden eliminar comentarios" ON comments;

-- 2. Crear función helper que bypassea RLS
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

-- 3. Re-crear políticas usando la función helper
-- PROFILES
CREATE POLICY "Admins pueden leer todos los perfiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Solo admins pueden cambiar roles"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- ANIMES
CREATE POLICY "Admins pueden insertar animes"
  ON animes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins pueden actualizar animes"
  ON animes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins pueden eliminar animes"
  ON animes FOR DELETE
  USING (public.is_admin());

-- EPISODES
CREATE POLICY "Admins pueden insertar episodios"
  ON episodes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins pueden actualizar episodios"
  ON episodes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins pueden eliminar episodios"
  ON episodes FOR DELETE
  USING (public.is_admin());

-- COMMENTS
CREATE POLICY "Admins pueden eliminar comentarios"
  ON comments FOR DELETE
  USING (public.is_admin());
