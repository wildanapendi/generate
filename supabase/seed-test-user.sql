-- ============================================================
-- Modul Praktikum Generator — Seed Test User (SQL Murni)
-- ============================================================
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Cukup copy-paste seluruh file ini lalu klik Run.
-- ============================================================

-- 1. Bersihkan data lama jika ada
DO $$
BEGIN
  -- Hapus templates & modules milik user ini terlebih dahulu
  DELETE FROM public.templates WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'testuser@modulgenerator.com'
  );
  DELETE FROM public.modules WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'testuser@modulgenerator.com'
  );
  DELETE FROM public.generated_logs WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'testuser@modulgenerator.com'
  );
  DELETE FROM public.exports WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'testuser@modulgenerator.com'
  );
  -- Hapus identities
  DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'testuser@modulgenerator.com'
  );
  -- Hapus user dari public lalu auth
  DELETE FROM public.users WHERE email = 'testuser@modulgenerator.com';
  DELETE FROM auth.users WHERE email = 'testuser@modulgenerator.com';
END $$;

-- 2. Buat test user lengkap
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  new_template_id uuid := gen_random_uuid();
BEGIN
  -- --------------------------------------------------------
  -- 2a. Insert ke auth.users dengan semua field yang
  --     dibutuhkan GoTrue agar signInWithPassword berfungsi
  -- --------------------------------------------------------
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    email_change,
    email_change_confirm_status,
    phone,
    phone_change,
    phone_change_token,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'testuser@modulgenerator.com',
    crypt('TestUser@2026', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Test User Lecturer"}'::jsonb,
    false,
    false,
    '',
    '',
    '',
    '',
    '',
    0,
    null,
    '',
    '',
    now(),
    now()
  );

  -- --------------------------------------------------------
  -- 2b. Insert ke auth.identities (WAJIB agar login berfungsi)
  -- --------------------------------------------------------
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'testuser@modulgenerator.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    null,
    now(),
    now()
  );

  -- --------------------------------------------------------
  -- 2c. Update profil di public.users
  --     (trigger on_auth_user_created otomatis buat row-nya)
  -- --------------------------------------------------------
  UPDATE public.users
  SET role = 'lecturer',
      full_name = 'Test User Lecturer',
      institution = 'Universitas Test'
  WHERE id = new_user_id;

  -- --------------------------------------------------------
  -- 3. Buat sample template
  -- --------------------------------------------------------
  INSERT INTO public.templates (id, user_id, name, description, is_default, config)
  VALUES (
    new_template_id,
    new_user_id,
    'Template Standar Praktikum',
    'Template default untuk menguji generate design modul praktikum',
    true,
    '{
      "pageSize": "A4",
      "orientation": "portrait",
      "margins": { "top": 25, "right": 20, "bottom": 25, "left": 25 },
      "fonts": {
        "heading": { "family": "Times New Roman", "size": 16, "weight": "bold", "color": "#1a1a2e" },
        "subheading": { "family": "Times New Roman", "size": 13, "weight": "bold", "color": "#16213e" },
        "body": { "family": "Times New Roman", "size": 12, "weight": "normal", "color": "#333333" },
        "caption": { "family": "Arial", "size": 10, "weight": "normal", "color": "#666666" }
      },
      "header": {
        "enabled": true,
        "height": 60,
        "logoPosition": "left",
        "showInstitution": true,
        "showTitle": true,
        "borderBottom": true
      },
      "footer": {
        "enabled": true,
        "height": 30,
        "showPageNumber": true,
        "pageNumberPosition": "center",
        "borderTop": true
      },
      "cover": {
        "enabled": true,
        "layout": "centered",
        "showLogo": true,
        "showTitle": true,
        "showSubtitle": true,
        "showInstitution": true,
        "showAcademicYear": true,
        "backgroundColor": "#ffffff",
        "titleColor": "#1a1a2e",
        "subtitleColor": "#16213e"
      },
      "watermark": {
        "enabled": false,
        "text": "",
        "opacity": 0.08,
        "fontSize": 48,
        "rotation": -30
      },
      "colors": {
        "primary": "#1a1a2e",
        "secondary": "#16213e",
        "accent": "#e94560",
        "background": "#ffffff",
        "surface": "#f8f9fa"
      },
      "spacing": {
        "sectionGap": 16,
        "paragraphGap": 8,
        "lineHeight": 1.6
      }
    }'::jsonb
  );

  -- --------------------------------------------------------
  -- 4. Buat sample modul draft yang menggunakan template
  -- --------------------------------------------------------
  INSERT INTO public.modules (
    user_id, template_id, title, code, subject, semester,
    program, lecturer, lab, academic_year, status, content
  ) VALUES (
    new_user_id,
    new_template_id,
    'Praktikum Algoritma & Pemrograman - Modul 1',
    'PRAK-ALG-001',
    'Algoritma dan Pemrograman',
    'Ganjil 2025/2026',
    'Teknik Informatika',
    'Test User Lecturer',
    'Lab Komputer 1',
    '2025/2026',
    'draft',
    '{
      "sections": [
        {
          "id": "s1",
          "type": "heading",
          "title": "Tujuan Praktikum",
          "content": "Mahasiswa mampu memahami konsep dasar algoritma dan mengimplementasikannya dalam bahasa pemrograman.",
          "order": 1
        },
        {
          "id": "s2",
          "type": "paragraph",
          "title": "Dasar Teori",
          "content": "Algoritma merupakan urutan langkah-langkah logis untuk menyelesaikan suatu masalah.",
          "order": 2
        },
        {
          "id": "s3",
          "type": "procedure",
          "title": "Langkah Praktikum",
          "content": "1. Buka IDE\n2. Buat project baru\n3. Tulis kode program\n4. Compile dan jalankan\n5. Catat output",
          "order": 3
        },
        {
          "id": "s4",
          "type": "paragraph",
          "title": "Tugas",
          "content": "Buatlah program yang menghitung rata-rata dari n bilangan.",
          "order": 4
        }
      ],
      "toc": true,
      "version": 1
    }'::jsonb
  );

  RAISE NOTICE '✅ Test user berhasil dibuat! ID: %', new_user_id;
  RAISE NOTICE '✅ Template berhasil dibuat! ID: %', new_template_id;
END $$;

-- ============================================================
-- 3. VERIFIKASI
-- ============================================================
SELECT
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  u.is_sso_user,
  p.full_name,
  p.role,
  p.institution
FROM auth.users u
LEFT JOIN public.users p ON p.id = u.id
WHERE u.email = 'testuser@modulgenerator.com';

SELECT t.id, t.name, t.is_default
FROM public.templates t
JOIN auth.users u ON u.id = t.user_id
WHERE u.email = 'testuser@modulgenerator.com';

SELECT m.id, m.title, m.code, m.status
FROM public.modules m
JOIN auth.users u ON u.id = m.user_id
WHERE u.email = 'testuser@modulgenerator.com';

-- ============================================================
-- KREDENSIAL LOGIN:
--   Email:    testuser@modulgenerator.com
--   Password: TestUser@2026
--   Role:     lecturer
-- ============================================================
