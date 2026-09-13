/**
 * §275 — CALENDAR DATE BOUNDARY REGRESSION.
 *
 * A due date is a calendar DAY. This suite pins the two conversions that have to agree for
 * that to survive a round trip through a `timestamp` column, because when §275 measured
 * them end to end on a machine at UTC-4 they disagreed:
 *
 *   sent "2026-09-15"                 stored 2026-09-14 20:00   calendar said 2026-09-15
 *   sent "2026-09-15T20:00:00-04:00"  stored 2026-09-15 20:00   calendar said 2026-09-16
 *
 * The second row is the defect a user sees: an action due on the evening of the 15th
 * appears on the 16th, and in a compliance tracker that is the difference between "due
 * today" and "not yet". The first row passed, and passed for the wrong reason — the
 * ingestion error and the projection error cancelled. That is exactly why a fix to either
 * half alone is a regression, and why both directions are asserted here.
 *
 * These are PURE function tests over the two helpers. They need no database and no server,
 * so they run in the ordinary loop rather than only in an integration pass.
 *
 * Run: npm run test:calendar-date-boundary
 */
import { parseDueDate, toCalendarDayKey } from '../../common/calendar-date';

let failures = 0;
let checks = 0;

function check(name: string, actual: unknown, expected: unknown): void {
  checks += 1;
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `  expected ${String(expected)}, got ${String(actual)}`}`);
}

console.log(`local timezone offset: UTC${-new Date().getTimezoneOffset() / 60 >= 0 ? '+' : ''}${-new Date().getTimezoneOffset() / 60}\n`);

// ---------------------------------------------------------------------------------------
// INGESTION. A bare date must become LOCAL midnight on the day named.
// ---------------------------------------------------------------------------------------
const bare = parseDueDate('2026-09-15');
check('bare date keeps its year', bare?.getFullYear(), 2026);
check('bare date keeps its month', bare ? bare.getMonth() + 1 : null, 9);
check('bare date keeps its DAY (not the previous evening in UTC)', bare?.getDate(), 15);
check('bare date is local midnight', bare?.getHours(), 0);

// A date at the far end of a month is where a UTC shift is most visible.
check('month-end bare date keeps its day', parseDueDate('2026-09-30')?.getDate(), 30);
check('month-start bare date keeps its day', parseDueDate('2026-09-01')?.getDate(), 1);
check('year-end bare date keeps its day', parseDueDate('2026-12-31')?.getDate(), 31);
check('year-end bare date keeps its year', parseDueDate('2026-12-31')?.getFullYear(), 2026);

// An explicit instant is already unambiguous and must not be reinterpreted.
const explicit = parseDueDate('2026-09-15T20:00:00-04:00');
check('explicit offset is preserved as an instant', explicit?.toISOString(), '2026-09-16T00:00:00.000Z');

check('empty string yields undefined', parseDueDate(''), undefined);
check('null yields undefined', parseDueDate(null), undefined);
check('undefined yields undefined', parseDueDate(undefined), undefined);
check('unparseable input yields undefined', parseDueDate('not a date'), undefined);

// ---------------------------------------------------------------------------------------
// PROJECTION. An instant must report the LOCAL calendar day it falls on.
// ---------------------------------------------------------------------------------------
check('local-evening instant reports its own day, not the next one',
  toCalendarDayKey(new Date(2026, 8, 15, 20, 0, 0)), '2026-09-15');
check('local just-before-midnight instant stays on its day',
  toCalendarDayKey(new Date(2026, 8, 15, 23, 59, 59)), '2026-09-15');
check('local just-after-midnight instant is the new day',
  toCalendarDayKey(new Date(2026, 8, 16, 0, 0, 1)), '2026-09-16');
check('local midday is unambiguous',
  toCalendarDayKey(new Date(2026, 8, 15, 12, 0, 0)), '2026-09-15');
check('null instant yields null', toCalendarDayKey(null), null);

// ---------------------------------------------------------------------------------------
// ROUND TRIP. This is the property the product actually depends on.
// ---------------------------------------------------------------------------------------
for (const key of ['2026-01-01', '2026-03-08', '2026-06-30', '2026-09-15', '2026-11-01', '2026-12-31']) {
  check(`round trip ${key}`, toCalendarDayKey(parseDueDate(key) as Date), key);
}

// An explicit local evening must round trip to the day the user named, which is the
// case that was broken.
check('round trip of an explicit local evening',
  toCalendarDayKey(parseDueDate('2026-09-15T20:00:00') as Date), '2026-09-15');

console.log(`\n${'='.repeat(70)}`);
console.log(`checks ${checks}   failures ${failures}`);
if (failures > 0) {
  console.log('calendar date boundary regression: FAILED');
  process.exit(1);
}
console.log('calendar date boundary regression: all invariants passed, 0 failed');
