import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { FREQUENCY_OPTIONS, PRIORITY_OPTIONS, DAY_OPTIONS } from '../../constants/taskOptions';
import { ConfirmDeleteButton } from '../../components/common/ConfirmDeleteButton';

const FREQUENCY_LABELS = Object.fromEntries(FREQUENCY_OPTIONS.map((opt) => [opt.value, opt.label]));
const DAY_LABELS = Object.fromEntries(DAY_OPTIONS.map((opt) => [opt.value, opt.label]));

const PRIORITY_COLORS = {
  low: 'text.secondary',
  medium: 'warning.main',
  high: 'error.main',
};

// todo.dueDate is a "YYYY-MM-DD" string from a date input. Parsing that directly with
// `new Date(...)` treats it as UTC midnight, which `toLocaleDateString()` then rolls back
// a day in timezones behind UTC. Parse the parts into a local-midnight Date instead.
function parseDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Renders a single to-do row.
 * Kept "dumb" on purpose — all state lives in the parent via useCollection,
 * this component just renders and forwards events.
 */
export function TodoItem({ todo, onToggleComplete, onDelete, onPriorityChange, showFrequency }) {
  const navigate = useNavigate();
  const dueDate = todo.dueDate ? parseDateOnly(todo.dueDate) : null;
  const isOverdue = dueDate && !todo.completed && dueDate < new Date(new Date().toDateString());
  const frequencyLabel = showFrequency
    ? [FREQUENCY_LABELS[todo.frequency], DAY_LABELS[todo.recurringDay]].filter(Boolean).join(' · ')
    : null;
  const metaText = [frequencyLabel, todo.sourceLabel].filter(Boolean).join(' · ');

  return (
    <Box
      onClick={() => navigate(`/todos/${todo.id}`)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:last-of-type': { borderBottom: 'none' },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Checkbox
        checked={todo.completed}
        onChange={() => onToggleComplete(todo.id, !todo.completed)}
        onClick={(e) => e.stopPropagation()}
        sx={{ p: 0.5, mr: 1.5 }}
      />

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          sx={{
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? 'text.disabled' : 'text.primary',
          }}
        >
          {todo.text}
        </Typography>
        {todo.description && (
          <Typography
            variant="body2"
            sx={{
              color: todo.completed ? 'text.disabled' : 'text.secondary',
              whiteSpace: 'pre-wrap',
            }}
          >
            {todo.description}
          </Typography>
        )}
        {(todo.dueDate || metaText) && (
          <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
            {dueDate && (
              <Box component="span" sx={{ color: isOverdue ? 'error.main' : 'inherit' }}>
                Due {dueDate.toLocaleDateString()}
              </Box>
            )}
            {todo.dueDate && metaText && ' · '}
            {metaText}
          </Typography>
        )}
      </Box>

      <Select
        value={todo.priority ?? 'medium'}
        onChange={(e) => onPriorityChange(todo.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        variant="standard"
        disableUnderline
        size="small"
        sx={{
          fontSize: 13,
          mr: 1,
          color: PRIORITY_COLORS[todo.priority ?? 'medium'],
          '& .MuiSelect-select': { py: 0.25 },
        }}
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      <ConfirmDeleteButton
        itemLabel={todo.text}
        onConfirm={() => onDelete(todo.id)}
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
}