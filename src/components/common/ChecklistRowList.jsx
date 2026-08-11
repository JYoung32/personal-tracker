import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

/**
 * A flat checklist: checkbox + label + delete, no navigation. For leaf-level
 * task lists (hobby list entries, vehicle maintenance tasks, ...).
 */
export function ChecklistRowList({ items, getLabel, onToggleComplete, onDelete, emptyMessage }) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box>
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-of-type': { borderBottom: 'none' },
          }}
        >
          <Checkbox
            checked={item.completed}
            onChange={() => onToggleComplete(item.id, !item.completed)}
            sx={{ p: 0.5, mr: 1.5 }}
          />
          <Typography
            sx={{
              flexGrow: 1,
              minWidth: 0,
              textDecoration: item.completed ? 'line-through' : 'none',
              color: item.completed ? 'text.disabled' : 'text.primary',
            }}
          >
            {getLabel(item)}
          </Typography>
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
      ))}
    </Box>
  );
}
