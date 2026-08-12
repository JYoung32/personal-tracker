-- 001: initial schema
--
-- Creates one table per app "collection", in an order that satisfies
-- foreign keys (parent tables before children). This is the schema as it
-- existed before real Auth was wired up — every table gets a temporary
-- "allow everything" RLS policy here; migration 002 locks each row down to
-- the account that created it and adds a `profiles` table.
--
-- Column names are snake_case; the app's supabaseAdapter.js converts to/from
-- the camelCase shapes every feature already uses (id, createdAt, dueDate,
-- vehicleId, ...), so no feature code needs to know about this naming.

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
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table garage_vehicles enable row level security;
drop policy if exists "allow all - garage_vehicles" on garage_vehicles;
create policy "allow all - garage_vehicles" on garage_vehicles for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- armory_items
-- ---------------------------------------------------------------------
create table if not exists armory_items (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  caliber text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table armory_items enable row level security;
drop policy if exists "allow all - armory_items" on armory_items;
create policy "allow all - armory_items" on armory_items for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- hobbies
-- ---------------------------------------------------------------------
create table if not exists hobbies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table hobbies enable row level security;
drop policy if exists "allow all - hobbies" on hobbies;
create policy "allow all - hobbies" on hobbies for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- hobby_lists (Maintenance/Modifications/Wishlist/Equipment, per hobby)
-- ---------------------------------------------------------------------
create table if not exists hobby_lists (
  id uuid primary key default gen_random_uuid(),
  hobby_id uuid not null references hobbies(id) on delete cascade,
  name text not null,
  type text not null default 'maintenance',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists hobby_lists_hobby_id_idx on hobby_lists (hobby_id);
alter table hobby_lists enable row level security;
drop policy if exists "allow all - hobby_lists" on hobby_lists;
create policy "allow all - hobby_lists" on hobby_lists for all using (true) with check (true);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists todos_vehicle_id_idx on todos (vehicle_id);
create index if not exists todos_armory_item_id_idx on todos (armory_item_id);
create index if not exists todos_hobby_id_idx on todos (hobby_id);
create index if not exists todos_hobby_list_id_idx on todos (hobby_list_id);
alter table todos enable row level security;
drop policy if exists "allow all - todos" on todos;
create policy "allow all - todos" on todos for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- garage_modifications
-- ---------------------------------------------------------------------
create table if not exists garage_modifications (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references garage_vehicles(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists garage_modifications_vehicle_id_idx on garage_modifications (vehicle_id);
alter table garage_modifications enable row level security;
drop policy if exists "allow all - garage_modifications" on garage_modifications;
create policy "allow all - garage_modifications" on garage_modifications for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- garage_wishlist (vehicle_id is null for the Garage page-level wishlist)
-- ---------------------------------------------------------------------
create table if not exists garage_wishlist (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references garage_vehicles(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists garage_wishlist_vehicle_id_idx on garage_wishlist (vehicle_id);
alter table garage_wishlist enable row level security;
drop policy if exists "allow all - garage_wishlist" on garage_wishlist;
create policy "allow all - garage_wishlist" on garage_wishlist for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- armory_modifications
-- ---------------------------------------------------------------------
create table if not exists armory_modifications (
  id uuid primary key default gen_random_uuid(),
  armory_item_id uuid not null references armory_items(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists armory_modifications_armory_item_id_idx on armory_modifications (armory_item_id);
alter table armory_modifications enable row level security;
drop policy if exists "allow all - armory_modifications" on armory_modifications;
create policy "allow all - armory_modifications" on armory_modifications for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- armory_wishlist (armory_item_id is null for the Armory page-level wishlist)
-- ---------------------------------------------------------------------
create table if not exists armory_wishlist (
  id uuid primary key default gen_random_uuid(),
  armory_item_id uuid references armory_items(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists armory_wishlist_armory_item_id_idx on armory_wishlist (armory_item_id);
alter table armory_wishlist enable row level security;
drop policy if exists "allow all - armory_wishlist" on armory_wishlist;
create policy "allow all - armory_wishlist" on armory_wishlist for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- hobby_list_entries (items in a Modifications/Wishlist/Equipment-type list;
-- Maintenance-type lists use `todos` with hobby_list_id set instead)
-- ---------------------------------------------------------------------
create table if not exists hobby_list_entries (
  id uuid primary key default gen_random_uuid(),
  hobby_list_id uuid not null references hobby_lists(id) on delete cascade,
  text text not null,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists hobby_list_entries_hobby_list_id_idx on hobby_list_entries (hobby_list_id);
alter table hobby_list_entries enable row level security;
drop policy if exists "allow all - hobby_list_entries" on hobby_list_entries;
create policy "allow all - hobby_list_entries" on hobby_list_entries for all using (true) with check (true);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table owe_items enable row level security;
drop policy if exists "allow all - owe_items" on owe_items;
create policy "allow all - owe_items" on owe_items for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- wish_to_purchase_items (Finances > Wish to Purchase tab)
-- ---------------------------------------------------------------------
create table if not exists wish_to_purchase_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  item_amount numeric(12, 2) not null,
  amount_saved numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table wish_to_purchase_items enable row level security;
drop policy if exists "allow all - wish_to_purchase_items" on wish_to_purchase_items;
create policy "allow all - wish_to_purchase_items" on wish_to_purchase_items for all using (true) with check (true);
