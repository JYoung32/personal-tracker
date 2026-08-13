import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

/**
 * A read-only summary (children) with a grey pencil (edit) icon and a red
 * X (delete) icon in the header's upper-right corner. The pencil swaps in
 * FormComponent (prefilled via the shared { initialValues, onSubmit,
 * submitLabel } form convention) for editing in place. Used for the core
 * details of a hobby or tracker item — analogous to how tasks get a full
 * edit view, but here the detail page itself already is that view.
 * FormComponent's own submit button renders a Cancel (X) inline next to it
 * (see FormActions) while editing. Pass onDelete to show the red X;
 * without it, only the pencil renders. Pass `error` (the owning
 * useCollection's error state) to show it above the form while editing —
 * on a failed save this stays in edit mode instead of silently reverting
 * to the (unsaved) read-only view. `formProps` is spread onto
 * FormComponent for forms that need extra config beyond the standard
 * convention (e.g. a dynamic form that needs its field schema) — same
 * idea as AddFormPanel's own `formProps`.
 */
export function EditableDetails({ FormComponent, formProps, values, onSave, onDelete, deleteLabel, error, children }) {
  const [editing, setEditing] = useState(false);

  async function handleSave(updated) {
    try {
      await onSave(updated);
      setEditing(false);
    } catch {
      // error is rendered below; stay in edit mode so nothing is lost
    }
  }

  if (editing) {
    return (
      <Box sx={{ mb: 5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormComponent
          {...formProps}
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
