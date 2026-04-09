-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Fase 1: RLS Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── exercises ───────────────────────────────────────────────────────────────
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises: superadmin full access"
  ON public.exercises FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "exercises: gym members read"
  ON public.exercises FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "exercises: admin profe manage"
  ON public.exercises FOR ALL
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'profe')
    )
  )
  WITH CHECK (
    gym_id = public.get_user_gym_id()
  );

-- ─── routines ────────────────────────────────────────────────────────────────
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routines: superadmin full access"
  ON public.routines FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "routines: gym members read"
  ON public.routines FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "routines: admin profe manage"
  ON public.routines FOR ALL
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'profe')
    )
  )
  WITH CHECK (gym_id = public.get_user_gym_id());

-- ─── routine_days ─────────────────────────────────────────────────────────────
ALTER TABLE public.routine_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routine_days: superadmin full access"
  ON public.routine_days FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "routine_days: gym members read"
  ON public.routine_days FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "routine_days: admin profe manage"
  ON public.routine_days FOR ALL
  USING (gym_id = public.get_user_gym_id()
    AND EXISTS (SELECT 1 FROM public.profiles AS me WHERE me.id = auth.uid() AND me.role IN ('admin','profe')))
  WITH CHECK (gym_id = public.get_user_gym_id());

-- ─── routine_day_exercises ────────────────────────────────────────────────────
ALTER TABLE public.routine_day_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rde: superadmin full access"
  ON public.routine_day_exercises FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "rde: gym members read"
  ON public.routine_day_exercises FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "rde: admin profe manage"
  ON public.routine_day_exercises FOR ALL
  USING (gym_id = public.get_user_gym_id()
    AND EXISTS (SELECT 1 FROM public.profiles AS me WHERE me.id = auth.uid() AND me.role IN ('admin','profe')))
  WITH CHECK (gym_id = public.get_user_gym_id());

-- ─── client_routine_assignments ───────────────────────────────────────────────
ALTER TABLE public.client_routine_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cra: superadmin full access"
  ON public.client_routine_assignments FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "cra: client read own"
  ON public.client_routine_assignments FOR SELECT
  USING (client_id = auth.uid() OR gym_id = public.get_user_gym_id());

CREATE POLICY "cra: admin profe manage"
  ON public.client_routine_assignments FOR ALL
  USING (gym_id = public.get_user_gym_id()
    AND EXISTS (SELECT 1 FROM public.profiles AS me WHERE me.id = auth.uid() AND me.role IN ('admin','profe')))
  WITH CHECK (gym_id = public.get_user_gym_id());

-- ─── Storage: allow admins/profes to upload exercise videos ──────────────────
CREATE POLICY "gym-assets: admin profe upload exercises"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gym-assets'
    AND (storage.foldername(name))[1] = 'gyms'
    AND (storage.foldername(name))[2] = public.get_user_gym_id()::TEXT
    AND (storage.foldername(name))[3] = 'exercises'
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role IN ('admin','profe')
    )
  );

CREATE POLICY "gym-assets: admin profe update exercises"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gym-assets'
    AND (storage.foldername(name))[1] = 'gyms'
    AND (storage.foldername(name))[2] = public.get_user_gym_id()::TEXT
    AND EXISTS (SELECT 1 FROM public.profiles AS me WHERE me.id = auth.uid() AND me.role IN ('admin','profe'))
  );
