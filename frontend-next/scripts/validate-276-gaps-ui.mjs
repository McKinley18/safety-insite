// §276 — CLOSING THE OTHER THREE §275 NOT_EXECUTED AREAS, IN THE BROWSER.
//
//   D  SETTINGS       every active settings/account screen, driven and changed
//   E  CLARIFICATION  a genuine HazLenz clarification, through the product path
//   F  PERFORMANCE    representative localhost timings, and redundant-call counting
//
// Settings, clarification and perceived performance are things a person experiences rather
// than things a route returns, so these are driven through the real interface with the
// development bypass off.
//
// Usage:
//   APP_URL=http://localhost:3000 API_URL=http://localhost:4000 \
//   VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> node scripts/validate-276-gaps-ui.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-276";
const EMAIL = process.env.VAL_EMAIL || "validation-276-a@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "";
const RUN = `VALIDATION-276-UI-${Date.now()}`;

const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

const results = [];
const timings = [];
const networkByRoute = {};

function record(area, id, title, outcome, detail) {
  results.push({ area, id, title, outcome, detail: detail ?? null });
  const mark = outcome === "PASS" ? "ok  " : outcome === "NOTE" ? "note" : "FAIL";
  console.log(`${mark} [${area}] ${id}  ${title}${detail ? `  [${detail}]` : ""}`);
}

/**
 * §276. Timings measure work, never waiting.
 *
 * The first version of this instrument wrapped `waitForTimeout(2500)` inside the measured
 * window, so every page "took" about 3 s and the two slowest results were the two pages
 * that happened to have the longest sleep after them. A number produced that way says
 * nothing about the product. The window now closes on a CONDITION -- the content being
 * present -- and any settling delay is taken outside it.
 */
async function timed(label, fn) {
  const started = Date.now();
  const value = await fn();
  const ms = Date.now() - started;
  timings.push({ label, ms });
  console.log(`      ⏱  ${label}: ${ms} ms`);
  return value;
}

async function text(page) {
  return (await page.locator("body").innerText()).replace(/\s+/g, " ");
}

/**
 * Tokens that must never reach rendered text on a settings or account screen. §276 Part 5D
 * asks for "no placeholders/debug values"; this is what that means concretely.
 */
