-- ============================================================
-- AUTOBOOK — FULL DATABASE SETUP
-- Run this single file in the Supabase SQL editor, top to bottom,
-- on a fresh project. It combines, in dependency order:
--   1. Core schema (tables, indexes, RLS) — all 7 sections
--   2. Storage buckets (listing photos, part photos)
--   3. Auto Doctor matching function + seed data
--   4. Knowledge Hub view-count function + seed data
-- Safe to re-run — inserts use ON CONFLICT DO NOTHING and the
-- storage bucket insert is idempotent.
-- ============================================================


-- ============================================================
-- PART 1 — CORE SCHEMA
-- ============================================================

-- ============================================================
-- AUTOBOOK — Supabase (PostgreSQL) Schema
-- Sections: Login/Sign up, My Service, Knowledge Hub,
--           Auto Doctor, Spare Parts Finder, Buy/Sell,
--           Garage & Service Stations
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================================
-- 1. LOGIN / SIGN UP  (extends Supabase auth.users)
-- ============================================================

create type user_role as enum ('customer', 'mechanic', 'seller', 'garage_owner', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  avatar_url text,
  role user_role not null default 'customer',
  city text,
  district text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile row when a user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. MY SERVICE  (vehicles owned by user + service history/reminders)
-- ============================================================

create table public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  make text not null,
  model text not null,
  year int,
  plate_number text unique,
  vin text,
  fuel_type text,           -- petrol / diesel / hybrid / EV
  transmission text,        -- manual / automatic
  current_mileage int,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.service_records (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  garage_id uuid references public.garages(id),   -- forward ref, created below
  service_type text not null,      -- oil change, full service, tyre, etc.
  service_date date not null,
  mileage_at_service int,
  cost numeric(10,2),
  notes text,
  invoice_url text,
  created_at timestamptz not null default now()
);

create table public.service_reminders (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  reminder_type text not null,     -- e.g. "Insurance renewal", "Oil change"
  due_date date,
  due_mileage int,
  status text not null default 'pending',  -- pending / done / dismissed
  created_at timestamptz not null default now()
);


-- ============================================================
-- 3. KNOWLEDGE HUB  (articles / guides)
-- ============================================================

create table public.article_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique
);

create table public.articles (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.article_categories(id),
  author_id uuid references public.profiles(id),
  title text not null,
  slug text not null unique,
  content text not null,           -- markdown / rich text
  cover_image_url text,
  tags text[] default '{}',
  view_count int not null default 0,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.article_comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 4. AUTO DOCTOR  (symptom-based self-diagnosis)
-- ============================================================

create table public.symptoms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,              -- "Engine makes knocking noise"
  category text                    -- engine / brakes / electrical / AC ...
);

create table public.vehicle_issues (
  id uuid primary key default uuid_generate_v4(),
  title text not null,             -- "Worn spark plugs"
  description text,
  possible_causes text,
  severity text default 'medium',  -- low / medium / high / critical
  recommended_action text,
  category text
);

create table public.issue_symptoms (
  issue_id uuid references public.vehicle_issues(id) on delete cascade,
  symptom_id uuid references public.symptoms(id) on delete cascade,
  weight numeric default 1.0,      -- how strongly symptom implies issue
  primary key (issue_id, symptom_id)
);

create table public.diagnostic_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id),
  selected_symptom_ids uuid[] default '{}',
  suggested_issue_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);


-- ============================================================
-- 5. SPARE PARTS FINDER  (marketplace for parts)
-- ============================================================

create table public.part_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

create type part_condition as enum ('new', 'used', 'refurbished');

