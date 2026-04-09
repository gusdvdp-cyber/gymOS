-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Fase 2: RLS Policies for workout tracking
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── workout_sessions ────────────────────────────────────────────────────────

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sessions: superadmin full access"
  ON public.workout_sessions FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "workout_sessions: client manage own"
  ON public.workout_sessions FOR ALL
  USING (client_id = auth.uid() AND gym_id = public.get_user_gym_id())
  WITH CHECK (client_id = auth.uid() AND gym_id = public.get_user_gym_id());

CREATE POLICY "workout_sessions: admin profe read gym"
  ON public.workout_sessions FOR SELECT
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'profe')
    )
  );

-- ─── workout_set_logs ─────────────────────────────────────────────────────────

ALTER TABLE public.workout_set_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_set_logs: superadmin full access"
  ON public.workout_set_logs FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "workout_set_logs: client manage own via session"
  ON public.workout_set_logs FOR ALL
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.client_id = auth.uid()
    )
  )
  WITH CHECK (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.client_id = auth.uid()
    )
  );

CREATE POLICY "workout_set_logs: admin profe read gym"
  ON public.workout_set_logs FOR SELECT
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'profe')
    )
  );

-- ─── body_measurements ────────────────────────────────────────────────────────

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "body_measurements: superadmin full access"
  ON public.body_measurements FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "body_measurements: client manage own"
  ON public.body_measurements FOR ALL
  USING (client_id = auth.uid() AND gym_id = public.get_user_gym_id())
  WITH CHECK (client_id = auth.uid() AND gym_id = public.get_user_gym_id());

CREATE POLICY "body_measurements: admin profe read gym"
  ON public.body_measurements FOR SELECT
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'profe')
    )
  );
