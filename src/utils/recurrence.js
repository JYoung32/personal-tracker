// Days between resets, keyed by frequency. One-time has no entry — it never recurs.
const FREQUENCY_INTERVAL_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

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

// The first reset lands `intervalDays` after the task was created, pulled forward (if a
// recurringDay is set) to the next occurrence of that weekday. That weekday-alignment "extension"
// is only ever added to this first reset — every later reset is exactly `intervalDays` after the
// one before it, so the schedule stays fixed and predictable regardless of when the user actually
// checks the task off.
function firstResetDate(anchorDate, intervalDays, recurringDay) {
  const earliest = addDays(anchorDate, intervalDays);
  if (recurringDay === null || recurringDay === undefined) return earliest;
  const offset = (recurringDay - earliest.getDay() + 7) % 7;
  return addDays(earliest, offset);
}

// The most recent scheduled reset date on/before today, or null if the task's frequency doesn't
// recur (one-time) or its first reset hasn't happened yet.
export function currentResetBoundary(todo, todayMidnight) {
  const intervalDays = FREQUENCY_INTERVAL_DAYS[todo.frequency];
  if (!intervalDays) return null;

  const anchor = parseLocalDateOnly(todo.createdAt);
  const r1 = firstResetDate(anchor, intervalDays, todo.recurringDay);
  if (todayMidnight < r1) return null;

  const cyclesPast = Math.floor((todayMidnight - r1) / 86400000 / intervalDays);
  return addDays(r1, cyclesPast * intervalDays);
}

// Fields to merge in when toggling a recurring task's completed state, so
// completedDate reliably reflects the day it was last checked off.
export function toggleCompletionFields(completed) {
  return { completed, completedDate: completed ? todayDateString() : null };
}