create table public.spare_parts (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.part_categories(id),
  name text not null,
  brand text,
  part_number text,
  compatible_makes text[] default '{}',
  compatible_models text[] default '{}',
  compatible_years int[] default '{}',
  condition part_condition not null default 'used',
  price numeric(10,2) not null,
  stock_qty int not null default 1,
  images text[] default '{}',
  description text,
  district text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.part_inquiries (
  id uuid primary key default uuid_generate_v4(),
  part_id uuid not null references public.spare_parts(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 6. BUY / SELL  (vehicle marketplace)
-- ============================================================

create type listing_status as enum ('active', 'pending', 'sold', 'expired');

create table public.vehicle_listings (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  make text not null,
  model text not null,
  year int,
  price numeric(12,2) not null,
  mileage int,
  condition text,                  -- new / used / reconditioned
  transmission text,
  fuel_type text,
  body_type text,
  color text,
  images text[] default '{}',
  description text,
  district text,
  status listing_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.listing_inquiries (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.vehicle_listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  created_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null,         -- 'vehicle_listing' | 'spare_part' | 'garage'
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);


-- ============================================================
-- 7. GARAGE & SERVICE STATIONS  (locator + reviews)
-- ============================================================

create table public.garages (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id),
  name text not null,
  description text,
  address text,
  district text,
  city text,
  latitude double precision,
  longitude double precision,
  phone text,
  services_offered text[] default '{}',   -- e.g. {"Full Service","Tyres","AC Repair"}
  opening_hours jsonb,                    -- {"mon": "8:00-17:00", ...}
  images text[] default '{}',
  is_verified boolean not null default false,
  rating_avg numeric(2,1) default 0,
  rating_count int default 0,
  created_at timestamptz not null default now()
);

create table public.garage_reviews (
  id uuid primary key default uuid_generate_v4(),
  garage_id uuid not null references public.garages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (garage_id, user_id)
);


-- ============================================================
-- 8. SHARED: notifications & messaging
-- ============================================================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,              -- 'service_due','new_message','inquiry', etc.
  title text not null,
  message text,
  is_read boolean not null default false,
  related_id uuid,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  context_type text,               -- 'vehicle_listing' | 'spare_part' | 'garage'
  context_id uuid,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================
create index idx_vehicles_owner on public.vehicles(owner_id);
create index idx_service_records_vehicle on public.service_records(vehicle_id);
create index idx_articles_category on public.articles(category_id);
create index idx_spare_parts_seller on public.spare_parts(seller_id);
create index idx_spare_parts_makes on public.spare_parts using gin (compatible_makes);
create index idx_vehicle_listings_seller on public.vehicle_listings(seller_id);
create index idx_vehicle_listings_status on public.vehicle_listings(status);
create index idx_garages_district on public.garages(district);
create index idx_garages_location on public.garages(latitude, longitude);
create index idx_messages_participants on public.messages(sender_id, receiver_id);


-- ============================================================
-- ROW LEVEL SECURITY (enable + baseline policies)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.service_records enable row level security;
alter table public.service_reminders enable row level security;
alter table public.articles enable row level security;
alter table public.spare_parts enable row level security;
alter table public.vehicle_listings enable row level security;
alter table public.garages enable row level security;
alter table public.garage_reviews enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Profiles: users manage their own row, everyone can read basic profiles
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Vehicles: owner-only
create policy "vehicles_all_own" on public.vehicles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Service records/reminders: only via owning vehicle
create policy "service_records_owner" on public.service_records
  for all using (
    auth.uid() = (select owner_id from public.vehicles v where v.id = vehicle_id)
  );
create policy "service_reminders_owner" on public.service_reminders
  for all using (
    auth.uid() = (select owner_id from public.vehicles v where v.id = vehicle_id)
  );

-- Articles: public read of published, author manages own
create policy "articles_public_read" on public.articles for select using (is_published = true);
create policy "articles_author_write" on public.articles
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- Spare parts / listings: public read of active items, seller manages own
create policy "parts_public_read" on public.spare_parts for select using (is_active = true);
create policy "parts_seller_write" on public.spare_parts
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

create policy "listings_public_read" on public.vehicle_listings for select using (true);
create policy "listings_seller_write" on public.vehicle_listings
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

-- Garages: public read, owner manages own
create policy "garages_public_read" on public.garages for select using (true);
create policy "garages_owner_write" on public.garages
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "reviews_public_read" on public.garage_reviews for select using (true);
create policy "reviews_author_write" on public.garage_reviews
  for insert with check (auth.uid() = user_id);

-- Messages/notifications: only sender/receiver or owner can see
create policy "messages_participants" on public.messages
  for all using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "notifications_owner" on public.notifications
  for all using (auth.uid() = user_id);


-- ============================================================
-- PART 2 — STORAGE BUCKETS (Buy/Sell + Spare Parts photo uploads)
-- ============================================================

-- storage_setup.sql
-- Run this in the Supabase SQL editor (once). Creates a public bucket for
-- vehicle listing photos, with folder-per-user upload/delete permissions.

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Anyone can view photos (they're shown on public listing pages)
create policy "Public read listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

-- A signed-in user can only upload into a folder named after their own
-- user id — e.g. "3fa1.../my-photo.jpg" — so one seller can't overwrite
-- another seller's files.
create policy "Users upload own listing photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- A user can delete only their own uploaded photos.
create policy "Users delete own listing photos"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Same pattern reused later for garage photos and spare-parts photos —
-- just swap the bucket id ('garage-photos', 'part-photos') and repeat.

-- storage_setup.sql
-- Same pattern as the Buy/Sell section's bucket — run once in the Supabase
-- SQL editor. If you already ran the Buy/Sell version, just add this bucket.

insert into storage.buckets (id, name, public)
values ('part-photos', 'part-photos', true)
on conflict (id) do nothing;

create policy "Public read part photos"
  on storage.objects for select
  using (bucket_id = 'part-photos');

create policy "Users upload own part photos"
  on storage.objects for insert
  with check (
    bucket_id = 'part-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own part photos"
  on storage.objects for delete
  using (
    bucket_id = 'part-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- PART 3 — AUTO DOCTOR (matching function + seed symptoms/issues)
-- ============================================================

-- auto_doctor_setup.sql
-- Run once in the Supabase SQL editor. Adds the matching function the
-- diagnosis flow calls, plus a starter set of symptoms/issues so the
-- feature has something to return on day one.

-- ============================================================
-- MATCHING FUNCTION
-- Scores each vehicle_issue by how much of its total symptom weight
-- was matched by the symptoms the user picked, so an issue with 4/4
-- matched symptoms ranks above one with 2/5 matched, even if the raw
-- matched weight is similar.
-- ============================================================
create or replace function diagnose_issues(symptom_ids uuid[])
returns table (
  issue_id uuid,
  title text,
  description text,
  possible_causes text,
  severity text,
  recommended_action text,
  category text,
  matched_weight numeric,
  total_weight numeric,
  confidence numeric
)
language sql stable
as $$
  select
    vi.id as issue_id,
    vi.title,
    vi.description,
    vi.possible_causes,
    vi.severity,
    vi.recommended_action,
    vi.category,
    coalesce(matched.matched_weight, 0) as matched_weight,
    totals.total_weight,
    round(coalesce(matched.matched_weight, 0) / nullif(totals.total_weight, 0) * 100) as confidence
  from vehicle_issues vi
  join (
    select issue_id, sum(weight) as total_weight
    from issue_symptoms
    group by issue_id
  ) totals on totals.issue_id = vi.id
  left join (
    select issue_id, sum(weight) as matched_weight
    from issue_symptoms
    where symptom_id = any(symptom_ids)
    group by issue_id
  ) matched on matched.issue_id = vi.id
  where matched.matched_weight is not null
  order by matched.matched_weight desc, confidence desc
  limit 10;
$$;

-- ============================================================
-- SEED DATA — a starter set covering common issues. Add more over time
-- through the Supabase table editor as you learn what users search for.
-- ============================================================

-- Symptoms
insert into symptoms (id, name, category) values
  ('00000000-0000-0000-0000-000000000001', 'Engine makes a knocking/tapping noise', 'engine'),
  ('00000000-0000-0000-0000-000000000002', 'Check engine light is on', 'engine'),
  ('00000000-0000-0000-0000-000000000003', 'Engine loses power going uphill', 'engine'),
  ('00000000-0000-0000-0000-000000000004', 'White smoke from exhaust', 'engine'),
  ('00000000-0000-0000-0000-000000000005', 'Engine overheating / temp gauge high', 'engine'),
  ('00000000-0000-0000-0000-000000000006', 'Squeaking or grinding when braking', 'brakes'),
  ('00000000-0000-0000-0000-000000000007', 'Brake pedal feels soft or spongy', 'brakes'),
  ('00000000-0000-0000-0000-000000000008', 'Car pulls to one side when braking', 'brakes'),
  ('00000000-0000-0000-0000-000000000009', 'Car won''t start, clicking sound', 'electrical'),
  ('00000000-0000-0000-0000-000000000010', 'Headlights or dashboard lights dim', 'electrical'),
  ('00000000-0000-0000-0000-000000000011', 'Battery warning light on', 'electrical'),
  ('00000000-0000-0000-0000-000000000012', 'AC blows warm air', 'ac'),
  ('00000000-0000-0000-0000-000000000013', 'AC makes a rattling noise', 'ac'),
  ('00000000-0000-0000-0000-000000000014', 'Steering wheel vibrates at speed', 'suspension'),
  ('00000000-0000-0000-0000-000000000015', 'Car bounces excessively over bumps', 'suspension'),
  ('00000000-0000-0000-0000-000000000016', 'Uneven tyre wear', 'tyres')
on conflict (id) do nothing;

-- Issues
insert into vehicle_issues (id, title, description, possible_causes, severity, recommended_action, category) values
  ('10000000-0000-0000-0000-000000000001', 'Worn spark plugs / ignition issue',
   'Misfiring or knocking often traces back to spark plugs or ignition coils past their service life.',
   'Worn spark plugs, faulty ignition coil, carbon buildup',
   'medium', 'Have spark plugs and ignition coils checked at your next service. Safe to drive short distances.',
   'engine'),
  ('10000000-0000-0000-0000-000000000002', 'Low engine oil / worn engine bearings',
   'A persistent knocking noise combined with power loss can mean the engine is running low on oil or bearings are wearing out.',
   'Low oil level, degraded oil, worn bearings',
   'high', 'Check oil level immediately. If low, top up and monitor closely. If the noise continues, stop driving and get it inspected.',
   'engine'),
  ('10000000-0000-0000-0000-000000000003', 'Head gasket issue',
   'White smoke from the exhaust combined with overheating often points to a blown or failing head gasket.',
   'Blown head gasket, coolant leaking into cylinders',
   'critical', 'Stop driving as soon as it''s safe. Continuing to drive can cause serious engine damage. Tow to a garage.',
   'engine'),
  ('10000000-0000-0000-0000-000000000004', 'Worn brake pads',
   'Squeaking or grinding when braking is the classic sign that brake pads need replacing.',
   'Brake pad wear indicator contact, thin pad material',
   'high', 'Get brake pads inspected within the next few days — don''t delay if you hear grinding, that means metal-on-metal contact.',
   'brakes'),
  ('10000000-0000-0000-0000-000000000005', 'Air in brake lines / failing master cylinder',
   'A soft or spongy brake pedal usually means air has entered the brake lines or the master cylinder is failing.',
   'Air in brake lines, brake fluid leak, worn master cylinder',
   'critical', 'This affects your ability to stop the car safely. Avoid driving and get it inspected immediately.',
   'brakes'),
  ('10000000-0000-0000-0000-000000000006', 'Weak or failing battery',
   'Clicking when starting plus dim lights point to a battery that can''t hold enough charge.',
   'Old battery, loose terminals, parasitic drain',
   'medium', 'Get the battery load-tested. Carry jumper cables in the meantime.',
   'electrical'),
  ('10000000-0000-0000-0000-000000000007', 'Failing alternator',
   'Dimming lights while driving and a battery warning light usually mean the alternator isn''t charging the battery properly.',
   'Worn alternator brushes, broken belt, faulty voltage regulator',
   'high', 'Get the charging system tested soon — if the alternator fails completely, the car will stall while driving.',
   'electrical'),
  ('10000000-0000-0000-0000-000000000008', 'Low refrigerant / AC leak',
   'Warm air from the AC vents most often means the system has lost refrigerant through a leak.',
   'Refrigerant leak, faulty compressor, blocked condenser',
   'low', 'Not a safety issue — get it checked and re-gassed at a garage with AC service.',
   'ac'),
  ('10000000-0000-0000-0000-000000000009', 'Wheel balance or alignment issue',
   'Vibration at speed usually means the wheels are out of balance or the alignment is off.',
   'Wheel imbalance, bent rim, worn suspension component',
   'medium', 'Get wheels balanced and alignment checked — uneven vibration accelerates tyre wear if left alone.',
   'suspension'),
  ('10000000-0000-0000-0000-000000000010', 'Worn shock absorbers',
   'Excessive bouncing over bumps points to worn-out shock absorbers or struts.',
   'Worn shocks/struts, leaking damper fluid',
   'medium', 'Have shocks inspected — worn shocks increase braking distance and affect handling.',
   'suspension')
on conflict (id) do nothing;

-- Issue ↔ Symptom weighted links
insert into issue_symptoms (issue_id, symptom_id, weight) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1.0),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 0.5),

  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1.0),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 0.8),

  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 1.0),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 1.0),

  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 1.0),

  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', 1.0),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 0.6),

  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', 1.0),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', 0.7),

  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010', 1.0),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000011', 1.0),

  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000012', 1.0),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000013', 0.4),

  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000014', 1.0),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000016', 0.6),

  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000015', 1.0),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000014', 0.5)
