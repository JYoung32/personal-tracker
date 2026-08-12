-- Personal Tracker — Supabase schema (fresh-install reference)
--
-- If you're setting this project up for the first time: run this once in
-- the Supabase dashboard (SQL Editor > New query > paste this whole file >
-- Run). It creates one table per app "collection", in an order that
-- satisfies foreign keys (parent tables before children), each row owned
-- by the auth user who created it, plus a `profiles` table for
-- username/first/last name.
--
-- If you already ran an earlier version of this file (without user_id/
-- profiles): don't re-run this — use supabase/migrations/ instead, in
-- order, starting from wherever you left off.
--
-- Column names are snake_case; the app's supabaseAdapter.js converts to/from
-- the camelCase shapes every feature already uses (id, createdAt, dueDate,
-- vehicleId, ...), so no feature code needs to know about this naming.
--
-- Every table is owned per-row: user_id defaults to auth.uid() (the
-- logged-in request's own id) so the app never has to send it explicitly,
-- and RLS policies only allow a row's owner to see or touch it.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- garage_vehicles
-- ---------------------------------------------------------------------
create table garage_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  trim_level text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on garage_vehicles (user_id);
alter table garage_vehicles enable row level security;
create policy "owner only - garage_vehicles" on garage_vehicles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- armory_items
-- ---------------------------------------------------------------------
create table armory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  caliber text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on armory_items (user_id);
alter table armory_items enable row level security;
create policy "owner only - armory_items" on armory_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- hobbies
-- ---------------------------------------------------------------------
create table hobbies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on hobbies (user_id);
alter table hobbies enable row level security;
create policy "owner only - hobbies" on hobbies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- hobby_lists (Maintenance/Modifications/Wishlist/Equipment, per hobby)
-- ---------------------------------------------------------------------
create table hobby_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  hobby_id uuid not null references hobbies(id) on delete cascade,
  name text not null,
  type text not null default 'maintenance',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on hobby_lists (hobby_id);
create index on hobby_lists (user_id);
alter table hobby_lists enable row level security;
create policy "owner only - hobby_lists" on hobby_lists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- todos (shared by To-Do, Overview, Garage/Armory maintenance, Hobby tasks
-- and Hobby Maintenance-type lists — distinguished by which *_id is set)
-- ---------------------------------------------------------------------
create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on todos (vehicle_id);
create index on todos (armory_item_id);
create index on todos (hobby_id);
create index on todos (hobby_list_id);
create index on todos (user_id);
alter table todos enable row level security;
create policy "owner only - todos" on todos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- garage_modifications
-- ---------------------------------------------------------------------
create table garage_modifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehicle_id uuid not null references garage_vehicles(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on garage_modifications (vehicle_id);
create index on garage_modifications (user_id);
alter table garage_modifications enable row level security;
create policy "owner only - garage_modifications" on garage_modifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- garage_wishlist (vehicle_id is null for the Garage page-level wishlist)
-- ---------------------------------------------------------------------
create table garage_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehicle_id uuid references garage_vehicles(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on garage_wishlist (vehicle_id);
create index on garage_wishlist (user_id);
alter table garage_wishlist enable row level security;
create policy "owner only - garage_wishlist" on garage_wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- armory_modifications
-- ---------------------------------------------------------------------
create table armory_modifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  armory_item_id uuid not null references armory_items(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on armory_modifications (armory_item_id);
create index on armory_modifications (user_id);
alter table armory_modifications enable row level security;
create policy "owner only - armory_modifications" on armory_modifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- armory_wishlist (armory_item_id is null for the Armory page-level wishlist)
-- ---------------------------------------------------------------------
create table armory_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  armory_item_id uuid references armory_items(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on armory_wishlist (armory_item_id);
create index on armory_wishlist (user_id);
alter table armory_wishlist enable row level security;
create policy "owner only - armory_wishlist" on armory_wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- hobby_list_entries (items in a Modifications/Wishlist/Equipment-type list;
-- Maintenance-type lists use `todos` with hobby_list_id set instead)
-- ---------------------------------------------------------------------
create table hobby_list_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  hobby_list_id uuid not null references hobby_lists(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on hobby_list_entries (hobby_list_id);
create index on hobby_list_entries (user_id);
alter table hobby_list_entries enable row level security;
create policy "owner only - hobby_list_entries" on hobby_list_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- owe_items (Finances > Owe tab)
-- ---------------------------------------------------------------------
create table owe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  amount_owed numeric(12, 2) not null,
  months_left smallint,
  priority text not null default 'low',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on owe_items (user_id);
alter table owe_items enable row level security;
create policy "owner only - owe_items" on owe_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- wish_to_purchase_items (Finances > Wish to Purchase tab)
-- ---------------------------------------------------------------------
create table wish_to_purchase_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  item_amount numeric(12, 2) not null,
  amount_saved numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index on wish_to_purchase_items (user_id);
alter table wish_to_purchase_items enable row level security;
create policy "owner only - wish_to_purchase_items" on wish_to_purchase_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- profiles: username (unique, optional) + first/last name, one row per
-- auth user. Auto-created whenever someone signs up.
-- ---------------------------------------------------------------------
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "owner only - profiles" on profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
