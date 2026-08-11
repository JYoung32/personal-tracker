import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

/**
 * Form for adding a new hobby. Calls onAdd({ name }) and resets itself.
 */
export function HobbyForm({ onAdd }) {
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onAdd({ name: trimmed });
    setName('');
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
          htmlFor="hobby-name"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Hobby name
        </Typography>
        <TextField
          id="hobby-name"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 4 }}>
          Add
        </Button>
      </Box>
    </Box>
  );
}
