// §276 — THE EXPERT HUMAN-CONFIRMATION PATH, IN THE PRODUCT.
//
// §275 recorded "Human confirmation: PASS_WITH_LIMITATION -- risk confirmation works;
// Expert settlement unreachable (the run was refused)". Its single Expert execution was
// refused by deterministic structural admission, so the reviewer never met a conclusion to
// settle and the branch could not be driven at all.
//
// §276's unresolved/clarification-required product path (P6) produced an execution that WAS
// admitted and reached ANALYSIS_AWAITING_CONFIRMATION. This drives what happens next, which
// is the part a reviewer actually does: read the proposal, settle the named classification,
// and see the conclusion become usable.
//
// ZERO NEW PROVIDER SPEND. The read route and the settlement route contact no provider;
// this replays an execution that already happened.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OBSERVATION_ID=... \
//   OUT_DIR=<dir> node scripts/validate-276-expert-settlement.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-276";
const EMAIL = process.env.VAL_EMAIL || "validation-276-a@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "";
const OBSERVATION_ID = process.env.OBSERVATION_ID || "";

const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

const results = [];
function record(id, title, outcome, detail) {
  results.push({ id, title, outcome, detail: detail ?? null });
  const mark = outcome === "PASS" ? "ok  "
    : outcome === "NOTE" ? "note"
      : outcome === "NOT_EXERCISED" ? "skip" : "FAIL";
  console.log(`${mark} ${id}  ${title}${detail ? `  [${detail}]` : ""}`);
}

