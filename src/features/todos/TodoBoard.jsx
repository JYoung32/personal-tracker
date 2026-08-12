import { useRef, useState } from 'react';
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
import { FREQUENCY_OPTIONS } from '../../constants/taskOptions';
import { PageHeader } from '../../components/common/PageHeader';
import { AddFormPanel } from '../../components/common/AddFormPanel';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { FILTERS, useTodoFilters } from './useTodoFilters';

const FREQUENCY_FILTERS = [{ value: 'all', label: 'All' }, ...FREQUENCY_OPTIONS];

/**
 * The status tabs + frequency filter + sorted task list shared by TodoPage
 * (a scoped list, e.g. only tasks created on the To-Do page) and
 * OverviewPage (the full, cross-tab list). Pass `onAddTodo` to show the
 * PageHeader "+" and add form; omit it for a read-only board (OverviewPage,
 * which isn't allowed to create tasks).
 */
export function TodoBoard({
  title,
  todos,
  loading,
  error,
  onToggleComplete,
  onDelete,
  onPriorityChange,
  onAddTodo,
  addLabel,
  emptyMessage,
}) {
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);
  const { filter, setFilter, frequencyFilter, setFrequencyFilter, filteredTodos, completedCount } =
    useTodoFilters(todos);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <PageHeader
        title={title}
        isAdding={showForm}
        onAddClick={onAddTodo ? () => setShowForm(true) : undefined}
        onSave={() => panelRef.current?.submit()}
        onCancel={() => setShowForm(false)}
        addLabel={addLabel}
      >
        {todos.length > 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            {completedCount} of {todos.length} done
          </Typography>
        )}
      </PageHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {onAddTodo && (
        <AddFormPanel
          ref={panelRef}
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={onAddTodo}
          FormComponent={TodoForm}
        />
      )}

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
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onPriorityChange={onPriorityChange}
          showFrequency={frequencyFilter === 'all'}
          emptyMessage={emptyMessage}
        />
      )}
    </Container>
  );
}
