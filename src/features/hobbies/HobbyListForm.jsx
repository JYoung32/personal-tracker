import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { HOBBY_LIST_TYPES, DEFAULT_HOBBY_LIST_TYPE } from '../../constants/hobbyListTypes';
import { FormActions } from '../../components/common/FormActions';

/**
 * Form for adding a list directly to a hobby. Calls onSubmit({ name, type })
 * and resets itself. `type` decides the tab behavior it gets on
 * HobbyDetailPage (Maintenance tasks sync to the to-do list;
 * Modifications/Wishlist/Equipment are add-or-remove lists).
 */
export function HobbyListForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(DEFAULT_HOBBY_LIST_TYPE);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onSubmit({ name: trimmed, type });
    setName('');
    setType(DEFAULT_HOBBY_LIST_TYPE);
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
          htmlFor="hobby-list-name"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          List name
        </Typography>
        <TextField
          id="hobby-list-name"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="hobby-list-type"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          List type
        </Typography>
        <Select
          id="hobby-list-type"
          variant="standard"
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
        >
          {HOBBY_LIST_TYPES.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel="Add" onCancel={onCancel} />
      </Box>
    </Box>
  );
}
