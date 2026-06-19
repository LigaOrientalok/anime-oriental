-- ============================================================
-- FIX: handle_new_user trigger — usar SET search_path + manejar NULL email
-- ============================================================
-- El trigger original falla con "Database error saving new user"
-- porque:
--   1. No usa SET search_path en SECURITY DEFINER (injection risk)
--   2. No maneja NULL email (posible en algunos OAuth edge cases)
--   3. No usa ON CONFLICT para evitar duplicados

-- Drop trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recrear función con search_path seguro y manejo de NULLs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'unknown@' || NEW.id || '.placeholder'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recrear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
