import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { FREQUENCY_OPTIONS, DAY_OPTIONS, supportsRecurringDay } from '../../constants/taskOptions';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

/**
 * Maintenance tasks are real to-do items (see MaintenanceTaskForm), so each
 * row exposes the same frequency / recurring-day controls inline — updating
 * either here immediately reshapes that task's reset schedule wherever it's
 * viewed (here or on the main To-Do page). Clicking the row (outside the
 * inline controls) opens the same full edit view as a regular to-do.
 */
export function MaintenanceTaskList({
  items,
  onToggleComplete,
  onFrequencyChange,
  onRecurringDayChange,
  onDelete,
  emptyMessage,
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
      {items.map((task) => (
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
      ))}
    </Box>
  );
}
