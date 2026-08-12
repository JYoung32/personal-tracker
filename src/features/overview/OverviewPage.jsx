import { useCollection } from '../../hooks/useCollection';
import { useRecurringReset } from '../../hooks/useRecurringReset';
import { toggleCompletionFields } from '../../utils/recurrence';
import { TodoBoard } from '../todos/TodoBoard';

/**
 * Landing page (reached via the "Personal Tracker" nav-bar brand). Shows
 * every task across every tab — plain to-dos plus vehicle/armory
 * maintenance tasks — collectively, using the same list/filter UI as
 * TodoPage. Read-only with respect to creating tasks: each tab still owns
 * adding its own tasks, so there's no add form here.
 */
export function OverviewPage() {
  const { items: todos, loading, error, updateItem, removeItem } = useCollection('todos');

  useRecurringReset(todos, loading, updateItem);

  function handleToggleComplete(id, completed) {
    updateItem(id, toggleCompletionFields(completed));
  }

  function handlePriorityChange(id, priority) {
    updateItem(id, { priority });
  }

  return (
    <TodoBoard
      title="Overview"
      todos={todos}
      loading={loading}
      error={error}
      onToggleComplete={handleToggleComplete}
      onDelete={removeItem}
      onPriorityChange={handlePriorityChange}
      emptyMessage="Nothing here yet."
    />
  );
}
