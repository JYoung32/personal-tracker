import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import {
  FREQUENCY_OPTIONS,
  PRIORITY_OPTIONS,
  DAY_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  DEFAULT_FREQUENCY,
  DEFAULT_PRIORITY,
  supportsRecurringDay,
  supportsRecurringWeekOfMonth,
} from '../../constants/taskOptions';
import { FormActions } from '../../components/common/FormActions';
import { normalizeTags } from '../../utils/tags';

/**
 * Form for adding or editing a to-do. Calls onSubmit({ text, description, dueDate, frequency,
 * recurringDay, recurringWeekOfMonth, priority, tags }). In "add" mode (no initialValues) it
 * clears itself after submit. Pass initialValues (an existing todo) to prefill for editing —
 * completed/completedDate aren't part of the form and are left untouched by the caller's merge.
 * Pass onCancel to get a Cancel (X) button inline next to the submit button (see FormActions) —
 * used when this form is inside an AddFormPanel add flow; omitted for standalone edit views like
 * TaskDetailPage.
 *
 * "Repeats on" is one of two shapes depending on frequency (see taskOptions.js): weekly gets a
 * plain weekday picker (recurringDay alone — 7 days later always lands on the same weekday, so
 * that's meaningful by itself); monthly gets a week-of-month + weekday pair (recurringDay +
 * recurringWeekOfMonth together, e.g. "2nd Tuesday" — see recurrence.js's
 * ordinalMonthlyResetBoundary). The pair is all-or-nothing: picking only one of the two submits
 * neither, rather than a half-set preference. Quarterly/yearly/daily/one-time show neither.
 */
export function TodoForm({ initialValues, onSubmit, submitLabel = 'Add', onCancel }) {
  const [text, setText] = useState(initialValues?.text ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');
  const [frequency, setFrequency] = useState(initialValues?.frequency ?? DEFAULT_FREQUENCY);
  const [recurringDay, setRecurringDay] = useState(initialValues?.recurringDay ?? '');
  const [recurringWeekOfMonth, setRecurringWeekOfMonth] = useState(
    initialValues?.recurringWeekOfMonth ?? ''
  );
  const [priority, setPriority] = useState(initialValues?.priority ?? DEFAULT_PRIORITY);
  const [tags, setTags] = useState(initialValues?.tags ?? []);

  const showRecurringDay = supportsRecurringDay(frequency);
  const showRecurringWeekOfMonth = supportsRecurringWeekOfMonth(frequency);
  const weekOfMonthPaired = showRecurringWeekOfMonth && recurringDay !== '' && recurringWeekOfMonth !== '';

  function handleFrequencyChange(value) {
    setFrequency(value);
    if (!supportsRecurringDay(value) && !supportsRecurringWeekOfMonth(value)) setRecurringDay('');
    if (!supportsRecurringWeekOfMonth(value)) setRecurringWeekOfMonth('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSubmit({
      text: trimmed,
      description: description.trim() || null,
      dueDate: dueDate || null,
      frequency,
      recurringDay: showRecurringDay && recurringDay !== '' ? recurringDay : weekOfMonthPaired ? recurringDay : null,
      recurringWeekOfMonth: weekOfMonthPaired ? recurringWeekOfMonth : null,
      priority,
      tags: normalizeTags(tags),
    });

    if (!initialValues) {
      setText('');
      setDescription('');
      setDueDate('');
      setFrequency(DEFAULT_FREQUENCY);
      setRecurringDay('');
      setRecurringWeekOfMonth('');
      setPriority(DEFAULT_PRIORITY);
      setTags([]);
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

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
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

      {showRecurringWeekOfMonth && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor="todo-recurring-week"
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Repeats on (optional)
            </Typography>
            <Select
              id="todo-recurring-week"
              variant="standard"
              value={recurringWeekOfMonth}
              onChange={(e) => setRecurringWeekOfMonth(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">
                <em>Any week</em>
              </MenuItem>
              {WEEK_OF_MONTH_OPTIONS.map((opt) => (
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
              htmlFor="todo-recurring-week-day"
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              &nbsp;
            </Typography>
            <Select
              id="todo-recurring-week-day"
              variant="standard"
              value={recurringDay}
              onChange={(e) => setRecurringDay(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">
                <em>Any day</em>
              </MenuItem>
              {DAY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      )}

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="todo-tags"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Tags (optional)
        </Typography>
        <Autocomplete
          id="todo-tags"
          multiple
          freeSolo
          options={[]}
          value={tags}
          onChange={(_, newValue) => setTags(newValue)}
          renderValue={(value, getItemProps) =>
            value.map((tag, index) => {
              const { key, ...chipProps } = getItemProps({ index });
              return <Chip key={key} label={tag} size="small" {...chipProps} />;
            })
          }
          renderInput={(params) => (
            <TextField {...params} variant="standard" placeholder="Type a tag, press Enter" />
          )}
        />
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}