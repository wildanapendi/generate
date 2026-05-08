-- ============================================================
-- Modul Praktikum Generator — Database Schema
-- ============================================================
-- Run this file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable extensions ----------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USERS  (extends auth.users)
-- ============================================================
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  avatar_url   text,
  institution  text,
  role         text default 'lecturer',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self" on public.users
  for insert with check (auth.uid() = id);

-- Auto-create row when auth.users row is created -----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. TEMPLATES
-- ============================================================
create table if not exists public.templates (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  name         text not null,
  description  text,
  is_default   boolean default false,
  config       jsonb not null default '{}'::jsonb,
  preview_url  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists templates_user_id_idx on public.templates(user_id);
create index if not exists templates_created_at_idx on public.templates(created_at desc);

alter table public.templates enable row level security;

drop policy if exists "templates_owner_all" on public.templates;
create policy "templates_owner_all" on public.templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 3. MODULES
-- ============================================================
create table if not exists public.modules (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  template_id     uuid references public.templates(id) on delete set null,
  title           text not null,
  code            text,
  subject         text,
  semester        text,
  program         text,
  lecturer        text,
  lab             text,
  academic_year   text,
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  content         jsonb not null default '{"sections":[]}'::jsonb,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists modules_user_id_idx       on public.modules(user_id);
create index if not exists modules_status_idx        on public.modules(status);
create index if not exists modules_created_at_idx    on public.modules(created_at desc);
create index if not exists modules_user_status_idx   on public.modules(user_id, status);

alter table public.modules enable row level security;

drop policy if exists "modules_owner_all" on public.modules;
create policy "modules_owner_all" on public.modules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at trigger ---------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists modules_touch_updated on public.modules;
create trigger modules_touch_updated
  before update on public.modules
  for each row execute function public.touch_updated_at();

drop trigger if exists templates_touch_updated on public.templates;
create trigger templates_touch_updated
  before update on public.templates
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 4. EXPORTS
-- ============================================================
create table if not exists public.exports (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  module_id      uuid not null references public.modules(id) on delete cascade,
  format         text not null check (format in ('pdf','docx')),
  file_path      text,
  file_size      bigint,
  status         text not null default 'pending' check (status in ('pending','completed','failed')),
  error_message  text,
  created_at     timestamptz default now()
);

create index if not exists exports_user_id_idx     on public.exports(user_id);
create index if not exists exports_module_id_idx   on public.exports(module_id);
create index if not exists exports_created_at_idx  on public.exports(created_at desc);

alter table public.exports enable row level security;

drop policy if exists "exports_owner_all" on public.exports;
create policy "exports_owner_all" on public.exports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 5. GENERATED_LOGS
-- ============================================================
create table if not exists public.generated_logs (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  module_id      uuid references public.modules(id) on delete set null,
  prompt         jsonb not null,
  tokens_used    integer,
  model          text,
  status         text not null default 'success' check (status in ('success','failed')),
  error_message  text,
  created_at     timestamptz default now()
);

create index if not exists generated_logs_user_id_idx    on public.generated_logs(user_id);
create index if not exists generated_logs_created_at_idx on public.generated_logs(created_at desc);

alter table public.generated_logs enable row level security;

drop policy if exists "generated_logs_owner_all" on public.generated_logs;
create policy "generated_logs_owner_all" on public.generated_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET (run separately via Dashboard or here)
-- ============================================================
-- 1. Create bucket `module-assets` in Supabase Dashboard → Storage
-- 2. Set public = false
-- 3. Apply policies below

insert into storage.buckets (id, name, public)
values ('module-assets', 'module-assets', false)
on conflict (id) do nothing;

drop policy if exists "module_assets_owner_all" on storage.objects;
create policy "module_assets_owner_all" on storage.objects
  for all using (
    bucket_id = 'module-assets'
    and (auth.uid())::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'module-assets'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );
