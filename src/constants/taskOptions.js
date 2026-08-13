export const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// -1 stands for "last", rather than a 5th occurrence — a month always has
// at least 4 of any given weekday, but not always a 5th, so "last" is the
// standard way to express "the final one" without a fragile fallback.
export const WEEK_OF_MONTH_OPTIONS = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: -1, label: 'Last' },
];

export const DEFAULT_FREQUENCY = 'daily';
export const DEFAULT_PRIORITY = 'medium';

const DAY_LABELS = Object.fromEntries(DAY_OPTIONS.map((opt) => [opt.value, opt.label]));
const WEEK_OF_MONTH_LABELS = Object.fromEntries(WEEK_OF_MONTH_OPTIONS.map((opt) => [opt.value, opt.label]));

// Only weekly has a plain "repeats on this weekday" picker — 7 days later
// always lands back on the same weekday, so it's meaningful on its own.
// Monthly's weekday picker is paired with a week-of-month (see
// supportsRecurringWeekOfMonth) instead; quarterly/yearly don't get one at
// all (see recurrence.js's currentResetBoundary docstring for why a bare
// weekday nudge on those isn't useful). Daily has no use for it (it resets
// every day anyway) and one-time never recurs.
export function supportsRecurringDay(frequency) {
  return frequency === 'weekly';
}

// Monthly tasks can optionally pin their reset to an "Nth weekday of the
// month" (e.g. "2nd Tuesday") via the paired recurringDay +
// recurringWeekOfMonth fields — see recurrence.js's
// ordinalMonthlyResetBoundary for the math.
export function supportsRecurringWeekOfMonth(frequency) {
  return frequency === 'monthly';
}

// Renders a todo's recurringDay/recurringWeekOfMonth as display text:
// "Tuesday" for a weekly task, "2nd Tuesday" for an ordinal monthly one,
// or null if neither applies (nothing worth showing) — shared by TodoItem
// and MaintenanceTaskList so both render the exact same label.
export function formatRecurringDayLabel(todo) {
  if (todo.recurringDay == null) return null;
  if (supportsRecurringDay(todo.frequency)) return DAY_LABELS[todo.recurringDay];
  if (supportsRecurringWeekOfMonth(todo.frequency) && todo.recurringWeekOfMonth != null) {
    return `${WEEK_OF_MONTH_LABELS[todo.recurringWeekOfMonth]} ${DAY_LABELS[todo.recurringDay]}`;
  }
  return null;
}
