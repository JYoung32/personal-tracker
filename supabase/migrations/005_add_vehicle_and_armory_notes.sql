-- 005: notes on garage vehicles and armory items
--
-- Garage vehicles (make/model/trim/color) and armory items (make/model/
-- caliber) are the only two entities with a detail page that have no
-- freeform text field at all today — everything else (modifications,
-- wishlist items, hobbies, hobby list entries, owe items, wish-to-purchase
-- items) already has an equivalent detail/description field, so adding a
-- second one there would just be a redundant duplicate box. This closes
-- that specific gap: a place for things like a VIN, insurance renewal
-- date, or a firearm's serial number.
--
-- Written to be safely re-runnable (see 002's header for why that matters).

alter table garage_vehicles add column if not exists notes text;
alter table armory_items add column if not exists notes text;
