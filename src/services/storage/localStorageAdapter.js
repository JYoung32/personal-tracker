/**
 * localStorageAdapter
 * --------------------
 * A simple CRUD adapter backed by the browser's localStorage.
 *
 * This exists so the rest of the app never talks to localStorage directly.
 * Every feature (todos, hobbies, purchases) calls this adapter through the
 * generic `useCollection` hook, using a "collection key" (e.g. "todos") to
 * namespace its data.
 *
 * WHY THIS MATTERS:
 * When you're ready to move to Supabase, you write a `supabaseAdapter.js`
 * that implements the exact same four methods (getAll, create, update,
 * remove), then flip the export in `services/storage/index.js`. No feature
 * code (TodoPage, HobbyPage, etc.) has to change at all.
 */

const STORAGE_PREFIX = 'personal-tracker:';

function readCollection(key) {
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  return raw ? JSON.parse(raw) : [];
}

function writeCollection(key, items) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(items));
}

// Simulate async latency-free network calls so components can already be
// written as if they're waiting on a real API (async/await, loading states).
// This makes the eventual Supabase swap behave identically from the UI's
// point of view.
function resolveAsync(value) {
  return Promise.resolve(value);
}

export const localStorageAdapter = {
  /**
   * Fetch every item in a collection.
   * @param {string} key - collection name, e.g. "todos"
   */
  async getAll(key) {
    return resolveAsync(readCollection(key));
  },

  /**
   * Create a new item in a collection. Automatically assigns an id and
   * createdAt timestamp.
   * @param {string} key
   * @param {object} item - fields specific to the feature (e.g. { text, completed })
   */
  async create(key, item) {
    const items = readCollection(key);
    const newItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...item,
    };
    items.push(newItem);
    writeCollection(key, items);
    return resolveAsync(newItem);
  },

  /**
   * Update fields on an existing item.
   * @param {string} key
   * @param {string} id
   * @param {object} updates - partial fields to merge in
   */
  async update(key, id, updates) {
    const items = readCollection(key);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id "${id}" not found in collection "${key}"`);
    }
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeCollection(key, items);
    return resolveAsync(items[index]);
  },

  /**
   * Remove an item from a collection.
   * @param {string} key
   * @param {string} id
   */
  async remove(key, id) {
    const items = readCollection(key).filter((item) => item.id !== id);
    writeCollection(key, items);
    return resolveAsync(true);
  },
};
