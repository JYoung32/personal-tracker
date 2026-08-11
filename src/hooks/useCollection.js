import { useCallback, useEffect, useState } from 'react';
import { storageAdapter } from '../services/storage';

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
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [collectionKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item) => {
      const newItem = await storageAdapter.create(collectionKey, item);
      setItems((prev) => [...prev, newItem]);
      return newItem;
    },
    [collectionKey]
  );

  const updateItem = useCallback(
    async (id, updates) => {
      const updated = await storageAdapter.update(collectionKey, id, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [collectionKey]
  );

  const removeItem = useCallback(
    async (id) => {
      await storageAdapter.remove(collectionKey, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [collectionKey]
  );

  return { items, loading, error, addItem, updateItem, removeItem, refresh };
}
