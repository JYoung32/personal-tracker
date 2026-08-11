import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Minimal "text field + Add button" form, reused anywhere we just need to
 * collect one line of text (hobby items, lists, list entries, ...).
 * Calls onSubmit(trimmedValue) and clears itself. Pass onCancel to get a
 * circular X inline next to the Add button (used inside an AddFormPanel
 * add flow).
 */
export function SingleFieldForm({ placeholder, buttonLabel = 'Add', onSubmit, onCancel }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
    setValue('');
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
      <TextField
        placeholder={placeholder}
        variant="standard"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
      />
      <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 3 }}>
        {buttonLabel}
      </Button>
      {onCancel && (
        <IconButton
          aria-label="Cancel"
          onClick={onCancel}
          size="small"
          sx={{ border: '1px solid', borderColor: 'divider', color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
