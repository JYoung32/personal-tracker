import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormActions } from '../../components/common/FormActions';

/**
 * Form for adding or editing a "Wish to Purchase" item. Calls
 * onSubmit({ name, description, itemAmount, amountSaved }). In "add" mode
 * (no initialValues) it clears itself after submit; pass initialValues (an
 * existing item) to prefill for editing. The Amount saved field shows a
 * live "% saved" helper text once both amounts are entered.
 */
export function WishToPurchaseForm({ initialValues, onSubmit, submitLabel = 'Add', onCancel }) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [itemAmount, setItemAmount] = useState(initialValues?.itemAmount ?? '');
  const [amountSaved, setAmountSaved] = useState(initialValues?.amountSaved ?? '');

  const parsedItemAmount = Number(itemAmount);
  const parsedAmountSaved = Number(amountSaved);
  const percentSaved =
    itemAmount !== '' &&
    amountSaved !== '' &&
    !Number.isNaN(parsedItemAmount) &&
    !Number.isNaN(parsedAmountSaved) &&
    parsedItemAmount > 0
      ? Math.round((parsedAmountSaved / parsedItemAmount) * 100)
      : null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || itemAmount === '') return;

    onSubmit({
      name: trimmedName,
      description: description.trim() || null,
      itemAmount: Number(itemAmount),
      amountSaved: amountSaved === '' ? 0 : Number(amountSaved),
    });

    if (!initialValues) {
      setName('');
      setDescription('');
      setItemAmount('');
      setAmountSaved('');
    }
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
          htmlFor="wish-name"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Name
        </Typography>
        <TextField
          id="wish-name"
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
          htmlFor="wish-description"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Description (optional)
        </Typography>
        <TextField
          id="wish-description"
          variant="standard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="wish-item-amount"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Item amount
          </Typography>
          <TextField
            id="wish-item-amount"
            type="number"
            variant="standard"
            value={itemAmount}
            onChange={(e) => setItemAmount(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="wish-amount-saved"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Amount saved
          </Typography>
          <TextField
            id="wish-amount-saved"
            type="number"
            variant="standard"
            value={amountSaved}
            onChange={(e) => setAmountSaved(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            helperText={percentSaved !== null ? `${percentSaved}% saved` : undefined}
            fullWidth
          />
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
