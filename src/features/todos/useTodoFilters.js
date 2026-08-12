import { useMemo, useState } from 'react';

export const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

/**
 * Shared status-tab / frequency-dropdown filtering and sort order for a
 * list of todos — used by both TodoPage (a scoped list) and OverviewPage
 * (the full, cross-tab list), so the two stay in sync without duplicating
 * the sort/filter logic.
 */
export function useTodoFilters(todos) {
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

  return { filter, setFilter, frequencyFilter, setFrequencyFilter, filteredTodos, completedCount };
}
