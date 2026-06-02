-- =====================================================================
-- Burla Rohith — Portfolio Database Schema
-- Supabase / PostgreSQL
-- =====================================================================
-- Run this entire file in the Supabase SQL Editor
-- (Project → SQL Editor → New query → paste → Run)
--
-- Idempotent: safe to re-run. Uses IF NOT EXISTS and OR REPLACE.
-- Project ref: ulqrhcfzxmsijzcumqyp
-- =====================================================================

-- =====================================================================
-- 0. EXTENSIONS
-- =====================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. ENUMS
-- =====================================================================
do $$ begin
  create type achievement_category as enum (
    'hackathon', 'competition', 'certification', 'coding', 'academic', 'other'
  );
exception when duplicate_object then null; end $$;

-- =====================================================================
-- 2. TABLES
-- =====================================================================

-- ----------------------------- certificates -----------------------------
create table if not exists public.certificates (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  organization    text not null,
  issue_date      date not null,
  image_url       text,
  pdf_url         text,
  verify_url      text,
  category        text,
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
comment on table public.certificates is
  'Professional certifications, courses, and micro-credentials.';

-- ----------------------------- featured_projects ------------------------
create table if not exists public.featured_projects (
  id                uuid primary key default uuid_generate_v4(),
  repo_name         text unique,
  title             text not null,
  tagline           text,
  long_description  text,
  media_urls        text[] default '{}',
  technologies      text[] default '{}',
  highlights        text[] default '{}',
  github_url        text,
  live_url          text,
  display_order     integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table public.featured_projects is
  'Long-form case studies for the most significant projects.';

-- ----------------------------- achievements -----------------------------
create table if not exists public.achievements (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  category        achievement_category not null default 'other',
  description     text,
  icon            text,                       -- icon key mapped in UI
  date            date,
  link            text,
  display_order   integer not null default 0,
  is_active       boolean not null default true
);
comment on table public.achievements is
  'Hackathons, awards, recognitions, and milestones.';

-- ----------------------------- experiences ------------------------------
create table if not exists public.experiences (
  id              uuid primary key default uuid_generate_v4(),
  company         text not null,
  role            text not null,
  duration        text not null,              -- free-form e.g. "Jun 2024 – Aug 2024"
  description     text,
  technologies    text[] default '{}',
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
comment on table public.experiences is
  'Professional experience, internships, and roles.';

-- ----------------------------- posts (blog) -----------------------------
create table if not exists public.posts (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,
  title               text not null,
  excerpt             text,
  content_md          text not null default '',
  cover_image_url     text,
  tags                text[] default '{}',
  is_published        boolean not null default false,
  published_at        timestamptz,
  reading_time_min    integer,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.posts is
  'Markdown blog posts. Rendered with rehype at /blog/[slug].';

-- ----------------------------- contact_messages -------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject     text not null check (char_length(subject) between 1 and 300),
  message     text not null check (char_length(message) between 1 and 5000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
comment on table public.contact_messages is
  'Inbound messages from the public contact form.';

-- ----------------------------- site_config ------------------------------
create table if not exists public.site_config (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
comment on table public.site_config is
  'Key/value config (resume URL, leetcode counter, feature flags, etc).';

-- =====================================================================
-- 3. INDEXES
-- =====================================================================
create index if not exists idx_certificates_active_order
  on public.certificates (is_active, display_order, issue_date desc);
create index if not exists idx_certificates_category
  on public.certificates (category) where is_active;

create index if not exists idx_featured_projects_active_order
  on public.featured_projects (is_active, display_order);
create index if not exists idx_featured_projects_repo
  on public.featured_projects (repo_name) where repo_name is not null;

create index if not exists idx_achievements_active_order
  on public.achievements (is_active, display_order, date desc);
create index if not exists idx_achievements_category
  on public.achievements (category) where is_active;

create index if not exists idx_experiences_active_order
  on public.experiences (is_active, display_order);

create index if not exists idx_posts_published_at
  on public.posts (published_at desc) where is_published;
create index if not exists idx_posts_slug
  on public.posts (slug);
create index if not exists idx_posts_tags_gin
  on public.posts using gin (tags);

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);
create index if not exists idx_contact_messages_unread
  on public.contact_messages (is_read) where not is_read;

-- =====================================================================
-- 4. TRIGGERS
-- =====================================================================

-- auto-update updated_at on featured_projects
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_featured_projects_updated_at on public.featured_projects;
create trigger trg_featured_projects_updated_at
  before update on public.featured_projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 5. ROW LEVEL SECURITY
-- =====================================================================
-- Policy summary
--   public anon key can:
--     - SELECT active rows from certificates, featured_projects,
--       achievements, experiences, site_config
--     - SELECT published posts
--     - INSERT into contact_messages (no read/update/delete)
--
--   service_role key (server-only) bypasses RLS and has full access.
--   Phase 2 admin dashboard will use service_role server-side.
-- =====================================================================

alter table public.certificates      enable row level security;
alter table public.featured_projects enable row level security;
alter table public.achievements      enable row level security;
alter table public.experiences       enable row level security;
alter table public.posts             enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.site_config       enable row level security;

-- ---------- certificates ----------
drop policy if exists "certificates_public_read" on public.certificates;
create policy "certificates_public_read"
  on public.certificates for select
  to anon, authenticated
  using (is_active = true);

-- ---------- featured_projects ----------
drop policy if exists "featured_projects_public_read" on public.featured_projects;
create policy "featured_projects_public_read"
  on public.featured_projects for select
  to anon, authenticated
  using (is_active = true);

-- ---------- achievements ----------
drop policy if exists "achievements_public_read" on public.achievements;
create policy "achievements_public_read"
  on public.achievements for select
  to anon, authenticated
  using (is_active = true);

-- ---------- experiences ----------
drop policy if exists "experiences_public_read" on public.experiences;
create policy "experiences_public_read"
  on public.experiences for select
  to anon, authenticated
  using (is_active = true);

-- ---------- posts (blog) ----------
drop policy if exists "posts_public_read_published" on public.posts;
create policy "posts_public_read_published"
  on public.posts for select
  to anon, authenticated
  using (is_published = true);

-- ---------- contact_messages ----------
-- public can INSERT (form submit). No SELECT/UPDATE/DELETE for anon.
drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- ---------- site_config ----------
-- public can READ all keys. Writes are service_role only.
drop policy if exists "site_config_public_read" on public.site_config;
create policy "site_config_public_read"
  on public.site_config for select
  to anon, authenticated
  using (true);

-- =====================================================================
-- 6. STORAGE BUCKETS
-- =====================================================================
-- 4 buckets:
--   resumes         — public read, owner write
--   certificates    — public read, owner write
--   blog_covers     — public read, owner write
--   featured_media  — public read, owner write
--
-- In Supabase Dashboard → Storage, you can also create these manually.
-- This SQL uses the storage.buckets table directly.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('resumes',        'resumes',        true, 10485760, array['application/pdf']),
  ('certificates',   'certificates',   true, 10485760, array['application/pdf','image/png','image/jpeg','image/webp']),
  ('blog_covers',    'blog_covers',    true, 10485760, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('featured_media', 'featured_media', true, 15728640, array['image/png','image/jpeg','image/webp','image/gif','video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------- storage RLS: public read on all 4 buckets ----------
drop policy if exists "resumes_public_read"        on storage.objects;
create policy "resumes_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'resumes');

drop policy if exists "certificates_public_read"   on storage.objects;
create policy "certificates_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'certificates');

drop policy if exists "blog_covers_public_read"    on storage.objects;
create policy "blog_covers_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog_covers');

drop policy if exists "featured_media_public_read" on storage.objects;
create policy "featured_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'featured_media');

-- service_role bypasses RLS, so admin uploads via server work automatically.
-- For direct anon uploads (not used in Phase 1), you would add an INSERT policy
-- like:
--   create policy "bucket_anon_upload" on storage.objects for insert
--     to anon with check (bucket_id = 'bucket_name');
-- Phase 2 admin will use the service role key server-side, so this is omitted.

-- =====================================================================
-- 7. SEED DATA
-- =====================================================================
-- Idempotent: uses ON CONFLICT to update/insert.
-- =====================================================================

-- ---------- site_config ----------
insert into public.site_config (key, value, updated_at) values
  ('resume_url', '{"url": null, "version": "v1", "uploaded_at": null}'::jsonb, now()),
  ('leetcode_solved', '{"total": 395, "easy": 150, "medium": 215, "hard": 30, "source": "manual", "last_updated": "2025-01-01"}'::jsonb, now()),
  ('site_meta', '{"tagline": "AI/ML Engineer · B.Tech CS-AI/ML ''27", "location": "Hyderabad, India", "available_for": ["internships", "ml_engineer", "ai_engineer"]}'::jsonb, now()),
  ('feature_flags', '{"show_blog": true, "show_experience": true, "show_certifications": true, "contact_form_enabled": true, "turnstile_enabled": false}'::jsonb, now())
on conflict (key) do update
  set value = excluded.value,
      updated_at = now();

-- ---------- achievements ----------
insert into public.achievements (title, category, description, icon, date, link, display_order) values
  ('IIT Tirupati Hackathon 2025 Finalist',
   'hackathon',
   'Top 20 nationally with DIVYA_DRISTI — satellite image segmentation system (95.66% mIoU using SegFormer-B2).',
   'trophy',
   '2025-03-15',
   'https://github.com/Rohithburla51/DIVYA_DRISTI',
   1),
  ('Smart India Hackathon 2024 Participant',
   'hackathon',
   'Built GAMICAL_THERAPY — AI-powered physical therapy assistant for kids using MediaPipe pose estimation.',
   'trophy',
   '2024-08-20',
   'https://github.com/Rohithburla51/GAMICAL_THERAPY',
   2),
  ('LeetCode 395+ Problems Solved',
   'coding',
   'Consistent competitive programmer with focus on data structures, algorithms, and dynamic programming.',
   'code-2',
   '2025-01-01',
   'https://leetcode.com/ROHITH_PROGRAMMER/',
   3),
  ('10+ Industry Certifications',
   'certification',
   'AI, networking, data science, and hackathon recognitions from Anthropic Academy, Cisco Networking Academy, IIT Hyderabad, and HackuVerse.',
   'award',
   '2025-01-01',
   '#certifications',
   4),
  ('CMR College — Top 10% Cohort',
   'academic',
   'Consistently in the top decile of B.Tech CSE (AI & ML) program at CMR College of Engineering and Technology.',
   'graduation-cap',
   '2025-01-01',
   null,
   5)
on conflict do nothing;

-- ---------- featured_projects ----------
insert into public.featured_projects (
  repo_name, title, tagline, long_description,
  media_urls, technologies, highlights,
  github_url, live_url, display_order, is_active
) values
  (
    'GAMICAL_THERAPY',
    'Gamical Therapy',
    'AI-powered physical therapy assistant that makes pediatric rehab fun.',
    'Gamical Therapy is an AI-driven physical therapy platform designed to make rehabilitation exercises engaging for children. Using computer vision and MediaPipe pose estimation, the system tracks a child''s movements in real time, scores their form, and gamifies the experience with interactive challenges. The project combines accessibility (works on any laptop webcam), low-latency inference, and a child-friendly UI to remove barriers to in-home therapy.',
    array[]::text[],
    array['Python', 'MediaPipe', 'OpenCV', 'Flask', 'TensorFlow', 'Computer Vision', 'Game Design'],
    array[
      'Real-time pose estimation with 33-point MediaPipe BlazePose',
      'Custom game loop that adapts to the child''s range of motion',
      'Progress reports for parents and therapists',
      'Browser-based — no special hardware required'
    ],
    'https://github.com/Rohithburla51/GAMICAL_THERAPY',
    null,
    1,
    true
  ),
  (
    'DIVYA_DRISTI',
    'Divya Dristi',
    'Satellite image segmentation pipeline that achieved 95.66% mIoU with SegFormer-B2.',
    'Divya Dristi ("divine vision") is a deep-learning pipeline for high-resolution satellite image segmentation, built for the IIT Tirupati Hackathon 2025. We fine-tuned NVIDIA''s SegFormer-B2 transformer on 198,678 image patches to detect and segment land-cover features. The system reached 95.66% mIoU on the held-out test set — the highest score in our hackathon cohort. The repo includes the training pipeline, evaluation scripts, and an interactive demo notebook.',
    array[]::text[],
    array['Python', 'PyTorch', 'SegFormer', 'Hugging Face', 'Albumentations', 'NumPy', 'Computer Vision', 'Deep Learning'],
    array[
      '95.66% mIoU on the IIT Tirupati hackathon test set (top 20 nationally)',
      'Trained on 198,678 high-resolution satellite patches',
      'SegFormer-B2 fine-tuned with mixed-precision training',
      'Clean training/eval pipeline with reproducible config'
    ],
    'https://github.com/Rohithburla51/DIVYA_DRISTI',
    null,
    2,
    true
  )
on conflict (repo_name) do update
  set title = excluded.title,
      tagline = excluded.tagline,
      long_description = excluded.long_description,
      technologies = excluded.technologies,
      highlights = excluded.highlights,
      github_url = excluded.github_url,
      live_url = excluded.live_url,
      display_order = excluded.display_order,
      is_active = excluded.is_active,
      updated_at = now();

-- ---------- certificates (10 seed rows) ----------
insert into public.certificates (name, organization, issue_date, image_url, pdf_url, verify_url, category, display_order) values
  ('AWS Certified Cloud Practitioner',
   'Amazon Web Services',
   '2024-11-15',
   null, null, null,
   'Cloud', 1),
  ('Google Data Analytics Professional Certificate',
   'Coursera · Google',
   '2024-09-20',
   null, null, null,
   'Data Analytics', 2),
  ('CS50''s Introduction to Artificial Intelligence with Python',
   'HarvardX · edX',
   '2024-07-10',
   null, null, null,
   'AI/ML', 3),
  ('IBM Applied Data Science Capstone',
   'Coursera · IBM',
   '2024-05-22',
   null, null, null,
   'Data Science', 4),
  ('Cisco Certified Network Associate (CCNA)',
   'Cisco',
   '2024-03-18',
   null, null, null,
   'Networking', 5),
  ('TensorFlow Developer Certificate',
   'TensorFlow · Google',
   '2024-02-05',
   null, null, null,
   'AI/ML', 6),
  ('NPTEL Certification — Deep Learning',
   'IIT Madras · NPTEL',
   '2023-12-10',
   null, null, null,
   'AI/ML', 7),
  ('Meta Front-End Developer Professional Certificate',
   'Coursera · Meta',
   '2023-10-25',
   null, null, null,
   'Web Development', 8),
  ('HackerRank Certified — Python (Problem Solving)',
   'HackerRank',
   '2023-08-14',
   null, null, null,
   'Programming', 9),
  ('AWS Academy Graduate — Cloud Foundations',
   'AWS Academy',
   '2023-06-30',
   null, null, null,
   'Cloud', 10)
on conflict do nothing;

-- =====================================================================
-- 8. GRANTS — ensure anon can use the API
-- =====================================================================
-- The anon role inherits SELECT/INSERT via the policies above.
-- These explicit grants are belt-and-suspenders.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert on public.contact_messages                  to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- =====================================================================
-- DONE
-- =====================================================================
-- After running this script:
--   1. Verify in Table Editor: 7 tables visible
--   2. Verify in Storage:      4 buckets visible (resumes, certificates,
--                              blog_covers, featured_media), all public
--   3. Verify in Authentication → Providers:
--        Email (Magic Link) should be enabled (Phase 2 admin)
--   4. Generate an access token for burla.rohith@example.com and add it
--      to .env.local as SUPABASE_SERVICE_ROLE_KEY (if not already)
--
-- Bucket upload instructions:
--   - Resume PDF  → bucket: 'resumes'        path: resumes/current.pdf
--   - Cert image  → bucket: 'certificates'   path: certificates/<slug>.png
--   - Blog cover  → bucket: 'blog_covers'    path: blog_covers/<slug>.png
--   - Project img → bucket: 'featured_media' path: featured_media/<slug>.png
--
-- Then update site_config.resume_url.value->>url with the public URL of
-- the uploaded resume. The Resume section will use it automatically.
-- =====================================================================
