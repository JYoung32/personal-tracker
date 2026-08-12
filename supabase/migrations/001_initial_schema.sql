-- 001: initial schema
--
-- Creates every table in its current, final shape — ownership (`user_id`),
-- row-level security, the `profiles` table, `todos.tags`, and the two
-- `notes` columns are all part of table creation here, not bolted on by
-- later migrations. This file used to be four separate ones (002 added
-- ownership/profiles, 003 added tags, 004 was an incident cleanup, 005
-- added notes) that have since been folded back into this single file now
-- that they're all long since applied to production — same idea as the
-- earlier fold of the pre-migrations schema.sql into this file. See git
-- history for the individual migrations if you need the granular story.
--
-- Every table gets `user_id uuid not null default auth.uid() references
-- auth.users(id)` and an owner-only RLS policy (`auth.uid() = user_id`)
-- from creation — that's what actually enforces "separate accounts see
-- separate data," and it holds even against direct API calls, not just
-- what the UI happens to show.
--
-- This file never creates a permissive ("allow all") policy, not even
-- temporarily. An earlier version of this schema did, for the pre-Auth
-- era, and it caused a real production incident: re-running that version
-- against an already-owner-scoped database silently reinstated "allow
-- all" alongside the owner-only policy — Postgres OR's multiple
-- permissive policies together, so "allow all" alone was enough to expose
-- every row to every account. Each table below still has a `drop policy
-- if exists "allow all - X"` line, purely defensive — a no-op today, but
-- it means re-running this migration actively cleans up that policy name
-- if it's ever somehow reintroduced, instead of the reverse.
--
-- Column names are snake_case; the app's supabaseAdapter.js converts to/from
-- the camelCase shapes every feature already uses (id, createdAt, dueDate,
-- vehicleId, ...), so no feature code needs to know about this naming.
--
-- Written to be safely re-runnable — Supabase's GitHub integration
-- replays every file in supabase/migrations/ against preview branches
-- cloned from production, which already has all of this applied, so a
-- non-idempotent statement errors there even though it's a no-op. Guard
-- with IF NOT EXISTS / IF EXISTS / OR REPLACE throughout; write new
-- migrations the same way.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- garage_vehicles
-- ---------------------------------------------------------------------
create table if not exists garage_vehicles (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  trim_level text,
  color text,
  notes text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists garage_vehicles_user_id_idx on garage_vehicles (user_id);
alter table garage_vehicles enable row level security;
drop policy if exists "allow all - garage_vehicles" on garage_vehicles;
drop policy if exists "owner only - garage_vehicles" on garage_vehicles;
create policy "owner only - garage_vehicles" on garage_vehicles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- armory_items
-- ---------------------------------------------------------------------
create table if not exists armory_items (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  caliber text,
  notes text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists armory_items_user_id_idx on armory_items (user_id);
alter table armory_items enable row level security;
drop policy if exists "allow all - armory_items" on armory_items;
drop policy if exists "owner only - armory_items" on armory_items;
create policy "owner only - armory_items" on armory_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- hobbies
-- ---------------------------------------------------------------------
create table if not exists hobbies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists hobbies_user_id_idx on hobbies (user_id);
alter table hobbies enable row level security;
drop policy if exists "allow all - hobbies" on hobbies;
drop policy if exists "owner only - hobbies" on hobbies;
create policy "owner only - hobbies" on hobbies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- hobby_lists (Maintenance/Modifications/Wishlist/Equipment, per hobby)
-- ---------------------------------------------------------------------
create table if not exists hobby_lists (
  id uuid primary key default gen_random_uuid(),
  hobby_id uuid not null references hobbies(id) on delete cascade,
  name text not null,
  type text not null default 'maintenance',
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists hobby_lists_hobby_id_idx on hobby_lists (hobby_id);
create index if not exists hobby_lists_user_id_idx on hobby_lists (user_id);
alter table hobby_lists enable row level security;
drop policy if exists "allow all - hobby_lists" on hobby_lists;
drop policy if exists "owner only - hobby_lists" on hobby_lists;
create policy "owner only - hobby_lists" on hobby_lists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- todos (shared by To-Do, Overview, Garage/Armory maintenance, Hobby tasks
-- and Hobby Maintenance-type lists — distinguished by which *_id is set)
-- ---------------------------------------------------------------------
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  description text,
  due_date date,
  frequency text not null default 'daily',
  recurring_day smallint,
  priority text not null default 'medium',
  completed boolean not null default false,
  completed_date date,
  vehicle_id uuid references garage_vehicles(id) on delete cascade,
  armory_item_id uuid references armory_items(id) on delete cascade,
  hobby_id uuid references hobbies(id) on delete cascade,
  hobby_list_id uuid references hobby_lists(id) on delete cascade,
  source_label text,
  tags text[] not null default '{}',
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists todos_vehicle_id_idx on todos (vehicle_id);
create index if not exists todos_armory_item_id_idx on todos (armory_item_id);
create index if not exists todos_hobby_id_idx on todos (hobby_id);
create index if not exists todos_hobby_list_id_idx on todos (hobby_list_id);
-- Speeds up "does this array contain tag X" filtering if it's ever pushed
-- server-side; the app currently filters client-side since data volume is
-- personal-scale, but the index costs nothing to have ready.
create index if not exists todos_tags_idx on todos using gin (tags);
create index if not exists todos_user_id_idx on todos (user_id);
alter table todos enable row level security;
drop policy if exists "allow all - todos" on todos;
drop policy if exists "owner only - todos" on todos;
create policy "owner only - todos" on todos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- garage_modifications
-- ---------------------------------------------------------------------
create table if not exists garage_modifications (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references garage_vehicles(id) on delete cascade,
  text text not null,
  detail text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists garage_modifications_vehicle_id_idx on garage_modifications (vehicle_id);
create index if not exists garage_modifications_user_id_idx on garage_modifications (user_id);
alter table garage_modifications enable row level security;
drop policy if exists "allow all - garage_modifications" on garage_modifications;
drop policy if exists "owner only - garage_modifications" on garage_modifications;
create policy "owner only - garage_modifications" on garage_modifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- garage_wishlist (vehicle_id is null for the Garage page-level wishlist)
-- ---------------------------------------------------------------------
create table if not exists garage_wishlist (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references garage_vehicles(id) on delete cascade,
  text text not null,
  detail text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists garage_wishlist_vehicle_id_idx on garage_wishlist (vehicle_id);
create index if not exists garage_wishlist_user_id_idx on garage_wishlist (user_id);
alter table garage_wishlist enable row level security;
drop policy if exists "allow all - garage_wishlist" on garage_wishlist;
drop policy if exists "owner only - garage_wishlist" on garage_wishlist;
create policy "owner only - garage_wishlist" on garage_wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- armory_modifications
-- ---------------------------------------------------------------------
create table if not exists armory_modifications (
  id uuid primary key default gen_random_uuid(),
  armory_item_id uuid not null references armory_items(id) on delete cascade,
  text text not null,
  detail text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists armory_modifications_armory_item_id_idx on armory_modifications (armory_item_id);
create index if not exists armory_modifications_user_id_idx on armory_modifications (user_id);
alter table armory_modifications enable row level security;
drop policy if exists "allow all - armory_modifications" on armory_modifications;
drop policy if exists "owner only - armory_modifications" on armory_modifications;
create policy "owner only - armory_modifications" on armory_modifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- armory_wishlist (armory_item_id is null for the Armory page-level wishlist)
-- ---------------------------------------------------------------------
create table if not exists armory_wishlist (
  id uuid primary key default gen_random_uuid(),
  armory_item_id uuid references armory_items(id) on delete cascade,
  text text not null,
  detail text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists armory_wishlist_armory_item_id_idx on armory_wishlist (armory_item_id);
create index if not exists armory_wishlist_user_id_idx on armory_wishlist (user_id);
alter table armory_wishlist enable row level security;
drop policy if exists "allow all - armory_wishlist" on armory_wishlist;
drop policy if exists "owner only - armory_wishlist" on armory_wishlist;
create policy "owner only - armory_wishlist" on armory_wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- hobby_list_entries (items in a Modifications/Wishlist/Equipment-type list;
-- Maintenance-type lists use `todos` with hobby_list_id set instead)
-- ---------------------------------------------------------------------
create table if not exists hobby_list_entries (
  id uuid primary key default gen_random_uuid(),
  hobby_list_id uuid not null references hobby_lists(id) on delete cascade,
  text text not null,
  detail text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists hobby_list_entries_hobby_list_id_idx on hobby_list_entries (hobby_list_id);
create index if not exists hobby_list_entries_user_id_idx on hobby_list_entries (user_id);
alter table hobby_list_entries enable row level security;
drop policy if exists "allow all - hobby_list_entries" on hobby_list_entries;
drop policy if exists "owner only - hobby_list_entries" on hobby_list_entries;
create policy "owner only - hobby_list_entries" on hobby_list_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- owe_items (Finances > Owe tab)
-- ---------------------------------------------------------------------
create table if not exists owe_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  amount_owed numeric(12, 2) not null,
  months_left smallint,
  priority text not null default 'low',
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists owe_items_user_id_idx on owe_items (user_id);
alter table owe_items enable row level security;
drop policy if exists "allow all - owe_items" on owe_items;
drop policy if exists "owner only - owe_items" on owe_items;
create policy "owner only - owe_items" on owe_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- wish_to_purchase_items (Finances > Wish to Purchase tab)
-- ---------------------------------------------------------------------
create table if not exists wish_to_purchase_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  item_amount numeric(12, 2) not null,
  amount_saved numeric(12, 2) not null default 0,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists wish_to_purchase_items_user_id_idx on wish_to_purchase_items (user_id);
alter table wish_to_purchase_items enable row level security;
drop policy if exists "allow all - wish_to_purchase_items" on wish_to_purchase_items;
drop policy if exists "owner only - wish_to_purchase_items" on wish_to_purchase_items;
create policy "owner only - wish_to_purchase_items" on wish_to_purchase_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- profiles: username (unique, optional) + first/last name, one row per
-- auth user. Auto-created via a trigger whenever someone signs up.
-- ---------------------------------------------------------------------
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
drop policy if exists "owner only - profiles" on profiles;
create policy "owner only - profiles" on profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill a profile row for any account that predates the trigger, or was
-- otherwise created without going through it (e.g. directly via the admin
-- API). Idempotent by construction — only touches users still missing one.
insert into profiles (user_id)
select id from auth.users
where id not in (select user_id from profiles);
