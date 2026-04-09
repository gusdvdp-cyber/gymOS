-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Row Level Security Policies
-- Regla de oro: superadmin ve todo, cada gym solo ve su propia data.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── gyms ────────────────────────────────────────────────────────────────────
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- SuperAdmin: acceso total
CREATE POLICY "gyms: superadmin full access"
  ON public.gyms
  FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Admin/Profe/Cliente: solo ve su propio gym
CREATE POLICY "gyms: member read own gym"
  ON public.gyms
  FOR SELECT
  USING (id = public.get_user_gym_id());

-- ─── profiles ────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SuperAdmin: acceso total
CREATE POLICY "profiles: superadmin full access"
  ON public.profiles
  FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Usuario autenticado: puede leer su propio profile siempre
CREATE POLICY "profiles: read own profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Admin/Profe: puede leer profiles de su gym
CREATE POLICY "profiles: gym staff read gym profiles"
  ON public.profiles
  FOR SELECT
  USING (gym_id = public.get_user_gym_id());

-- Admin: puede actualizar profiles de su gym
CREATE POLICY "profiles: admin update gym profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid()
        AND me.role IN ('admin')
    )
  )
  WITH CHECK (
    gym_id = public.get_user_gym_id()
  );

-- Usuario: puede actualizar su propio profile (datos personales)
CREATE POLICY "profiles: update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── gym_branding ─────────────────────────────────────────────────────────────
ALTER TABLE public.gym_branding ENABLE ROW LEVEL SECURITY;

-- SuperAdmin: acceso total
CREATE POLICY "gym_branding: superadmin full access"
  ON public.gym_branding
  FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Cualquier miembro del gym puede leer el branding (para aplicar en la UI)
CREATE POLICY "gym_branding: member read own gym branding"
  ON public.gym_branding
  FOR SELECT
  USING (gym_id = public.get_user_gym_id());

-- Admin: puede actualizar el branding de su gym
CREATE POLICY "gym_branding: admin upsert own gym branding"
  ON public.gym_branding
  FOR ALL
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid()
        AND me.role = 'admin'
    )
  )
  WITH CHECK (
    gym_id = public.get_user_gym_id()
  );
