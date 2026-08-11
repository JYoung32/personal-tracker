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

export const DEFAULT_FREQUENCY = 'daily';
export const DEFAULT_PRIORITY = 'medium';

// Weekly/monthly/quarterly/yearly tasks can optionally pin their reset to a
// specific day of the week; daily has no use for it (it resets every day
// anyway) and one-time never recurs.
export function supportsRecurringDay(frequency) {
  return frequency !== 'one-time' && frequency !== 'daily';
}
