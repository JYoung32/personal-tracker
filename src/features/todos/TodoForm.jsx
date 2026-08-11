import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const DEFAULT_FREQUENCY = 'daily';
const DEFAULT_PRIORITY = 'medium';

function supportsRecurringDay(frequency) {
  return frequency !== 'one-time' && frequency !== 'daily';
}

/**
 * Form for adding a new to-do. Calls onAdd({ text, dueDate, frequency, recurringDay, priority })
 * and resets itself.
 */
export function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY);
  const [recurringDay, setRecurringDay] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);

  const showRecurringDay = supportsRecurringDay(frequency);

  function handleFrequencyChange(value) {
    setFrequency(value);
    if (!supportsRecurringDay(value)) setRecurringDay('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onAdd({
      text: trimmed,
      description: description.trim() || null,
      completed: false,
      dueDate: dueDate || null,
      frequency,
      recurringDay: showRecurringDay && recurringDay !== '' ? recurringDay : null,
      priority,
    });

    setText('');
    setDescription('');
    setDueDate('');
    setFrequency(DEFAULT_FREQUENCY);
    setRecurringDay('');
    setPriority(DEFAULT_PRIORITY);
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
          htmlFor="todo-text"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Task title
        </Typography>
        <TextField
          id="todo-text"
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
          htmlFor="todo-description"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Description (optional)
        </Typography>
        <TextField
          id="todo-description"
          variant="standard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="todo-due-date"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Due date (optional)
        </Typography>
        <TextField
          id="todo-due-date"
          type="date"
          variant="standard"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="todo-frequency"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Frequency
          </Typography>
          <Select
            id="todo-frequency"
            variant="standard"
            value={frequency}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            fullWidth
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="todo-priority"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Priority
          </Typography>
          <Select
            id="todo-priority"
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
      </Box>

      {showRecurringDay && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor="todo-recurring-day"
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Repeats on (optional)
          </Typography>
          <Select
            id="todo-recurring-day"
            variant="standard"
            value={recurringDay}
            onChange={(e) => setRecurringDay(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">
              <em>No specific day</em>
            </MenuItem>
            {DAY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 4 }}>
          Add
        </Button>
      </Box>
    </Box>
  );
}