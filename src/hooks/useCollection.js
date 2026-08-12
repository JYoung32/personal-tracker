import { useCallback, useEffect, useState } from 'react';
import { storageAdapter } from '../services/storage';
import { getFriendlyErrorMessage } from '../utils/friendlyError';

/**
 * useCollection
 * --------------
 * Generic list management: loads a named collection and exposes
 * add / update / remove operations plus loading & error state.
 *
 * This is the "different types of lists" abstraction — the to-do list,
 * hobby tracker, and purchase order list are all just collections with
 * different item shapes. Each feature calls this hook with its own
 * collection key and gets full CRUD for free.
 *
 * Every mutation is wrapped so a failure (network drop, RLS rejection,
 * unique constraint, ...) sets `error` to a friendly message instead of
 * becoming a silent no-op or an unhandled rejection — most pages already
 * render `{error && <Alert>...}`, so this alone surfaces failures
 * app-wide with no per-page changes. The original error is still
 * re-thrown so a caller that needs to react (e.g. keep a form open
 * instead of closing it) can `catch` it.
 *
 * @param {string} collectionKey - e.g. "todos", "hobbies", "purchases"
 *
 * @example
 * const { items, loading, addItem, updateItem, removeItem } = useCollection('todos');
 * addItem({ text: 'Buy milk', completed: false });
 */
export function useCollection(collectionKey) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storageAdapter.getAll(collectionKey);
      setItems(data);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [collectionKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item) => {
      setError(null);
      try {
        const newItem = await storageAdapter.create(collectionKey, item);
        setItems((prev) => [...prev, newItem]);
        return newItem;
      } catch (err) {
        setError(getFriendlyErrorMessage(err));
        throw err;
      }
    },
    [collectionKey]
  );

  const updateItem = useCallback(
    async (id, updates) => {
      setError(null);
      try {
        const updated = await storageAdapter.update(collectionKey, id, updates);
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
      } catch (err) {
        setError(getFriendlyErrorMessage(err));
        throw err;
      }
    },
    [collectionKey]
  );

  const removeItem = useCallback(
    async (id) => {
      setError(null);
      try {
        await storageAdapter.remove(collectionKey, id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setError(getFriendlyErrorMessage(err));
        throw err;
      }
    },
    [collectionKey]
  );

  return { items, loading, error, addItem, updateItem, removeItem, refresh };
}
