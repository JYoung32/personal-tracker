import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { VehicleForm } from './VehicleForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { CollapsibleAddForm } from '../../components/common/CollapsibleAddForm';

export function GaragePage() {
  const { items: vehicles, loading, error, addItem, removeItem } = useCollection('garageVehicles');
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
          Garage
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CollapsibleAddForm addLabel="Add a Car" onAdd={addItem} FormComponent={VehicleForm} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <NavigableRowList
          items={vehicles}
          getLabel={(vehicle) =>
            [vehicle.make, vehicle.model, vehicle.trimLevel].filter(Boolean).join(' ')
          }
          getSecondaryLabel={(vehicle) => vehicle.color}
          onItemClick={(vehicle) => navigate(`/garage/${vehicle.id}`)}
          onDelete={removeItem}
          emptyMessage="Nothing here — add a vehicle above."
        />
      )}
    </Container>
  );
}
