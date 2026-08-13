// Renders a stored tracker_fields.field_values entry as display text.
// Shared by TrackerItemForm's own cleaning logic and any read-only
// summary (TrackerItemDetailPage, TrackerTypeDetailPage's item list) —
// boolean is the one type whose raw stored value (`true`/`false`/absent)
// isn't already display-ready. Returns null when there's nothing worth
// showing, so callers can `.filter(Boolean)` straight through.
export function formatFieldValue(field, value) {
  if (field.fieldType === 'boolean') return value === undefined ? null : value ? 'Yes' : 'No';
  return value || null;
}
