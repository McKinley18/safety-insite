"use client";

import {
  type ClientCompatibility,
  type CompatibilityResult,
  type ReleaseContract,
  resolveClientCompatibility,
} from "./releaseContract";
import { buildIdentity } from "./buildIdentity";

/**
 * §279 — ASKING THE SERVER WHETHER THIS TAB IS STILL A SUPPORTED CLIENT.
 *
 * ==================== WHEN IT ASKS, AND WHY NOT MORE OFTEN ====================
 *
 * An inspector's phone is frequently on a metered or marginal connection in a plant, and this
 * check earns none of its keep by being frequent -- a release happens a few times a month, not a
 * few times a minute. So it runs at the moments where the answer can actually have changed since
 * it was last known:
 *
 *   - application boot, once;
 *   - when a stored session is restored, because that is a new client lifetime;
 *   - when a backgrounded tab becomes visible again after STALE_AFTER_MS -- this is the case that
 *     matters most, since the measured §279 Part A risk is precisely a tab left open for days;
 *   - and a slow background interval as a floor, only while the document is visible.
 *
 * A hidden tab polls nothing at all. There is no value in discovering a new release for a tab
 * nobody is looking at, and every reason not to spend a field connection on it.
 *
 * ==================== IT FAILS OPEN, ON PURPOSE ====================
 *
 * Every path that cannot produce evidence resolves to UNKNOWN, and UNKNOWN blocks nothing. A
 * timeout, a 502 from a restarting instance, a captive portal, an offline phone -- none of these
 * are allowed to tell a safety professional that their application is obsolete. The rule lives in
 * `releaseContract.ts`; this module only supplies it with inputs and never second-guesses it.
 */

const VERSION_ENDPOINT_BASE =
  // Resolved here rather than imported from `hazlenzClient`, which imports `apiFetch`, which
  // consults this module: importing it would close a module-initialisation cycle.
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

/** A returning tab re-checks only if this long has passed. 15 minutes. */
export const STALE_AFTER_MS = 15 * 60 * 1000;
/** The background floor while the tab is visible. 30 minutes. */
export const BACKGROUND_INTERVAL_MS = 30 * 60 * 1000;
/** Short on purpose: this request must never be what makes the application feel slow. */
const REQUEST_TIMEOUT_MS = 8000;

export interface ReleaseStatus {
  readonly result: CompatibilityResult;
  readonly contract: ReleaseContract | null;
  readonly checkedAt: number | null;
}

const UNCHECKED: ReleaseStatus = {
  result: {
    state: "UNKNOWN",
    blocksSafetyCriticalWrites: false,
    refreshResolves: false,
    reason: "No version check has completed yet.",
  },
  contract: null,
  checkedAt: null,
};

let status: ReleaseStatus = UNCHECKED;
let inFlight: Promise<ReleaseStatus> | null = null;
const listeners = new Set<(next: ReleaseStatus) => void>();

export function getReleaseStatus(): ReleaseStatus {
  return status;
}

