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

  it('advances a monthly task by calendar months, preserving day-of-month', () => {
    const todo = { frequency: 'monthly', createdAt: localIso(2026, 0, 15) };
    // Created Jan 15 -> first reset Feb 15 -> next Mar 15.
    const boundary = currentResetBoundary(todo, new Date(2026, 2, 20));
    expect(boundary).toEqual(new Date(2026, 2, 15));
  });

  it('clamps a month-end monthly task to the shorter month instead of drifting', () => {
    const todo = { frequency: 'monthly', createdAt: localIso(2026, 0, 31) };
    // Created Jan 31 -> first reset clamps to Feb 28 (2026 isn't a leap year).
    const beforeMarch = currentResetBoundary(todo, new Date(2026, 1, 28));
    expect(beforeMarch).toEqual(new Date(2026, 1, 28));

    // The 2nd cycle hasn't landed yet by Mar 28 — it recovers all the way to
    // Mar 31 (see the next test), so the boundary is still Feb 28 here.
    const stillFeb = currentResetBoundary(todo, new Date(2026, 2, 28));
    expect(stillFeb).toEqual(new Date(2026, 1, 28));
  });

  it('recovers the original day-of-month once a later month is long enough for it', () => {
    const todo = { frequency: 'monthly', createdAt: localIso(2026, 0, 31) };
    // Jan 31 -> Feb 28 (clamped) -> Mar 31 (recovers, March has 31 days) ->
    // Apr 30 (clamped again) -> May 31 (recovers again) — never permanently
    // stuck at 28 the way chaining off the previous boundary would leave it.
    expect(currentResetBoundary(todo, new Date(2026, 2, 31))).toEqual(new Date(2026, 2, 31));
    expect(currentResetBoundary(todo, new Date(2026, 3, 29))).toEqual(new Date(2026, 2, 31));
    expect(currentResetBoundary(todo, new Date(2026, 3, 30))).toEqual(new Date(2026, 3, 30));
    expect(currentResetBoundary(todo, new Date(2026, 4, 31))).toEqual(new Date(2026, 4, 31));
  });

  it('advances a quarterly task by 3 calendar months at a time', () => {
    const todo = { frequency: 'quarterly', createdAt: localIso(2026, 0, 31) };
    // Jan 31 -> Apr 30 (April only has 30 days) -> next would be Jul 31.
    const boundary = currentResetBoundary(todo, new Date(2026, 3, 30));
    expect(boundary).toEqual(new Date(2026, 3, 30));
  });

  it('advances a yearly task by calendar years, clamping Feb 29 in non-leap years', () => {
    const todo = { frequency: 'yearly', createdAt: localIso(2024, 1, 29) };
    // 2024 is a leap year (Feb 29 exists); created Feb 29 2024 -> first reset
    // clamps to Feb 28 2025 (not a leap year) -> next is Feb 28 2026.
    const boundary = currentResetBoundary(todo, new Date(2025, 2, 1));
    expect(boundary).toEqual(new Date(2025, 1, 28));

    const later = currentResetBoundary(todo, new Date(2026, 1, 28));
    expect(later).toEqual(new Date(2026, 1, 28));
  });

  it('recovers Feb 29 for a yearly task on the next leap year', () => {
    const todo = { frequency: 'yearly', createdAt: localIso(2024, 1, 29) };
    // Feb 28 2025, 2026, 2027 (all non-leap) -> Feb 29 2028 (leap) recovers,
    // rather than staying clamped at the 28th forever.
    expect(currentResetBoundary(todo, new Date(2027, 1, 28))).toEqual(new Date(2027, 1, 28));
    expect(currentResetBoundary(todo, new Date(2028, 1, 29))).toEqual(new Date(2028, 1, 29));
  });

  describe('ordinal monthly resets ("Nth weekday of the month")', () => {
    it('fires within the creation month if the Nth weekday has not passed yet', () => {
      // Created Sat Aug 1 2026; 2nd Tuesday of August is Aug 11 — still
      // ahead of creation, so (unlike every other frequency) it doesn't
      // get pushed a full cycle out.
      const todo = {
        frequency: 'monthly',
        createdAt: localIso(2026, 7, 1),
        recurringDay: 2,
        recurringWeekOfMonth: 2,
      };
      expect(currentResetBoundary(todo, new Date(2026, 7, 1))).toBeNull();
      expect(currentResetBoundary(todo, new Date(2026, 7, 11))).toEqual(new Date(2026, 7, 11));
    });

    it('does not advance early, then lands exactly on next month\'s occurrence', () => {
      const todo = {
        frequency: 'monthly',
        createdAt: localIso(2026, 7, 1),
        recurringDay: 2,
        recurringWeekOfMonth: 2,
      };
      // Sep's 2nd Tuesday is Sep 8 — Sep 7 is still within August's cycle.
      expect(currentResetBoundary(todo, new Date(2026, 8, 7))).toEqual(new Date(2026, 7, 11));
      expect(currentResetBoundary(todo, new Date(2026, 8, 8))).toEqual(new Date(2026, 8, 8));
    });

    it('skips to next month if the Nth weekday already passed in the creation month', () => {
      // Created Aug 12, after August's 2nd Tuesday (Aug 11) already passed
      // — first reset is September's, not a stale August date.
      const todo = {
        frequency: 'monthly',
        createdAt: localIso(2026, 7, 12),
        recurringDay: 2,
        recurringWeekOfMonth: 2,
      };
      expect(currentResetBoundary(todo, new Date(2026, 7, 20))).toBeNull();
      expect(currentResetBoundary(todo, new Date(2026, 8, 8))).toEqual(new Date(2026, 8, 8));
    });

    it('supports the "Last" ordinal (-1), including across a short month', () => {
      // Created Jan 1 2026; Last Friday of Jan 2026 is Jan 30.
      const todo = {
        frequency: 'monthly',
        createdAt: localIso(2026, 0, 1),
        recurringDay: 5,
        recurringWeekOfMonth: -1,
      };
      expect(currentResetBoundary(todo, new Date(2026, 0, 30))).toEqual(new Date(2026, 0, 30));
      // Last Friday of Feb 2026 (28-day month) is Feb 27, not Jan 30 + ~30 days.
      expect(currentResetBoundary(todo, new Date(2026, 1, 26))).toEqual(new Date(2026, 0, 30));
      expect(currentResetBoundary(todo, new Date(2026, 1, 27))).toEqual(new Date(2026, 1, 27));
    });

    it('advances correctly across many months in a single query', () => {
      const todo = {
        frequency: 'monthly',
        createdAt: localIso(2026, 0, 5),
        recurringDay: 2,
        recurringWeekOfMonth: 2,
      };
      // 2nd Tuesday of November 2026 is Nov 10.
      expect(currentResetBoundary(todo, new Date(2026, 10, 20))).toEqual(new Date(2026, 10, 10));
    });

    it('ignores a stray recurringDay on monthly without a matching recurringWeekOfMonth', () => {
      // No recurringWeekOfMonth -> falls through to plain day-of-month
      // monthly math (the pre-existing, unrelated code path), not ordinal.
      const todo = { frequency: 'monthly', createdAt: localIso(2026, 0, 15), recurringDay: 2 };
      expect(currentResetBoundary(todo, new Date(2026, 1, 15))).toEqual(new Date(2026, 1, 15));
    });

    it('ignores recurringDay entirely for quarterly and yearly', () => {
      const quarterly = { frequency: 'quarterly', createdAt: localIso(2026, 0, 31), recurringDay: 2 };
      expect(currentResetBoundary(quarterly, new Date(2026, 3, 30))).toEqual(new Date(2026, 3, 30));

      const yearly = { frequency: 'yearly', createdAt: localIso(2025, 5, 15), recurringDay: 2 };
      expect(currentResetBoundary(yearly, new Date(2026, 5, 20))).toEqual(new Date(2026, 5, 15));
    });
  });
});
