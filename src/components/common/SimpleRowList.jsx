import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';

/**
 * A flat list of rows with just a label and a delete button — no navigation,
 * no checkbox. For sections that are still a simple running list rather than
 * a container with deeper content underneath.
 */
export function SimpleRowList({ items, getLabel, onDelete, emptyMessage }) {
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
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-of-type': { borderBottom: 'none' },
          }}
        >
          <Typography sx={{ flexGrow: 1, minWidth: 0 }}>{getLabel(item)}</Typography>
          <IconButton
            aria-label="delete"
            onClick={() => onDelete(item.id)}
            size="small"
            sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