export function subscribeToReleaseStatus(listener: (next: ReleaseStatus) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function publish(next: ReleaseStatus): ReleaseStatus {
  status = next;
  // Every completed check notifies, including one that found no change. The subscriber renders
  // from the STATE, so an unchanged state produces identical output and no second banner -- the
  // de-duplication lives in the render, not in a comparison here that could drift from it.
  for (const listener of listeners) listener(next);
  return next;
}

async function fetchContract(signal: AbortSignal): Promise<ReleaseContract | null> {
  const response = await fetch(`${VERSION_ENDPOINT_BASE}/version`, {
    method: "GET",
    // The one request in the product that must never be answered from a cache. An intermediary
    // holding this for an hour would reintroduce exactly the staleness it exists to detect.
    cache: "no-store",
    credentials: "omit",
    signal,
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as ReleaseContract;
  return payload && typeof payload === "object" ? payload : null;
}

/**
 * Runs a check, or joins the one already running. The join is what stops four simultaneous
 * triggers -- boot, session restore, visibility and interval can coincide -- from producing four
 * requests and four notices.
 */
export async function checkReleaseVersion(): Promise<ReleaseStatus> {
  if (inFlight) return inFlight;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  inFlight = (async () => {
    try {
      const contract = await fetchContract(controller.signal);
      return publish({
        result: resolveClientCompatibility(buildIdentity.frontendVersion, contract),
        contract,
        checkedAt: Date.now(),
      });
    } catch {
      // Unreachable, aborted, or unparseable. The client learns nothing, and learning nothing is
      // explicitly NOT evidence that it is obsolete.
      return publish({
        result: {
          state: "UNKNOWN",
          blocksSafetyCriticalWrites: false,
          refreshResolves: false,
          reason: "The server could not be reached for a version check.",
        },
        contract: null,
        checkedAt: Date.now(),
      });
    } finally {
      clearTimeout(timer);
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * THE WRITE GATE.
 *
 * `apiFetch` consults this before every request. It returns true only for a request that would
 * change server state from a client the server has positively declared unusable.
 *
 * Reads are never blocked: an inspector on a stale client must still be able to open the record
 * they are standing in front of, and refusing to show them a hazard would be a worse outcome than
 * showing it from an old bundle.
 *
 * Authentication lifecycle calls are never blocked either. They are how a client recovers, and a
 * gate that stopped someone signing out would be a gate that trapped them.
 */
export function blocksMutation(method: string | undefined, url: string): boolean {
  if (!status.result.blocksSafetyCriticalWrites) return false;
  const verb = (method || "GET").toUpperCase();
  if (verb === "GET" || verb === "HEAD" || verb === "OPTIONS") return false;
  if (/\/auth\/(refresh|login|register|logout)(\?|$)/.test(url)) return false;
  if (/\/version(\?|$)/.test(url)) return false;
  return true;
}

/**
 * The error a blocked mutation throws. Named so callers can recognise it by `name` rather than by
 * matching on message text, and carrying the state so a caller can tell "refresh fixes this" from
 * "refresh cannot fix this" without re-deriving it.
 *
 * The message is written for the inspector who will see it in a toast, not for a log.
 */
export class StaleClientError extends Error {
  readonly compatibility: ClientCompatibility;

  constructor(compatibility: ClientCompatibility) {
    super(
      compatibility === "INCOMPATIBLE"
        ? "This version of Safety InSite cannot save to the current server. Contact support before continuing."
        : "Safety InSite has been updated and this page is running an older version, so it was not saved. Refresh to continue.",
    );
    this.name = "StaleClientError";
    this.compatibility = compatibility;
  }
}

/**
 * Starts the watch. Returns a teardown. Idempotent per caller; mounting it twice would produce
 * two schedules, which is why exactly one component in the tree owns it.
 */
export function startReleaseVersionWatch(): () => void {
  if (typeof window === "undefined") return () => {};

  let stopped = false;

  const maybeCheck = (force = false) => {
    if (stopped) return;
    if (document.visibilityState !== "visible") return;
    const age = status.checkedAt === null ? Infinity : Date.now() - status.checkedAt;
    if (!force && age < STALE_AFTER_MS) return;
    void checkReleaseVersion();
  };

  const onVisibility = () => maybeCheck(false);
  document.addEventListener("visibilitychange", onVisibility);

  const interval = window.setInterval(() => maybeCheck(false), BACKGROUND_INTERVAL_MS);

  maybeCheck(true);

  return () => {
    stopped = true;
    document.removeEventListener("visibilitychange", onVisibility);
    window.clearInterval(interval);
  };
}

/** Exposed for tests: returns the module to its pre-check state. */
export function resetReleaseStatusForTests(): void {
  status = UNCHECKED;
  inFlight = null;
}
