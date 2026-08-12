import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecurringReset } from './useRecurringReset';

// A recurring todo whose current cycle's reset date has already passed,
// last completed in an earlier cycle — i.e. due to be re-opened.
const dueTodo = {
  id: 'due-1',
  frequency: 'daily',
  createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  completed: true,
  completedDate: '2000-01-01',
};

describe('useRecurringReset', () => {
  it('calls updateItem once for a due item', () => {
    const updateItem = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    renderHook(() => useRecurringReset([dueTodo], false, updateItem));

    expect(updateItem).toHaveBeenCalledTimes(1);
    expect(updateItem).toHaveBeenCalledWith('due-1', { completed: false, completedDate: null });
  });

  it('does not call updateItem again for the same id while its reset is still in flight', () => {
    const updateItem = vi.fn().mockReturnValue(new Promise(() => {}));
    const { rerender } = renderHook(({ items }) => useRecurringReset(items, false, updateItem), {
      initialProps: { items: [dueTodo] },
    });

    // Simulate an unrelated mutation elsewhere producing a new `items`
    // array reference before the in-flight reset above has resolved.
    rerender({ items: [{ ...dueTodo }] });
    rerender({ items: [{ ...dueTodo }] });

    expect(updateItem).toHaveBeenCalledTimes(1);
  });

  it('does nothing while loading, or when nothing is due', () => {
    const updateItem = vi.fn();
    renderHook(() => useRecurringReset([dueTodo], true, updateItem));
    expect(updateItem).not.toHaveBeenCalled();

    const notDue = { ...dueTodo, completed: false, completedDate: null };
    renderHook(() => useRecurringReset([notDue], false, updateItem));
    expect(updateItem).not.toHaveBeenCalled();
  });
});
