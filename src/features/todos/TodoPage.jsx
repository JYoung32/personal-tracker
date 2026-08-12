import { useMemo } from 'react';
import { useCollection } from '../../hooks/useCollection';
import { useRecurringReset } from '../../hooks/useRecurringReset';
import { toggleCompletionFields } from '../../utils/recurrence';
import { TodoBoard } from './TodoBoard';

/**
 * Only tasks created directly on this page — vehicle/armory maintenance
 * tasks (tagged vehicleId/armoryItemId) and hobby tasks (tagged hobbyId,
 * whether a hobby-level task or one under a Maintenance-type list) live on
 * their own Garage/Armory/Hobbies pages instead, and everything together
 * shows up on OverviewPage.
 */
export function TodoPage() {
  const { items: todos, loading, error, addItem, updateItem, removeItem } = useCollection('todos');

  useRecurringReset(todos, loading, updateItem);

  const ownTodos = useMemo(
    () => todos.filter((t) => !t.vehicleId && !t.armoryItemId && !t.hobbyId),
    [todos]
  );

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
