import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
  FREQUENCY_OPTIONS,
  DAY_OPTIONS,
  DEFAULT_FREQUENCY,
  supportsRecurringDay,
} from '../../constants/taskOptions';
import { FormActions } from './FormActions';

/**
 * Form for adding a maintenance task that's also a real to-do item (see
 * MaintenanceSection usage in VehicleDetailPage / ArmoryItemDetailPage).
 * Calls onSubmit({ text, frequency, recurringDay }) and resets itself. Pass
 * onCancel to get a circular X inline next to the Add button (used inside
 * an AddFormPanel add flow). Add/Cancel sit centered on their own line
 * below the text/frequency row. Pass defaultFrequency to start the
 * frequency picker somewhere other than "Daily" (e.g. Hobby tasks default
 * to "One-Time").
 */
export function MaintenanceTaskForm({ onSubmit, onCancel, defaultFrequency = DEFAULT_FREQUENCY }) {
  const [text, setText] = useState('');
  const [frequency, setFrequency] = useState(defaultFrequency);
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
    setFrequency(defaultFrequency);
    setRecurringDay('');
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <TextField
          placeholder="Add a maintenance task"
          variant="standard"
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ flex: '1 1 160px' }}
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
      </Box>

      {showRecurringDay && (
        <Select
          value={recurringDay}
          onChange={(e) => setRecurringDay(e.target.value)}
          variant="standard"
          displayEmpty
          sx={{ minWidth: 160, fontSize: 14, mb: 2 }}
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

      <Box sx={{ textAlign: 'center' }}>
        <FormActions submitLabel="Add" onCancel={onCancel} />
      </Box>
    </Box>
  );
}
