/**
 * §284 — WHAT AN ENTITLEMENT DENIAL IS, AND WHEN IT IS A SECURITY EVENT.
 *
 * ==================== THE MEASUREMENT THAT PROMPTED THIS ====================
 *
 * §283 measured a Free account opening the HazLenz step and being correctly refused Expert access
 * on every visit — 64 of 64 — and every one of those refusals wrote a `security_audit_events` row
 * with `action: 'entitlement_denied'`. §284's bounded synthetic case measured the ratio directly:
 * **28 refused requests produced 28 rows.**
 *
 * Nothing was wrong with any single write. The problem is that the table then says the same thing
 * about two very different facts: "a Free account's browser rendered a paid panel and was told no",
 * and "somebody tried to EXECUTE a paid analysis they are not entitled to". A security log in which
 * the second is buried under thousands of the first is a log nobody reads, and an alert threshold
 * set on it is an alert threshold set on product rendering.
 *
 * ==================== THE SEPARATION, AND IT IS THE ONLY ONE ====================
 *
 * The request's METHOD decides, because the method is what distinguishes looking from doing:
 *
 *   MUTATING (POST/PUT/PATCH/DELETE) -> `entitlement_denied`, one row per attempt, exactly as
 *   before. An attempt to CHANGE something without the entitlement to do it is a security-relevant
 *   act whether or not it succeeded, and it is never coalesced, never sampled and never dropped.
 *
 *   SAFE (GET/HEAD/OPTIONS) -> `entitlement_read_refused`, OPERATIONAL telemetry, COALESCED: the
 *   first refusal in a window writes a row, and every refusal after it in the same window updates
 *   that row's counter rather than adding another. A read that was refused changed nothing, by
 *   definition.
 *
 * ==================== WHAT COALESCING IS NOT ====================
 *
 * **It is not sampling and it discards nothing.** Every refusal is counted; what is bounded is how
 * many ROWS the counting occupies. A burst of ten thousand refused reads produces one row that says
 * ten thousand, which is strictly more legible than ten thousand rows that each say one — and it
 * keeps requirement 5, that repeated access patterns stay observable, rather than trading it away.
 *
 * **It is not enforcement.** Nothing here is consulted before the refusal. `EntitlementGuard`
 * refuses on exactly the same evidence it always did, with the same status and the same body; this
 * module is only asked what to write down afterwards.
 *
 * ==================== WHAT THIS SECTION DID NOT BUILD, AND MUST NOT BE READ AS ====================
 *
 * Two denial classes named in §284's requirements are NOT written by this path and were NOT added
 * here, because they are not entitlement denials and §284 is not the place to build them:
 *
 *   - CROSS-TENANT access resolves through `InspectionService.authorizeObservation`, which answers
 *     `NotFoundException` and writes NOTHING today.
 *   - ROLE/PRIVILEGE violations resolve through `RolesGuard`, which returns `false` and writes
 *     NOTHING today.
 *
 * Neither is changed by this file, and neither was auditable before it. Recorded so that "security
 * denials remain auditable" is not read as a claim that those two are.
 */

export type EntitlementDenialClass = 'SECURITY' | 'OPERATIONAL';

export const ENTITLEMENT_DENIED_ACTION = 'entitlement_denied';
export const ENTITLEMENT_READ_REFUSED_ACTION = 'entitlement_read_refused';

/** One row per (actor, organization, entitlement, resource) per this long. Fifteen minutes. */
export const READ_REFUSAL_WINDOW_MS = 15 * 60 * 1000;

/**
 * A hard ceiling on how many open windows are tracked, so a hostile or merely large caller
 * population cannot grow this map without bound. On overflow the OLDEST window is dropped, which
 * costs at most one extra row for that key and never loses an event.
 */
export const MAX_TRACKED_READ_WINDOWS = 5000;

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Which class of denial this was, from the request method alone. Pure, so the policy can be
 * exercised without a database, a guard or a request.
 */
