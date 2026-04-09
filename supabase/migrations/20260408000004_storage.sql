-- ─────────────────────────────────────────────────────────────────────────────
-- GymOS — Storage Buckets & Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- Bucket para logos y assets del gym (privado por defecto)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gym-assets',
  'gym-assets',
  false,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- SuperAdmin puede hacer todo en el bucket
CREATE POLICY "gym-assets: superadmin full access"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'gym-assets'
    AND public.is_superadmin()
  )
  WITH CHECK (
    bucket_id = 'gym-assets'
    AND public.is_superadmin()
  );

-- Admin puede subir/actualizar assets de su gym
-- Path esperado: gyms/{gym_id}/logo.png
CREATE POLICY "gym-assets: admin upload own gym assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'gym-assets'
    AND (storage.foldername(name))[1] = 'gyms'
    AND (storage.foldername(name))[2] = public.get_user_gym_id()::TEXT
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid()
        AND me.role = 'admin'
    )
  );

CREATE POLICY "gym-assets: admin update own gym assets"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'gym-assets'
    AND (storage.foldername(name))[1] = 'gyms'
    AND (storage.foldername(name))[2] = public.get_user_gym_id()::TEXT
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid()
        AND me.role = 'admin'
    )
  );

-- Cualquier usuario autenticado puede leer assets de su gym
CREATE POLICY "gym-assets: member read own gym assets"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'gym-assets'
    AND (storage.foldername(name))[1] = 'gyms'
    AND (storage.foldername(name))[2] = public.get_user_gym_id()::TEXT
  );
