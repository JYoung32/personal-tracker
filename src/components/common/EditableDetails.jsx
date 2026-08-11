import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

/**
 * A read-only summary (children) with an "Edit" button that swaps in
 * FormComponent (prefilled via the shared { initialValues, onSubmit,
 * submitLabel } form convention) for editing in place. Used for the core
 * details of a vehicle/armory item — analogous to how tasks get a full
 * edit view, but here the detail page itself already is that view.
 */
export function EditableDetails({ FormComponent, values, onSave, children }) {
  const [editing, setEditing] = useState(false);

  function handleSave(updated) {
    onSave(updated);
    setEditing(false);
  }

  if (editing) {
    return (
      <Box sx={{ mb: 5 }}>
        <FormComponent initialValues={values} submitLabel="Save changes" onSubmit={handleSave} />
        <Box sx={{ textAlign: 'center', mt: -3 }}>
          <Button size="small" onClick={() => setEditing(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 5, textAlign: 'center' }}>
      {children}
      <Button size="small" onClick={() => setEditing(true)} sx={{ color: 'text.secondary', mt: 1 }}>
        Edit
      </Button>
    </Box>
  );
}