export function classifyEntitlementDenial(method: string | undefined): {
  denialClass: EntitlementDenialClass;
  action: string;
  coalesced: boolean;
} {
  const verb = String(method || 'GET').toUpperCase();
  if (SAFE_METHODS.has(verb)) {
    return {
      denialClass: 'OPERATIONAL',
      action: ENTITLEMENT_READ_REFUSED_ACTION,
      coalesced: true,
    };
  }
  return { denialClass: 'SECURITY', action: ENTITLEMENT_DENIED_ACTION, coalesced: false };
}

/**
 * The coalescing key. Deliberately NOT the full path: a per-path key would defeat the whole point
 * for a client that walks twenty observations, since each carries its own id. What is being
 * counted is "this actor kept being refused this entitlement on this kind of resource", and the
 * ids live in the row's metadata where an investigator can still reach them.
 */
export function readRefusalKey(input: {
  actorUserId: string | null;
  organizationId: string | null;
  entitlement: string;
  resourceType: string;
}): string {
  return [
    input.actorUserId ?? 'anonymous',
    input.organizationId ?? 'none',
    input.entitlement,
    input.resourceType,
  ].join('|');
}

type OpenWindow = { eventId: string | null; firstAt: number; repeats: number };

const openWindows = new Map<string, OpenWindow>();

export type ReadRefusalDecision =
  /** Nothing has been written for this key inside the window. Write a row, then anchor it. */
  | { write: 'INSERT'; firstAt: number }
  /** A row exists for this window. Bump its counter instead of writing another. */
  | { write: 'UPDATE'; eventId: string; repeats: number; firstAt: number }
  /**
   * The window is open but its row was never anchored — the INSERT failed, or the row was removed.
   * Write a fresh one. This is the self-healing branch, and it is the reason an audit failure
   * cannot silence the key for the rest of the window.
   */
  | { write: 'INSERT'; firstAt: number; reanchor: true };

/**
 * Decide what to write for one refused READ, and advance this key's window.
 *
 * Called once per refused safe-method request. It both decides and records, because a decision
 * that did not advance the window would let a burst re-enter the INSERT branch on every request.
 */
export function noteReadRefusal(key: string, now: number = Date.now()): ReadRefusalDecision {
  evictExpired(now);

  const open = openWindows.get(key);
  if (open && now - open.firstAt < READ_REFUSAL_WINDOW_MS) {
    open.repeats += 1;
    if (open.eventId) {
      return { write: 'UPDATE', eventId: open.eventId, repeats: open.repeats, firstAt: open.firstAt };
    }
    return { write: 'INSERT', firstAt: open.firstAt, reanchor: true };
  }

  openWindows.set(key, { eventId: null, firstAt: now, repeats: 0 });
  enforceCeiling();
  return { write: 'INSERT', firstAt: now };
}

/** Attach the row this key's window is now counting into. Called after a successful INSERT. */
export function anchorReadRefusalEvent(key: string, eventId: string): void {
  const open = openWindows.get(key);
  if (open) open.eventId = eventId;
}

function evictExpired(now: number): void {
  for (const [key, open] of openWindows) {
    if (now - open.firstAt >= READ_REFUSAL_WINDOW_MS) openWindows.delete(key);
  }
}

function enforceCeiling(): void {
  while (openWindows.size > MAX_TRACKED_READ_WINDOWS) {
    // Map iteration is insertion-ordered, so the first entry is the oldest window.
    const oldest = openWindows.keys().next();
    if (oldest.done) return;
    openWindows.delete(oldest.value);
  }
}

/** Exposed for tests. Production has no reason to clear the windows. */
export function resetReadRefusalWindowsForTests(): void {
  openWindows.clear();
}

/** Exposed for tests: how many windows are currently held. */
export function trackedReadRefusalWindowCount(): number {
  return openWindows.size;
}
