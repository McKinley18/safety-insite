/**
 * §281 (D-041) — THE OFFLINE DATA-STATE VOCABULARY.
 *
 * ==================== THE RULE THIS EXISTS TO ENFORCE ====================
 *
 *      UNKNOWN OR UNAVAILABLE DATA MUST NEVER BE REPRESENTED AS A VERIFIED ZERO.
 *
 * `0 OVERDUE` because the server said so and `0 OVERDUE` because nobody asked the server are the
 * same six characters and opposite facts. On a safety product the second one is a clean board the
 * product has not checked, and an inspector who trusts it walks away from work that is due.
 *
 * §276 (D-007) found this exact shape once already: the Safety Calendar read **0 EVENTS, 0 OPEN,
 * 0 OVERDUE** against nine rows on the server, because its write path went to the server and its
 * read path composed device-local stores. §280 found the dashboard rendering every count at zero
 * offline. §281 measured the dashboard rendering every count at zero **while fully online, with
 * seven inspections and nine observations on the server** — the local stores its counters read
 * were only ever written by the `/inspection` route, which D-038 has now retired. A counter whose
 * only writer is unreachable code does not report "no work"; it reports nothing, in the shape of
 * a number.
 *
 * ==================== WHAT THIS MODULE IS, AND IS NOT ====================
 *
 * It is the VOCABULARY and the honest-rendering rule, in one place, so the next surface that needs
 * it does not invent a sixth way of saying "we don't know".
 *
 * It is NOT the D-037 offline synchronisation architecture and must not grow into one. There is no
 * queue here, no reconciliation, no conflict resolution — only the states a surface can be in and
 * the discipline that each one is SAID rather than silently rendered as a number.
 *
 * `SYNC_CONFLICT` is deliberately declared and deliberately unused by any current surface. It is
 * part of the vocabulary the product owner asked to establish now, and a state nothing can yet
 * produce is honest as long as nothing claims it can — see `DATA_STATES` below.
 */

export type DataStateKind =
  /** The server answered, just now. The value is what the record says. */
  | "CURRENT"
  /** The server is unreachable. This is the last value it gave, and it is dated. */
  | "LAST_SYNCED"
  /** Local work the server has not accepted yet is included in, or missing from, this value. */
  | "PENDING_SYNC"
  /** The server is unreachable and there is no trustworthy local value. There is no number. */
  | "OFFLINE_UNAVAILABLE"
  /** Local and server disagree in a way the product cannot resolve on its own. */
  | "SYNC_CONFLICT";

export const DATA_STATES: Record<DataStateKind, {
  /** What the customer is told. Never the enum name. */
  label: string;
  /** Whether a NUMBER may be shown at all in this state. */
  showsValue: boolean;
  /** Whether the number, if shown, is the server's current answer. */
  verified: boolean;
  /** Surfaces that can currently produce this state. Empty means: declared, not yet produced. */
  producedBy: string[];
}> = {
  CURRENT: { label: "", showsValue: true, verified: true, producedBy: ["dashboard", "safety calendar"] },
  LAST_SYNCED: { label: "Last synced", showsValue: true, verified: false, producedBy: ["dashboard", "safety calendar"] },
  PENDING_SYNC: { label: "Pending sync", showsValue: true, verified: false, producedBy: ["safety calendar"] },
  OFFLINE_UNAVAILABLE: { label: "Unavailable offline", showsValue: false, verified: false, producedBy: ["dashboard"] },
  SYNC_CONFLICT: { label: "Sync conflict", showsValue: false, verified: false, producedBy: [] },
};

export type DataValue<T> = {
  state: DataStateKind;
  /**
   * The value, or null when the state does not permit one. `OFFLINE_UNAVAILABLE` carries null by
   * construction — it is the state's whole purpose that there is no number to show.
   */
  value: T | null;
  /** ISO timestamp of the last SUCCESSFUL server read, when one is known. */
  syncedAt?: string | null;
  /** How many local items are waiting for the server, when the surface tracks that. */
  pendingCount?: number;
};

/**
 * Build a data value from a read attempt, applying the rule in one place rather than at every
 * call site. This is the function that makes "unknown is not zero" structural: a caller that
 * reaches the server passes `reachable: true`, and one that does not CANNOT produce a verified
 * zero through this function, whatever it passes as `value`.
 */
