// A hobby's lists are typed so they can reuse the same tab behaviors as a
// tracker item's Maintenance/Modifications/Wishlist tabs. "Equipment"
// behaves exactly like Modifications, just under its own name.
export const HOBBY_LIST_TYPES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'modifications', label: 'Modifications' },
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'equipment', label: 'Equipment' },
];

export const DEFAULT_HOBBY_LIST_TYPE = 'maintenance';

const HOBBY_LIST_TYPE_VALUES = HOBBY_LIST_TYPES.map((opt) => opt.value);

export function isKnownHobbyListType(type) {
  return HOBBY_LIST_TYPE_VALUES.includes(type);
}
