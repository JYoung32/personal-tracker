import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCollection } from './useCollection';
import { storageAdapter } from '../services/storage';

vi.mock('../services/storage', () => ({
  storageAdapter: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCollection', () => {
  it('starts loading, then populates items from storageAdapter.getAll', async () => {
    storageAdapter.getAll.mockResolvedValue([{ id: '1', text: 'a' }]);

    const { result } = renderHook(() => useCollection('todos'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(storageAdapter.getAll).toHaveBeenCalledWith('todos');
    expect(result.current.items).toEqual([{ id: '1', text: 'a' }]);
    expect(result.current.error).toBeNull();
  });

  it('sets a friendly error and leaves items empty when the initial load fails', async () => {
    storageAdapter.getAll.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useCollection('todos'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('network down');
  });

  it('addItem appends the created item to state', async () => {
    storageAdapter.getAll.mockResolvedValue([]);
    storageAdapter.create.mockResolvedValue({ id: '2', text: 'b' });

    const { result } = renderHook(() => useCollection('todos'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem({ text: 'b' });
    });

    expect(storageAdapter.create).toHaveBeenCalledWith('todos', { text: 'b' });
    expect(result.current.items).toEqual([{ id: '2', text: 'b' }]);
  });

  it('updateItem replaces the matching item in state', async () => {
    storageAdapter.getAll.mockResolvedValue([{ id: '1', text: 'a', completed: false }]);
    storageAdapter.update.mockResolvedValue({ id: '1', text: 'a', completed: true });

    const { result } = renderHook(() => useCollection('todos'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateItem('1', { completed: true });
    });

    expect(result.current.items).toEqual([{ id: '1', text: 'a', completed: true }]);
  });

  it('removeItem filters the item out of state', async () => {
    storageAdapter.getAll.mockResolvedValue([
      { id: '1', text: 'a' },
      { id: '2', text: 'b' },
    ]);
    storageAdapter.remove.mockResolvedValue(true);

    const { result } = renderHook(() => useCollection('todos'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeItem('1');
    });

    expect(result.current.items).toEqual([{ id: '2', text: 'b' }]);
  });

  it('a failed mutation sets a friendly error and rethrows, leaving state unchanged', async () => {
    storageAdapter.getAll.mockResolvedValue([{ id: '1', text: 'a' }]);
    const dbError = Object.assign(new Error('duplicate key'), { code: '23505' });
    storageAdapter.update.mockRejectedValue(dbError);

    const { result } = renderHook(() => useCollection('todos'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let caught;
    await act(async () => {
      try {
        await result.current.updateItem('1', { text: 'dup' });
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBe(dbError);
    expect(result.current.error).toBe('That already exists — try a different value.');
    // The optimistic item list is untouched since the adapter call itself failed.
    expect(result.current.items).toEqual([{ id: '1', text: 'a' }]);
  });
});
