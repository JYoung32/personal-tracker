import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

/**
 * Wraps any delete trigger (an icon button in a list row, a "Delete task"
 * button on a detail page, ...) with a confirmation dialog. The caller
 * supplies the trigger's own look via renderTrigger(openDialog), so this
 * stays usable in both compact rows and full-page buttons; the dialog
 * itself owns its open/close state.
 */
export function ConfirmDeleteButton({ onConfirm, itemLabel = 'this item', renderTrigger }) {
  const [open, setOpen] = useState(false);

  function handleOpen(e) {
    e?.stopPropagation();
    setOpen(true);
  }

  function handleClose(e) {
    e?.stopPropagation();
    setOpen(false);
  }

  function handleConfirm(e) {
    e?.stopPropagation();
    onConfirm();
    setOpen(false);
  }

  return (
    <>
      {renderTrigger(handleOpen)}
      <Dialog
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              width: 350,
              maxWidth: 'calc(100vw - 32px)',
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            },
          },
        }}
      >
        <DialogTitle>Delete {itemLabel}?</DialogTitle>
        <DialogContent>
          <DialogContentText>This can&apos;t be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained" disableElevation>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
