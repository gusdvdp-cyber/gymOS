-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Fase 1: Ejercicios, Rutinas, Asignaciones
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── exercises ───────────────────────────────────────────────────────────────
CREATE TABLE public.exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id           UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  muscle_group     TEXT NOT NULL DEFAULT 'other' CHECK (muscle_group IN (
                     'chest','back','shoulders','biceps','triceps',
                     'legs','glutes','core','cardio','full_body','other'
                   )),
  video_url        TEXT,
  video_duration   SMALLINT CHECK (video_duration IS NULL OR video_duration <= 30),
  thumbnail_url    TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_gym_id ON public.exercises(gym_id);
CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group);

-- ─── routines ────────────────────────────────────────────────────────────────
CREATE TABLE public.routines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id         UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  days_per_week  SMALLINT NOT NULL CHECK (days_per_week IN (3, 4, 5)),
  description    TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_gym_id ON public.routines(gym_id);

-- ─── routine_days ─────────────────────────────────────────────────────────────
CREATE TABLE public.routine_days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id  UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  gym_id      UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  day_number  SMALLINT NOT NULL CHECK (day_number BETWEEN 1 AND 5),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (routine_id, day_number)
);

CREATE INDEX idx_routine_days_routine_id ON public.routine_days(routine_id);

-- ─── routine_day_exercises ────────────────────────────────────────────────────
CREATE TABLE public.routine_day_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id   UUID NOT NULL REFERENCES public.routine_days(id) ON DELETE CASCADE,
  gym_id           UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  exercise_id      UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  sets             SMALLINT NOT NULL DEFAULT 3 CHECK (sets > 0),
  reps             TEXT NOT NULL DEFAULT '10',
  suggested_weight NUMERIC(6,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rde_routine_day_id ON public.routine_day_exercises(routine_day_id);
CREATE INDEX idx_rde_exercise_id    ON public.routine_day_exercises(exercise_id);

-- ─── client_routine_assignments ───────────────────────────────────────────────
CREATE TABLE public.client_routine_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_id  UUID NOT NULL REFERENCES public.routines(id) ON DELETE RESTRICT,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  notes       TEXT,
  UNIQUE (client_id, routine_id)
);

CREATE INDEX idx_cra_client_id ON public.client_routine_assignments(client_id);
CREATE INDEX idx_cra_gym_id    ON public.client_routine_assignments(gym_id);

-- ─── updated_at triggers ──────────────────────────────────────────────────────
CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
