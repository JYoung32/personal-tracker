// Frequencies that recur at all. One-time is excluded — it never recurs.
const RECURRING_FREQUENCIES = new Set(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);

// Local (not UTC) YYYY-MM-DD, matching the date-input format used for dueDate
// so string comparisons behave as expected across timezones.
export function todayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses a "YYYY-MM-DD" string (as stored in dueDate/completedDate) into a local-midnight Date.
export function parseDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Truncates an ISO timestamp (as stored in createdAt) to local midnight.
function parseLocalDateOnly(isoString) {
  const d = new Date(isoString);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Adds `months` calendar months, clamping the day-of-month to whatever the
// target month actually has (e.g. Jan 31 + 1 month -> Feb 28/29, not Mar
// 3) instead of letting Date's own month-overflow rollover push it into the
// following month. Also used for yearly (12 months), which gets Feb 29 ->
// Feb 28 leap-day clamping for free the same way.
function addMonths(date, months) {
  const day = date.getDate();
  const firstOfTargetMonth = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const daysInTargetMonth = new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth() + 1,
    0
  ).getDate();
  firstOfTargetMonth.setDate(Math.min(day, daysInTargetMonth));
  return firstOfTargetMonth;
}

// Adds `n` cycles of `frequency` to `date`, always measuring from `date`
// itself — never chained from a previously-computed (and possibly already
// month-end/leap-day clamped) boundary. That distinction matters for
// monthly/quarterly/yearly: see currentResetBoundary below for why.
function addCycles(date, frequency, n) {
  switch (frequency) {
    case 'daily':
      return addDays(date, n);
    case 'weekly':
      return addDays(date, n * 7);
    case 'monthly':
      return addMonths(date, n);
    case 'quarterly':
      return addMonths(date, n * 3);
    case 'yearly':
      return addMonths(date, n * 12);
    default:
      return date;
  }
}

// The first reset lands one cycle after the task was created, pulled forward (if a recurringDay
// is set) to the next occurrence of that weekday. That weekday-alignment "extension" is only ever
// added to this first reset — every later reset is exactly N cycles after the *original creation
// date* (see currentResetBoundary), not after this weekday-shifted date, so the schedule stays
// fixed and predictable regardless of when the user actually checks the task off.
function firstResetDate(anchorDate, frequency, recurringDay) {
  const earliest = addCycles(anchorDate, frequency, 1);
  if (recurringDay === null || recurringDay === undefined) return earliest;
  const offset = (recurringDay - earliest.getDay() + 7) % 7;
  return addDays(earliest, offset);
}

