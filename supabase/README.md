# Supabase Setup

1. Create a project at https://supabase.com
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **SQL Editor → New query**, paste the contents of `schema.sql`, and run.
4. Go to **Authentication → URL Configuration** and add your site URL to allowed redirect URLs.
5. Done. Tables, RLS policies, and storage buckets are now in place.
