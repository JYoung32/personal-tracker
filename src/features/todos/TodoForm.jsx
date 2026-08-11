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

const DEFAULT_FREQUENCY = 'daily';
const DEFAULT_PRIORITY = 'medium';

/**
 * Form for adding a new to-do. Calls onAdd({ text, dueDate, frequency, priority }) and resets itself.
 */
export function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY);
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);

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
      priority,
    });

    setText('');
    setDescription('');
    setDueDate('');
    setFrequency(DEFAULT_FREQUENCY);
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
            onChange={(e) => setFrequency(e.target.value)}
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

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 4 }}>
          Add
        </Button>
      </Box>
    </Box>
  );
}