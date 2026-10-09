/** Activity follows the device's local calendar, not UTC midnight. */
export function localDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function localWeekKey(date = new Date()): string {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return localDayKey(monday);
}
export function nextActiveWeeks(previousDay: string | null, count: number, now = new Date()): number {
  if (!previousDay) return 1;
  const previousWeek = localWeekKey(new Date(previousDay + 'T12:00:00'));
  const thisWeek = localWeekKey(now);
  if (previousWeek === thisWeek) return Math.max(1, count);
  const lastWeek = new Date(now); lastWeek.setDate(lastWeek.getDate() - 7);
  return previousWeek === localWeekKey(lastWeek) ? Math.max(1, count) + 1 : 1;
}
