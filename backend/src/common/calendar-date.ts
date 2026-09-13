/**
 * §275 — DUE DATES ARE CALENDAR DAYS, NOT INSTANTS.
 *
 * ==================== THE DEFECT THIS EXISTS TO FIX ====================
 *
 * A corrective action's `dueDate` is a `timestamp` column, but what a user means by
 * "due September 15" is a CALENDAR DAY. Converting between the two through UTC moved
 * the day, and §275 measured it end to end on a machine at UTC-4:
 *
 *   sent "2026-09-15"                 stored 2026-09-14 20:00   calendar said 2026-09-15
 *   sent "2026-09-15T20:00:00-04:00"  stored 2026-09-15 20:00   calendar said 2026-09-16
 *
 * Two separate errors, in opposite directions:
 *
 *   INGESTION   `new Date("2026-09-15")` parses a bare date as UTC MIDNIGHT, which is
 *               the previous evening anywhere west of Greenwich. The stored instant is
 *               already the wrong day before anything reads it.
 *
 *   PROJECTION  `new Date(d).toISOString().slice(0, 10)` reads the day back out in UTC,
 *               so any action due in the local evening reports as the NEXT day.
 *
 * On the first row the two errors cancel and the answer is accidentally right, which is
 * why this survived: the obvious test case passes. Fixing either half alone would break
 * that row, so both are fixed together and both are exercised.
 *
 * The `tasks` table never had this problem — its `dueDate` is a `date` column and is
 * passed through verbatim. That is the better model, and moving corrective actions onto a
 * `date` column is the real repair; it is a data migration over live rows, so §275 makes
 * the two conversions correct and leaves the column change as a separate decision.
 */

/**
 * Parse a due date the way a person means it.
 *
 * A bare `YYYY-MM-DD` becomes LOCAL midnight, not UTC midnight, so the stored instant
 * falls on the day the user actually named. Anything carrying an explicit time or offset
 * is already unambiguous and is passed to `Date` untouched.
 */
export function parseDueDate(value: string | Date | null | undefined): Date | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Render an instant as the calendar day it falls on LOCALLY, as `YYYY-MM-DD`.
 *
 * Deliberately not `toISOString().slice(0, 10)`: that is the UTC day, and the UTC day is
 * not the day the user is looking at. Built from the local component getters so it agrees
 * with `parseDueDate` in both directions.
 */
export function toCalendarDayKey(value: Date | string | null | undefined): string | null {
  const parsed = value instanceof Date ? value : parseDueDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
