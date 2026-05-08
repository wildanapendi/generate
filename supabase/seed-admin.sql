-- ============================================================
-- Modul Praktikum Generator — Seed Admin Account
-- ============================================================
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================
-- PENTING: Ganti email dan password sesuai kebutuhan Anda
-- Password di-hash menggunakan bcrypt format Supabase
-- ============================================================

-- 1. Hapus akun lama yang mungkin error (bersihkan state)
DELETE FROM auth.users WHERE email = 'admin@modulgenerator.com';
DELETE FROM public.users WHERE email = 'admin@modulgenerator.com';

-- 2. Buat ulang akun menggunakan blok transaksi yang lebih aman
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert data utama ke auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'admin@modulgenerator.com',
    crypt('Props-Ti@2026', gen_salt('bf')), now(),
    '{"full_name":"Administrator"}', '{"provider":"email","providers":["email"]}',
    'authenticated', 'authenticated', now(), now()
  );

  -- Insert data otentikasi ke auth.identities dengan UUID mandiri
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id, new_user_id::text,
    jsonb_build_object('sub', new_user_id::text, 'email', 'admin@modulgenerator.com', 'email_verified', true),
    'email', now(), now()
  );

  -- Sesuaikan role di tabel public (karena trigger schema.sql sudah otomatis membuat row-nya)
  UPDATE public.users 
  SET role = 'admin', full_name = 'Administrator' 
  WHERE id = new_user_id;
END $$;

-- ============================================================
-- VERIFIKASI: Cek apakah admin berhasil dibuat
-- ============================================================
SELECT
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
JOIN public.users p ON p.id = u.id
WHERE u.email = 'admin@modulgenerator.com';
