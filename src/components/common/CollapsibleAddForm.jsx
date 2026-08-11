import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

/**
 * Collapses an "add" form behind a button until needed: shows `addLabel`
 * as a button; clicking it reveals FormComponent (which must accept an
 * `onAdd` prop, matching VehicleForm/ArmoryItemForm/HobbyForm/etc.) plus a
 * Cancel link. Submitting the form re-collapses it automatically.
 */
export function CollapsibleAddForm({ addLabel, onAdd, FormComponent }) {
  const [showForm, setShowForm] = useState(false);

  function handleAdd(values) {
    onAdd(values);
    setShowForm(false);
  }

  if (!showForm) {
    return (
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Button
          variant="outlined"
          disableElevation
          onClick={() => setShowForm(true)}
          sx={{ borderRadius: 2, px: 4 }}
        >
          {addLabel}
        </Button>
      </Box>
    );
  }

  return (
    <>
      <FormComponent onAdd={handleAdd} />
      <Box sx={{ textAlign: 'center', mt: -3, mb: 2 }}>
        <Button size="small" onClick={() => setShowForm(false)} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
      </Box>
    </>
  );
}
