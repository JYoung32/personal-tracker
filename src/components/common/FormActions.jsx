import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/**
 * The submit button a form ends with, plus an optional circular X next to
 * it that cancels (only rendered when `onCancel` is passed — forms used
 * standalone, e.g. TaskDetailPage/EditableDetails, get no Cancel). Both
 * are MUI inline-flex elements, so dropping them side by side inside a
 * `textAlign: 'center'` parent lines them up on one row without any extra
 * flex wrapper.
 */
export function FormActions({ submitLabel = 'Add', onCancel }) {
  return (
    <>
      <Button
        type="submit"
        variant="outlined"
        disableElevation
        sx={{ borderRadius: 2, px: 4, mr: onCancel ? 1.5 : 0 }}
      >
        {submitLabel}
      </Button>
      {onCancel && (
        <IconButton
          aria-label="Cancel"
          onClick={onCancel}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </>
  );
}
