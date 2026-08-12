import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FILTERS, useTodoFilters } from './useTodoFilters';

function todo(overrides) {
  return {
    id: '1',
    text: 'task',
    completed: false,
    dueDate: null,
    priority: 'medium',
    frequency: 'daily',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useTodoFilters', () => {
  it('sorts incomplete before completed', () => {
    const todos = [todo({ id: '1', completed: true }), todo({ id: '2', completed: false })];
    const { result } = renderHook(() => useTodoFilters(todos));
    expect(result.current.filteredTodos.map((t) => t.id)).toEqual(['2', '1']);
  });

  it('the ACTIVE/COMPLETED status filter narrows the list', () => {
    const todos = [todo({ id: '1', completed: true }), todo({ id: '2', completed: false })];
    const { result } = renderHook(() => useTodoFilters(todos));

    act(() => result.current.setFilter(FILTERS.ACTIVE));
    expect(result.current.filteredTodos.map((t) => t.id)).toEqual(['2']);

    act(() => result.current.setFilter(FILTERS.COMPLETED));
    expect(result.current.filteredTodos.map((t) => t.id)).toEqual(['1']);
  });

  it('the frequency filter narrows the list', () => {
    const todos = [todo({ id: '1', frequency: 'daily' }), todo({ id: '2', frequency: 'weekly' })];
    const { result } = renderHook(() => useTodoFilters(todos));

    act(() => result.current.setFrequencyFilter('weekly'));
    expect(result.current.filteredTodos.map((t) => t.id)).toEqual(['2']);
  });

  it('availableTags is the deduped, sorted set of tags across all todos', () => {
    const todos = [
      todo({ id: '1', tags: ['work', 'urgent'] }),
      todo({ id: '2', tags: ['home'] }),
      todo({ id: '3', tags: ['work'] }),
      todo({ id: '4', tags: [] }),
    ];
    const { result } = renderHook(() => useTodoFilters(todos));
    expect(result.current.availableTags).toEqual(['home', 'urgent', 'work']);
  });

  it('the tag filter narrows the list to todos carrying that tag', () => {
    const todos = [
      todo({ id: '1', tags: ['work'] }),
      todo({ id: '2', tags: ['home'] }),
      todo({ id: '3', tags: ['work', 'home'] }),
    ];
    const { result } = renderHook(() => useTodoFilters(todos));

    act(() => result.current.setTagFilter('home'));
    expect(result.current.filteredTodos.map((t) => t.id).sort()).toEqual(['2', '3']);
  });

  it('defaults to "all" and applies no tag filtering', () => {
    const todos = [todo({ id: '1', tags: ['work'] }), todo({ id: '2', tags: [] })];
    const { result } = renderHook(() => useTodoFilters(todos));
    expect(result.current.tagFilter).toBe('all');
    expect(result.current.filteredTodos).toHaveLength(2);
  });

  it('treats a missing tags field as no tags, without throwing', () => {
    const todos = [{ id: '1', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }];
    const { result } = renderHook(() => useTodoFilters(todos));
    expect(result.current.availableTags).toEqual([]);
    expect(() => act(() => result.current.setTagFilter('anything'))).not.toThrow();
  });
});
