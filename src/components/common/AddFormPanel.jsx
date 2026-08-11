import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

/**
 * Renders FormComponent (anything that accepts an `onSubmit` callback —
 * the shared { initialValues, onSubmit, submitLabel } convention, or a
 * simpler add-only form like SingleFieldForm/MaintenanceTaskForm) plus a
 * Cancel link when `open`, otherwise nothing. Visibility is controlled
 * externally — see PageHeader/CollapsibleSection's "+" icon, which is what
 * toggles `open` on the pages/sections that use this. `formProps` is
 * spread onto FormComponent for forms that need extra config (e.g.
 * SingleFieldForm's placeholder).
 */
export function AddFormPanel({ open, onClose, onSubmit, FormComponent, formProps }) {
  if (!open) return null;

  function handleSubmit(values) {
    onSubmit(values);
    onClose();
  }

  return (
    <>
      <FormComponent {...formProps} onSubmit={handleSubmit} />
      <Box sx={{ textAlign: 'center', mt: -3, mb: 2 }}>
        <Button size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
      </Box>
    </>
  );
}
