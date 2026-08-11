import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { SingleFieldForm } from './SingleFieldForm';
import { SimpleRowList } from './SimpleRowList';

/**
 * A titled "add or remove" sub-section (no checkbox) — e.g. a vehicle's
 * Modifications or Wishlist list.
 */
export function SimpleListSection({ title, placeholder, emptyMessage, items, error, onAdd, onDelete }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <SingleFieldForm placeholder={placeholder} onSubmit={onAdd} />

      <SimpleRowList items={items} getLabel={(item) => item.text} onDelete={onDelete} emptyMessage={emptyMessage} />
    </Box>
  );
}
