-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Helper Functions & Triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- Devuelve TRUE si el usuario autenticado es superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'
  );
END;
$$;

-- Devuelve el gym_id del usuario autenticado (NULL para superadmin)
CREATE OR REPLACE FUNCTION public.get_user_gym_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gym_id UUID;
BEGIN
  SELECT gym_id INTO v_gym_id
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN v_gym_id;
END;
$$;

-- Auto-crea el profile cuando un usuario se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, gym_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'gym_id', '')::UUID
  );
  RETURN NEW;
END;
$$;

-- Trigger: ejecuta handle_new_user() después de INSERT en auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
