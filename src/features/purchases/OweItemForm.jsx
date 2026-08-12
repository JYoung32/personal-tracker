import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { PRIORITY_OPTIONS } from '../../constants/taskOptions';
import { FormActions } from '../../components/common/FormActions';

const DEFAULT_OWE_PRIORITY = 'low';

/**
 * Form for adding or editing an "Owe" list item. Calls
 * onSubmit({ name, amountOwed, monthsLeft, priority, description }). In
 * "add" mode (no initialValues) it clears itself after submit; pass
 * initialValues (an existing item) to prefill for editing. Priority
 * defaults to Low here (unlike tasks, which default to Medium).
 */
export function OweItemForm({ initialValues, onSubmit, submitLabel = 'Add', onCancel }) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [amountOwed, setAmountOwed] = useState(initialValues?.amountOwed ?? '');
  const [monthsLeft, setMonthsLeft] = useState(initialValues?.monthsLeft ?? '');
  const [priority, setPriority] = useState(initialValues?.priority ?? DEFAULT_OWE_PRIORITY);
  const [description, setDescription] = useState(initialValues?.description ?? '');

  const parsedAmount = Number(amountOwed);
  const parsedMonths = Number(monthsLeft);
  const monthlyPayment =
    amountOwed !== '' && monthsLeft !== '' && !Number.isNaN(parsedAmount) && parsedMonths > 0
      ? parsedAmount / parsedMonths
      : null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || amountOwed === '') return;

    onSubmit({
      name: trimmedName,
      amountOwed: Number(amountOwed),
      monthsLeft: monthsLeft === '' ? null : Number(monthsLeft),
      priority,
      description: description.trim() || null,
    });

    if (!initialValues) {
      setName('');
      setAmountOwed('');
      setMonthsLeft('');
      setPriority(DEFAULT_OWE_PRIORITY);
      setDescription('');
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
          htmlFor="owe-name"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Name
        </Typography>
        <TextField
          id="owe-name"
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
          htmlFor="owe-description"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Description (optional)
        </Typography>
        <TextField
          id="owe-description"
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
            htmlFor="owe-amount"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            $ Owed
          </Typography>
          <TextField
            id="owe-amount"
            type="number"
            variant="standard"
            value={amountOwed}
            onChange={(e) => setAmountOwed(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="owe-months-left"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Months left (optional)
          </Typography>
          <TextField
            id="owe-months-left"
            type="number"
            variant="standard"
            value={monthsLeft}
            onChange={(e) => setMonthsLeft(e.target.value)}
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
          />
        </Box>
      </Box>

      {monthlyPayment !== null && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="owe-monthly-payment"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Monthly payment
          </Typography>
          <TextField
            id="owe-monthly-payment"
            variant="standard"
            value={`$${monthlyPayment.toFixed(2)}`}
            disabled
            fullWidth
          />
        </Box>
      )}

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="owe-priority"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Priority
        </Typography>
        <Select
          id="owe-priority"
          variant="standard"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          fullWidth
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
