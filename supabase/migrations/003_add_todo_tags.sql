-- 003: free-form tags on todos
--
-- Lets a to-do be grouped by user-defined labels (e.g. "home", "work"),
-- independent of the existing vehicle_id/armory_item_id/hobby_id entity
-- tagging — a plain to-do with none of those set can still be grouped this
-- way, and an entity-linked task (maintenance, hobby task, ...) can carry
-- both at once. Stored as a Postgres text[] since tags are free text with
-- no fixed set and no need for their own table at this scale.
--
-- Written to be safely re-runnable (see 002's header for why that matters).

alter table todos add column if not exists tags text[] not null default '{}';

-- Speeds up "does this array contain tag X" filtering if it's ever pushed
-- server-side; the app currently filters client-side since data volume is
-- personal-scale, but the index costs nothing to have ready.
create index if not exists todos_tags_idx on todos using gin (tags);
