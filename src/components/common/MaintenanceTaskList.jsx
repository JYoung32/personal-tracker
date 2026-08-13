import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  FREQUENCY_OPTIONS,
  PRIORITY_OPTIONS,
  DAY_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  supportsRecurringDay,
  supportsRecurringWeekOfMonth,
  formatRecurringDayLabel,
} from '../../constants/taskOptions';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

const FREQUENCY_LABELS = Object.fromEntries(FREQUENCY_OPTIONS.map((opt) => [opt.value, opt.label]));
const PRIORITY_LABELS = Object.fromEntries(PRIORITY_OPTIONS.map((opt) => [opt.value, opt.label]));

// Same local-midnight parsing as TodoItem.jsx — dueDate is a "YYYY-MM-DD"
// string, and parsing it directly with `new Date(...)` treats it as UTC
// midnight, which rolls back a day in timezones behind UTC.
function parseDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Maintenance tasks are real to-do items (see MaintenanceTaskForm). By
 * default each row exposes the same frequency / recurring-day controls
 * inline — updating either here immediately reshapes that task's reset
 * schedule wherever it's viewed (here or on the main To-Do page). A weekly
 * task gets a plain weekday Select (onRecurringDayChange); a monthly task
 * gets a week-of-month + weekday pair instead (onRecurringDayChange +
 * onRecurringWeekOfMonthChange together — see taskOptions.js's
 * supportsRecurringDay/supportsRecurringWeekOfMonth). Clicking the row
 * (outside the inline controls) opens the same full edit view as a regular
 * to-do. Pass `readOnlySchedule` (currently only Trackers does) to swap
 * that out for a read-only info stack under the title instead —
 * description, then a line for whichever of due date / frequency / priority
 * / repeats-on day are actually set, then tag chips — mirroring TodoItem's
 * row on the main To-Do page. Still editable, just from the task's own
 * detail page rather than inline here; Hobbies keeps the inline Select
 * controls unchanged.
 */
export function MaintenanceTaskList({
  items,
  onToggleComplete,
  onFrequencyChange,
  onRecurringDayChange,
  onRecurringWeekOfMonthChange,
  onDelete,
  emptyMessage,
  readOnlySchedule = false,
}) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box>
      {items.map((task) => {
        const dueDate = readOnlySchedule && task.dueDate ? parseDateOnly(task.dueDate) : null;
        const isOverdue = dueDate && !task.completed && dueDate < new Date(new Date().toDateString());
        const metaParts = readOnlySchedule
          ? [
              task.frequency && `Frequency: ${FREQUENCY_LABELS[task.frequency] ?? task.frequency}`,
              formatRecurringDayLabel(task) && `Repeats on: ${formatRecurringDayLabel(task)}`,
              task.priority && `Priority: ${PRIORITY_LABELS[task.priority] ?? task.priority}`,
            ].filter(Boolean)
          : [];
        const metaText = metaParts.join(' · ');

        return (
          <Box
            key={task.id}
            onClick={() => navigate(`/todos/${task.id}`)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              rowGap: 0.5,
              py: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              '&:last-of-type': { borderBottom: 'none' },
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Checkbox
              checked={task.completed}
              onChange={() => onToggleComplete(task.id, !task.completed)}
              onClick={(e) => e.stopPropagation()}
              sx={{ p: 0.5, mr: 1 }}
            />

            {readOnlySchedule ? (
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {task.text}
                </Typography>
                {task.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: task.completed ? 'text.disabled' : 'text.secondary',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {task.description}
                  </Typography>
                )}
                {(dueDate || metaText) && (
                  <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                    {dueDate && (
                      <Box component="span" sx={{ color: isOverdue ? 'error.main' : 'inherit' }}>
                        Due {dueDate.toLocaleDateString()}
                      </Box>
                    )}
                    {dueDate && metaText && ' · '}
                    {metaText}
                  </Typography>
                )}
                {task.tags?.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {task.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 11, opacity: task.completed ? 0.6 : 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <>
                <Typography
                  sx={{
                    flexGrow: 1,
                    minWidth: 100,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {task.text}
                </Typography>

                <Select
                  value={task.frequency ?? 'daily'}
                  onChange={(e) => onFrequencyChange(task.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  variant="standard"
                  disableUnderline
                  size="small"
                  sx={{ fontSize: 13, mr: 1, minWidth: 88, '& .MuiSelect-select': { py: 0.25 } }}
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>

                {supportsRecurringDay(task.frequency) && (
                  <Select
                    value={task.recurringDay ?? ''}
                    onChange={(e) =>
                      onRecurringDayChange(task.id, e.target.value === '' ? null : e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    variant="standard"
                    disableUnderline
                    displayEmpty
                    size="small"
                    sx={{ fontSize: 13, mr: 1, minWidth: 88, '& .MuiSelect-select': { py: 0.25 } }}
                  >
                    <MenuItem value="">
                      <em>Any day</em>
                    </MenuItem>
                    {DAY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                {supportsRecurringWeekOfMonth(task.frequency) && (
                  <>
                    <Select
                      value={task.recurringWeekOfMonth ?? ''}
                      onChange={(e) =>
                        onRecurringWeekOfMonthChange(task.id, e.target.value === '' ? null : e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      variant="standard"
                      disableUnderline
                      displayEmpty
                      size="small"
                      sx={{ fontSize: 13, mr: 1, minWidth: 72, '& .MuiSelect-select': { py: 0.25 } }}
                    >
                      <MenuItem value="">
                        <em>Any week</em>
                      </MenuItem>
                      {WEEK_OF_MONTH_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      value={task.recurringDay ?? ''}
                      onChange={(e) =>
                        onRecurringDayChange(task.id, e.target.value === '' ? null : e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      variant="standard"
                      disableUnderline
                      displayEmpty
                      size="small"
                      sx={{ fontSize: 13, mr: 1, minWidth: 88, '& .MuiSelect-select': { py: 0.25 } }}
                    >
                      <MenuItem value="">
                        <em>Any day</em>
                      </MenuItem>
                      {DAY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </>
            )}

            <ConfirmDeleteButton
              itemLabel={task.text}
              onConfirm={() => onDelete(task.id)}
              renderTrigger={(open) => (
                <IconButton
                  aria-label="delete"
                  onClick={open}
                  size="small"
                  sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              )}
            />
          </Box>
        );
      })}
    </Box>
  );
}
