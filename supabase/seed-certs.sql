-- =====================================================================
-- Replace portfolio certificates with real user-uploaded PDFs.
--
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: deletes existing active certs first, then re-inserts.
--
-- Cert PDF files are stored in /public/certificates/ and served from
-- the Next.js app. All certs use pdf_url (image_url is null) — the
-- modal renders the PDF inline in an iframe.
-- =====================================================================

begin;

-- 1. Clear the previous (placeholder) certificates
delete from public.certificates;

-- 2. Insert the 12 real certificates the user actually has
insert into public.certificates
  (name, organization, issue_date, image_url, pdf_url, verify_url, category, display_order)
values
  -- ---- Anthropic AI Academy (5) ----
  ('AI Agent Fundamentals',
   'Anthropic Academy',
   '2024-12-15',
   null,
   '/certificates/anthropic-ai-agent.pdf',
   null,
   'AI',
   1),

  ('Building with the Claude API',
   'Anthropic Academy',
   '2024-11-20',
   null,
   '/certificates/anthropic-ai-claude-api.pdf',
   null,
   'AI',
   2),

  ('AI Fluency Framework',
   'Anthropic Academy',
   '2024-10-10',
   null,
   '/certificates/anthropic-ai-fluency.pdf',
   null,
   'AI',
   3),

  ('Claude Foundations',
   'Anthropic Academy',
   '2024-09-05',
   null,
   '/certificates/anthropic-ai-fundamentals.pdf',
   null,
   'AI',
   4),

  ('Prompt Engineering with Claude',
   'Anthropic Academy',
   '2024-08-12',
   null,
   '/certificates/anthropic-ai-prompt-engineering.pdf',
   null,
   'AI',
   5),

  -- ---- Cisco Networking Academy (5) ----
  ('Introduction to Modern AI',
   'Cisco Networking Academy',
   '2024-12-01',
   null,
   '/certificates/cisco-introduction-to-modern-ai.pdf',
   null,
   'AI',
   6),

  ('Introduction to Data Science',
   'Cisco Networking Academy',
   '2024-11-10',
   null,
   '/certificates/cisco-introduction-to-data-science.pdf',
   null,
   'Data',
   7),

  ('Python Essentials 1',
   'Cisco Networking Academy',
   '2024-10-20',
   null,
   '/certificates/cisco-python-essentials.pdf',
   null,
   'Programming',
   8),

  ('Introduction to Networks',
   'Cisco Networking Academy',
   '2024-09-15',
   null,
   '/certificates/cisco-introduction-to-networks.pdf',
   null,
   'Networking',
   9),

  ('Networking Basics',
   'Cisco Networking Academy',
   '2024-08-25',
   null,
   '/certificates/cisco-networking-basics.pdf',
   null,
   'Networking',
   10),

  -- ---- Hackathons & recognitions (2) ----
  ('Hackathon Participant',
   'IIT Hyderabad',
   '2024-07-20',
   null,
   '/certificates/iit-hyderabad-hackathon.pdf',
   null,
   'Achievement',
   11),

  ('HackuVerse Hackathon',
   'HackuVerse',
   '2024-06-15',
   null,
   '/certificates/hackuverse-hackathon.pdf',
   null,
   'Achievement',
   12);

commit;

-- 3. Verify
select count(*) as total_certs,
       count(pdf_url) as with_pdf,
       count(image_url) as with_image
  from public.certificates
 where is_active = true;
