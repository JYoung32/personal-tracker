import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { FormActions } from './FormActions';

/**
 * Minimal "text field + Add button" form, reused anywhere we just need to
 * collect one line of text (hobby items, lists, list entries, ...).
 * Calls onSubmit(trimmedValue) and clears itself. Pass onCancel to get a
 * circular X inline next to the Add button (used inside an AddFormPanel
 * add flow). Add/Cancel sit centered on their own line below the field.
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <TextField
        placeholder={placeholder}
        variant="standard"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
      />
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <FormActions submitLabel={buttonLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
