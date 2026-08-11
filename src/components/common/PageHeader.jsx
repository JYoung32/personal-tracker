import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

/**
 * Centered page title with an optional "+" icon button (top-right of the
 * header) that toggles an add form. `children` renders as an optional
 * subtitle line below the title (e.g. a completion count).
 */
export function PageHeader({ title, onAddClick, addLabel, children }) {
  return (
    <Box sx={{ position: 'relative', mb: 7, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
        {title}
      </Typography>
      {children}
      {onAddClick && (
        <IconButton
          onClick={onAddClick}
          aria-label={addLabel}
          color="primary"
          sx={{ position: 'absolute', top: 0, right: 0 }}
        >
          <AddIcon />
        </IconButton>
      )}
    </Box>
  );
}
