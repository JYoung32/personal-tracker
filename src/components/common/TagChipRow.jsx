import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

/**
 * A wrapped row of small outlined tag chips, or nothing if `tags` is
 * empty/absent — so callers can render it unconditionally. Pass `dimmed`
 * for a completed/struck-through row (todos) to fade the chips along with
 * the rest of the row. Originally duplicated identically in `TodoItem` and
 * `MaintenanceTaskList`; extracted so every taggable entity's list/detail
 * view (Hobbies, Tracker items, Owe/Wish to Purchase,
 * Modifications/Wishlist/Equipment entries) renders tags the same way.
 */
export function TagChipRow({ tags, dimmed = false, sx }) {
  if (!tags || tags.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, ...sx }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: 11, opacity: dimmed ? 0.6 : 1 }}
        />
      ))}
    </Box>
  );
}
