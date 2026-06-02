# Deployment Guide — Burla Rohith Portfolio

End-to-end guide to deploy the Next.js 16 portfolio to Vercel with Supabase as the data backend.

---

## Prerequisites

- GitHub account (`Rohithburla51`)
- Vercel account (free tier is fine)
- Supabase project: `ulqrhcfzxmsijzcumqyp.supabase.co`
- Node.js 20+ locally (for verification)
- All env vars from `.env.local` (see "Environment Variables" below)

---

## 1. Environment Variables

The portfolio requires the following variables. Set them in **Vercel → Project → Settings → Environment Variables**.

| Variable | Where to find it | Required for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project → Settings → API | All public reads (certs, projects, achievements, site config) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project → Settings → API (anon `public` key) | All public reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project → Settings → API (service_role) | Admin writes (Phase 2 only — not needed for Phase 1) |
| `NEXT_PUBLIC_LEETCODE_USERNAME` | Your LeetCode username (`ROHITH_PROGRAMMER`) | About section live stats |
| `LEETCODE_API_BASE` | `https://alfa-leetcode-api.onrender.com` (default) | LeetCode fallback API |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens | GitHub projects auto-fetch |
| `GITHUB_USERNAME` | `Rohithburla51` | GitHub projects list |
| `RESEND_API_KEY` | Resend → API Keys | Contact form email |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` (default) or your verified domain | Contact form sender |
| `CONTACT_TO_EMAIL` | `burlarohith999@gmail.com` | Contact form recipient |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` (set after first deploy) | OG tags, canonical URLs |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile | Contact form spam protection (optional) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile | Server-side verification (optional) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 | Analytics (optional) |

> **Never commit `.env.local`** — it's gitignored. Use `.env.example` for documentation.

---

## 2. Push to GitHub

```bash
# One-time: create a private/public repo on github.com/Rohithburla51/portfolio
# (or use whatever name you prefer)

cd C:\Users\burla\OneDrive\Desktop\portfolio
git init -b main
git add .
git commit -m "feat: phase 1 portfolio (hero, projects, certs, achievements, contact, blog)"
git remote add origin https://github.com/Rohithburla51/portfolio.git
git push -u origin main
```

If the push prompts for credentials, use a GitHub PAT (Personal Access Token) as the password — not your GitHub account password. Create one at <https://github.com/settings/tokens> (fine-grained, with `Contents: Read and write` on the repo).

---

## 3. Deploy to Vercel

### Option A: One-click import (recommended)

1. Go to <https://vercel.com/new>
2. Click **"Import Git Repository"**
3. Select `Rohithburla51/portfolio` (or whatever you named it)
4. Vercel auto-detects **Next.js** as the framework — leave defaults:
   - Build Command: `next build` (auto)
   - Output Directory: `.next` (auto)
   - Install Command: `npm install` (auto)
5. **Before clicking Deploy**, expand **"Environment Variables"** and add every variable from the table above
6. Click **Deploy**
7. Wait ~2-3 minutes. Build should succeed. Once done, you'll get a URL like `https://portfolio-xxxxx.vercel.app`

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login                  # opens browser for auth
vercel link                   # links to your Vercel project
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... repeat for each variable
vercel --prod                 # deploys to production
```

---

## 4. Post-deploy

1. **Set `NEXT_PUBLIC_SITE_URL`** in Vercel env vars to your real domain (e.g. `https://burlarohith.com` or the Vercel preview URL). Redeploy.
2. **Add a custom domain** (optional): Vercel → Project → Settings → Domains. Add `burlarohith.com` (or whatever you own). Update DNS per Vercel's instructions.
3. **Verify**:
   - Home page loads in <2s
   - All 5 sections (Hero, About, Skills, Projects, Contact) render with real data
   - Resume PDF downloads
   - Cert modal opens and embeds the PDF
   - Submit the contact form — check both Supabase `contact_messages` table and your `burlarohith999@gmail.com` inbox

---

## 5. Resend (email) — production gotcha

By default, the contact form sends from `onboarding@resend.dev` (Resend's sandbox). This works in dev but is throttled in production. For real delivery:

1. Buy a domain (e.g. `burlarohith.com` — Namecheap, Cloudflare Registrar, etc.)
2. Add it to Resend → Domains → Add Domain
3. Add the DNS records Resend shows you (SPF, DKIM, DMARC) to your domain registrar
4. Once verified, set `RESEND_FROM_EMAIL=noreply@burlarohith.com` in Vercel env
5. Redeploy

Without this, contact form submissions still get stored in Supabase, but the email lands in your Resend dashboard, not your inbox.

---

## 6. Supabase service role key (Phase 2 only)

The current `sb_secret_UGmIcR-...` key in `.env.local` returns 401 (likely truncated). This is fine for Phase 1 — all reads use the anon key. For Phase 2 admin writes:

1. Supabase → Project → Settings → API
2. Click **"Generate new service role key"** if the current one is broken
3. Copy the full 64-char secret (starts with `sb_secret_`)
4. Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel env
5. Redeploy

---

## 7. Continuous deployment

Every `git push` to `main` triggers a Vercel build automatically. To skip a deploy, add `[skip ci]` to the commit message.

Preview deploys are auto-created for every PR — useful for testing before merging.

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails: "supabase is possibly null" | Check `NEXT_PUBLIC_SUPABASE_URL` is set without trailing `/rest/v1/` |
| Cert section empty | Run `supabase/seed-certs.sql` in Supabase SQL Editor |
| Contact form returns 200 but no email | Resend sandbox — verify custom domain (see §5) |
| LeetCode stats show 395 (fallback) | Alfa API down or username wrong — check `NEXT_PUBLIC_LEETCODE_USERNAME` |
| GitHub projects empty | Token expired or scopes wrong — regenerate `GITHUB_TOKEN` |
| `/icon.png` 404 in dev | Fixed: `app/icon.png` is now a static file (gradient + "BR") |

---

## 9. Project structure (deployable surface)

```
portfolio/
├── app/                    # Next.js App Router (deploy this)
├── components/             # React components (deploy this)
├── lib/                    # Data access + utilities (deploy this)
├── public/                 # Static assets (cert PDFs, resume, og image) (deploy this)
│   ├── certificates/       # 12 real cert PDFs
│   ├── resume.pdf          # User's real resume
│   └── ...
├── supabase/               # Database schema (NOT deployed — runs in Supabase)
│   ├── schema.sql          # Tables, RLS policies, storage buckets
│   └── seed-certs.sql      # Idempotent cert seed (run once)
├── scripts/                # Screenshot tools (NOT deployed — dev only)
├── .env.example            # Env var documentation (deploy this)
├── .gitignore              # Standard Next.js + .preview/ + logs
├── next.config.ts          # Next.js config (deploy this)
├── package.json            # Dependencies (deploy this)
└── tsconfig.json           # TypeScript config (deploy this)
```

Vercel uses `package.json` to detect Next.js, runs `npm install` + `next build`, and serves the output. Anything not in `app/`, `components/`, `lib/`, `public/`, or referenced by `package.json` is ignored.

---

## 10. Estimated costs

- **Vercel**: Free for hobby projects (100GB bandwidth/month, unlimited sites)
- **Supabase**: Free tier (500MB DB, 1GB storage, 50k MAU) — more than enough
- **Resend**: Free tier (100 emails/day, 3k/month)
- **Domain**: $10-15/year if you want a custom URL

**Total: $0-15/year** to run.
