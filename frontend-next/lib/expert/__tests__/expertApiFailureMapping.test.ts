/**
 * §283 (D-045) — THE REGRESSION FOR THE ENTITLEMENT REFUSAL THE CLIENT DID NOT RECOGNISE.
 *
 * Runs with `npx tsx lib/expert/__tests__/expertApiFailureMapping.test.ts` (no test runner is
 * configured in this workspace, so this is a self-checking script — the same convention as
 * `expertPresentation.test.ts`).
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT FAILED, AND WHY A STATUS-ONLY TEST WOULD NOT HAVE CAUGHT IT.
 *
 * `EntitlementGuard` refuses an unentitled caller with **402**, not 403. `expertApi` recognised
 * 401 and 403 only, so the entitlement refusal fell through to the generic branch: the server's
 * `code` was discarded, `EXPERT_NOT_ENTITLED` was never raised, and `ExpertAnalysisPanel`'s plan
 * notice — which is the only surface that suppresses the "Run Expert review" button — was
 * unreachable. §281 measured the consequence on 64 of 64 HazLenz-step visits: a red `role="alert"`
 * error beside an enabled control the account could never use.
 *
 * The fixture below is therefore the REAL refusal, captured from the running API at §283 against
 * a Free account on a disposable database:
 *
 *   GET /inspections/observations/:id/expert-analyses/current
 *   -> 402 {"message":"A paid subscription is required for this feature.",
 *           "code":"PAID_SUBSCRIPTION_REQUIRED","entitlement":"fullSafeScope"}
 *
 * A test written against an imagined 403 would pass while the product shipped the defect, which is
 * exactly what happened. The case that matters is keyed on the STATUS AND THE CODE TOGETHER.
 */
import {
  classifyExpertFailure,
  EXPERT_ANALYSIS_ERROR,
  ExpertApiError,
} from "../expertApi";

const failures: string[] = [];
function check(condition: unknown, message: string) {
  if (condition) {
    console.log(`ok  ${message}`);
  } else {
    failures.push(message);
    console.log(`FAIL ${message}`);
  }
}

/** The exact body the guard returns. Not paraphrased. */
const ENTITLEMENT_REFUSAL = {
  message: "A paid subscription is required for this feature.",
  code: "PAID_SUBSCRIPTION_REQUIRED",
  entitlement: "fullSafeScope",
};

// =================================================================================================
// D-045. The measured refusal must classify as NOT ENTITLED.
// =================================================================================================
{
  const error = classifyExpertFailure(402, ENTITLEMENT_REFUSAL);
  check(error instanceof ExpertApiError, "D-045 the 402 refusal produces an ExpertApiError");
  check(error.code === EXPERT_ANALYSIS_ERROR.NOT_ENTITLED,
    `D-045 the 402 refusal is classified NOT_ENTITLED (got ${String(error.code)})`);
  check(error.status === 402, "D-045 the status is carried through unchanged");
  check(!/paid subscription/i.test(error.message),
    `D-045 the panel is not handed the billing sentence as an error (got "${error.message}")`);
}

// The same code on any other status still means the same thing. The mapping is keyed on what the
// server SAID, so a future guard that answers 403 with this code cannot reopen the defect.
{
  const error = classifyExpertFailure(403, ENTITLEMENT_REFUSAL);
  check(error.code === EXPERT_ANALYSIS_ERROR.NOT_ENTITLED,
    "D-045 the same code on 403 is also NOT_ENTITLED");
}

// =================================================================================================
// THE MAPPINGS THAT MUST NOT HAVE MOVED.
// =================================================================================================
{
  const error = classifyExpertFailure(401, null);
  check(error.code === EXPERT_ANALYSIS_ERROR.AUTH_REQUIRED, "401 is still AUTH_REQUIRED");
  check(/session has expired/i.test(error.message), "401 still says the session expired");
}
{
  // A 403 with no code at all — a guard other than the entitlement one. The previous behaviour is
  // preserved deliberately: this repair narrows nothing and widens nothing but the 402 case.
  const error = classifyExpertFailure(403, null);
  check(error.code === EXPERT_ANALYSIS_ERROR.NOT_ENTITLED,
    "a bare 403 keeps its existing NOT_ENTITLED mapping");
}
{
  // An ordinary server failure must stay ordinary, and must still surface the server's message —
  // the panel reports a failed read as a failure to LEARN the state, never as "no analysis".
  const error = classifyExpertFailure(500, { message: "Something went wrong." });
  check(error.code === null, "a 500 carries no entitlement code");
  check(error.message === "Something went wrong.", "a 500 surfaces the server's own message");
}
{
  const error = classifyExpertFailure(502, null);
  check(error.code === null, "a bodyless 502 carries no entitlement code");
  check(error.message === "The Expert analysis could not be completed.",
    "a bodyless failure falls back to the module's own sentence");
}
{
  // A code this module does not know must NOT be swallowed into the entitlement notice. Telling an
  // inspector "not included in your plan" about a refusal that was nothing of the kind would hide
  // a real failure behind a billing message.
  const error = classifyExpertFailure(409, { message: "A newer analysis request already exists.", code: "VERSION_CONFLICT" });
  check(error.code === null, "an unknown server code is not mapped to NOT_ENTITLED");
  check(/newer analysis request/.test(error.message), "an unknown server code keeps its message");
}

if (failures.length) {
  console.error(`\n${failures.length} FAILED:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nall expert API failure-mapping checks passed");
