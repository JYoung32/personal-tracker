import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

/**
 * PLACEHOLDER — not yet built.
 *
 * Will follow the same pattern as TodoPage:
 *   const { items, addItem, updateItem, removeItem } = useCollection('purchases');
 *
 * Item shape will likely be something like:
 *   { itemName, vendor, price, quantity, status, linkedHobby, purchasedAt }
 */
export function PurchasesPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Finances
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Coming soon — equipment/purchase tracking for your hobbies, built on
          the same list infrastructure as the to-do page.
        </Typography>
      </Paper>
    </Container>
  );
}
