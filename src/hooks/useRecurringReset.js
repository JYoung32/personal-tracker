import { useEffect } from 'react';
import { currentResetBoundary, parseDateOnly } from '../utils/recurrence';

/**
 * Re-opens recurring todos once their current cycle's scheduled reset date
 * (see currentResetBoundary) has passed and they were last completed before
 * that boundary — i.e. completed in an earlier cycle, not the current one.
 *
 * Call this wherever a `todos` collection is loaded and rendered (the
 * to-do page, or a vehicle/armory-item page showing its linked maintenance
 * tasks) so resets apply no matter which page the user happens to have
 * open.
 */
export function useRecurringReset(items, loading, updateItem) {
  useEffect(() => {
    if (loading) return;
    const todayMidnight = new Date(new Date().toDateString());
    items
      .filter((t) => t.completed && t.completedDate)
      .filter((t) => {
        const boundary = currentResetBoundary(t, todayMidnight);
        return boundary && parseDateOnly(t.completedDate) < boundary;
      })
      .forEach((t) => {
        // Runs automatically on load, not from a user action — updateItem
        // already surfaces a friendly error via the collection's error
        // state, so just swallow the rethrow here to avoid an unhandled
        // rejection; a failed auto-reset simply retries next load.
        updateItem(t.id, { completed: false, completedDate: null }).catch(() => {});
      });
  }, [items, loading, updateItem]);
}
