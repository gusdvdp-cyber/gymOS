-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Seed Data
-- Ejecutar DESPUÉS de crear el superadmin en Supabase Auth.
-- ─────────────────────────────────────────────────────────────────────────────

-- Actualiza el rol del primer usuario a superadmin.
-- Reemplazá el email con el tuyo.
-- UPDATE public.profiles
-- SET role = 'superadmin', gym_id = NULL
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');

-- Gym de demo para desarrollo
INSERT INTO public.gyms (id, name, slug, plan, status, email)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Gym Demo',
  'gym-demo',
  'FULL',
  'active',
  'demo@gymos.com'
)
ON CONFLICT (slug) DO NOTHING;

-- Branding del gym demo
INSERT INTO public.gym_branding (gym_id, primary_color, secondary_color, logo_url)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '#3B82F6',
  '#1E3A5F',
  NULL
)
ON CONFLICT (gym_id) DO NOTHING;
