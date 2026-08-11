import { useMemo, useState } from 'react';
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
import { useRecurringReset } from '../../hooks/useRecurringReset';
import { FREQUENCY_OPTIONS } from '../../constants/taskOptions';
import { toggleCompletionFields } from '../../utils/recurrence';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';

const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const FREQUENCY_FILTERS = [{ value: 'all', label: 'All' }, ...FREQUENCY_OPTIONS];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

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

  useRecurringReset(todos, loading, updateItem);

  function handleToggleComplete(id, completed) {
    updateItem(id, toggleCompletionFields(completed));
  }

  function handlePriorityChange(id, priority) {
    updateItem(id, { priority });
  }

  function handleAddTodo(values) {
    addItem({ ...values, completed: false, completedDate: null });
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

      <TodoForm onSubmit={handleAddTodo} />

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