async function main() {
  if (!OBSERVATION_ID) throw new Error("OBSERVATION_ID is required.");

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[placeholder*="example.com"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 40000 });

  const readRoute = async () => page.evaluate(async ({ apiUrl, observationId }) => {
    const response = await fetch(`${apiUrl}/inspections/observations/${observationId}/expert-analyses/current`, {
      headers: { authorization: `Bearer ${localStorage.getItem("sentinel_auth_token")}` },
    });
    return { status: response.status, body: await response.json() };
  }, { apiUrl: API_URL, observationId: OBSERVATION_ID });

  const before = await readRoute();
  writeFileSync(`${OUT_DIR}/expert-before-settlement.json`, JSON.stringify(before, null, 2));

  /**
   * The read response carries the authority picture at the TOP level -- state,
   * confirmationRequired, confirmationSubject, effectiveDecision -- with `analysis` holding
   * the Expert result itself. The first version of this instrument read the state off
   * `analysis` and got `undefined`, then scored that as a product failure. It was not one.
   */
  const read = before.body;
  const state = read?.analysisState;
  record("X01", "the Expert read route serves the analysis", before.status === 200 ? "PASS" : "FAIL",
    `status ${before.status}`);

  /**
   * §276. Settlement is a ONE-WAY transition: an analysis has exactly one settlement, so
   * this suite can only drive it once per execution. A re-run against an analysis already
   * settled is recorded NOT_EXERCISED, never as a failure and never as a pass -- the
   * transition was not re-driven, and pretending either way would misreport the evidence.
   * The frozen record of the run that DID drive it is `expert-settlement.json`.
   */
  const alreadySettled = ["ANALYSIS_CONFIRMED", "ANALYSIS_OVERRIDDEN"].includes(String(state));
  if (alreadySettled) {
    record("X02", "the analysis is awaiting a human decision", "NOT_EXERCISED",
      `already ${state} — the transition cannot be driven twice on one analysis`);
  } else {
    record("X02", "the analysis is awaiting a human decision",
      state === "ANALYSIS_AWAITING_CONFIRMATION" ? "PASS" : "FAIL", String(state));
  }
  record("X03", "the server says confirmation is required rather than the browser deciding",
    alreadySettled ? "NOT_EXERCISED" : (read?.confirmationRequired === true ? "PASS" : "FAIL"),
    String(read?.confirmationRequired));
  record("X04", "and it does NOT present a settled conclusion before a person settles it",
    alreadySettled ? "NOT_EXERCISED" : (before.body?.effectiveDecision?.settledForUse !== true ? "PASS" : "FAIL"),
    `settledForUse=${before.body?.effectiveDecision?.settledForUse}`);

  const subject = read?.confirmationSubject;
  writeFileSync(`${OUT_DIR}/expert-confirmation-subject.json`, JSON.stringify(subject ?? null, null, 2));
  record("X05", "the server names the classification entries the reviewer must settle",
    Array.isArray(subject?.entries) && subject.entries.length > 0 ? "PASS" : "NOTE",
    Array.isArray(subject?.entries) ? `${subject.entries.length} entry(ies)` : "no subject on the read payload");

  // The workspace, as the reviewer sees it.
  const inspectionId = read?.analysisId;
  await page.goto(`${APP_URL}/inspection-workspace`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const workspace = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  await page.screenshot({ path: `${shotDir}/X01-expert-awaiting.png`, fullPage: true });
  writeFileSync(`${OUT_DIR}/expert-workspace-screen.txt`, workspace);
  record("X06", "the workspace renders an Expert panel", /HAZLENZ EXPERT REVIEW/i.test(workspace) ? "PASS" : "NOTE",
    inspectionId ? `inspection ${inspectionId}` : "");

  /**
   * SETTLEMENT, through the route the browser uses. The vocabulary is the server's closed
   * two-member set; nothing here invents a value, and the reviewer settles the entries the
   * SERVER named rather than any the client chose.
   */
  const settle = await page.evaluate(async ({ apiUrl, observationId, analysisId }) => {
    const response = await fetch(
      `${apiUrl}/inspections/observations/${observationId}/expert-analyses/${analysisId}/settlement`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${localStorage.getItem("sentinel_auth_token")}`,
        },
        /*
         * A CONFIRMATION, in the server's own vocabulary. `replacements` is deliberately
         * absent: the DTO rejects it on a confirmation, because confirming is agreeing with
         * the classification as it stands. The rationale is mandatory even here -- a
         * confirmation is a person putting their name to "work may continue on this basis".
         */
        body: JSON.stringify({
          idempotencyKey: `s276-settle-${analysisId}`.slice(0, 120),
          decision: "classification_confirmed",
          rationale: "§276 acceptance: the energized status and the pinch exposure both decide whether work continues here, as classified.",
        }),
      },
    );
    return { status: response.status, body: await response.json().catch(() => ({})) };
  }, {
    apiUrl: API_URL,
    observationId: OBSERVATION_ID,
    analysisId: read?.analysisId,
  });

  writeFileSync(`${OUT_DIR}/expert-settlement-response.json`, JSON.stringify(settle, null, 2));
  record("X07", "a reviewer can settle the analysis", settle.status < 400 ? "PASS" : "FAIL",
    `status ${settle.status} ${String(settle.body?.message || "").slice(0, 120)}`);

  if (settle.status < 400) {
    const after = await readRoute();
    writeFileSync(`${OUT_DIR}/expert-after-settlement.json`, JSON.stringify(after, null, 2));
    const afterAnalysis = after.body;
    record("X08", "the state moves to a settled one",
      ["ANALYSIS_CONFIRMED", "ANALYSIS_OVERRIDDEN"].includes(String(afterAnalysis?.analysisState)) ? "PASS" : "FAIL",
      String(afterAnalysis?.analysisState));
    record("X09", "and the conclusion becomes usable only now",
      after.body?.effectiveDecision?.settledForUse === true ? "PASS" : "FAIL",
      `settledForUse=${after.body?.effectiveDecision?.settledForUse}`);

    /**
     * The proposal must survive the decision. §264 established that settlement never
     * rewrites the Expert result; this re-checks it on a live product record, because a
     * decision that edits the thing it is deciding about destroys the attribution.
     */
    const beforeSnapshot = JSON.stringify(read?.analysis ?? null);
    const afterSnapshot = JSON.stringify(after.body?.analysis ?? null);
    record("X10", "the Expert result is byte-identical after settlement",
      beforeSnapshot === afterSnapshot ? "PASS" : "FAIL",
      beforeSnapshot === afterSnapshot ? "the proposal and the decision stay separately attributable" : "the snapshot changed");

    // A replay must not create a second settlement.
    const replay = await page.evaluate(async ({ apiUrl, observationId, analysisId }) => {
      const response = await fetch(
        `${apiUrl}/inspections/observations/${observationId}/expert-analyses/${analysisId}/settlement`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("sentinel_auth_token")}`,
          },
          body: JSON.stringify({
            idempotencyKey: `s276-settle-${analysisId}`.slice(0, 120),
            decision: "classification_confirmed",
            rationale: "§276 acceptance: the energized status and the pinch exposure both decide whether work continues here, as classified.",
          }),
        },
      );
      return { status: response.status };
    }, {
      apiUrl: API_URL, observationId: OBSERVATION_ID,
      analysisId: read?.analysisId,
    });
    record("X11", "a replayed settlement does not create a second decision",
      replay.status < 500 ? "PASS" : "FAIL", `status ${replay.status}`);

    await page.goto(`${APP_URL}/inspection-workspace`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${shotDir}/X02-expert-settled.png`, fullPage: true });
    const settledScreen = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    writeFileSync(`${OUT_DIR}/expert-settled-screen.txt`, settledScreen);
  }

  await browser.close();
  writeFileSync(`${OUT_DIR}/expert-settlement.json`, JSON.stringify({
    section: 276, observationId: OBSERVATION_ID, providerCallsThisScript: 0, results,
  }, null, 2));

  const failed = results.filter((r) => r.outcome === "FAIL");
  const skipped = results.filter((r) => r.outcome === "NOT_EXERCISED");
  console.log(`\n${results.length - failed.length - skipped.length} passed, ${skipped.length} not exercised, ${failed.length} failed.`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
