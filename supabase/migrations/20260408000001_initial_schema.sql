-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Initial Schema (Fase 0)
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── gyms ────────────────────────────────────────────────────────────────────
CREATE TABLE public.gyms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  plan         TEXT NOT NULL DEFAULT 'PART' CHECK (plan IN ('PART', 'FULL')),
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Extiende auth.users de Supabase. id = auth.users.id.
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id       UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  role         TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('superadmin', 'admin', 'profe', 'cliente')),
  first_name   TEXT NOT NULL DEFAULT '',
  last_name    TEXT NOT NULL DEFAULT '',
  phone        TEXT,
  avatar_url   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── gym_branding ─────────────────────────────────────────────────────────────
CREATE TABLE public.gym_branding (
  gym_id          UUID PRIMARY KEY REFERENCES public.gyms(id) ON DELETE CASCADE,
  primary_color   TEXT NOT NULL DEFAULT '#3B82F6',
  secondary_color TEXT NOT NULL DEFAULT '#1E3A5F',
  logo_url        TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_profiles_gym_id ON public.profiles(gym_id);
CREATE INDEX idx_profiles_role   ON public.profiles(role);
CREATE INDEX idx_gyms_slug       ON public.gyms(slug);
CREATE INDEX idx_gyms_status     ON public.gyms(status);

-- ─── updated_at auto-update ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gyms_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_gym_branding_updated_at
  BEFORE UPDATE ON public.gym_branding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
