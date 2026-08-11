/**
 * Active storage adapter.
 *
 * Every feature imports `storageAdapter` from here rather than importing
 * `localStorageAdapter` directly. When Supabase is ready:
 *
 *   1. Create `services/storage/supabaseAdapter.js` implementing the same
 *      four methods: getAll(key), create(key, item), update(key, id, updates),
 *      remove(key, id).
 *   2. Import it below and change the export.
 *
 * That's it — no other file in the app needs to know storage changed.
 */
import { localStorageAdapter } from './localStorageAdapter';

export const storageAdapter = localStorageAdapter;
