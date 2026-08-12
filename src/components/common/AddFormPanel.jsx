import { forwardRef, useImperativeHandle, useRef } from 'react';
import Box from '@mui/material/Box';

/**
 * Renders FormComponent (anything that accepts an `onSubmit` callback —
 * the shared { initialValues, onSubmit, submitLabel } convention, or a
 * simpler add-only form like SingleFieldForm/MaintenanceTaskForm), passing
 * it `onCancel` so its own submit button renders a circular X inline next
 * to it (see FormActions). Visibility is controlled externally — see
 * PageHeader/SimpleListSection/MaintenanceSection's "+" icon, which is what
 * toggles `open` on the pages/sections that use this. `formProps` is
 * spread onto FormComponent for forms that need extra config (e.g.
 * SingleFieldForm's placeholder).
 *
 * Exposes `submit()` via ref so an external control (the header's
 * checkmark, via AddToggleActions) can trigger the underlying <form>'s
 * submit without this component needing to know about that control.
 */
export const AddFormPanel = forwardRef(function AddFormPanel(
  { open, onClose, onSubmit, FormComponent, formProps },
  ref
) {
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    submit: () => containerRef.current?.querySelector('form')?.requestSubmit(),
  }));

  if (!open) return null;

  async function handleSubmit(values) {
    try {
      await onSubmit(values);
      onClose();
    } catch {
      // onSubmit's collection already surfaced a friendly error (see
      // useCollection.js) — leave the panel open instead of closing it as
      // if the add had succeeded, so the user can see the error and retry
    }
  }

  return (
    <Box ref={containerRef}>
      <FormComponent {...formProps} onSubmit={handleSubmit} onCancel={onClose} />
    </Box>
  );
});
