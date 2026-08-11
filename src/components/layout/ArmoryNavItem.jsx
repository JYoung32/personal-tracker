import { NavDropdownItem } from './NavDropdownItem';

export function ArmoryNavItem() {
  return (
    <NavDropdownItem
      label="Armory"
      path="/armory"
      collectionKey="armoryItems"
      getItemLabel={(item) => [item.make, item.model].filter(Boolean).join(' ')}
      getItemPath={(item) => `/armory/${item.id}`}
      emptyMessage="No items yet"
    />
  );
}
