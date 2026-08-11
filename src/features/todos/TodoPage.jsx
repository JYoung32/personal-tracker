import { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { TodoForm, FREQUENCY_OPTIONS } from './TodoForm';
import { TodoList } from './TodoList';

const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const FREQUENCY_FILTERS = [{ value: 'all', label: 'All' }, ...FREQUENCY_OPTIONS];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

// Days between resets, keyed by frequency. One-time has no entry — it never recurs.
const FREQUENCY_INTERVAL_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

// Local (not UTC) YYYY-MM-DD, matching the date-input format used for dueDate
// so string comparisons behave as expected across timezones.
function todayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses a "YYYY-MM-DD" string (as stored in dueDate/completedDate) into a local-midnight Date.
function parseDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Truncates an ISO timestamp (as stored in createdAt) to local midnight.
function parseLocalDateOnly(isoString) {
  const d = new Date(isoString);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// The first reset lands `intervalDays` after the task was created, pulled forward (if a
// recurringDay is set) to the next occurrence of that weekday. That weekday-alignment "extension"
// is only ever added to this first reset — every later reset is exactly `intervalDays` after the
// one before it, so the schedule stays fixed and predictable regardless of when the user actually
// checks the task off.
function firstResetDate(anchorDate, intervalDays, recurringDay) {
  const earliest = addDays(anchorDate, intervalDays);
  if (recurringDay === null || recurringDay === undefined) return earliest;
  const offset = (recurringDay - earliest.getDay() + 7) % 7;
  return addDays(earliest, offset);
}

// The most recent scheduled reset date on/before today, or null if the task's frequency doesn't
// recur (one-time) or its first reset hasn't happened yet.
function currentResetBoundary(todo, todayMidnight) {
  const intervalDays = FREQUENCY_INTERVAL_DAYS[todo.frequency];
  if (!intervalDays) return null;

  const anchor = parseLocalDateOnly(todo.createdAt);
  const r1 = firstResetDate(anchor, intervalDays, todo.recurringDay);
  if (todayMidnight < r1) return null;

  const cyclesPast = Math.floor((todayMidnight - r1) / 86400000 / intervalDays);
  return addDays(r1, cyclesPast * intervalDays);
}

export function TodoPage() {
  const { items: todos, loading, error, addItem, updateItem, removeItem } = useCollection('todos');
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  const filteredTodos = useMemo(() => {
    const sorted = [...todos].sort((a, b) => {
      // Incomplete first, then soonest due date, then priority (high to low), then newest first.
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      if (a.dueDate && b.dueDate) {
        const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
      } else if (a.dueDate || b.dueDate) {
        return a.dueDate ? -1 : 1;
      }

      const priorityDiff = PRIORITY_RANK[a.priority ?? 'medium'] - PRIORITY_RANK[b.priority ?? 'medium'];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    let result = sorted;
    if (filter === FILTERS.ACTIVE) result = result.filter((t) => !t.completed);
    if (filter === FILTERS.COMPLETED) result = result.filter((t) => t.completed);
    if (frequencyFilter !== 'all') result = result.filter((t) => t.frequency === frequencyFilter);
    return result;
  }, [todos, filter, frequencyFilter]);

  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);

  // A task re-opens once the current cycle's scheduled reset date (see
  // currentResetBoundary) has passed and the task's last completion happened
  // before that boundary — i.e. it was completed in an earlier cycle, not
  // the current one. completedDate is only set/cleared in
  // handleToggleComplete, so it reliably reflects the day the task was last
  // checked off.
  useEffect(() => {
    if (loading) return;
    const todayMidnight = new Date(new Date().toDateString());
    todos
      .filter((t) => t.completed && t.completedDate)
      .filter((t) => {
        const boundary = currentResetBoundary(t, todayMidnight);
        return boundary && parseDateOnly(t.completedDate) < boundary;
      })
      .forEach((t) => updateItem(t.id, { completed: false, completedDate: null }));
  }, [todos, loading, updateItem]);

  function handleToggleComplete(id, completed) {
    updateItem(id, { completed, completedDate: completed ? todayDateString() : null });
  }

  function handlePriorityChange(id, priority) {
    updateItem(id, { priority });
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
          Daily To-Do
        </Typography>
        {todos.length > 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            {completedCount} of {todos.length} done
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TodoForm onAdd={addItem} />

      <Tabs
        value={filter}
        onChange={(_, value) => setFilter(value)}
        centered
        sx={{ minHeight: 36, mb: 2 }}
        slotProps={{ indicator: { sx: { height: 2 } } }}
      >
        {[FILTERS.ALL, FILTERS.ACTIVE, FILTERS.COMPLETED].map((value) => (
          <Tab
            key={value}
            value={value}
            label={value.charAt(0).toUpperCase() + value.slice(1)}
            disableRipple
            sx={{ minHeight: 36, textTransform: 'none', fontSize: 14, px: 1.5 }}
          />
        ))}
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Select
          value={frequencyFilter}
          onChange={(e) => setFrequencyFilter(e.target.value)}
          variant="standard"
          sx={{ minWidth: 160, fontSize: 14 }}
        >
          {FREQUENCY_FILTERS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <TodoList
          todos={filteredTodos}
          onToggleComplete={handleToggleComplete}
          onDelete={removeItem}
          onPriorityChange={handlePriorityChange}
          showFrequency={frequencyFilter === 'all'}
        />
      )}
    </Container>
  );
}