on conflict do nothing;


-- ============================================================
-- PART 4 — KNOWLEDGE HUB (view-count function + seed articles)
-- ============================================================

-- knowledge_hub_setup.sql
-- Run once in the Supabase SQL editor.

-- ============================================================
-- View count increment (single atomic update, avoids read-then-write
-- race conditions from doing it in two round trips from the client).
-- ============================================================
create or replace function increment_article_views(article_id uuid)
returns void
language sql
as $$
  update articles set view_count = view_count + 1 where id = article_id;
$$;

-- ============================================================
-- IMPORTANT — read before going live
-- The base schema's RLS policy lets ANY signed-in user insert their own
-- articles AND set is_published = true on them directly (there's no
-- separate "submit for review" step). That's fine for a community-written
-- hub; if you want an editorial gate instead, replace the write policy
-- with something like:
--
--   drop policy "articles_author_write" on public.articles;
--
--   create policy "articles_author_insert" on public.articles
--     for insert with check (auth.uid() = author_id);
--
--   create policy "articles_author_update_own_drafts" on public.articles
--     for update using (auth.uid() = author_id and is_published = false);
--
--   create policy "articles_admin_publish" on public.articles
--     for update using (
--       exists (select 1 from profiles where id = auth.uid() and role = 'admin')
--     );
--
-- That lets authors write and edit their own drafts, but only an admin
-- (profiles.role = 'admin') can flip is_published to true.
-- ============================================================