export function resolveDataValue<T>(input: {
  reachable: boolean;
  /** The server's answer. Only read when `reachable`. */
  value: T | null;
  /** The last value the server gave, from a local cache. Only read when NOT reachable. */
  cached?: T | null;
  cachedAt?: string | null;
  pendingCount?: number;
}): DataValue<T> {
  if (input.reachable) {
    return {
      state: input.pendingCount ? "PENDING_SYNC" : "CURRENT",
      value: input.value,
      syncedAt: new Date().toISOString(),
      pendingCount: input.pendingCount,
    };
  }
  // Not reachable. A cached value is still a truer picture than an empty page — but it is dated,
  // because a stale count presented as current is how a user misses due work. `cached == null`
  // means no read has ever succeeded on this device, and then there is NO NUMBER TO SHOW.
  if (input.cached === null || input.cached === undefined) {
    return { state: "OFFLINE_UNAVAILABLE", value: null, syncedAt: input.cachedAt ?? null, pendingCount: input.pendingCount };
  }
  return { state: "LAST_SYNCED", value: input.cached, syncedAt: input.cachedAt ?? null, pendingCount: input.pendingCount };
}

/** "2:14 PM" for today, "Sep 12, 2:14 PM" otherwise. Null when nothing has ever synced. */
export function formatSyncedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return null;
  const now = new Date();
  const sameDay = when.toDateString() === now.toDateString();
  const time = when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return sameDay ? time : `${when.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

/**
 * The one sentence a surface puts under a value to say what kind of answer it is. Null for
 * `CURRENT`, because a current value needs no caveat and captioning every number with "Current"
 * is how a caveat stops being read.
 */
export function dataStateCaption(value: DataValue<unknown>): string | null {
  switch (value.state) {
    case "CURRENT":
      return null;
    case "LAST_SYNCED": {
      const at = formatSyncedAt(value.syncedAt);
      return at ? `Last synced ${at}` : "Last synced";
    }
    case "PENDING_SYNC":
      return value.pendingCount
        ? `${value.pendingCount} ${value.pendingCount === 1 ? "change" : "changes"} not yet synced`
        : "Pending sync";
    case "OFFLINE_UNAVAILABLE":
      return "Unavailable offline";
    case "SYNC_CONFLICT":
      return "Sync conflict — needs review";
    default:
      return null;
  }
}

/**
 * What a counter RENDERS. Never a zero it cannot stand behind: `OFFLINE_UNAVAILABLE` renders an
 * em dash, which cannot be misread as "none".
 */
export function dataStateDisplayValue(value: DataValue<number>): string {
  if (!DATA_STATES[value.state].showsValue || value.value === null) return "—";
  return String(value.value);
}

/**
 * Cache the last successful server read for a named counter, so an offline visit can show
 * `LAST_SYNCED` rather than `OFFLINE_UNAVAILABLE`.
 *
 * Deliberately tiny: a number and a timestamp per key, nothing else. This is NOT an offline data
 * store and must not become one — the D-037 architecture is a separate, larger piece of work and
 * putting records in here would be the first step of building it by accident.
 *
 * The key is swept on sign-out with the other device-local customer content (see `lib/auth.ts`):
 * a count of another account's overdue work is that account's data.
 */
export const DASHBOARD_COUNTER_CACHE_KEY = "safety_insite_counter_cache";

type CounterCache = Record<string, { value: number; at: string }>;

export function readCounterCache(): CounterCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DASHBOARD_COUNTER_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as CounterCache) : {};
  } catch {
    return {};
  }
}

export function writeCounterCache(entries: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    const at = new Date().toISOString();
    const next: CounterCache = { ...readCounterCache() };
    for (const [key, value] of Object.entries(entries)) next[key] = { value, at };
    window.localStorage.setItem(DASHBOARD_COUNTER_CACHE_KEY, JSON.stringify(next));
  } catch {
    // A full or unavailable localStorage must never break the page. The consequence of failing
    // here is an OFFLINE_UNAVAILABLE on the next offline visit, which is the honest fallback.
  }
}
