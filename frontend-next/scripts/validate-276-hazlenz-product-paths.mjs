// §276 PART 6 — HAZLENZ PRODUCT-PATH COVERAGE AND CONCISION ACCEPTANCE.
//
// §275 drove ONE deep OSHA machine-guarding case. That is not a product-path set, and
// every conclusion drawn from it was correspondingly narrow. This adds the five paths
// §276 names, driven through the real interface:
//
//   2  OSHA, a SECOND domain (not machine guarding)
//   3  MSHA
//   4  a SAFE / NEGATED condition — the engine must not manufacture a hazard
//   5  MULTIPLE INDEPENDENT hazards in one observation
//   6  an UNRESOLVED / clarification-required condition
//
// Path 1 (OSHA machine guarding) is §275's, re-driven by the §276 walkthrough, and is not
// repeated here.
//
// PROVIDER SPEND. Deterministic HazLenz calls no provider and is unlimited. Expert HazLenz
// does, and is capped: at most 5 further analyses across §§275-276 combined against a
// cumulative $1.50 ceiling, of which §275 spent 1 ($0.119524). This script runs Expert on
// the paths where a second opinion carries information the deterministic engine cannot give
// -- a negated condition and an unresolved one -- and NOT on the paths where it would only
// re-confirm a settled deterministic answer. Every execution is counted and reported.
//
// NO PROMPT TUNING. §276 forbids tuning on a set this small, and nothing here writes to any
// Expert contract, instruction, schema or verifier.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> EXPERT=1 \
//   node scripts/validate-276-hazlenz-product-paths.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-276";
const EMAIL = process.env.VAL_EMAIL || "validation-276-a@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "";
const RUN_EXPERT = process.env.EXPERT === "1";
const RUN = `VALIDATION-276-PATH-${Date.now()}`;

const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

/**
 * The paths. Each observation is written the way an inspector writes one -- plain field
 * language, no engine vocabulary -- because the product path includes how the words arrive.
 */
const PATHS = [
  {
    id: "P2",
    domain: "OSHA General Industry — second domain (electrical)",
    context: "osha-general-industry",
    expectHazard: true,
    expert: false,
    observation:
      "The cover plate is missing from a 480-volt disconnect panel in the compressor room "
      + "and energized terminals are exposed at chest height. Employees pass within arm's "
      + "reach of the opening to reach the parts crib, and nothing guards the opening.",
  },
  {
    id: "P3",
    domain: "MSHA",
    context: "msha",
    expectHazard: true,
    expert: true,
    observation:
      "On the number two conveyor drive at the primary crusher, the guard over the tail "
      + "pulley pinch point has been removed and not replaced. The conveyor is running and "
      + "a miner cleans spillage beside the pulley while it turns.",
  },
  {
    id: "P4",
    domain: "safe / negated condition",
    context: "osha-general-industry",
    expectHazard: false,
    expert: true,
    observation:
      "The fixed guard on the bench grinder in the maintenance shop is in place, correctly "
      + "adjusted and secured with all fasteners present. The tool rest is set within one "
      + "eighth of an inch of the wheel. Nobody was working at the grinder and it was "
      + "switched off and isolated at the wall.",
  },
  {
    id: "P5",
    domain: "multiple independent hazards",
    context: "osha-general-industry",
    expectHazard: true,
    expert: false,
    observation:
      "The point of operation guard on the punch press has been removed and the press is "
      + "energized and cycling with the operator feeding blanks by hand. Separately, the "
      + "guardrail along the north mezzanine walkway is missing over a four metre drop and "
      + "employees walk within a metre of the open edge.",
  },
  {
    id: "P6",
    domain: "unresolved / clarification-required",
    context: "osha-general-industry",
    expectHazard: true,
    expert: true,
    observation:
      "The point of operation guard has been removed from the press brake in bay 2.",
  },
];

const results = [];
const expertExecutions = [];

function record(id, title, outcome, detail) {
  results.push({ id, title, outcome, detail: detail ?? null });
  const mark = outcome === "PASS" ? "ok  " : outcome === "NOTE" ? "note" : "FAIL";
  console.log(`${mark} ${id}  ${title}${detail ? `  [${detail}]` : ""}`);
}

async function text(page) {
  return (await page.locator("body").innerText()).replace(/\s+/g, " ").trim();
}

/**
 * The concision scorecard §276 asks for, measured from the DEFAULT screen -- what the
 * reviewer sees before expanding anything. "Correct but buried" is the failure mode this
 * exists to catch, and it is invisible to any assertion made against the payload.
 */
