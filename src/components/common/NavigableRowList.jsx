import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { TagChipRow } from './TagChipRow';

/**
 * A list of rows that navigate somewhere on click and can be individually
 * deleted (delete stops propagation so it doesn't also navigate). Used
 * anywhere an item is really a container for a deeper level of content —
 * hobby items, hobby lists, etc. Pass `getTags` to also render a
 * `TagChipRow` under the secondary label — used by every entity that
 * carries free-form tags (Hobbies, Tracker items, Wish to Purchase items,
 * Modifications/Wishlist/Equipment entries).
 */
export function NavigableRowList({ items, getLabel, getSecondaryLabel, getTags, onItemClick, onDelete, emptyMessage }) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box>
      {items.map((item) => {
        const secondaryLabel = getSecondaryLabel?.(item);
        const tags = getTags?.(item);
        return (
          <Box
            key={item.id}
            onClick={() => onItemClick(item)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              '&:last-of-type': { borderBottom: 'none' },
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ color: 'inherit' }}>{getLabel(item)}</Typography>
              {secondaryLabel && (
                <Typography variant="caption" color="text.secondary">
                  {secondaryLabel}
                </Typography>
              )}
              <TagChipRow tags={tags} />
            </Box>
            <ConfirmDeleteButton
              itemLabel={getLabel(item)}
              onConfirm={() => onDelete(item.id)}
              renderTrigger={(open) => (
                <IconButton
                  aria-label="delete"
                  onClick={open}
                  size="small"
                  sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              )}
            />
          </Box>
        );
      })}
    </Box>
  );
}
