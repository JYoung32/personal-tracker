import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { AddFormPanel } from '../../components/common/AddFormPanel';
import { AddToggleActions } from '../../components/common/AddToggleActions';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { WishToPurchaseForm } from './WishToPurchaseForm';

function formatSecondaryLabel(item) {
  const itemAmount = Number(item.itemAmount) || 0;
  const amountSaved = Number(item.amountSaved) || 0;
  const percent = itemAmount > 0 ? Math.round((amountSaved / itemAmount) * 100) : 0;
  return `$${amountSaved.toLocaleString()} of $${itemAmount.toLocaleString()} saved (${percent}%)`;
}

/**
 * The "Wish to Purchase" tab's content on the Finances page — items with a
 * name, optional description, item amount, and amount saved so far. Click
 * a row to edit it in full (WishToPurchaseItemDetailPage).
 */
export function WishToPurchaseSection() {
  const { items, loading, error, addItem, removeItem } = useCollection('wishToPurchaseItems');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <AddToggleActions
          open={showForm}
          onOpen={() => setShowForm(true)}
          onSave={() => panelRef.current?.submit()}
          onCancel={() => setShowForm(false)}
          addLabel="Add to Wish to Purchase"
          size="small"
        />
      </Box>

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
        FormComponent={WishToPurchaseForm}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <NavigableRowList
          items={items}
          getLabel={(item) => item.name}
          getSecondaryLabel={formatSecondaryLabel}
          getTags={(item) => item.tags}
          onItemClick={(item) => navigate(`/purchases/wish-to-purchase/${item.id}`)}
          onDelete={removeItem}
          emptyMessage="Nothing here — add an item above."
        />
      )}
    </Box>
  );
}
