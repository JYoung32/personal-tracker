-- 004: drop leftover "allow all" policies
--
-- Fixes a real data-isolation incident: 001_initial_schema.sql used to
-- unconditionally (re-)create a permissive "allow all" policy per table on
-- every run. Re-running 001 against a database that already had 002's
-- owner-only policies applied silently re-added "allow all" alongside them
-- — Postgres OR's multiple permissive policies together, so "allow all"
-- alone was enough to expose every row to every account regardless of the
-- owner-only policy also existing. 001 no longer creates that policy at
-- all (see its own header); this migration is the one-time cleanup for a
-- database that already has the stale policy sitting on it.
--
-- Pure DROP — touches no data, safe to re-run (every statement is already
-- a no-op once the policy is gone).

drop policy if exists "allow all - garage_vehicles" on garage_vehicles;
drop policy if exists "allow all - armory_items" on armory_items;
drop policy if exists "allow all - hobbies" on hobbies;
drop policy if exists "allow all - hobby_lists" on hobby_lists;
drop policy if exists "allow all - todos" on todos;
drop policy if exists "allow all - garage_modifications" on garage_modifications;
drop policy if exists "allow all - garage_wishlist" on garage_wishlist;
drop policy if exists "allow all - armory_modifications" on armory_modifications;
drop policy if exists "allow all - armory_wishlist" on armory_wishlist;
drop policy if exists "allow all - hobby_list_entries" on hobby_list_entries;
drop policy if exists "allow all - owe_items" on owe_items;
drop policy if exists "allow all - wish_to_purchase_items" on wish_to_purchase_items;
