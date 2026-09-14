/**
 * §281 (D-041) — THE DASHBOARD'S COUNTERS, READ FROM THE RECORD.
 *
 * ==================== WHAT WAS ACTUALLY WRONG ====================
 *
 * §280 recorded the dashboard rendering every count at zero OFFLINE, and raised D-041 as an
 * offline-honesty defect. §281 measured it and the defect is larger than that.
 *
 * The four counters were computed from `lib/reportStorage`, `lib/actionStorage` and
 * `lib/activityStorage` — three device-local stores. The ONLY code that ever wrote them was the
 * `/inspection` route's `reportGenerationService`, `findingSaveService` and
 * `reviewReportPersistenceService`, all of which belonged to the closed cycle D-038 has now
 * retired. The active workflow (`/inspection-workspace` -> `canonicalWorkflowApi`) has always
 * written to the SERVER and never to those stores.
 *
 * So the dashboard was not merely wrong offline. Measured at §281 against a real signed-in
 * account with SEVEN INSPECTIONS AND NINE OBSERVATIONS on the server, fully online, it read:
 *
 *      0 REPORTS    0 FINDINGS    0 OPEN ACTIONS    0 OVERDUE
 *
 * This is §276 (D-007) exactly: the write path went to the server and the read path composed
 * device-local stores, and no amount of correct local code could have produced a right answer.
 *
 * ==================== WHAT THIS DOES ====================
 *
 * Reads each counter from the endpoint that can actually answer it, and returns every one as a
 * `DataValue` so the surface cannot render a number without saying what kind of number it is.
 * A successful read is cached, so an offline visit shows `LAST_SYNCED` with a timestamp instead
 * of a fabricated zero, and a device that has never synced shows `OFFLINE_UNAVAILABLE`.
 *
 * ==================== THE FINDINGS TILE, AND WHY IT IS NOT HERE ====================
 *
 * There is NO unprivileged server aggregate for "findings across my inspections". `GET
 * /inspections` returns bare inspection rows with no findings relation; the per-inspection detail
 * route has them but one call per inspection is not a dashboard load; and `/dashboard/*` is gated
 * behind the paid `analytics` entitlement, so a Free account cannot read it.
 *
 * The tile therefore counts INSPECTIONS, which the server answers exactly for every plan. That is
 * a PRODUCT CHANGE and it is recorded as one (D-044): the alternative was keeping a tile that is
 * structurally always zero, which is the precise thing D-041 forbids. Whether a findings count
 * should return, and what server support it should get, is the product owner's call.
 */

import { listPersistedInspections, listPersistedReports } from "@/lib/canonicalWorkflowApi";
import { getSafetyCalendarSnapshot } from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";
import {
  readCounterCache,
  resolveDataValue,
  writeCounterCache,
  type DataValue,
} from "@/lib/data/dataState";

export type DashboardCounters = {
  inspections: DataValue<number>;
  reports: DataValue<number>;
  openActions: DataValue<number>;
  overdue: DataValue<number>;
  /** The reconciled calendar, for the week strip and the priority list. */
  calendarEvents: SafetyCalendarEvent[];
  /** False when the calendar read did not reach the server, so the strip can say so. */
  calendarReachable: boolean;
  calendarServedFromCache: boolean;
  calendarPendingCount: number;
};

/** Due work that is not finished. "Completed" is the only status that takes work off the board. */
function isOpen(event: SafetyCalendarEvent) {
  return String(event.status || "").toLowerCase() !== "completed";
}

/**
 * Overdue means DUE BEFORE TODAY and still open. Compared on the local date key rather than a
 * timestamp, because §275 found an action due the evening of the 15th being shown on the 16th:
 * a due DATE is a calendar day in the user's own timezone, not an instant.
 */
function isOverdue(event: SafetyCalendarEvent, todayKey: string) {
  return isOpen(event) && Boolean(event.date) && event.date < todayKey;
}

export async function loadDashboardCounters(todayKey: string): Promise<DashboardCounters> {
  const cache = readCounterCache();

  // Each source is read independently and its reachability is its own. One endpoint being down
  // must not turn the other three into "unavailable" — that would be the same class of untruth in
  // the opposite direction.
  const [inspectionsRead, reportsRead, calendar] = await Promise.all([
    listPersistedInspections().then(
      (rows) => ({ reachable: true, value: Array.isArray(rows) ? rows.length : 0 }),
      () => ({ reachable: false, value: null as number | null }),
    ),
    listPersistedReports().then(
      (rows) => ({ reachable: true, value: Array.isArray(rows) ? rows.length : 0 }),
      () => ({ reachable: false, value: null as number | null }),
    ),
    getSafetyCalendarSnapshot().catch(() => ({
      events: [] as SafetyCalendarEvent[],
      serverReachable: false,
      servedFromCache: false,
      pendingCount: 0,
      blockedCount: 0,
    })),
  ]);

  const openActionCount = calendar.events.filter(isOpen).length;
  const overdueCount = calendar.events.filter((event) => isOverdue(event, todayKey)).length;

  const counters: DashboardCounters = {
    inspections: resolveDataValue({
      reachable: inspectionsRead.reachable,
      value: inspectionsRead.value,
      cached: cache.inspections?.value ?? null,
      cachedAt: cache.inspections?.at ?? null,
    }),
    reports: resolveDataValue({
      reachable: reportsRead.reachable,
      value: reportsRead.value,
      cached: cache.reports?.value ?? null,
      cachedAt: cache.reports?.at ?? null,
    }),
    openActions: resolveDataValue({
      reachable: calendar.serverReachable,
      value: openActionCount,
      cached: cache.openActions?.value ?? null,
      cachedAt: cache.openActions?.at ?? null,
      pendingCount: calendar.pendingCount,
    }),
    overdue: resolveDataValue({
      reachable: calendar.serverReachable,
      value: overdueCount,
      cached: cache.overdue?.value ?? null,
      cachedAt: cache.overdue?.at ?? null,
      pendingCount: calendar.pendingCount,
    }),
    calendarEvents: calendar.events,
    calendarReachable: calendar.serverReachable,
    calendarServedFromCache: calendar.servedFromCache,
    calendarPendingCount: calendar.pendingCount,
  };

  // Only a value the SERVER supplied is ever written back. Caching a cached value would let a
  // stale number refresh its own timestamp on every offline visit and slowly present itself as
  // current, which is the failure this whole module exists to prevent.
  const fresh: Record<string, number> = {};
  if (inspectionsRead.reachable && inspectionsRead.value !== null) fresh.inspections = inspectionsRead.value;
  if (reportsRead.reachable && reportsRead.value !== null) fresh.reports = reportsRead.value;
  if (calendar.serverReachable) {
    fresh.openActions = openActionCount;
    fresh.overdue = overdueCount;
  }
  if (Object.keys(fresh).length) writeCounterCache(fresh);

  return counters;
}
