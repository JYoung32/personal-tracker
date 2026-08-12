import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormActions } from '../../components/common/FormActions';

const FIELDS = [
  { id: 'make', label: 'Make' },
  { id: 'model', label: 'Model' },
  { id: 'trimLevel', label: 'Trim' },
  { id: 'color', label: 'Color' },
];

const BLANK_VALUES = { make: '', model: '', trimLevel: '', color: '' };

/**
 * Form for adding or editing a vehicle. Calls
 * onSubmit({ make, model, trimLevel, color, notes }). In "add" mode (no
 * initialValues) it clears itself after submit; pass initialValues (an
 * existing vehicle) to prefill for editing.
 */
export function VehicleForm({ initialValues, onSubmit, submitLabel = 'Add', onCancel }) {
  const [values, setValues] = useState({
    make: initialValues?.make ?? '',
    model: initialValues?.model ?? '',
    trimLevel: initialValues?.trimLevel ?? '',
    color: initialValues?.color ?? '',
  });
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  function handleChange(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const make = values.make.trim();
    const model = values.model.trim();
    if (!make || !model) return;

    onSubmit({
      make,
      model,
      trimLevel: values.trimLevel.trim() || null,
      color: values.color.trim() || null,
      notes: notes.trim() || null,
    });

    if (!initialValues) {
      setValues(BLANK_VALUES);
      setNotes('');
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}
    >
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
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

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
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

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="vehicle-notes"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Notes (optional)
        </Typography>
        <TextField
          id="vehicle-notes"
          variant="standard"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
