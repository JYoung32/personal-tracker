import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormActions } from './FormActions';

/**
 * Form for editing a simple list item (a modification or wishlist entry):
 * its name plus a longer optional detail/notes field. Calls
 * onSubmit({ text, detail }). Pass initialValues (an existing item) to
 * prefill for editing. Pass onCancel to get a circular X inline next to
 * the submit button (see FormActions).
 */
export function SimpleItemForm({ initialValues, onSubmit, submitLabel = 'Save', onCancel }) {
  const [text, setText] = useState(initialValues?.text ?? '');
  const [detail, setDetail] = useState(initialValues?.detail ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSubmit({
      text: trimmed,
      detail: detail.trim() || null,
    });
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}
    >
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="simple-item-text"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Name
        </Typography>
        <TextField
          id="simple-item-text"
          variant="standard"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          sx={{ '& .MuiInputBase-input': { textAlign: 'center' } }}
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="simple-item-detail"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Detail (optional)
        </Typography>
        <TextField
          id="simple-item-detail"
          variant="standard"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
