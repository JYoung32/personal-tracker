import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { ArmoryItemForm } from './ArmoryItemForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { PageHeader } from '../../components/common/PageHeader';
import { AddFormPanel } from '../../components/common/AddFormPanel';

export function ArmoryPage() {
  const { items, loading, error, addItem, removeItem } = useCollection('armoryItems');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <PageHeader
        title="Armory"
        isAdding={showForm}
        onAddClick={() => setShowForm(true)}
        onSave={() => panelRef.current?.submit()}
        onCancel={() => setShowForm(false)}
        addLabel="Add a firearm"
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
        FormComponent={ArmoryItemForm}
      />

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
