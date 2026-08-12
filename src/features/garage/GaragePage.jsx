import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { VehicleForm } from './VehicleForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { PageHeader } from '../../components/common/PageHeader';
import { AddFormPanel } from '../../components/common/AddFormPanel';
import { SimpleListSection } from '../../components/common/SimpleListSection';

export function GaragePage() {
  const { items: vehicles, loading, error, addItem, removeItem } = useCollection('garageVehicles');
  const {
    items: wishlist,
    error: wishlistError,
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
  } = useCollection('garageWishlist');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);

  // Page-level wishlist items have no vehicleId — those belong to a specific
  // vehicle's own Wishlist tab instead (see VehicleDetailPage).
  const pageWishlist = useMemo(() => wishlist.filter((item) => !item.vehicleId), [wishlist]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <PageHeader
        title="Garage"
        isAdding={showForm}
        onAddClick={() => setShowForm(true)}
        onSave={() => panelRef.current?.submit()}
        onCancel={() => setShowForm(false)}
        addLabel="Add a car"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <AddFormPanel
        ref={panelRef}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addItem}
        FormComponent={VehicleForm}
      />

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

      <Divider sx={{ my: 5 }} />

      <SimpleListSection
        title="Wishlist"
        showHeading
        placeholder="Add a wishlist item"
        emptyMessage="Nothing on the wishlist yet."
        items={pageWishlist}
        error={wishlistError}
        onAdd={(text) => addWishlistItem({ text })}
        onItemClick={(item) => navigate(`/garage/wishlist/${item.id}`)}
        onDelete={removeWishlistItem}
      />
    </Container>
  );
}
