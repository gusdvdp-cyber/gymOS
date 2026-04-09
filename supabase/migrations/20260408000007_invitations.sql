-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Invitaciones de gym
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.gym_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  token       UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  role        TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'profe')),
  email       TEXT,             -- opcional: pre-llena el form y restringe a ese email
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  used_at     TIMESTAMPTZ,
  used_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gym_invitations_token  ON public.gym_invitations(token);
CREATE INDEX idx_gym_invitations_gym_id ON public.gym_invitations(gym_id);

-- Sin RLS: la página de registro es pública y necesita leer el token sin sesión.
-- La seguridad se maneja en la Server Action validando el token.
-- El admin crea invitaciones via adminClient (service_role), no necesita policy.