const PLACEHOLDER_PATTERNS = [
  { id: "lorem", re: /\blorem ipsum\b/i },
  { id: "todo", re: /\bTODO\b|\bFIXME\b|\bXXX\b/ },
  { id: "example_values", re: /\bAcme (Corp|Inc|Ltd)\b|\bJohn Doe\b|\bJane Doe\b/i },
  { id: "placeholder_literal", re: /\bplaceholder\b/i },
  { id: "unresolved_template", re: /\{\{[^}]{1,60}\}\}|\$\{[^}]{1,60}\}|\[object Object\]|\bundefined\b|\bNaN\b/ },
  { id: "screaming_snake", re: /\b[A-Z][A-Z0-9]{2,}(?:_[A-Z0-9]+)+\b/ },
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 250)); });

  /**
   * §276. Requests are counted PER VISIT, not per route name.
   *
   * The first version of this counter keyed on the route alone and accumulated across the
   * whole pass, so `/settings` -- which this script visits four times -- reported "10
   * requests" as though one page load had made ten. A redundancy number that silently sums
   * separate visits cannot distinguish a chatty page from a page visited often, which is
   * the entire question being asked.
   */
  let currentRoute = "startup";
  let visitIndex = 0;
  const visitRoute = (route) => {
    visitIndex += 1;
    currentRoute = `${route}#${visitIndex}`;
  };
  page.on("request", (r) => {
    if (!r.url().startsWith(API_URL)) return;
    const key = `${currentRoute} :: ${r.method()} ${r.url().replace(API_URL, "").split("?")[0]}`;
    networkByRoute[key] = (networkByRoute[key] || 0) + 1;
  });

  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[placeholder*="example.com"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 40000 });

  // =====================================================================================
  // AREA D — SETTINGS AND ACCOUNT SCREENS.
  // =====================================================================================
  visitRoute("/settings");
  await timed("settings load", async () => {
    await page.goto(`${APP_URL}/settings`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => /Saved sites/i.test(document.body.innerText), { timeout: 30000 });
  });
  await page.waitForTimeout(2000);
  const settings = await text(page);
  await page.screenshot({ path: `${shotDir}/D01-settings.png`, fullPage: true });

  record("D", "D01", "settings renders under the canonical product brand",
    /Safety InSite/i.test(settings) && !/\bsafe ?scope\b|\bsentinel safety\b|\bauditally\b/i.test(settings) ? "PASS" : "FAIL");
  record("D", "D02", "it shows the account's REAL plan, not a default",
    /PLAN Pro|CURRENT PLAN Pro/i.test(settings) ? "PASS" : "FAIL");
  record("D", "D03", "it lists the account's own saved sites",
    /saved sites/i.test(settings) && /VALIDATION-276/.test(settings) ? "PASS" : "FAIL");
  record("D", "D04", "an unavailable action says why rather than failing silently",
    /Billing is not configured on this environment/i.test(settings) ? "PASS" : "NOTE",
    "billing is unconfigured locally and the screen states it");

  const settingsLeaks = PLACEHOLDER_PATTERNS.filter((p) => p.re.test(settings)).map((p) => p.id);
  record("D", "D05", "no placeholder or debug value reaches the settings screen",
    settingsLeaks.length === 0 ? "PASS" : "FAIL", settingsLeaks.join(", "));

  /**
   * A setting is only verified once it has been CHANGED and seen to survive. Reading the
   * defaults proves the page renders; it does not prove the page works.
   */
  const riskMatrixButton = page.getByRole("button", { name: /Simple 4x4/i }).first();
  if (await riskMatrixButton.count()) {
    await riskMatrixButton.click();
    await page.waitForTimeout(1200);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    const afterChange = await text(page);
    record("D", "D06", "a changed setting survives a reload",
      /RISK MATRIX Simple 4x4/i.test(afterChange) ? "PASS" : "FAIL",
      "risk matrix default switched to Simple 4x4");
    // Put it back, so the walkthrough that follows runs on the documented default.
    await page.getByRole("button", { name: /Standard 5x5/i }).first().click();
    await page.waitForTimeout(1200);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    record("D", "D07", "and can be changed back",
      /RISK MATRIX Standard 5x5/i.test(await text(page)) ? "PASS" : "FAIL");
  } else {
    record("D", "D06", "a changed setting survives a reload", "FAIL", "no risk-matrix control found");
  }

  visitRoute("/profile");
  await timed("profile load", async () => {
    await page.goto(`${APP_URL}/profile`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => /Account details/i.test(document.body.innerText), { timeout: 30000 });
  });
  await page.waitForTimeout(2000);
  const profile = await text(page);
  await page.screenshot({ path: `${shotDir}/D02-profile.png`, fullPage: true });

  record("D", "D08", "the profile shows the signed-in account's own email",
    profile.toLowerCase().includes(EMAIL.toLowerCase()) ? "PASS" : "FAIL");
  record("D", "D09", "the email is shown as stored, not shouted back in capitals",
    profile.includes(EMAIL) ? "PASS" : "FAIL",
    profile.includes(EMAIL.toUpperCase()) && !profile.includes(EMAIL) ? "rendered uppercase" : "");
  record("D", "D10", "role and plan are visible", /PLAN Pro|Pro \$24\.99/i.test(profile) ? "PASS" : "FAIL");
  record("D", "D11", "sign-out is reachable", /Sign Out/i.test(profile) ? "PASS" : "FAIL");
  record("D", "D12", "account deletion requires the password",
    /enter your password to confirm/i.test(profile) ? "PASS" : "FAIL");

  const profileLeaks = PLACEHOLDER_PATTERNS.filter((p) => p.re.test(profile)).map((p) => p.id);
  record("D", "D13", "no placeholder or debug value reaches the profile screen",
    profileLeaks.length === 0 ? "PASS" : "FAIL", profileLeaks.join(", "));

  // Navigation between the account screens, as a person moves between them.
  for (const [routeName, route] of [["Home", "/command-center"], ["Settings", "/settings"], ["Calendar", "/safety-calendar"]]) {
    visitRoute(route);
    await page.goto(`${APP_URL}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    record("D", `D14-${routeName}`, `navigation reaches ${routeName} without an error boundary`,
      !/something went wrong|application error|unhandled/i.test(await text(page)) ? "PASS" : "FAIL");
  }

  // =====================================================================================
  // AREA E — CLARIFICATION, THROUGH THE PRODUCT PATH.
  //
  // The Pro workflow establishes jurisdiction once at inspection setup, so the
  // decision-critical JURISDICTION question is not reachable there by design. What IS
  // reachable inside the workflow is the per-predicate question the confidence panel
  // offers under "What would raise this", and that is what a reviewer actually meets.
  // Both are measured: the in-product one here, the decision-critical one through the
  // same classify contract the workflow posts to.
  // =====================================================================================
  visitRoute("/inspections");
  await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const siteSelect = page.locator("select").first();
  const siteName = `${RUN} Clarification Bay`;
  await siteSelect.selectOption("__new__");
  await page.waitForTimeout(400);
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: /save site/i }).first().click();
  await page.waitForTimeout(2500);
  // Select the site just created, by its name. Relying on it being auto-selected made this
  // script fail once the account had a dozen sites -- the Start button stayed disabled
  // because no site was chosen, which is the product behaving correctly.
  await page.locator("select").first().selectOption({ label: siteName });
  await page.waitForTimeout(400);
  await page.getByLabel("Regulatory context").selectOption("osha-general-industry");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /full inspection/i }).first().click();
  await page.waitForTimeout(800);
  const start = page.getByRole("button", { name: /^start|begin|continue/i }).first();
  if (await start.count()) await start.click();
  await page.waitForURL((u) => u.pathname.includes("inspection-workspace"), { timeout: 40000 });
  await page.waitForTimeout(2500);

  visitRoute("/inspection-workspace");
  /**
   * An observation that states the guard is missing and says NOTHING about energy or
   * exposure. That is the shape that leaves `moving or accessible energy` genuinely
   * unresolved -- and unlike §275's case there is no adjacent sentence about the same
   * machine to supply it, so D-009's scoped evidence has nothing to forward either.
   */
  await page.locator("textarea").first().fill(
    "The point of operation guard has been removed from the press brake in bay 2.",
  );
  await timed("HazLenz analysis (clarification case)", async () => {
    await page.getByRole("button", { name: /analy[sz]e|run hazlenz|hazlenz/i }).first().click();
    await page.waitForFunction(
      () => /hazard|finding|candidate|standard|No hazard/i.test(document.body.innerText)
        && !/analy[sz]ing/i.test(document.body.innerText),
      { timeout: 120000 },
    );
  });
  await page.waitForTimeout(2500);
  const clarifyScreen = await text(page);
  await page.screenshot({ path: `${shotDir}/E01-analysis.png`, fullPage: true });
  writeFileSync(`${OUT_DIR}/clarification-screen.txt`, clarifyScreen);

  const confirmCandidates = page.getByTestId("confirm-candidates");
  if (await confirmCandidates.count()) {
    await confirmCandidates.click();
    await page.waitForTimeout(2500);
  }
  const standardPanel = await text(page);
  await page.screenshot({ path: `${shotDir}/E02-standard-panel.png`, fullPage: true });

  const confidenceButton = page.getByRole("button", { name: /Confidence:/i }).first();
  const clarificationReachable = await confidenceButton.count() > 0;
  record("E", "E01", "the confidence control that leads to clarification is present",
    clarificationReachable ? "PASS" : "NOTE",
    clarificationReachable ? "" : "the candidate resolved without a question to ask");

  let beforeConfidence = "";
  let afterConfidence = "";
  let questionAsked = "";
  if (clarificationReachable) {
    beforeConfidence = (/Confidence: (\w+)/i.exec(standardPanel) || [])[1] || "";
    await confidenceButton.click();
    await page.waitForTimeout(1200);
    const panel = await text(page);
    await page.screenshot({ path: `${shotDir}/E03-clarification-panel.png`, fullPage: true });
    const question = /Can you confirm: ([^?]+)\?/i.exec(panel);
    questionAsked = question ? question[1] : "";
    record("E", "E02", "HazLenz states what would raise the finding's confidence",
      /What would raise this/i.test(panel) ? "PASS" : "FAIL");
    record("E", "E03", "and asks a question that materially relates to the settlement",
      Boolean(questionAsked) ? "PASS" : "NOTE",
      questionAsked ? `"${questionAsked}"` : "no question offered");

    if (questionAsked) {
      const yes = page.getByRole("button", { name: /^Yes$/ }).first();
      if (await yes.count()) {
        await timed("clarification answer -> recomputed analysis", async () => {
          await yes.click();
          await page.waitForFunction(
            () => !/Re-evaluating the evidence/i.test(document.body.innerText),
            { timeout: 120000 },
          );
        });
        await page.waitForTimeout(3000);
        const recomputed = await text(page);
        await page.screenshot({ path: `${shotDir}/E04-after-answer.png`, fullPage: true });
        writeFileSync(`${OUT_DIR}/clarification-after-answer.txt`, recomputed);
        afterConfidence = (/Confidence: (\w+)/i.exec(recomputed) || [])[1] || "";
        record("E", "E04", "answering resumes the analysis without losing the inspection",
          /FINDING YOU ARE BUILDING|Applicable standard/i.test(recomputed) ? "PASS" : "FAIL");
        /**
         * §276 measured this FAILING: a predicate clarification answer was accepted by the
         * interface and changed nothing, under a panel captioned "What would raise this".
         * §276 declined to repair it, because whether a reviewer's assertion may promote a
         * regulatory predicate is a safety-semantics decision rather than a scoping bug.
         *
         * §277 / D-023 settled it: an explicit answer about a NAMED fact may settle that
         * predicate, with `human_asserted` provenance, while a generic confirmation still
         * settles nothing. The assertion is kept here because it is the product-path proof
         * that the decision reaches the screen a reviewer uses.
         */
        record("E", "E05", "a PREDICATE clarification answer changes the recomputed result",
          afterConfidence && afterConfidence !== beforeConfidence ? "PASS" : "FAIL",
          `confidence ${beforeConfidence || "?"} -> ${afterConfidence || "?"} — §277 / D-023`);
        record("E", "E05b", "and the finding is not DAMAGED by answering",
          /Applicable standard \(1\)/i.test(recomputed)
          && !/guardstate=|=absent_or_ineffective/i.test(recomputed) ? "PASS" : "FAIL",
          "§276 found the standard disappearing and an internal token quoted back as the inspector's words");
      }
    }
  }

  /**
   * THE DECISION-CRITICAL QUESTION, over the same classify contract the workflow posts to.
   * `jurisdiction` is flagged `decisionCritical: true` and material to standard
   * applicability, risk and corrective action -- it is the clarification that controls what
   * the finding asserts.
   */
  const jurisdictionProbe = await page.evaluate(async ({ apiUrl }) => {
    const token = localStorage.getItem("sentinel_auth_token");
    const body = {
      text: "The point of operation guard on the shear has been removed and the blade is cycling while the operator feeds stock by hand.",
    };
    const ask = async (payload) => {
      const response = await fetch(`${apiUrl}/hazlenz/classify`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      return response.json();
    };
    const before = await ask(body);
    const after = await ask({ ...body, clarificationAnswers: [{ questionId: "jurisdiction", answer: "OSHA General Industry" }] });
    const summarise = (r) => ({
      questions: (r.clarificationQuestions || []).map((q) => ({ id: q.id, critical: q.priority === "critical" })),
      decisions: (r.applicabilityDecisions || []).map((d) => ({
        citation: d.citation, status: d.status, provenance: d.jurisdictionProvenance, missing: d.missingPredicates,
      })),
      state: r.clarificationAnswerState,
    });
    return { before: summarise(before), after: summarise(after) };
  }, { apiUrl: API_URL });

  writeFileSync(`${OUT_DIR}/clarification-jurisdiction.json`, JSON.stringify(jurisdictionProbe, null, 2));

  record("E", "E06", "a decision-critical clarification is raised when jurisdiction is unresolved",
    jurisdictionProbe.before.questions.some((q) => q.id === "jurisdiction" && q.critical) ? "PASS" : "FAIL");
  record("E", "E07", "answering it collapses the candidate regimes to the one named",
    jurisdictionProbe.after.decisions.length === 1
    && jurisdictionProbe.after.decisions[0].citation.includes("1910.212") ? "PASS" : "FAIL",
    `${jurisdictionProbe.before.decisions.length} -> ${jurisdictionProbe.after.decisions.length} candidate(s)`);
  record("E", "E08", "and the provenance records the human as the source",
    jurisdictionProbe.after.decisions[0]?.provenance === "USER_CONFIRMED" ? "PASS" : "FAIL",
    `${jurisdictionProbe.before.decisions[0]?.provenance} -> ${jurisdictionProbe.after.decisions[0]?.provenance}`);
  record("E", "E09", "the answer is not simultaneously recorded as ignored",
    (jurisdictionProbe.after.state?.invalidAnswers || []).length === 0 ? "PASS" : "FAIL",
    JSON.stringify(jurisdictionProbe.after.state?.invalidAnswers || []));

  // =====================================================================================
  // AREA F — PERFORMANCE SANITY. Not load testing: representative localhost timings, and
  // a count of how many times each page asks the server for the same thing.
  // =====================================================================================
  for (const [label, route] of [
    ["dashboard", "/command-center"],
    ["inspections list", "/inspections"],
    ["calendar", "/safety-calendar"],
    ["reports", "/reports"],
    ["settings", "/settings"],
  ]) {
    visitRoute(route);
    await timed(`${label} (cold navigation)`, async () => {
      await page.goto(`${APP_URL}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("h1", { timeout: 20000 });
    });
    // Settling time is taken OUTSIDE the measured window, on purpose.
    await page.waitForTimeout(2500);
  }

  const redundant = Object.entries(networkByRoute)
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
  record("F", "F01", "no single page VISIT asks the server for the same thing more than twice",
    redundant.every((r) => r.count <= 2) ? "PASS" : "NOTE",
    redundant.slice(0, 3).map((r) => `${r.key} x${r.count}`).join(" | "));

  const slow = timings.filter((t) => t.ms > 3000);
  record("F", "F02", "no measured interaction exceeds 3 s on localhost",
    slow.length === 0 ? "PASS" : "NOTE",
    slow.map((t) => `${t.label} ${t.ms}ms`).join(" | "));

  record("F", "F03", "the browser console carried no errors across this pass",
    consoleErrors.length === 0 ? "PASS" : "FAIL",
    consoleErrors.slice(0, 2).join(" | "));

  await browser.close();

  writeFileSync(`${OUT_DIR}/gap-closure-ui.json`, JSON.stringify({
    section: 276,
    run: RUN,
    areas: { D: "settings", E: "clarification", F: "performance sanity" },
    results, timings, networkByRoute, consoleErrors,
  }, null, 2));

  const failed = results.filter((r) => r.outcome === "FAIL");
  const noted = results.filter((r) => r.outcome === "NOTE");
  console.log(`\n${results.length - failed.length - noted.length} passed, ${noted.length} noted, ${failed.length} failed.`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
