-- =====================================================================
-- github_projects — enrichment layer for GitHub repos
-- Run in Supabase SQL Editor
-- =====================================================================

create table if not exists public.github_projects (
  id              uuid primary key default uuid_generate_v4(),
  repo_name       text unique not null,          -- matches GitHub repo name
  title_override  text,                          -- custom display title (null = use repo name)
  description     text,                          -- custom description (null = use GitHub description)
  highlights      text[] default '{}',           -- bullet points
  technologies    text[] default '{}',           -- tech stack badges
  live_url        text,                          -- live demo link
  is_hidden       boolean not null default false, -- hide from portfolio
  display_order   integer not null default 0,    -- sort order (0 = auto by stars/date)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.github_projects is
  'Admin-controlled enrichment for GitHub repos — descriptions, highlights, and visibility overrides.';

-- Trigger: auto-update updated_at
drop trigger if exists trg_github_projects_updated_at on public.github_projects;
create trigger trg_github_projects_updated_at
  before update on public.github_projects
  for each row execute function public.set_updated_at();

-- Index
create index if not exists idx_github_projects_repo_name
  on public.github_projects (repo_name);

create index if not exists idx_github_projects_hidden
  on public.github_projects (is_hidden, display_order);

-- RLS
alter table public.github_projects enable row level security;

drop policy if exists "github_projects_public_read" on public.github_projects;
create policy "github_projects_public_read"
  on public.github_projects for select
  to anon, authenticated
  using (true);

-- Service role bypasses RLS for admin writes
