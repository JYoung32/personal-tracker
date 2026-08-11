import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import {
  FREQUENCY_OPTIONS,
  DAY_OPTIONS,
  DEFAULT_FREQUENCY,
  supportsRecurringDay,
} from '../../constants/taskOptions';

/**
 * Form for adding a maintenance task that's also a real to-do item (see
 * MaintenanceSection usage in VehicleDetailPage / ArmoryItemDetailPage).
 * Calls onSubmit({ text, frequency, recurringDay }) and resets itself.
 */
export function MaintenanceTaskForm({ onSubmit }) {
  const [text, setText] = useState('');
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY);
  const [recurringDay, setRecurringDay] = useState('');

  const showRecurringDay = supportsRecurringDay(frequency);

  function handleFrequencyChange(value) {
    setFrequency(value);
    if (!supportsRecurringDay(value)) setRecurringDay('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSubmit({
      text: trimmed,
      frequency,
      recurringDay: showRecurringDay && recurringDay !== '' ? recurringDay : null,
    });

    setText('');
    setFrequency(DEFAULT_FREQUENCY);
    setRecurringDay('');
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 1.5, mb: showRecurringDay ? 1.5 : 0 }}>
        <TextField
          placeholder="Add a maintenance task"
          variant="standard"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
        />
        <Select
          value={frequency}
          onChange={(e) => handleFrequencyChange(e.target.value)}
          variant="standard"
          sx={{ minWidth: 110, fontSize: 14 }}
        >
          {FREQUENCY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 3 }}>
          Add
        </Button>
      </Box>

      {showRecurringDay && (
        <Select
          value={recurringDay}
          onChange={(e) => setRecurringDay(e.target.value)}
          variant="standard"
          displayEmpty
          sx={{ minWidth: 160, fontSize: 14 }}
        >
          <MenuItem value="">
            <em>No specific day</em>
          </MenuItem>
          {DAY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      )}
    </Box>
  );
}