// Adds `n` calendar months to a (year, month) pair, wrapping the year —
// used by the ordinal-monthly path below, which works in raw (year, month)
// rather than Date objects since a specific day-of-month isn't known until
// nthWeekdayOfMonth resolves one.
function addCalendarMonths(year, month, n) {
  const total = month + n;
  return { year: year + Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

// The Nth (ordinal 1-4) or last (ordinal -1) occurrence of `weekday`
// (0=Sunday..6=Saturday) in the given (year, month). Every month has at
// least 4 occurrences of every weekday — a 28-day month is exactly 4 full
// weeks — so ordinals 1-4 always exist; only "last" needs its own
// calculation (walking backward from month-end), since a 5th occurrence
// isn't guaranteed.
function nthWeekdayOfMonth(year, month, weekday, ordinal) {
  if (ordinal === -1) {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDate = new Date(year, month, lastDayOfMonth);
    const back = (lastDate.getDay() - weekday + 7) % 7;
    return addDays(lastDate, -back);
  }
  const firstDow = new Date(year, month, 1).getDay();
  const firstOccurrenceDay = 1 + ((weekday - firstDow + 7) % 7);
  return new Date(year, month, firstOccurrenceDay + (ordinal - 1) * 7);
}

// The most recent scheduled reset date on/before today for a monthly task pinned to a specific
// "Nth weekday of the month" (e.g. "2nd Tuesday"), rather than a plain day-of-month. Unlike every
// other recurrence path, the first reset is the very next such occurrence after creation — even
// later in the *same* month — never pushed a full cycle out: an ordinal date's existence doesn't
// depend on how soon after creation it falls (there's no "too soon" concept to guard against the
// way the weekday-alignment nudge on other frequencies exists for). Later cycles walk forward one
// calendar month at a time; no clamping is ever needed since nthWeekdayOfMonth's result always
// exists for that month by construction.
function ordinalMonthlyResetBoundary(anchor, weekday, weekOfMonth, todayMidnight) {
  let year = anchor.getFullYear();
  let month = anchor.getMonth();
  let r1 = nthWeekdayOfMonth(year, month, weekday, weekOfMonth);
  while (r1 <= anchor) {
    ({ year, month } = addCalendarMonths(year, month, 1));
    r1 = nthWeekdayOfMonth(year, month, weekday, weekOfMonth);
  }
  if (todayMidnight < r1) return null;

  let boundary = r1;
  for (;;) {
    const next = addCalendarMonths(year, month, 1);
    const nextBoundary = nthWeekdayOfMonth(next.year, next.month, weekday, weekOfMonth);
    if (nextBoundary > todayMidnight) break;
    boundary = nextBoundary;
    year = next.year;
    month = next.month;
  }
  return boundary;
}

// The most recent scheduled reset date on/before today, or null if the task's frequency doesn't
// recur (one-time) or its first reset hasn't happened yet.
//
// Every cycle N>=2 is computed as `addCycles(anchor, frequency, N)` — straight from the ORIGINAL
// creation date, never chained off the previous boundary (boundary N-1) or off r1. Both of those
// are themselves already-clamped results once a short month/non-leap year has been hit once, so
// chaining off them would permanently lock in that clamp: a monthly task created Jan 31 would go
// Jan 31 -> Feb 28 -> Mar 28 -> Apr 28 -> ... forever, silently downgrading from "the 31st" to
// "the 28th" and never coming back. Recomputing from the untouched original anchor instead lets a
// later month/year long enough to support the original day recover it: Jan 31 -> Feb 28 (clamped,
// Feb is short) -> Mar 31 (recovers) -> Apr 30 (clamped) -> May 31 (recovers). Same for a Feb 29
// yearly task: clamps to Feb 28 in non-leap years, returns to Feb 29 the next leap year.
//
// Daily/weekly cycles are a fixed number of days, so cycle N is computed directly (no clamping is
// possible, so chaining vs. recomputing from anchor make no difference there — the O(1) division
// is just cheaper). Cycle 1 for those frequencies is r1 itself (weekday-aligned, if recurringDay
// is set); the fixed-interval-from-r1 math below already accounts for that.
//
// A monthly task with BOTH recurringDay and recurringWeekOfMonth set is pinned to an "Nth weekday
// of the month" (e.g. "2nd Tuesday") and branches to ordinalMonthlyResetBoundary above instead —
// a genuinely different schedule shape (see that function's own docstring for why). Any other
// combination — weekly's plain recurringDay, or a stray recurringDay left over on a
// monthly/quarterly/yearly task with no matching recurringWeekOfMonth — falls through to the
// plain-cycle path below, which only ever honors recurringDay for weekly: quarterly/yearly never
// supported a meaningful weekday pin (a bare weekday nudge on an already-months-out date isn't
// useful), and a monthly task without both ordinal fields set is treated as having no day
// preference at all, rather than guessing at what a leftover lone recurringDay used to mean.
export function currentResetBoundary(todo, todayMidnight) {
  if (!RECURRING_FREQUENCIES.has(todo.frequency)) return null;

  const anchor = parseLocalDateOnly(todo.createdAt);

  if (todo.frequency === 'monthly' && todo.recurringDay != null && todo.recurringWeekOfMonth != null) {
    return ordinalMonthlyResetBoundary(anchor, todo.recurringDay, todo.recurringWeekOfMonth, todayMidnight);
  }

  const r1 = firstResetDate(anchor, todo.frequency, todo.frequency === 'weekly' ? todo.recurringDay : null);
  if (todayMidnight < r1) return null;

  if (todo.frequency === 'daily' || todo.frequency === 'weekly') {
    const intervalDays = todo.frequency === 'daily' ? 1 : 7;
    const cyclesPast = Math.floor((todayMidnight - r1) / 86400000 / intervalDays);
    return addDays(r1, cyclesPast * intervalDays);
  }

  // Cycle 1 is r1 (may include the one-time weekday shift above); cycle N>=2
  // is addCycles(anchor, frequency, N) — see the recovery explanation above.
  function boundaryForCycle(n) {
    return n === 1 ? r1 : addCycles(anchor, todo.frequency, n);
  }

  let n = 1;
  while (boundaryForCycle(n + 1) <= todayMidnight) {
    n += 1;
  }
  return boundaryForCycle(n);
}

// Fields to merge in when toggling a recurring task's completed state, so
// completedDate reliably reflects the day it was last checked off.
export function toggleCompletionFields(completed) {
  return { completed, completedDate: completed ? todayDateString() : null };
}
