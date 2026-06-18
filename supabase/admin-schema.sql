-- =====================================================================
-- Admin Panel Schema Updates
-- Supabase / PostgreSQL
-- =====================================================================
-- Run this in the Supabase SQL Editor after the main schema.sql
-- =====================================================================

-- =====================================================================
-- 1. PROFILES TABLE
-- =====================================================================
create table if not exists public.profiles (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null default '',
  title           text not null default '',
  about_me        text not null default '',
  email           text not null default '',
  github_url      text,
  linkedin_url    text,
  resume_url      text,
  profile_image_url text,
  location        text,
  phone           text,
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.profiles is 'Admin-controlled profile data for the portfolio.';

-- =====================================================================
-- 2. UPDATED TRIGGERS
-- =====================================================================

-- auto-update updated_at on profiles
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 3. INDEXES for profiles
-- =====================================================================
create index if not exists idx_profiles_active
  on public.profiles (is_active, display_order);

-- =====================================================================
-- 4. ROW LEVEL SECURITY for profiles
-- =====================================================================
alter table public.profiles enable row level security;

-- Public can SELECT the active profile row
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select
  to anon, authenticated
  using (is_active = true);

-- Service role (admin) has full access (bypasses RLS)

-- =====================================================================
-- 5. SEED INITIAL PROFILE
-- =====================================================================
insert into public.profiles (name, title, about_me, email, github_url, linkedin_url, profile_image_url, location, display_order)
values (
  'Burla Rohith',
  'AI & ML Engineer',
  'B.Tech CSE (AI & ML) ''27 at CMR College of Engineering and Technology. Building AI-powered solutions in Machine Learning, Computer Vision, and NLP.',
  'burlarohith999@gmail.com',
  'https://github.com/Rohithburla51',
  'https://www.linkedin.com/in/burla-rohith-25a31a361',
  null,
  'Hyderabad, India',
  1
)
on conflict do nothing;

-- =====================================================================
-- 6. UPDATED site_config for blog visibility
-- =====================================================================
-- Ensure feature_flags has show_blog which controls blog visibility
insert into public.site_config (key, value, updated_at) values
  ('feature_flags', '{"tagline": "AI/ML Engineer · B.Tech CS-AI/ML ''27", "location": "Hyderabad, India", "available_for": ["internships", "ml_engineer", "ai_engineer"], "show_blog": true, "show_experience": true, "show_certifications": true, "contact_form_enabled": true, "turnstile_enabled": false}'::jsonb, now())
on conflict (key) do update
  set value = excluded.value,
      updated_at = now();

-- =====================================================================
-- 7. AUTHENTICATION USERS TABLE (for allowed admin email check)
-- =====================================================================
-- We store the allowed admin email here for easy checking
create table if not exists public.admin_users (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  display_name    text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
comment on table public.admin_users is 'Authorized admin users for the CMS.';

alter table public.admin_users enable row level security;

-- Only authenticated admin can manage
drop policy if exists "admin_users_all" on public.admin_users;
create policy "admin_users_all"
  on public.admin_users for all
  to authenticated
  using (true);

-- Service role bypasses RLS

-- Seed the admin user
insert into public.admin_users (email, display_name)
values ('burlarohith999@gmail.com', 'Burla Rohith')
on conflict (email) do nothing;

-- =====================================================================
-- 8. CONTACT MESSAGES - mark as read/manage
-- =====================================================================
-- Allow authenticated users to update (mark as read)
drop policy if exists "contact_messages_auth_update" on public.contact_messages;
create policy "contact_messages_auth_update"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
-- 9. STORAGE BUCKET for profile images
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile_images',
  'profile_images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Profile images: public read
drop policy if exists "profile_images_public_read" on storage.objects;
create policy "profile_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'profile_images');

-- =====================================================================
-- DONE
-- =====================================================================
-- After running:
--   1. Verify profiles table in Table Editor
--   2. Verify admin_users table in Table Editor
--   3. In Authentication → Providers → Email:
--      - Enable Magic Link
--      - Set Site URL to your production URL
--      - Configure redirect URLs
-- =====================================================================