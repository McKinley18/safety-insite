"use client";

/**
 * §284 (S-15) — WHAT THE SERVER HAS ALREADY SAID ABOUT THIS SESSION'S EXPERT ENTITLEMENT.
 *
 * ==================== WHY THIS EXISTS, AND WHAT IT IS NOT ====================
 *
 * It is NOT an entitlement check. It cannot grant anything, it is never consulted to decide
 * whether Expert may run, and nothing in it is trusted in the direction of AVAILABILITY. The
 * server's `EntitlementGuard` remains the only authority, evaluated per request, and every Expert
 * route still carries it.
 *
 * What it holds is one narrow fact: **the server has already refused this client, just now.**
 * §283 measured a Free account issuing `GET .../expert-analyses/current` on every HazLenz-step
 * visit and being correctly refused every time — 64 of 64 — because the panel asks on mount and
 * had nowhere to remember the answer. The product-owner decision at §284 permits the interface to
 * use a server-authoritative refusal to stop asking a question it has just been answered.
 *
 * ==================== IT IS KEYED ON A REFUSAL, NOT ON A PLAN ====================
 *
 * The one thing that may set it is an `EXPERT_NOT_ENTITLED` raised from a real server response.
 * A JWT plan claim may NOT, and neither may `getVerifiedPlanCode()`: `EntitlementService` treats a
 * live `UserSubscription` row and an active `EntitlementGrant` as authoritative over the token's
 * cached claim, so a client that suppressed the call from its own idea of the plan would refuse to
 * ask on behalf of an account the server would have said yes to. The §283 control account was
 * exactly that shape — billing tier `free`, an active Pro grant, and `200` from the route.
 *
 * ==================== AND IT EXPIRES, BECAUSE AN UPGRADE IS INVISIBLE FROM HERE ====================
 *
 * A refusal is true when it is given and can stop being true at any moment, with no event the
 * browser can see: a checkout completes, an operator issues a grant, a subscription is reinstated.
 * So this memo is bounded three ways, and the product self-heals through all three:
 *
 *   1. it is dropped by `clearExpertEntitlementMemo()`, which `clearAuthSession()` calls alongside
 *      the plan-code and billing caches — sign-out, and the next account on the same device;
 *   2. it is dropped the moment any Expert read SUCCEEDS, which is what an upgraded session's
 *      first unsuppressed attempt produces;
 *   3. it expires on its own after `EXPERT_NOT_ENTITLED_MEMO_MS`, so an out-of-band upgrade that
 *      raises no client event is corrected by the next mount after the window rather than being
 *      pinned for the lifetime of the tab.
 *
 * The window is deliberately a few minutes and not a session: long enough to stop an inspector
 * walking a dozen observations from re-asking a settled question on every one, short enough that
 * "I just upgraded and it still says I can't" cannot survive a coffee break. It is the same
 * reasoning as `PLAN_CODE_FRESHNESS_MS` in `planEntitlements.ts`, at a different scale, and for the
 * same reason: a cache that outlives an upgrade is a cache that lies about money.
 *
 * ==================== UNKNOWN IS NOT DENIED ====================
 *
 * Nothing here is written for a timeout, an unreachable server, a 500, or a refusal whose body did
 * not name itself. Those resolve to an ERROR in the panel — a failure to learn the state — and
 * never to "not in your plan". A client that cannot reach the server has learned nothing about
 * what it is entitled to, and must not tell a safety professional otherwise.
 */

/** A few minutes. See the header for why this is not a session and not five seconds. */
export const EXPERT_NOT_ENTITLED_MEMO_MS = 5 * 60 * 1000;

let notEntitledSince: number | null = null;

/**
 * Record that the SERVER refused this client for lack of entitlement. The only permitted caller is
 * the handler of a real `EXPERT_NOT_ENTITLED` response.
 */
export function recordExpertNotEntitled(): void {
  notEntitledSince = Date.now();
}

/**
 * Record that an Expert call SUCCEEDED. Clears the memo unconditionally: a success is the
 * strongest possible evidence that the refusal no longer holds, and it is the shape an upgrade
 * takes when it finally reaches this surface.
 */
export function recordExpertEntitled(): void {
  notEntitledSince = null;
}

/** Dropped with the session. Called from `clearAuthSession()`. */
export function clearExpertEntitlementMemo(): void {
  notEntitledSince = null;
}

/**
 * True only while a server-authoritative refusal is still inside its window. False for every other
 * state the client can be in, including "no idea" — which is the state it starts in and returns to.
 */
export function expertKnownNotEntitled(now: number = Date.now()): boolean {
  if (notEntitledSince === null) return false;
  if (now - notEntitledSince >= EXPERT_NOT_ENTITLED_MEMO_MS) {
    notEntitledSince = null;
    return false;
  }
  return true;
}

/** Exposed for tests: returns the module to its pre-refusal state. */
export function resetExpertEntitlementMemoForTests(): void {
  notEntitledSince = null;
}

/** Exposed for tests: place the refusal at a chosen instant so expiry can be exercised. */
export function setExpertNotEntitledAtForTests(at: number | null): void {
  notEntitledSince = at;
}
