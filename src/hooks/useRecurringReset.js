import { useEffect, useRef } from 'react';
import { currentResetBoundary, parseDateOnly } from '../utils/recurrence';

/**
 * Re-opens recurring todos once their current cycle's scheduled reset date
 * (see currentResetBoundary) has passed and they were last completed before
 * that boundary — i.e. completed in an earlier cycle, not the current one.
 *
 * Call this wherever a `todos` collection is loaded and rendered (the
 * to-do page, or a hobby/tracker-item page showing its linked maintenance
 * tasks) so resets apply no matter which page the user happens to have
 * open.
 */
export function useRecurringReset(items, loading, updateItem) {
  // This effect re-runs on every `items` reference change, including
  // unrelated add/update/remove calls elsewhere on the page — the async
  // updateItem below hasn't landed back in `items` yet when that happens,
  // so without this guard the same due item could be sent to updateItem
  // more than once concurrently. Tracks ids currently being reset so a
  // re-run skips them instead of re-submitting.
  const resettingIds = useRef(new Set());

  useEffect(() => {
    if (loading) return;
    const todayMidnight = new Date(new Date().toDateString());
    const due = items
      .filter((t) => t.completed && t.completedDate && !resettingIds.current.has(t.id))
      .filter((t) => {
        const boundary = currentResetBoundary(t, todayMidnight);
        return boundary && parseDateOnly(t.completedDate) < boundary;
      });

    if (due.length === 0) return;

    due.forEach((t) => resettingIds.current.add(t.id));
    due.forEach((t) => {
      // Runs automatically on load, not from a user action — updateItem
      // already surfaces a friendly error via the collection's error
      // state, so just swallow the rethrow here to avoid an unhandled
      // rejection; a failed auto-reset simply retries next load.
      updateItem(t.id, { completed: false, completedDate: null })
        .catch(() => {})
        .finally(() => resettingIds.current.delete(t.id));
    });
  }, [items, loading, updateItem]);
}
