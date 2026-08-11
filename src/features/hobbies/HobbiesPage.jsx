import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

/**
 * PLACEHOLDER — not yet built.
 *
 * When we build this out, it'll follow the same pattern as TodoPage:
 *   const { items, addItem, updateItem, removeItem } = useCollection('hobbies');
 *
 * The item shape will just differ, e.g.:
 *   { name, category, progress, lastPracticedAt, notes }
 */
export function HobbiesPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Hobby Tracker
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Coming soon — this will use the same list infrastructure as the to-do
          page (useCollection hook + storage adapter), just with hobby-specific
          fields.
        </Typography>
      </Paper>
    </Container>
  );
}
