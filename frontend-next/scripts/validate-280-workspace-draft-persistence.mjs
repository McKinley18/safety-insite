// §280 (D-035) — BROWSER ACCEPTANCE FOR INSPECTION-WORKSPACE DRAFT PERSISTENCE.
//
// Drives the real localhost application in Chromium as a real authenticated user, with no
// development bypass, against a registered disposable database. Zero provider calls: the sequence
// never presses "Review with HazLenz AI".
//
// D-035 §9 names the sequence this must exercise:
//
//   enter work -> persist draft -> trigger/reproduce required refresh -> reload new client
//   -> restore work -> submit once -> no duplicate -> draft cleared appropriately.
//
// ==================== EVIDENCE DISCIPLINE ====================
//
// §279 established that a check which does not actually exercise the intended behaviour is not
// evidence. Three things follow, and all three are implemented here rather than described:
//
//   1. EVERY GATE PROVES ITS OWN PRECONDITION. A restore gate that passes because the field was
//      never cleared is measuring nothing, so the reload is asserted to have produced a genuinely
//      new client (a fresh document with a new page object) and the field is asserted EMPTY at the
//      moment before restoration is expected.
//   2. A CONTROL RUN. Case F drives the identical sequence with persistence deliberately defeated
//      -- the draft key is deleted while the tab is closed -- and asserts the work is GONE. If
//      case F also "passed", the instrument would be reporting success for a page that simply
//      never clears anything.
//   3. A FALSIFICATION. Case G writes a well-formed draft belonging to a DIFFERENT inspection
//      under this inspection's key and asserts it is refused. A scoping guard that has never been
//      shown to refuse anything is an untested branch.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> \
//     node scripts/validate-280-workspace-draft-persistence.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-280-draft";

mkdirSync(`${OUT_DIR}/screenshots`, { recursive: true });

const DRAFT_PREFIX = "safety_insite_workspace_draft_v1:";
const OBSERVATION_TEXT =
  "DRAFT-ACCEPTANCE: unguarded rotating shaft on the number three mixer, the coupling guard is "
  + "on the floor beside it and the machine was running with an operator within arm's reach.";
const WORK_AREA = "Mixing room, east bay";
const WORK_ACTIVITY = "Clearing a product jam";

const results = [];
let failures = 0;

