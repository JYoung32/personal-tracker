import { NavDropdownItem } from './NavDropdownItem';

/**
 * One user-created Tracker's nav entry — unlike a hardcoded per-domain nav
 * component, there can be any number of these at runtime, so NavBar
 * renders one per row in `trackerTypes`. All tracker items share one
 * `trackerItems` table (same idiom as `todos` serving several owners), so
 * `filterItem` narrows the dropdown to this type's own items.
 */
export function TrackerNavItem({ type }) {
  return (
    <NavDropdownItem
      label={type.name}
      path={`/trackers/${type.id}`}
      collectionKey="trackerItems"
      filterItem={(item) => item.trackerTypeId === type.id}
      getItemLabel={(item) => item.title}
      getItemPath={(item) => `/trackers/${type.id}/${item.id}`}
      emptyMessage="No items yet"
    />
  );
}
