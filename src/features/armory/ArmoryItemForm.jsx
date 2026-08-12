import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormActions } from '../../components/common/FormActions';

const BLANK_VALUES = { make: '', model: '', caliber: '' };

/**
 * Form for adding or editing an armory item. Calls onSubmit({ make, model, caliber }).
 * In "add" mode (no initialValues) it clears itself after submit; pass initialValues (an
 * existing item) to prefill for editing.
 */
export function ArmoryItemForm({ initialValues, onSubmit, submitLabel = 'Add', onCancel }) {
  const [values, setValues] = useState({
    make: initialValues?.make ?? '',
    model: initialValues?.model ?? '',
    caliber: initialValues?.caliber ?? '',
  });

  function handleChange(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const make = values.make.trim();
    const model = values.model.trim();
    if (!make || !model) return;

    onSubmit({ make, model, caliber: values.caliber.trim() || null });
    if (!initialValues) setValues(BLANK_VALUES);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}
    >
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="armory-item-make"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Make
          </Typography>
          <TextField
            id="armory-item-make"
            variant="standard"
            value={values.make}
            onChange={(e) => handleChange('make', e.target.value)}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="armory-item-model"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Model
          </Typography>
          <TextField
            id="armory-item-model"
            variant="standard"
            value={values.model}
            onChange={(e) => handleChange('model', e.target.value)}
            fullWidth
          />
        </Box>
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="armory-item-caliber"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Caliber (optional)
        </Typography>
        <TextField
          id="armory-item-caliber"
          variant="standard"
          value={values.caliber}
          onChange={(e) => handleChange('caliber', e.target.value)}
          fullWidth
        />
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
