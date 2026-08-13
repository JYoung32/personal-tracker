-- 001: initial schema
--
-- Creates every table in its current, final shape — ownership (`user_id`),
-- row-level security, the `profiles` table, `todos.tags`, the two `notes`
-- columns, and the user-defined Trackers tables are all part of table
-- creation here, not bolted on by later migrations. This file used to be
-- several separate ones (four incremental migrations that added
-- ownership/profiles, tags, an incident cleanup, and notes; then a
-- separate `002_trackers.sql` that added the Trackers feature) that have
-- since been folded back into this single file now that they're all long
-- since applied to production — same idea as the earlier fold of the
-- pre-migrations schema.sql into this file. See git history for the
-- individual migrations if you need the granular story.
--
-- This schema used to also have Garage and Armory: fixed, hardcoded
-- domains (vehicles with make/model/trim/color, firearms with
-- make/model/caliber). User-defined Trackers were built to reproduce that
-- same shape at runtime with no code deploy, and once proven out, Garage
-- and Armory were removed — their tables, and the `todos` columns that
-- referenced them, were dropped from production, and this file no longer
-- creates or references them at all.
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
-- trackerItemId, ...), so no feature code needs to know about this naming.
--
-- Written to be safely re-runnable — Supabase's GitHub integration
-- replays every file in supabase/migrations/ against preview branches
-- cloned from production, which already has all of this applied, so a
-- non-idempotent statement errors there even though it's a no-op. Guard
-- with IF NOT EXISTS / IF EXISTS / OR REPLACE throughout; write new
-- migrations the same way.

create extension if not exists pgcrypto;

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
-- tracker_types: a user-defined domain (e.g. "Guitars"), the lightweight
-- replacement for what Garage/Armory used to hardcode. `item_name_label`
-- lets the type rename its items' `title` field in the UI (e.g. "Guitar
-- Name") without a second title-equivalent column — `tracker_items.title`
-- is still the one place the value lives.
-- ---------------------------------------------------------------------
create table if not exists tracker_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  item_name_label text,
  sort_order integer not null default 0,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists tracker_types_user_id_idx on tracker_types (user_id);
