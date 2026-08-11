import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { ArmoryItemForm } from './ArmoryItemForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { CollapsibleAddForm } from '../../components/common/CollapsibleAddForm';

export function ArmoryPage() {
  const { items, loading, error, addItem, removeItem } = useCollection('armoryItems');
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
          Armory
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CollapsibleAddForm addLabel="Add a firearm" onAdd={addItem} FormComponent={ArmoryItemForm} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <NavigableRowList
          items={items}
          getLabel={(item) => [item.make, item.model].filter(Boolean).join(' ')}
          getSecondaryLabel={(item) => item.caliber}
          onItemClick={(item) => navigate(`/armory/${item.id}`)}
          onDelete={removeItem}
          emptyMessage="Nothing here — add an item above."
        />
      )}
    </Container>
  );
}
