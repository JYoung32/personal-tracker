import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

/**
 * Form for editing a simple list item (a modification or wishlist entry):
 * its name plus a longer optional detail/notes field. Calls
 * onSubmit({ text, detail }). Pass initialValues (an existing item) to
 * prefill for editing.
 */
export function SimpleItemForm({ initialValues, onSubmit, submitLabel = 'Save changes' }) {
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
        <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 4 }}>
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
