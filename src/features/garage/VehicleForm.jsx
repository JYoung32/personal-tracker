import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const FIELDS = [
  { id: 'make', label: 'Make' },
  { id: 'model', label: 'Model' },
  { id: 'trimLevel', label: 'Trim' },
  { id: 'color', label: 'Color' },
];

/**
 * Form for adding a new vehicle. Calls onAdd({ make, model, trimLevel, color }) and resets itself.
 */
export function VehicleForm({ onAdd }) {
  const [values, setValues] = useState({ make: '', model: '', trimLevel: '', color: '' });

  function handleChange(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const make = values.make.trim();
    const model = values.model.trim();
    if (!make || !model) return;

    onAdd({
      make,
      model,
      trimLevel: values.trimLevel.trim() || null,
      color: values.color.trim() || null,
    });

    setValues({ make: '', model: '', trimLevel: '', color: '' });
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}
    >
      <Box sx={{ display: 'flex', gap: 3 }}>
        {FIELDS.slice(0, 2).map((field) => (
          <Box key={field.id} sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor={`vehicle-${field.id}`}
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {field.label}
            </Typography>
            <TextField
              id={`vehicle-${field.id}`}
              variant="standard"
              value={values[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              fullWidth
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {FIELDS.slice(2).map((field) => (
          <Box key={field.id} sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor={`vehicle-${field.id}`}
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {field.label} (optional)
            </Typography>
            <TextField
              id={`vehicle-${field.id}`}
              variant="standard"
              value={values[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              fullWidth
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 4 }}>
          Add
        </Button>
      </Box>
    </Box>
  );
}
