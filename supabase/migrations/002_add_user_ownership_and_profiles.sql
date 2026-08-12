-- 002: per-user data ownership + profiles table
--
-- Every collection table currently has an "allow all" RLS policy (fine
-- while there was no real login; see schema.sql's original note). Now that
-- Supabase Auth is wired up, this locks each row to the account that
-- created it, and adds a `profiles` table (username, first/last name) —
-- one row per auth user, auto-created on signup.
--
-- BEFORE RUNNING: find your own user id by running this first —
--   select id, email from auth.users;
-- then replace 'YOUR_EMAIL_HERE' below with that email (used once, to
-- backfill your already-existing rows as their owner).

-- ---------------------------------------------------------------------
-- 1. Add user_id to every collection table (nullable for now — backfilled
--    below, then locked to NOT NULL).
-- ---------------------------------------------------------------------
alter table garage_vehicles add column user_id uuid references auth.users(id) on delete cascade;
alter table armory_items add column user_id uuid references auth.users(id) on delete cascade;
alter table hobbies add column user_id uuid references auth.users(id) on delete cascade;
alter table hobby_lists add column user_id uuid references auth.users(id) on delete cascade;
alter table todos add column user_id uuid references auth.users(id) on delete cascade;
alter table garage_modifications add column user_id uuid references auth.users(id) on delete cascade;
alter table garage_wishlist add column user_id uuid references auth.users(id) on delete cascade;
alter table armory_modifications add column user_id uuid references auth.users(id) on delete cascade;
alter table armory_wishlist add column user_id uuid references auth.users(id) on delete cascade;
alter table hobby_list_entries add column user_id uuid references auth.users(id) on delete cascade;
alter table owe_items add column user_id uuid references auth.users(id) on delete cascade;
alter table wish_to_purchase_items add column user_id uuid references auth.users(id) on delete cascade;

-- ---------------------------------------------------------------------
-- 2. Backfill existing rows to your account.
-- ---------------------------------------------------------------------
do $$
declare
  target_user_id uuid := (select id from auth.users where email = 'YOUR_EMAIL_HERE');
begin
  if target_user_id is null then
    raise exception 'No auth user found with that email — check the email address and retry.';
  end if;

  update garage_vehicles set user_id = target_user_id where user_id is null;
  update armory_items set user_id = target_user_id where user_id is null;
  update hobbies set user_id = target_user_id where user_id is null;
  update hobby_lists set user_id = target_user_id where user_id is null;
  update todos set user_id = target_user_id where user_id is null;
  update garage_modifications set user_id = target_user_id where user_id is null;
  update garage_wishlist set user_id = target_user_id where user_id is null;
  update armory_modifications set user_id = target_user_id where user_id is null;
  update armory_wishlist set user_id = target_user_id where user_id is null;
  update hobby_list_entries set user_id = target_user_id where user_id is null;
  update owe_items set user_id = target_user_id where user_id is null;
  update wish_to_purchase_items set user_id = target_user_id where user_id is null;
end $$;

-- ---------------------------------------------------------------------
-- 3. Lock user_id down: required going forward, auto-filled from the
--    logged-in request so the app never has to send it explicitly.
-- ---------------------------------------------------------------------
alter table garage_vehicles alter column user_id set not null, alter column user_id set default auth.uid();
alter table armory_items alter column user_id set not null, alter column user_id set default auth.uid();
alter table hobbies alter column user_id set not null, alter column user_id set default auth.uid();
alter table hobby_lists alter column user_id set not null, alter column user_id set default auth.uid();
alter table todos alter column user_id set not null, alter column user_id set default auth.uid();
alter table garage_modifications alter column user_id set not null, alter column user_id set default auth.uid();
alter table garage_wishlist alter column user_id set not null, alter column user_id set default auth.uid();
alter table armory_modifications alter column user_id set not null, alter column user_id set default auth.uid();
alter table armory_wishlist alter column user_id set not null, alter column user_id set default auth.uid();
alter table hobby_list_entries alter column user_id set not null, alter column user_id set default auth.uid();
alter table owe_items alter column user_id set not null, alter column user_id set default auth.uid();
alter table wish_to_purchase_items alter column user_id set not null, alter column user_id set default auth.uid();

create index on garage_vehicles (user_id);
create index on armory_items (user_id);
create index on hobbies (user_id);
create index on hobby_lists (user_id);
create index on todos (user_id);
create index on garage_modifications (user_id);
create index on garage_wishlist (user_id);
create index on armory_modifications (user_id);
create index on armory_wishlist (user_id);
create index on hobby_list_entries (user_id);
create index on owe_items (user_id);
create index on wish_to_purchase_items (user_id);

-- ---------------------------------------------------------------------
-- 4. Replace the temporary "allow everything" policies with owner-only
--    access — each row is now only visible/editable by the user who owns it.
-- ---------------------------------------------------------------------
drop policy "allow all - garage_vehicles" on garage_vehicles;
create policy "owner only - garage_vehicles" on garage_vehicles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - armory_items" on armory_items;
create policy "owner only - armory_items" on armory_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - hobbies" on hobbies;
create policy "owner only - hobbies" on hobbies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - hobby_lists" on hobby_lists;
create policy "owner only - hobby_lists" on hobby_lists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - todos" on todos;
create policy "owner only - todos" on todos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - garage_modifications" on garage_modifications;
create policy "owner only - garage_modifications" on garage_modifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - garage_wishlist" on garage_wishlist;
create policy "owner only - garage_wishlist" on garage_wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - armory_modifications" on armory_modifications;
create policy "owner only - armory_modifications" on armory_modifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - armory_wishlist" on armory_wishlist;
create policy "owner only - armory_wishlist" on armory_wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - hobby_list_entries" on hobby_list_entries;
create policy "owner only - hobby_list_entries" on hobby_list_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - owe_items" on owe_items;
create policy "owner only - owe_items" on owe_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy "allow all - wish_to_purchase_items" on wish_to_purchase_items;
create policy "owner only - wish_to_purchase_items" on wish_to_purchase_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. profiles: username (unique, optional) + first/last name, one row per
--    auth user. Replaces the old localStorage-only profile.
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

-- Auto-create a blank profile row whenever someone signs up.
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

-- Backfill a profile row for any account that already existed before this
-- trigger did (e.g. the account you signed up with earlier).
insert into profiles (user_id)
select id from auth.users
where id not in (select user_id from profiles);
