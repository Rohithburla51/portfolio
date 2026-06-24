-- =====================================================================
-- Chatbot Schema Updates
-- Supabase / PostgreSQL
-- =====================================================================
-- Run this in the Supabase SQL Editor after the main schema.sql
-- =====================================================================

-- =====================================================================
-- 1. CHATBOT SETTINGS TABLE
-- =====================================================================
create table if not exists public.chatbot_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

comment on table public.chatbot_settings is
  'Chatbot configuration (enable/disable, welcome message, name, suggested questions).';

-- =====================================================================
-- 2. INDEXES
-- =====================================================================
-- No additional indexes needed for key/value table

-- =====================================================================
-- 3. TRIGGERS
-- =====================================================================

drop trigger if exists trg_chatbot_settings_updated_at on public.chatbot_settings;

create trigger trg_chatbot_settings_updated_at
  before update on public.chatbot_settings
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================================

alter table public.chatbot_settings enable row level security;

drop policy if exists "chatbot_settings_public_read"
on public.chatbot_settings;

create policy "chatbot_settings_public_read"
  on public.chatbot_settings
  for select
  to anon, authenticated
  using (true);

-- Service role bypasses RLS automatically

-- =====================================================================
-- 5. SEED DEFAULT SETTINGS
-- =====================================================================

insert into public.chatbot_settings (key, value, updated_at)
values

(
  'enabled',
  '{"value": true}'::jsonb,
  now()
),

(
  'chatbot_name',
  '{"value": "Rohith''s AI Portfolio Assistant"}'::jsonb,
  now()
),

(
  'welcome_message',
  '{"value": "Hi! I''m Rohith''s AI Portfolio Assistant. Ask me anything about his projects, skills, certifications, achievements, education, or experience."}'::jsonb,
  now()
),

(
  'suggested_questions',
  '{
    "value": [
      "Who is Rohith?",
      "What projects has he built?",
      "What machine learning projects does he have?",
      "What certifications does he have?",
      "What skills does he know?",
      "What technologies has he worked with?",
      "What achievements does he have?",
      "What is his education?",
      "What is his experience?",
      "What hackathons has he participated in?",
      "What is his GitHub?",
      "What is his LinkedIn?",
      "How can I contact him?"
    ]
  }'::jsonb,
  now()
)

on conflict (key) do nothing;

-- =====================================================================
-- 6. CHAT HISTORY TABLE (OPTIONAL)
-- =====================================================================
-- Uncomment if you want server-side analytics
-- By default chat history remains in browser localStorage

/*
create table if not exists public.chat_history (
  id              uuid primary key default gen_random_uuid(),
  session_id      text not null,
  user_message    text not null,
  bot_response    text not null,
  created_at      timestamptz not null default now()
);

comment on table public.chat_history is
  'Optional: Server-side chat history for analytics.';

alter table public.chat_history enable row level security;

drop policy if exists "chat_history_admin_insert"
on public.chat_history;

create policy "chat_history_admin_insert"
  on public.chat_history
  for insert
  to authenticated
  with check (true);
*/

-- =====================================================================
-- DONE
-- =====================================================================
-- Verify:
-- 1. Table Editor -> chatbot_settings
-- 2. 4 default records inserted
-- 3. Admin chatbot settings page can read them
-- =====================================================================