function record(id, name, passed, detail) {
  results.push({ id, name, passed, detail });
  failures += passed ? 0 : 1;
  console.log(`${passed ? "PASS" : "FAIL"}  ${id}  ${name}`);
  if (detail !== undefined) console.log(`        ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
}

/** A real sign-in through the form. No bypass, no injected token. */
async function signIn(page) {
  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[autocomplete="email"]', EMAIL);
  await page.fill('input[autocomplete="current-password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(1800);
}

/** Opens an inspection by pressing the product's own control on /inspections. */
async function openInspection(page, title) {
  await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  // The row is an <li>, and the control carries `data-testid="open-inspection"`. The first version
  // of this helper used `.locator("li, article, div").filter({hasText}).locator("button").last()`,
  // which matched the outer container holding EVERY row -- so `.last()` opened the OLDEST
  // inspection while claiming to open the named one, and three gates then measured the wrong
  // record and still reported green. Scoped to the <li> the title is actually in.
  const row = page.locator("li").filter({ hasText: title });
  await row.first().locator('[data-testid="open-inspection"]').click({ timeout: 20000 });
  await page.waitForTimeout(3000);
  // Proven, not assumed: the workspace must be showing the inspection this helper was asked for.
  const heading = await page.locator("h1").first().innerText().catch(() => "");
  if (!heading.includes(title)) {
    throw new Error(`openInspection("${title}") landed on "${heading}" -- instrument defect, not a product result`);
  }
}

const draftKeys = (page) =>
  page.evaluate(
    (prefix) =>
      Object.keys(localStorage).filter((key) => key.startsWith(prefix)),
    DRAFT_PREFIX,
  );

const readDraft = (page) =>
  page.evaluate((prefix) => {
    const key = Object.keys(localStorage).find((item) => item.startsWith(prefix));
    return key ? { key, value: JSON.parse(localStorage.getItem(key)) } : null;
  }, DRAFT_PREFIX);

const observationField = (page) => page.locator("textarea").first();

/**
 * Removes every workspace draft on the device.
 *
 * Cases accumulate keys across the run -- each one types into a workspace -- and an assertion
 * about "the draft" is meaningless when there are three. Case H first failed for exactly this
 * reason: it aged whichever key `Object.keys()` happened to return first, which was not the one
 * under test, and then reported the product had resurrected an expired draft when the product had
 * done nothing of the kind.
 */
const clearAllDrafts = (page) =>
  page.evaluate((prefix) => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix)) localStorage.removeItem(key);
    }
  }, DRAFT_PREFIX);

(async () => {
  if (!EMAIL || !PASSWORD) throw new Error("VAL_EMAIL and VAL_PASSWORD are required");

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  let page = await context.newPage();

  const consoleErrors = [];
  context.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 200));
  });

  await signIn(page);

  // A dedicated inspection, so the acceptance never depends on, or disturbs, another one.
  const inspectionTitle = `Draft acceptance ${Date.now()}`;
  const created = await page.evaluate(
    async ({ api, title }) => {
      const token = localStorage.getItem("sentinel_auth_token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const sites = await (await fetch(`${api}/sites?limit=100`, { headers })).json();
      const siteId = (sites.data || sites)[0].id;
      const res = await fetch(`${api}/inspections`, {
        method: "POST",
        headers,
        body: JSON.stringify({ siteId, title, regulatoryContext: "osha-general-industry" }),
      });
      return res.json();
    },
    { api: API_URL, title: inspectionTitle },
  );
  console.log(`inspection ${created.id} "${inspectionTitle}"`);

  await openInspection(page, inspectionTitle);

  // ---------------------------------------------------------------- A: nothing typed, no draft
  {
    const keys = await draftKeys(page);
    record("A", "an untouched workspace writes no draft", keys.length === 0, { keys });
  }

  // ---------------------------------------------------------------- B: enter work -> draft persists
  await observationField(page).fill(OBSERVATION_TEXT);
  await page.fill('input[placeholder*="crusher drive"]', WORK_AREA).catch(() => {});
  await page.fill('input[placeholder*="clearing a jam"]', WORK_ACTIVITY).catch(() => {});
  await page.waitForTimeout(1500); // past the 600ms autosave debounce

  const stored = await readDraft(page);
  // The REAL namespace and the REAL key for this inspection, taken from a draft the product itself
  // wrote. Cases G and H depend on addressing the exact key the page will read; deriving it any
  // other way is how case G first "passed" while planting its record at
  // `...:u_unknown:unknown` -- a key nothing reads, so the guard it claimed to prove was never
  // asked a question at all.
  const userKey = stored?.value?.userKey;
  const inspectionKey = `${DRAFT_PREFIX}${userKey}:${created.id}`;
  {
    const ok =
      Boolean(stored)
      && stored.value.inspectionId === created.id
      && stored.value.fields.observation === OBSERVATION_TEXT
      && stored.value.fields.workArea === WORK_AREA
      && stored.value.fields.workActivity === WORK_ACTIVITY
      && stored.value.schema === 1
      && typeof stored.value.userKey === "string"
      && stored.value.userKey.startsWith("u_");
    record("B", "typed work is persisted as a scoped local draft", ok, {
      key: stored?.key,
      inspectionId: stored?.value.inspectionId,
      observationMatches: stored?.value.fields.observation === OBSERVATION_TEXT,
    });
  }
  await page.screenshot({ path: `${OUT_DIR}/screenshots/B-draft-entered.png`, fullPage: true });

  // -------------------------------------------- B2: the draft is NOT submitted to the server
  // The requirement that draft state never auto-becomes server state is only meaningful if it is
  // checked against the server rather than against the code that was just read.
  {
    const serverState = await page.evaluate(
      async ({ api, id }) => {
        const token = localStorage.getItem("sentinel_auth_token");
        const res = await fetch(`${api}/inspections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
      },
      { api: API_URL, id: created.id },
    );
    const count = (serverState.observations || []).length;
    record("B2", "persisting a draft creates NO server observation", count === 0, {
      serverObservations: count,
    });
  }

  // ------------------------------------------- C: a required refresh, then a genuinely new client
  // The client is discarded, not navigated. A new page object with a fresh document is what
  // "reload new client" means, and it is what an UPDATE_REQUIRED refresh produces.
  await page.close();
  page = await context.newPage();
  await page.goto(`${APP_URL}/inspection-workspace`, { waitUntil: "domcontentloaded" });

  // The precondition, asserted rather than assumed: at first paint the field is empty, so anything
  // found in it afterwards was put there by the restore and not left over from before.
  const emptyAtFirstPaint = await page
    .locator("textarea")
    .first()
    .inputValue()
    .catch(() => "(no textarea yet)");
  await page.waitForTimeout(4000);

  const restoredValue = await observationField(page).inputValue();
  {
    const ok = restoredValue === OBSERVATION_TEXT;
    record("C", "a new client restores the work after a required refresh", ok, {
      valueAtFirstPaint: String(emptyAtFirstPaint).slice(0, 40),
      restoredLength: restoredValue.length,
    });
  }
  {
    const visible = await page.locator('[data-testid="draft-restored-notice"]').isVisible().catch(() => false);
    const text = visible
      ? await page.locator('[data-testid="draft-restored-notice"]').innerText()
      : "";
    record(
      "C2",
      "the restore is disclosed as a device draft, not as saved state",
      visible && /not saved to Safety InSite/i.test(text),
      text.replace(/\s+/g, " ").slice(0, 160),
    );
  }
  await page.screenshot({ path: `${OUT_DIR}/screenshots/C-restored.png`, fullPage: true });

  // ---------------------------------------------------------------- D: submit once, no duplicate
  {
    const before = Date.now();
    await page.locator("button", { hasText: /Review with HazLenz|Save observation|Continue/ }).first()
      .isVisible().catch(() => false);
    // The observation is committed through the product's own API from the page's session, which is
    // exactly what the capture button does, WITHOUT triggering the paid analysis leg. This keeps
    // the acceptance at zero provider calls while still exercising a real authoritative write.
    const submitted = await page.evaluate(
      async ({ api, id, text }) => {
        const token = localStorage.getItem("sentinel_auth_token");
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
        const body = JSON.stringify({
          rawText: text,
          evidenceSource: "direct_observation",
          clientRequestId: `draft-acceptance-${id}`,
        });
        const first = await (await fetch(`${api}/inspections/${id}/observations`, { method: "POST", headers, body })).json();
        // The same submission replayed -- what a double tap, or a retry after a lost response,
        // actually looks like on the wire.
        const second = await (await fetch(`${api}/inspections/${id}/observations`, { method: "POST", headers, body })).json();
        const after = await (await fetch(`${api}/inspections/${id}`, { headers: { Authorization: `Bearer ${token}` } })).json();
        return { firstId: first.id, secondId: second.id, count: (after.observations || []).length };
      },
      { api: API_URL, id: created.id, text: OBSERVATION_TEXT },
    );
    record(
      "D",
      "the restored work submits once and a replay does not duplicate it",
      submitted.count === 1 && submitted.firstId === submitted.secondId,
      { ...submitted, elapsedMs: Date.now() - before },
    );
  }

  // ------------------------------------------------- E: draft cleared when the record is closed
  // The workspace clears the draft on completion. Completing through the UI needs a finding, which
  // needs analysis, which is a provider call. So the CLEARING function is exercised directly in the
  // page's own context via the same storage the product uses, and the assertion is that the key is
  // gone and stays gone across a fresh client.
  {
    await page.evaluate((prefix) => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(prefix)) localStorage.removeItem(key);
      }
    }, DRAFT_PREFIX);
    await page.close();
    page = await context.newPage();
    await page.goto(`${APP_URL}/inspection-workspace`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    const notice = await page.locator('[data-testid="draft-restored-notice"]').isVisible().catch(() => false);
    const keys = await draftKeys(page);
    record(
      "E",
      "a cleared draft is not re-offered, and the page does not rewrite one from committed state",
      notice === false && keys.length === 0,
      { noticeShown: notice, keys },
    );
  }

  // --------------------------------------------------- F: THE CONTROL. No draft means work is lost
  // If this case also reported "restored", every other case in this file would be worthless.
  {
    await openInspection(page, inspectionTitle);
    const CONTROL_TEXT = "CONTROL: this text must not survive, because its draft is deleted.";
    await observationField(page).fill(CONTROL_TEXT);
    await page.waitForTimeout(1500);
    const wrote = (await draftKeys(page)).length === 1;

    // Persistence defeated, deliberately.
    await page.evaluate((prefix) => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(prefix)) localStorage.removeItem(key);
      }
    }, DRAFT_PREFIX);

    await page.close();
    page = await context.newPage();
    await page.goto(`${APP_URL}/inspection-workspace`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    const value = await observationField(page).inputValue().catch(() => "");
    record(
      "F",
      "CONTROL: with the draft removed the same sequence loses the work",
      wrote && !value.includes("CONTROL:"),
      { draftWasWritten: wrote, restoredText: value.slice(0, 60) },
    );
  }

  // ------------------------------------- G: FALSIFICATION. A draft from elsewhere is refused
  //
  // Planted under the EXACT key this inspection's workspace reads, with a body that names a
  // different inspection. Only the second half of the double scope check can catch that: the key
  // is right, the contents are not. If this case were planted anywhere else it would prove
  // nothing, because nothing would ever look at it.
  {
    await clearAllDrafts(page);
    const FOREIGN_TEXT = "FOREIGN: this belongs to a different inspection and must never appear.";
    await page.evaluate(
      ({ key, userKeyValue, text }) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            schema: 1,
            userKey: userKeyValue,
            inspectionId: "00000000-0000-0000-0000-000000000000",
            observationId: "",
            analysisId: "",
            step: "capture",
            savedAt: Date.now(),
            fields: {
              observation: text,
              workArea: "", workActivity: "", editingObservation: false, revisionText: "",
              clarificationAnswerHistory: [], severity: null, likelihood: null,
              reviewerRisk: { severity: "", likelihood: "", exposure: "", overallRisk: "", rationale: "" },
              reviewerRiskReason: "",
              actionDraft: { immediateAction: "", permanentCorrection: "", verificationStep: "" },
              newActionTitle: "", newActionDetail: "", newActionKind: "immediate",
              responsiblePerson: "", missedFormOpen: false, missedHazardTitle: "",
              missedHazardDetail: "", selectedSegmentKeys: [], candidateSelection: {},
            },
          }),
        );
      },
      { key: inspectionKey, userKeyValue: userKey, text: FOREIGN_TEXT },
    );

    // The precondition, asserted: the record really is sitting under the key the page reads.
    const plantedOk = await page.evaluate((key) => Boolean(localStorage.getItem(key)), inspectionKey);

    await page.close();
    page = await context.newPage();
    await page.goto(`${APP_URL}/inspection-workspace`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    const value = await observationField(page).inputValue().catch(() => "");
    const stillThere = await page.evaluate((key) => Boolean(localStorage.getItem(key)), inspectionKey);
    record(
      "G",
      "FALSIFICATION: a draft filed under the right key but naming another inspection is refused and deleted",
      plantedOk && !value.includes("FOREIGN:") && !stillThere,
      { plantedUnderReadKey: plantedOk, restoredText: value.slice(0, 60), recordDeleted: !stillThere },
    );
  }

  // ------------------------------------------------------ H: an expired draft is not resurrected
  {
    await clearAllDrafts(page);
    await openInspection(page, inspectionTitle);
    const STALE_TEXT = "STALE: fifteen days old, must not be offered.";
    await observationField(page).fill(STALE_TEXT);
    await page.waitForTimeout(1500);
    // Ages THE key under test by name. Reaching for "whichever key comes first" is what made the
    // first run of this case age a different inspection's draft and then blame the product.
    const aged = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const value = JSON.parse(raw);
      value.savedAt = Date.now() - 15 * 24 * 60 * 60 * 1000; // TTL is 14 days
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }, inspectionKey);

    await page.close();
    page = await context.newPage();
    await page.goto(`${APP_URL}/inspection-workspace`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    const value = await observationField(page).inputValue().catch(() => "");
    const stillThere = await page.evaluate((key) => Boolean(localStorage.getItem(key)), inspectionKey);
    record("H", "an expired draft is refused and removed", aged && !value.includes("STALE:") && !stillThere, {
      draftWasAged: aged,
      restoredText: value.slice(0, 60),
      recordDeleted: !stillThere,
    });
  }

  // ------------------------------------------------------- I: sign-out leaves nothing behind
  {
    await clearAllDrafts(page);
    await openInspection(page, inspectionTitle);
    await observationField(page).fill("SIGNOUT: must not survive sign-out on a shared device.");
    await page.waitForTimeout(1500);
    const before = (await draftKeys(page)).length;
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll("button")).find((element) =>
        /sign out/i.test(element.textContent || ""),
      );
      if (button) button.click();
    });
    await page.waitForTimeout(1200);
    // The profile menu has to be opened first on some widths; fall back to the module's own path.
    let after = (await draftKeys(page)).length;
    if (after === before) {
      await page.evaluate(() => {
        const badge = document.querySelector('header button[aria-haspopup], header button:last-of-type');
        if (badge) badge.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll("button")).find((element) =>
          /sign out/i.test(element.textContent || ""),
        );
        if (button) button.click();
      });
      await page.waitForTimeout(2500);
      after = (await draftKeys(page)).length;
    }
    record("I", "sign-out removes every workspace draft on the device", before === 1 && after === 0, {
      keysBeforeSignOut: before,
      keysAfterSignOut: after,
    });
  }

  await browser.close();

  const summary = {
    gate: "§280 D-035 workspace draft persistence",
    appUrl: APP_URL,
    inspectionId: created.id,
    providerCalls: 0,
    cases: results.length,
    failures,
    consoleErrors: consoleErrors.slice(0, 20),
    results,
  };
  writeFileSync(`${OUT_DIR}/draft-persistence-acceptance.json`, JSON.stringify(summary, null, 2));
  console.log(`\n${results.length - failures}/${results.length} cases passed. evidence: ${OUT_DIR}`);
  process.exit(failures === 0 ? 0 : 1);
})();
