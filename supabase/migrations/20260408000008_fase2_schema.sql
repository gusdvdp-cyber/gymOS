-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Fase 2: Workout tracking + body measurements schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── workout_sessions ────────────────────────────────────────────────────────

CREATE TABLE public.workout_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id        uuid        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  client_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_id    uuid        REFERENCES public.routines(id) ON DELETE SET NULL,
  routine_day_id uuid       REFERENCES public.routine_days(id) ON DELETE SET NULL,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  notes         text
);

CREATE INDEX ON public.workout_sessions (client_id, started_at DESC);
CREATE INDEX ON public.workout_sessions (gym_id);

-- ─── workout_set_logs ─────────────────────────────────────────────────────────

CREATE TABLE public.workout_set_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      uuid        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  session_id  uuid        NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id uuid        NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number  int         NOT NULL CHECK (set_number > 0),
  reps        int         CHECK (reps > 0),
  weight_kg   numeric(6,2) CHECK (weight_kg >= 0),
  logged_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.workout_set_logs (session_id, exercise_id, set_number);

-- ─── body_measurements ────────────────────────────────────────────────────────

CREATE TABLE public.body_measurements (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id        uuid    NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  client_id     uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  measured_at   date    NOT NULL DEFAULT current_date,
  weight_kg     numeric(5,2) CHECK (weight_kg > 0),
  height_cm     numeric(5,2) CHECK (height_cm > 0),
  body_fat_pct  numeric(4,1) CHECK (body_fat_pct BETWEEN 0 AND 100),
  chest_cm      numeric(5,1),
  waist_cm      numeric(5,1),
  hips_cm       numeric(5,1),
  bicep_cm      numeric(5,1),
  thigh_cm      numeric(5,1),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.body_measurements (client_id, measured_at DESC);