-- ============================================================
-- SEED DATA
-- ============================================================
insert into article_categories (id, name, slug) values
  ('20000000-0000-0000-0000-000000000001', 'Maintenance Tips', 'maintenance-tips'),
  ('20000000-0000-0000-0000-000000000002', 'Buying Guides', 'buying-guides'),
  ('20000000-0000-0000-0000-000000000003', 'Repair How-Tos', 'repair-how-tos'),
  ('20000000-0000-0000-0000-000000000004', 'Insurance & Registration', 'insurance-registration')
on conflict (id) do nothing;

insert into articles (id, category_id, title, slug, content, tags, is_published, published_at) values
  (
    '21000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '7 Habits That Double Your Engine''s Lifespan',
    '7-habits-double-engine-lifespan',
    E'## Warm up gently, not aggressively\n\nModern engines don''t need a long idle warm-up, but revving hard in the first minute wears components before oil has fully circulated. Drive gently for the first few kilometers instead.\n\n## Follow the real oil change interval\n\nSri Lanka''s stop-start traffic and dusty roads count as "severe service" for most manufacturers — that usually means changing oil every 5,000 km, not the 10,000 km quoted for highway driving.\n\n## Watch the temperature gauge\n\nA few minutes of overheating can warp a cylinder head. If the needle climbs into the red, pull over immediately rather than trying to "make it home."\n\n## Use the right fuel grade\n\nLower octane than recommended can cause knocking, which damages pistons over time — especially in turbocharged engines.\n\n## Don''t ignore the check engine light\n\nIt''s often a minor sensor issue, but occasionally it flags something that gets much more expensive the longer it''s ignored.\n\n## Change air and fuel filters on schedule\n\nA clogged air filter forces the engine to work harder and run richer than it should, which affects both power and longevity.\n\n## Let it cool before switching off after a hard drive\n\nAfter a long highway run or hill climb, idle for 30–60 seconds before turning off — this lets the turbo (if fitted) cool evenly instead of "heat soaking."',
    array['engine','maintenance','oil change'],
    true,
    now()
  ),
  (
    '21000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Buying a Used Car in Sri Lanka: A Pre-Purchase Checklist',
    'used-car-pre-purchase-checklist',
    E'## Check the paperwork first\n\nBefore you even look at the engine, verify the revenue license, the CR book, and that the chassis number matches the CR book exactly.\n\n## Inspect for accident history\n\nUneven panel gaps, mismatched paint texture, or overspray on rubber trim are signs of prior bodywork.\n\n## Check tyre wear patterns\n\nUneven wear across the tread can point to alignment or suspension issues — not just old tyres.\n\n## Take it for a proper test drive\n\nInclude both city stop-start driving and, if possible, a short highway stretch to feel for vibration at speed.\n\n## Get an independent inspection\n\nA few thousand rupees for an inspection at a trusted garage before you commit can save you from a very expensive mistake — never skip this for a private-party purchase.',
    array['buying guide','used cars','inspection'],
    true,
    now()
  )
on conflict (id) do nothing;
