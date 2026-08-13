import { useMemo } from 'react';
import { useCollection } from '../../hooks/useCollection';
import { useRecurringReset } from '../../hooks/useRecurringReset';
import { toggleCompletionFields } from '../../utils/recurrence';
import { TodoBoard } from './TodoBoard';

/**
 * Only tasks created directly on this page — hobby tasks (tagged hobbyId,
 * whether a hobby-level task or one under a Maintenance-type list) and
 * tracker item maintenance tasks (tagged trackerItemId) live on their own
 * Hobbies/Tracker pages instead, and everything together shows up on
 * OverviewPage.
 */
export function TodoPage() {
  const { items: todos, loading, error, addItem, updateItem, removeItem } = useCollection('todos');

  useRecurringReset(todos, loading, updateItem);

  const ownTodos = useMemo(() => todos.filter((t) => !t.hobbyId && !t.trackerItemId), [todos]);

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
    <TodoBoard
      title="Daily To-Do"
      todos={ownTodos}
      loading={loading}
      error={error}
      onToggleComplete={handleToggleComplete}
      onDelete={removeItem}
      onPriorityChange={handlePriorityChange}
      onAddTodo={handleAddTodo}
      addLabel="Add task"
    />
  );
}
