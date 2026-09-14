/**
 * §284 (S-15) — THE ENTITLEMENT STATES THE EXPERT SURFACE MUST GET RIGHT.
 *
 * Runs with `npx tsx lib/expert/__tests__/expertEntitlementPresentation.test.ts` (no test runner is
 * configured in this workspace, so this is a self-checking script — the same convention as
 * `expertPresentation.test.ts` and `expertApiFailureMapping.test.ts`).
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS BEING PROVEN, AND WHAT A BROWSER HAS TO PROVE INSTEAD.
 *
 * Here: the DECISION — given what the server returned, does the client conclude "denied", "fine",
 * or "I do not know", and may it stop asking? Every case the §284 direction names is executed:
 * Free, entitled, recently upgraded, recently downgraded, stale JWT, server unavailable, malformed
 * entitlement response.
 *
 * In the browser (`review-279-page-batch`, batch 2H): the PRESENTATION — that a non-entitled
 * account is shown no enabled Expert control and no error styling. A unit test cannot see a button.
 *
 * ---------------------------------------------------------------------------------------------
 * THE ONE RULE THAT OUTRANKS THE OTHERS.
 *
 * **UNKNOWN IS NOT DENIED.** A timeout, an unreachable server, a 500, or a 402 whose body did not
 * name itself teaches the client nothing about entitlement. None of them may set the refusal memo,
 * and none of them may render "Available with Pro" — because telling a safety professional that a
 * capability is not in their plan, when what actually happened is that the network dropped, is a
 * false statement about their product made from no evidence.
 */
import { classifyExpertFailure, EXPERT_ANALYSIS_ERROR } from "../expertApi";
import {
  EXPERT_NOT_ENTITLED_MEMO_MS,
  clearExpertEntitlementMemo,
  expertKnownNotEntitled,
  recordExpertEntitled,
  recordExpertNotEntitled,
  resetExpertEntitlementMemoForTests,
  setExpertNotEntitledAtForTests,
} from "../expertEntitlement";

const failures: string[] = [];
function check(condition: unknown, message: string) {
  if (condition) {
    console.log(`ok  ${message}`);
  } else {
    failures.push(message);
    console.log(`FAIL ${message}`);
  }
}

/** The exact body `EntitlementGuard` returns, captured from the running API at §283. */
const REFUSAL = {
  message: "A paid subscription is required for this feature.",
  code: "PAID_SUBSCRIPTION_REQUIRED",
  entitlement: "fullSafeScope",
};

/**
 * The panel's decision, as a pure function of the outcome of one Expert call. `outcome` is either
 * a success or the `ExpertApiError` the API module raised. Mirrors `refresh()` exactly:
 * NOT_ENTITLED sets the memo and shows the plan surface; anything else is an ERROR and shows a
 * failure to LEARN the state; a success clears the memo.
 */
type Surface = "PLAN_NOTICE" | "ANALYSIS" | "ERROR";
function decide(outcome: { ok: true } | { status: number; body: unknown }): Surface {
  if (expertKnownNotEntitled()) return "PLAN_NOTICE";
  if ("ok" in outcome) {
    recordExpertEntitled();
    return "ANALYSIS";
  }
  const error = classifyExpertFailure(
    outcome.status,
    outcome.body as { message?: string; code?: string } | null,
  );
  if (error.code === EXPERT_ANALYSIS_ERROR.NOT_ENTITLED) {
    recordExpertNotEntitled();
    return "PLAN_NOTICE";
  }
  return "ERROR";
}

// =================================================================================================
// FREE. The server refuses; the plan surface is shown; the refusal is remembered.
// =================================================================================================
{
  resetExpertEntitlementMemoForTests();
  check(!expertKnownNotEntitled(), "FREE the client starts with no opinion at all");
  check(decide({ status: 402, body: REFUSAL }) === "PLAN_NOTICE",
    "FREE a 402 PAID_SUBSCRIPTION_REQUIRED shows the plan surface");
  check(expertKnownNotEntitled(), "FREE the server-authoritative refusal is remembered");
  // The second observation in the same inspection must not re-ask.
  check(decide({ status: 402, body: REFUSAL }) === "PLAN_NOTICE",
    "FREE the next observation shows the same surface without another request");
}

// =================================================================================================
// ENTITLED. Nothing is remembered, and nothing suppresses anything.
// =================================================================================================
{
  resetExpertEntitlementMemoForTests();
  check(decide({ ok: true }) === "ANALYSIS", "ENTITLED a 200 renders the analysis surface");
  check(!expertKnownNotEntitled(), "ENTITLED no refusal is held");
}

