import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

/**
 * A read-only summary (children) with a grey pencil (edit) icon and a red
 * X (delete) icon in the header's upper-right corner. The pencil swaps in
 * FormComponent (prefilled via the shared { initialValues, onSubmit,
 * submitLabel } form convention) for editing in place. Used for the core
 * details of a vehicle/armory item — analogous to how tasks get a full
 * edit view, but here the detail page itself already is that view.
 * FormComponent's own submit button renders a Cancel (X) inline next to it
 * (see FormActions) while editing. Pass onDelete to show the red X;
 * without it, only the pencil renders.
 */
export function EditableDetails({ FormComponent, values, onSave, onDelete, deleteLabel, children }) {
  const [editing, setEditing] = useState(false);

  function handleSave(updated) {
    onSave(updated);
    setEditing(false);
  }

  if (editing) {
    return (
      <Box sx={{ mb: 5 }}>
        <FormComponent
          initialValues={values}
          submitLabel="Save"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 5, position: 'relative', textAlign: 'center' }}>
      {children}
      <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex' }}>
        <IconButton
          aria-label="Edit"
          onClick={() => setEditing(true)}
          size="small"
          sx={{ color: 'text.disabled' }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        {onDelete && (
          <ConfirmDeleteButton
            itemLabel={deleteLabel}
            onConfirm={onDelete}
            renderTrigger={(open) => (
              <IconButton aria-label="Delete" onClick={open} size="small" color="error">
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          />
        )}
      </Box>
    </Box>
  );
}
