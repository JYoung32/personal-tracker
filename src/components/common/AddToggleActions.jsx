import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

/**
 * The "+" icon that opens an add form. Once the form is open, it swaps to a
 * checkmark (saves — submits the associated AddFormPanel via its ref) and a
 * grey X (cancels — closes the form) pair. Shared by PageHeader and the
 * section-level "+" headerActions (SimpleListSection/MaintenanceSection) so
 * every add flow in the app toggles identically.
 */
export function AddToggleActions({ open, onOpen, onSave, onCancel, addLabel, size }) {
  if (!open) {
    return (
      <IconButton onClick={onOpen} aria-label={addLabel} color="primary" size={size}>
        <AddIcon fontSize={size} />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton onClick={onSave} aria-label="Save" color="primary" size={size}>
        <CheckIcon fontSize={size} />
      </IconButton>
      <IconButton onClick={onCancel} aria-label="Cancel" size={size} sx={{ color: 'text.disabled' }}>
        <CloseIcon fontSize={size} />
      </IconButton>
    </>
  );
}