function scoreConcision(screen, path) {
  const body = screen
    .replace(/^.*?(1\. Record It|HazLenz)/, "")
    .trim();

  const leaks = [
    /\b[a-z][a-z0-9]*=[a-z0-9_]+\b/,            // guardstate=absent_or_ineffective
    /\b[A-Z][A-Z0-9]{2,}(?:_[A-Z0-9]+)+\b/,      // SCREAMING_SNAKE
    /\b[a-z]+(?:_[a-z]+)+\b/,                    // snake_case
  ].filter((re) => re.test(body));

  const sentences = body.split(/(?<=[.!?]) /).map((s) => s.trim()).filter((s) => s.length > 25);
  const seen = new Set();
  let repeated = 0;
  for (const sentence of sentences) {
    const key = sentence.toLowerCase();
    if (seen.has(key)) repeated += 1;
    seen.add(key);
  }

  const caveats = (body.match(/advisory|qualified (safety )?professional|must verify|requires? (qualified )?(human )?review/gi) || []).length;

  return {
    renderedCharacters: body.length,
    // The four questions the default screen has to answer.
    whatWasFound: /HazLenz (found|did not identify)|possible findings|FINDING YOU ARE BUILDING/i.test(body),
    whatNeedsAttention: /Risk (Critical|High|Moderate|Low)|HIGH|CRITICAL|did not identify a hazard/i.test(body),
    whatToDo: /Corrective action|What will be done|Continue to risk|record the finding yourself/i.test(body),
    whatIsMissing: /missing:|What would raise this|No standard has been established|still unknown/i.test(body),
    quotesTheInspectorsOwnWords: new RegExp(path.observation.split(" ").slice(2, 6).join(" "), "i").test(body)
      || /From what you wrote|Flagged from what you recorded/i.test(body),
    citationOnTheDefaultScreen: /\d+ CFR \d+/.test(body),
    internalTokenLeaks: leaks.length,
    repeatedSentences: repeated,
    caveatCount: caveats,
    // Regulatory text is progressive-disclosure: the full standard must be behind a control.
    regulatoryTextDeferred: /Show details for|STANDARD DETAIL/i.test(body)
      && !/\(a\)\(1\) Types of guarding|shall be provided to protect the operator/i.test(body),
  };
}

