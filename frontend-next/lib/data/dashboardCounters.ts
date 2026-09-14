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
 * ==================== THE FINDINGS TILE, AND WHERE ITS NUMBER NOW COMES FROM ====================
 *
 * §281 removed a Findings tile because there was NO unprivileged server aggregate to feed it:
 * `GET /inspections` returned bare rows, the per-inspection detail route is one call each, and
 * `/dashboard/*` sits behind the paid `analytics` entitlement — so the account most likely to be
 * looking at the dashboard was the one that could not read the number. A tile pointed at
 * Inspections was the honest stand-in; a Findings tile would have been structurally always zero,
 * which is the precise thing D-041 forbids.
 *
 * §285 (D-044) added the aggregate rather than the tile: `GET /inspections` now carries
 * `findingCount` per row, computed inside the SAME query that decides which inspections the caller
 * may see, so it cannot count a finding on an inspection they may not read and there is no second
 * tenancy rule to drift. It is not entitlement-gated, because a count of your own findings is not
 * an analytics feature. Findings across the board is the sum of that field.
 *
 * `dismissed` and `superseded` findings are excluded server-side. A dismissed finding is one a
 * reviewer decided was not a finding, and a superseded one has been replaced by a later revision
 * of itself; counting either would put hazards on an inspector's board that nobody believes are
 * there.
 *
 * THE SUM IS STILL A `DataValue`. If `/inspections` cannot be reached the count is not zero, it is
 * unknown, and it renders as such — the same rule as every other figure here.
 */

import { listPersistedInspections } from "@/lib/canonicalWorkflowApi";
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
  findings: DataValue<number>;
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
  const [inspectionsRead, calendar] = await Promise.all([
    // ONE read answers two tiles. `findingCount` rides on the rows this call already returns, so
    // adding Findings to the board costs no extra request and cannot disagree with Inspections
    // about which inspections the caller can see.
    listPersistedInspections().then(
      (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        /**
         * A ROW WITHOUT `findingCount` MAKES THE SUM UNKNOWN, NOT SMALLER.
         *
         * `|| 0` on a missing field is the exact shape of the defect D-041 was raised for: a
         * server that stopped sending the field, or an older instance behind a rolling deploy,
         * would produce a confident, wrong, LOWER number -- and a safety board reading "3 findings"
         * when there are eleven is worse than one reading "—". So a single row missing the field
         * collapses the whole figure to unknown, and the tile says it does not know.
         *
         * An inspection with genuinely no findings sends `0`, which is a number and is summed.
         */
        const complete = list.every((row) => typeof row?.findingCount === "number");
        return {
          reachable: true,
          value: list.length,
          findings: complete
            ? list.reduce((total, row) => total + (row.findingCount as number), 0)
            : null,
        };
      },
      () => ({ reachable: false, value: null as number | null, findings: null as number | null }),
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
    findings: resolveDataValue({
      // Reachability here is "the count arrived", not "the request succeeded". A response that
      // came back without the field taught the client nothing about how many findings exist.
      reachable: inspectionsRead.reachable && inspectionsRead.findings !== null,
      value: inspectionsRead.findings,
      cached: cache.findings?.value ?? null,
      cachedAt: cache.findings?.at ?? null,
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
  if (inspectionsRead.reachable && inspectionsRead.findings !== null) fresh.findings = inspectionsRead.findings;
  if (calendar.serverReachable) {
    fresh.openActions = openActionCount;
    fresh.overdue = overdueCount;
  }
  if (Object.keys(fresh).length) writeCounterCache(fresh);

  return counters;
}
