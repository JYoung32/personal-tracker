import { NavDropdownItem } from './NavDropdownItem';

export function GarageNavItem() {
  return (
    <NavDropdownItem
      label="Garage"
      path="/garage"
      collectionKey="garageVehicles"
      getItemLabel={(vehicle) => [vehicle.make, vehicle.model, vehicle.trimLevel].filter(Boolean).join(' ')}
      getItemPath={(vehicle) => `/garage/${vehicle.id}`}
      emptyMessage="No vehicles yet"
    />
  );
}