// =================================================================================================
// RECENTLY UPGRADED — the live subscription authority now says yes.
//
// The dangerous case. The memo was set while the account was Free; the account then upgrades. The
// client must NOT keep asserting a refusal it was given before the money changed hands.
// =================================================================================================
{
  resetExpertEntitlementMemoForTests();
  decide({ status: 402, body: REFUSAL });
  check(expertKnownNotEntitled(), "UPGRADE the refusal is held before the upgrade");

  // (a) The memo expires on its own, so an out-of-band upgrade that raises no client event heals.
  setExpertNotEntitledAtForTests(Date.now() - EXPERT_NOT_ENTITLED_MEMO_MS - 1);
  check(!expertKnownNotEntitled(),
    "UPGRADE an expired refusal is dropped, so the next mount asks the server again");
  check(decide({ ok: true }) === "ANALYSIS",
    "UPGRADE and the server's yes is then rendered, not the stale no");

  // (b) A success clears it immediately, whatever the window said.
  resetExpertEntitlementMemoForTests();
  recordExpertNotEntitled();
  recordExpertEntitled();
  check(!expertKnownNotEntitled(), "UPGRADE a successful Expert call clears a held refusal at once");

  // (c) Sign-out drops it, so the next account on this device starts with no opinion.
  recordExpertNotEntitled();
  clearExpertEntitlementMemo();
  check(!expertKnownNotEntitled(), "UPGRADE/SIGN-OUT clearing the session drops the refusal");
}

// =================================================================================================
// RECENTLY DOWNGRADED — the live subscription authority now says no.
//
// The account was entitled, so nothing was ever remembered; the first refusal after the downgrade
// is taken at face value. The client must not go on showing an Expert control it can no longer use.
// =================================================================================================
{
  resetExpertEntitlementMemoForTests();
  check(decide({ ok: true }) === "ANALYSIS", "DOWNGRADE entitled first: the analysis surface");
  check(decide({ status: 402, body: REFUSAL }) === "PLAN_NOTICE",
    "DOWNGRADE the first refusal after the downgrade switches to the plan surface");
  check(expertKnownNotEntitled(), "DOWNGRADE and is then remembered like any other refusal");
}

// =================================================================================================
// STALE JWT — the token still claims the old plan; the server disagrees, in BOTH directions.
//
// `EntitlementService` treats a live `UserSubscription` row and an active `EntitlementGrant` as
// authoritative over the token's cached claim. So the client's own plan idea decides NOTHING here:
// the two cases below differ only in what the SERVER said, and the surfaces follow the server.
// =================================================================================================
{
  // Stale claim says "free"; the server has a grant and answers 200. The client must render the
  // analysis — a client that suppressed the call from its token would have shown a false refusal.
  // This is the exact shape of the §283 control account: billing tier free, active Pro grant, 200.
  resetExpertEntitlementMemoForTests();
  check(decide({ ok: true }) === "ANALYSIS",
    "STALE JWT a token claiming Free does not suppress a request the server would have allowed");
  check(!expertKnownNotEntitled(), "STALE JWT and no refusal is invented from the token");

  // Stale claim says "pro"; the subscription has ended and the server answers 402.
  resetExpertEntitlementMemoForTests();
  check(decide({ status: 402, body: REFUSAL }) === "PLAN_NOTICE",
    "STALE JWT a token claiming Pro does not override the server's refusal");
}

// =================================================================================================
// SERVER UNAVAILABLE — UNKNOWN, and UNKNOWN IS NOT DENIED.
// =================================================================================================
{
  for (const [label, outcome] of [
    ["a 500", { status: 500, body: { message: "Something went wrong." } }],
    ["a bodyless 502", { status: 502, body: null }],
    ["a 503", { status: 503, body: { message: "Service unavailable." } }],
  ] as const) {
    resetExpertEntitlementMemoForTests();
    check(decide(outcome) === "ERROR", `UNAVAILABLE ${label} shows a failure to read, not a plan notice`);
    check(!expertKnownNotEntitled(), `UNAVAILABLE ${label} sets no refusal`);
  }
}

// =================================================================================================
// MALFORMED ENTITLEMENT RESPONSE — a refusal that did not name itself.
//
// Neither denial nor availability may be concluded from it. It is reported as what it is: the
// client could not learn the state. It must NOT poison the memo, because a memo set from a
// response the client could not parse would suppress requests on no evidence at all.
// =================================================================================================
{
  for (const [label, outcome] of [
    ["a 402 with no code", { status: 402, body: { message: "A paid subscription is required for this feature." } }],
    ["a 402 with an empty body", { status: 402, body: null }],
    ["a 402 with an unrecognised code", { status: 402, body: { message: "no", code: "SOMETHING_ELSE" } }],
  ] as const) {
    resetExpertEntitlementMemoForTests();
    check(decide(outcome) === "ERROR", `MALFORMED ${label} is not read as a denial`);
    check(!expertKnownNotEntitled(), `MALFORMED ${label} sets no refusal memo`);
  }
}

// =================================================================================================
// THE MEMO CAN ONLY EVER BE SET BY A REFUSAL. It is never set towards availability, and there is
// no path from a plan claim into it — the module exposes no such entry point.
// =================================================================================================
{
  resetExpertEntitlementMemoForTests();
  check(!expertKnownNotEntitled(), "a fresh session suppresses nothing");
  check(decide({ ok: true }) === "ANALYSIS", "and asks the server, which is the only authority");
}

if (failures.length) {
  console.error(`\n${failures.length} FAILED:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nall S-15 Expert entitlement decision checks passed");