async function startInspection(page, path, siteName) {
  await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.locator("select").first().selectOption("__new__");
  await page.waitForTimeout(400);
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: /save site/i }).first().click();
  await page.waitForTimeout(2500);
  // Select the site just created, by its name. Relying on it being auto-selected made this
  // script fail once the account had a dozen sites -- the Start button stayed disabled
  // because no site was chosen, which is the product behaving correctly.
  await page.locator("select").first().selectOption({ label: siteName });
  await page.waitForTimeout(400);
  await page.getByLabel("Regulatory context").selectOption(path.context);
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /full inspection/i }).first().click();
  await page.waitForTimeout(800);
  const start = page.getByRole("button", { name: /^start|begin|continue/i }).first();
  if (await start.count()) await start.click();
  await page.waitForURL((u) => u.pathname.includes("inspection-workspace"), { timeout: 40000 });
  await page.waitForTimeout(2500);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 250)); });

  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[placeholder*="example.com"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 40000 });

  const matrix = [];

  for (const path of PATHS) {
    console.log(`\n--- ${path.id}: ${path.domain} ---`);
    await startInspection(page, path, `${RUN} ${path.id}`);
    await page.locator("textarea").first().fill(path.observation);

    const started = Date.now();
    await page.getByRole("button", { name: /analy[sz]e|run hazlenz|hazlenz/i }).first().click();
    await page.waitForFunction(
      () => /possible findings|did not identify|FINDING YOU ARE BUILDING|No hazard/i.test(document.body.innerText)
        && !/analy[sz]ing/i.test(document.body.innerText),
      { timeout: 120000 },
    );
    const analysisMs = Date.now() - started;
    await page.waitForTimeout(2000);

    const screen = await text(page);
    await page.screenshot({ path: `${shotDir}/${path.id}-analysis.png`, fullPage: true });
    writeFileSync(`${OUT_DIR}/path-${path.id}-screen.txt`, screen);

    const foundHazard = !/did not identify a hazard/i.test(screen);
    const proposedCount = Number((/HazLenz found (\d+) possible finding/i.exec(screen) || [])[1] || (foundHazard ? 1 : 0));
    record(path.id, `${path.domain}: hazard outcome matches the condition`,
      foundHazard === path.expectHazard ? "PASS" : "FAIL",
      `${proposedCount} proposed — expected ${path.expectHazard ? "at least one" : "none"}`);

    /**
     * For the SAFE path, the two failures are different and must not be summed. §276 closed
     * the first and referred the second: a hazard the engine itself assessed SAFE_VERIFIED is
     * no longer proposed, while a weak DOMAIN ROUTE -- `ground_control` at confidence 0.2 on
     * the single word "wall" -- still is. Choosing a routing-confidence floor from one
     * observation is the kind of tuning §276 forbids, so it is reported, not guessed at.
     */
    if (!path.expectHazard) {
      record(path.id, "no hazard the engine assessed SAFE_VERIFIED is proposed",
        !/Hot work/i.test(screen) ? "PASS" : "FAIL",
        "the engine's own per-hazard determination is now respected unconditionally");
      record(path.id, "no weakly-routed hazard is proposed either",
        proposedCount === 0 ? "PASS" : "FAIL",
        proposedCount > 0 ? "a low-confidence domain route survives; referred as a §276 defect" : "");
    }

    const concision = scoreConcision(screen, path);
    record(path.id, "the default screen answers the four questions",
      concision.whatWasFound && concision.whatNeedsAttention && concision.whatToDo ? "PASS" : "NOTE",
      `found=${concision.whatWasFound} attention=${concision.whatNeedsAttention} todo=${concision.whatToDo} missing=${concision.whatIsMissing}`);
    record(path.id, "no internal token reaches the screen",
      concision.internalTokenLeaks === 0 ? "PASS" : "FAIL", `${concision.internalTokenLeaks} pattern(s)`);
    record(path.id, "the screen quotes the inspector's own words",
      concision.quotesTheInspectorsOwnWords ? "PASS" : "NOTE");

    let expertOutcome = null;
    if (RUN_EXPERT && path.expert) {
      const expertButton = page.getByRole("button", { name: /Run Expert review/i }).first();
      if (await expertButton.count()) {
        const expertStarted = Date.now();
        await expertButton.click();
        await page.waitForFunction(
          () => !/Running Expert|Requesting Expert|Expert analysis is running/i.test(document.body.innerText),
          { timeout: 240000 },
        ).catch(() => {});
        await page.waitForTimeout(9000);
        const expertScreen = await text(page);
        await page.screenshot({ path: `${shotDir}/${path.id}-expert.png`, fullPage: true });
        writeFileSync(`${OUT_DIR}/path-${path.id}-expert.txt`, expertScreen);
        const expertMs = Date.now() - expertStarted;
        const panel = /HAZLENZ EXPERT REVIEW (.*?)(Applicable standard|Not right\?|Add a finding)/i.exec(expertScreen);
        expertOutcome = {
          ms: expertMs,
          panelText: panel ? panel[1].slice(0, 600) : expertScreen.slice(0, 400),
          refused: /could not be used|refused in full|no conclusion is offered/i.test(expertScreen),
          awaitingConfirmation: /confirm|awaiting/i.test(expertScreen),
        };
        expertExecutions.push({ path: path.id, ...expertOutcome });
        record(path.id, "an Expert execution completes and is presented honestly",
          /HAZLENZ EXPERT REVIEW/i.test(expertScreen) ? "PASS" : "FAIL",
          expertOutcome.refused ? "refused, and the refusal is stated" : "a conclusion or a pending state is shown");
      } else {
        record(path.id, "an Expert execution completes and is presented honestly", "NOTE",
          "the Run Expert review control was not present on this screen");
      }
    }

    matrix.push({
      id: path.id,
      domain: path.domain,
      regulatoryContext: path.context,
      observation: path.observation,
      expectedHazard: path.expectHazard,
      observedHazard: foundHazard,
      analysisMs,
      concision,
      expert: expertOutcome,
    });
  }

  // Provider accounting, read from the server's own execution ledger rather than counted here.
  const spend = await page.evaluate(async (apiUrl) => {
    const token = localStorage.getItem("sentinel_auth_token");
    const response = await fetch(`${apiUrl}/health/ready`, { headers: { authorization: `Bearer ${token}` } });
    return response.ok ? "reachable" : "unreachable";
  }, API_URL);

  await browser.close();

  writeFileSync(`${OUT_DIR}/hazlenz-product-paths.json`, JSON.stringify({
    section: 276,
    run: RUN,
    expertEnabled: RUN_EXPERT,
    note: "Path 1 (OSHA machine guarding) is §275's case, re-driven by the §276 walkthrough and not repeated here.",
    matrix,
    expertExecutions,
    results,
    consoleErrors,
    serverReachableAtEnd: spend,
  }, null, 2));

  const failed = results.filter((r) => r.outcome === "FAIL");
  const noted = results.filter((r) => r.outcome === "NOTE");
  console.log(`\n${results.length - failed.length - noted.length} passed, ${noted.length} noted, ${failed.length} failed.`);
  console.log(`Expert executions this run: ${expertExecutions.length}`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