alter table tracker_types enable row level security;
drop policy if exists "allow all - tracker_types" on tracker_types;
drop policy if exists "owner only - tracker_types" on tracker_types;
create policy "owner only - tracker_types" on tracker_types for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- tracker_fields: the type's own core fields (its "make/model/trim"
-- equivalent), user-defined. `id` doubles as the key used inside
-- tracker_items.field_values (see below) — never derive that key from
-- `label`, which is freely renameable. `required`/`field_type`/
-- `select_options`/`sort_order` are pure form-behavior metadata
-- (TrackerItemForm reads them to mark a field required, pick which input
-- to render — text/number/date/checkbox/dropdown — populate a dropdown's
-- options, and order the fields on the form) — they don't affect how
-- field_values is stored, still just jsonb either way.
-- ---------------------------------------------------------------------
create table if not exists tracker_fields (
  id uuid primary key default gen_random_uuid(),
  tracker_type_id uuid not null references tracker_types(id) on delete cascade,
  label text not null,
  required boolean not null default false,
  field_type text not null default 'string',
  select_options text[] not null default '{}',
  sort_order integer not null default 0,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
-- retroactive-safe for the same reason as tracker_types' alters used to
-- be (see git history) — tracker_fields already exists in production.
alter table tracker_fields add column if not exists select_options text[] not null default '{}';
create index if not exists tracker_fields_tracker_type_id_idx on tracker_fields (tracker_type_id);
create index if not exists tracker_fields_user_id_idx on tracker_fields (user_id);
alter table tracker_fields enable row level security;
drop policy if exists "allow all - tracker_fields" on tracker_fields;
drop policy if exists "owner only - tracker_fields" on tracker_fields;
create policy "owner only - tracker_fields" on tracker_fields for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- tracker_items: the "vehicles" equivalent. Every tracker type's items
-- share this one table (same idiom as `todos` serving several different
-- owners), filtered client-side by tracker_type_id. `field_values` is a
-- jsonb object keyed by `tracker_fields.id` (a uuid, not a label-derived
-- slug) — this makes renaming a field free and collision-proof, and it
-- means a deleted field's leftover value is simply orphaned/invisible
-- rather than ever resurrectable under a different field.
-- ---------------------------------------------------------------------
create table if not exists tracker_items (
  id uuid primary key default gen_random_uuid(),
  tracker_type_id uuid not null references tracker_types(id) on delete cascade,
  title text not null,
  field_values jsonb not null default '{}',
  notes text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists tracker_items_tracker_type_id_idx on tracker_items (tracker_type_id);
create index if not exists tracker_items_user_id_idx on tracker_items (user_id);
alter table tracker_items enable row level security;
drop policy if exists "allow all - tracker_items" on tracker_items;
drop policy if exists "owner only - tracker_items" on tracker_items;
create policy "owner only - tracker_items" on tracker_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- tracker_item_lists (mirrors hobby_lists) — deliberately a parallel
-- table rather than a generalization of hobby_lists, to keep zero risk to
-- existing, stable Hobby data/code. Some schema duplication traded for
-- that isolation.
-- ---------------------------------------------------------------------
create table if not exists tracker_item_lists (
  id uuid primary key default gen_random_uuid(),
  tracker_item_id uuid not null references tracker_items(id) on delete cascade,
  name text not null,
  type text not null default 'maintenance',
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists tracker_item_lists_tracker_item_id_idx on tracker_item_lists (tracker_item_id);
create index if not exists tracker_item_lists_user_id_idx on tracker_item_lists (user_id);
alter table tracker_item_lists enable row level security;
drop policy if exists "allow all - tracker_item_lists" on tracker_item_lists;
drop policy if exists "owner only - tracker_item_lists" on tracker_item_lists;
create policy "owner only - tracker_item_lists" on tracker_item_lists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- todos (shared by To-Do, Overview, Hobby tasks, Hobby Maintenance-type
-- lists, and Tracker item Maintenance-type lists — distinguished by which
-- *_id is set)
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
  hobby_id uuid references hobbies(id) on delete cascade,
  hobby_list_id uuid references hobby_lists(id) on delete cascade,
  tracker_item_id uuid references tracker_items(id) on delete cascade,
  tracker_item_list_id uuid references tracker_item_lists(id) on delete cascade,
  source_label text,
  tags text[] not null default '{}',
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists todos_hobby_id_idx on todos (hobby_id);
create index if not exists todos_hobby_list_id_idx on todos (hobby_list_id);
create index if not exists todos_tracker_item_id_idx on todos (tracker_item_id);
create index if not exists todos_tracker_item_list_id_idx on todos (tracker_item_list_id);
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
-- tracker_item_list_entries (mirrors hobby_list_entries; items in a
-- Modifications/Wishlist/Equipment-type list — Maintenance-type lists use
-- `todos` with tracker_item_id + tracker_item_list_id set instead)
-- ---------------------------------------------------------------------
create table if not exists tracker_item_list_entries (
  id uuid primary key default gen_random_uuid(),
  tracker_item_list_id uuid not null references tracker_item_lists(id) on delete cascade,
  text text not null,
  detail text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists tracker_item_list_entries_list_id_idx on tracker_item_list_entries (tracker_item_list_id);
create index if not exists tracker_item_list_entries_user_id_idx on tracker_item_list_entries (user_id);
alter table tracker_item_list_entries enable row level security;
drop policy if exists "allow all - tracker_item_list_entries" on tracker_item_list_entries;
drop policy if exists "owner only - tracker_item_list_entries" on tracker_item_list_entries;
create policy "owner only - tracker_item_list_entries" on tracker_item_list_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
