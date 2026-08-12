import { describe, it, expect } from 'vitest';
import { currentResetBoundary, parseDateOnly, todayDateString, toggleCompletionFields } from './recurrence';

// Builds an ISO createdAt timestamp from local Y/M/D/H, so these tests behave
// the same regardless of which timezone they happen to run in (matching how
// recurrence.js itself always reasons in local time, never UTC).
function localIso(year, month, day, hour = 12) {
  return new Date(year, month, day, hour).toISOString();
}

describe('parseDateOnly', () => {
  it('parses a YYYY-MM-DD string into a local-midnight Date', () => {
    const d = parseDateOnly('2026-03-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // 0-indexed
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(0);
  });
});

describe('todayDateString', () => {
  it('matches the local YYYY-MM-DD format', () => {
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('toggleCompletionFields', () => {
  it('sets completedDate to today when completing', () => {
    expect(toggleCompletionFields(true)).toEqual({
      completed: true,
      completedDate: todayDateString(),
    });
  });

  it('clears completedDate when un-completing', () => {
    expect(toggleCompletionFields(false)).toEqual({
      completed: false,
      completedDate: null,
    });
  });
});

describe('currentResetBoundary', () => {
  it('returns null for a one-time task (no recurrence)', () => {
    const todo = { frequency: 'one-time', createdAt: localIso(2026, 0, 1) };
    expect(currentResetBoundary(todo, new Date(2026, 5, 1))).toBeNull();
  });

  it('returns null before the first reset has happened', () => {
    const todo = { frequency: 'daily', createdAt: localIso(2026, 0, 1) };
    // Created Jan 1, first daily reset lands Jan 2 — Jan 1 itself is still too early.
    expect(currentResetBoundary(todo, new Date(2026, 0, 1))).toBeNull();
  });

  it('returns the first reset date once it has passed, for a daily task', () => {
    const todo = { frequency: 'daily', createdAt: localIso(2026, 0, 1) };
    const boundary = currentResetBoundary(todo, new Date(2026, 0, 2));
    expect(boundary).toEqual(new Date(2026, 0, 2));
  });

  it('advances by whole intervals for a weekly task several cycles out', () => {
    const todo = { frequency: 'weekly', createdAt: localIso(2026, 0, 1) };
    // First reset: Jan 8. Three weeks later (Jan 29) should be the 3rd cycle's boundary.
    const boundary = currentResetBoundary(todo, new Date(2026, 0, 29));
    expect(boundary).toEqual(new Date(2026, 0, 29));
  });

  it('does not advance past today even mid-cycle', () => {
    const todo = { frequency: 'weekly', createdAt: localIso(2026, 0, 1) };
    // Jan 8 is the first boundary; Jan 12 is still within that same cycle.
    const boundary = currentResetBoundary(todo, new Date(2026, 0, 12));
    expect(boundary).toEqual(new Date(2026, 0, 8));
  });

  it('pulls the first reset forward to the given weekday when recurringDay is set', () => {
    // Jan 1 2026 is a Thursday (day 4). intervalDays=1 -> earliest = Jan 2 (Friday, day 5).
    // recurringDay=1 (Monday) should push the first reset to Jan 5.
    const todo = { frequency: 'daily', createdAt: localIso(2026, 0, 1), recurringDay: 1 };
    const boundary = currentResetBoundary(todo, new Date(2026, 0, 5));
    expect(boundary).toEqual(new Date(2026, 0, 5));
    expect(boundary.getDay()).toBe(1);
  });

  it('keeps later resets on a fixed interval after the weekday-aligned first one', () => {
    const todo = { frequency: 'daily', createdAt: localIso(2026, 0, 1), recurringDay: 1 };
    // First reset Jan 5 (Monday); next daily reset is exactly 1 day later, Jan 6.
    const boundary = currentResetBoundary(todo, new Date(2026, 0, 6));
    expect(boundary).toEqual(new Date(2026, 0, 6));
  });
});
