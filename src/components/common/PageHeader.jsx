import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AddToggleActions } from './AddToggleActions';

/**
 * Centered page title with an optional add-form toggle (top-right of the
 * header) — a "+" icon that swaps to a checkmark/X pair once the form is
 * open (see AddToggleActions). `children` renders as an optional subtitle
 * line below the title (e.g. a completion count).
 */
export function PageHeader({ title, isAdding, onAddClick, onSave, onCancel, addLabel, children }) {
  return (
    <Box sx={{ position: 'relative', mb: 7, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
        {title}
      </Typography>
      {children}
      {onAddClick && (
        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
          <AddToggleActions
            open={isAdding}
            onOpen={onAddClick}
            onSave={onSave}
            onCancel={onCancel}
            addLabel={addLabel}
          />
        </Box>
      )}
    </Box>
  );
}
