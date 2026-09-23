# Autobook

Sri Lanka's automobile platform — all 7 sections assembled into one Next.js
14 (App Router) + Supabase project.

## 1. Install

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at supabase.com (or use an existing one).
2. Open the SQL editor and run **`database_setup.sql`** — one file, does
   everything: creates every table across all sections, sets up Row Level
   Security, creates the two storage buckets (with folder-per-user upload
   policies), creates the Auto Doctor matching function, creates the
   Knowledge Hub view-count function, and seeds starter data (Auto Doctor
   symptoms/issues, Knowledge Hub categories/articles) so the app isn't
   empty on first load.
3. Copy `.env.local.example` to `.env.local` and fill in your project URL
   and anon key (Supabase dashboard → Settings → API).

```bash
cp .env.local.example .env.local
```

## 3. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`.

## What's here

| Section | Route | Notes |
|---|---|---|
| Login / Sign up | `/login`, `/signup` | Shared by every section via `?redirect=` |
| My Service | `/my-service` | Vehicles, service history, reminders |
| Knowledge Hub | `/knowledge-hub` | Articles, Markdown content, comments |
| Auto Doctor | `/auto-doctor` | Symptom checker with weighted matching |
| Spare Parts Finder | `/spare-parts` | Parts marketplace, photo upload |
| Buy & Sell | `/buy-sell` | Vehicle marketplace, photo upload, favorites |
| Garages & Service Stations | `/garages` | Directory, reviews, district filter |

Every section that needs an account (posting, favoriting, commenting)
redirects to `/login?redirect=<original page>` and lands you back where you
started after logging in.

## Known gaps (from each section's own README, now consolidated here)

- **Content moderation**: any signed-in user can currently publish a
  Knowledge Hub article directly — see `database_setup.sql` Part 4 for a
  commented-out RLS policy swap that adds an admin-approval step.
- **Favorites page**: the heart button on Buy/Sell and Spare Parts saves to
  the `favorites` table, but there's no page listing them yet.
- **Notifications UI**: inquiries write to the `notifications` table, but
  there's no bell icon / notification list surfacing them yet — worth
  building once, shared across sections.
- **Garage photos**: Garages don't have a photo upload yet (Buy/Sell and
  Spare Parts do) — same Storage pattern, just needs a
  `garage-photos` bucket and an uploader wired into the garage listing form.
- **Service History → Garage picker**: `service_records.garage_id` exists
  in the schema but the "Add record" form doesn't have a garage dropdown
  yet.
- **Auto Doctor ↔ My Service**: `diagnostic_sessions.vehicle_id` is ready
  but nothing currently lets you pick a vehicle before running a diagnosis.

None of these block using the app — they're the natural next round of
polish once the core flows are live.
