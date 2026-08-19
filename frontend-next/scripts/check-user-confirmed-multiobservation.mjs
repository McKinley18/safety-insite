// Phase 8 — multi-observation E2E under an explicitly USER_CONFIRMED regulatory context.
//
// Closes the limitation disclosed at Checkpoint 2, where the multi-observation
// report was only ever verified with an UNKNOWN context. The root cause was in
// the harness, not the product: the prior script selected the context with
//   selectOption({ label: /General Industry/i })
// but Playwright's `label` option takes a string, not a RegExp, so the call
// threw and a trailing `.catch(() => {})` swallowed it. The inspection was then
// created with the default "unknown" and nobody noticed.
//
// This version selects by option VALUE and hard-asserts, before any observation
// is entered, that (a) the select actually holds the chosen regime and (b) the
// inspection row persisted it. Provenance is read from the live HazLenz
// responses rather than inferred.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { APP_URL, connectDb, createProAccount, signIn } from "./visual-acceptance-lib.mjs";

const outDir = process.env.OUT_DIR || "/tmp/user-confirmed";
mkdirSync(outDir, { recursive: true });

const REGIME = "osha-general-industry";
const REGIME_LABEL = "OSHA — General Industry";

const OBSERVATIONS = [
  "In the north warehouse aisle the emergency exit door is blocked by three stacked pallets, and a 55-gallon drum of solvent beside it carries no hazard label.",
  "In the maintenance bay the belt guard on the air compressor drive is missing and the belt and pulley are exposed to contact while the compressor is running.",
  "A portable extension cord powering a bench grinder has exposed copper conductors and remains energized where employees are working.",
];

const problems = [];
const provenanceSeen = [];
const contextValuesSeen = [];

const db = await connectDb();
const browser = await chromium.launch({ headless: true });
const findingTitles = (page) =>
  page.locator("section[aria-label='Findings in this inspection'] article p.font-bold").allInnerTexts();

let siteName = null;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  // Capture the regulatory context HazLenz actually evaluated under, straight
  // from the analysis responses.
  page.on("response", async (res) => {
    if (!/classify|analy[sz]e|hazlenz|review/i.test(res.url())) return;
    try {
      const body = await res.json();
      const ctx = body?.regulatoryContext;
      if (ctx?.provenance) {
        provenanceSeen.push(ctx.provenance);
        contextValuesSeen.push(ctx.value);
      }
    } catch { /* not JSON, or already consumed */ }
  });

  const account = await createProAccount(page, db, "userconfirmed");
  await signIn(page, account.email, account.password);

  // ---- Create the inspection with an explicit regime ----
  await page.goto(`${APP_URL}/inspections`, { waitUntil: "networkidle" });
  siteName = `User-confirmed site ${Date.now()}`;
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();

  const ctxSelect = page.getByLabel("Regulatory context").first();
  await ctxSelect.waitFor({ timeout: 15000 });
  await ctxSelect.selectOption(REGIME); // by value -- no silent regex miss
  const selected = await ctxSelect.inputValue();
  if (selected !== REGIME) {
    throw new Error(`regulatory context did not take: select holds "${selected}", expected "${REGIME}"`);
  }
  console.log(`[ctx] select holds ${selected}`);
  await page.screenshot({ path: `${outDir}/uc-01-context-selected.png`, fullPage: true });

  await page.getByRole("button", { name: /Full Inspection/ }).first().click();
  await page.getByRole("button", { name: /Start Full Inspection/ }).click();
  await page.waitForURL(/inspection-workspace/, { timeout: 30000 });

  // ---- Assert the inspection PERSISTED the regime before observing anything ----
  const persisted = await db.query(
    `SELECT i.id, i."regulatoryContext" ctx FROM inspection i
       JOIN site s ON s.id = i."siteId" WHERE s.name = $1 LIMIT 1`,
    [siteName],
  );
  if (!persisted.rows.length) throw new Error("inspection row not found");
  const persistedCtx = persisted.rows[0].ctx;
  console.log(`[ctx] persisted on inspection row: ${persistedCtx}`);
  if (persistedCtx !== REGIME) {
    throw new Error(`inspection persisted "${persistedCtx}", expected "${REGIME}" -- aborting rather than repeating the Checkpoint 2 UNKNOWN run`);
  }

  // ---- Observation 1 ----
  await page.locator("#observation").fill(OBSERVATIONS[0]);
  await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 90000 });
  await page.locator("[data-testid='add-finding']").waitFor({ timeout: 15000 });
  const afterObs1 = await findingTitles(page);

  // ---- Observations 2 and 3 via Add Finding ----
  for (const text of OBSERVATIONS.slice(1)) {
    await page.locator("[data-testid='add-finding']").click();
    await page.locator("[data-testid='additional-observation-banner']").waitFor();
    await page.locator("#observation").fill(text);
    await page.getByRole("button", { name: "Analyze and add this finding" }).click();
    await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 90000 });
    await page.waitForTimeout(1200);
  }
  const afterAll = await findingTitles(page);
  await page.screenshot({ path: `${outDir}/uc-02-all-findings.png`, fullPage: true });
  if (afterAll.length < 4) problems.push(`expected >=4 findings, got ${afterAll.length}`);
  for (const t of afterObs1) {
    if (!afterAll.includes(t)) problems.push(`observation-1 finding lost: ${t}`);
  }

  // ---- Reload restores context and findings ----
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 90000 });
  await page.waitForTimeout(1500);
  const afterReload = await findingTitles(page);
  if (JSON.stringify(afterReload) !== JSON.stringify(afterAll)) {
    problems.push(`finding order/count changed across reload: ${afterAll} -> ${afterReload}`);
  }

  // Visit each finding once.
  for (let i = await page.getByRole("button", { name: "Review this finding" }).count(); i > 0; i--) {
    await page.getByRole("button", { name: "Review this finding" }).first().click();
    await page.waitForTimeout(500);
  }

  // ---- Finalize every finding ----
  let guard = 0;
  while (guard++ < 14) {
    const remaining = await page.getByRole("button", { name: "Review this finding" }).count();
    if (await page.getByRole("heading", { name: "Corrective action" }).count()) break;
    const toRisk = page.getByRole("button", { name: "Continue to risk review" });
    if (await toRisk.count()) { await toRisk.click(); await page.waitForTimeout(600); }
    const confirm = page.getByRole("button", { name: "Confirm risk and finalize finding" });
    if (await confirm.count()) { await confirm.click(); await page.waitForTimeout(2500); }
    else if (!remaining) break;
  }

  // ---- Corrective action + report ----
  await page.getByRole("heading", { name: "Corrective action" }).waitFor({ timeout: 30000 });
  const permanent = page.locator("textarea").nth(1);
  if (!(await permanent.inputValue()).trim()) {
    await permanent.fill("Clear the obstruction, restore the guard, and remove damaged equipment from service.");
  }
  await page.getByRole("button", { name: "Complete inspection and generate report" }).click();
  await page.getByRole("heading", { name: /Durably saved|Report/i }).waitFor({ timeout: 120000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/uc-03-complete.png`, fullPage: true });

  // ---- Database truth ----
  const dbq = await db.query(
    `SELECT
       (SELECT count(*)::int FROM observations o JOIN inspection i ON i.id=o."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) observations,
       (SELECT count(*)::int FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1 AND f.status<>'superseded') active_findings,
       (SELECT count(*)::int FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1 AND f.status='superseded') superseded,
       (SELECT count(*)::int FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1 AND f."finalReviewId" IS NOT NULL) finalized,
       (SELECT count(*)::int FROM inspection_reports r JOIN inspection i ON i.id=r."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) reports,
       (SELECT i."regulatoryContext" FROM inspection i JOIN site s ON s.id=i."siteId" WHERE s.name=$1 LIMIT 1) regctx`,
    [siteName],
  );
  const counts = dbq.rows[0];
  if (counts.observations !== 3) problems.push(`expected 3 observations, got ${counts.observations}`);
  if (counts.superseded !== 0) problems.push(`${counts.superseded} finding(s) superseded`);
  if (counts.finalized !== counts.active_findings) problems.push(`finalized ${counts.finalized} != active ${counts.active_findings}`);
  if (counts.reports < 1) problems.push("no report row persisted");
  if (counts.regctx !== REGIME) problems.push(`inspection regulatoryContext drifted to ${counts.regctx}`);

  // ---- Provenance must never have degraded to inferred/unknown ----
  const badProvenance = provenanceSeen.filter((p) => p !== "USER_CONFIRMED");
  if (!provenanceSeen.length) problems.push("no HazLenz regulatoryContext provenance observed on the wire");
  if (badProvenance.length) problems.push(`non-USER_CONFIRMED provenance seen: ${[...new Set(badProvenance)].join(", ")}`);
  const badCtx = contextValuesSeen.filter((v) => v !== REGIME);
  if (badCtx.length) problems.push(`context drifted on the wire: ${[...new Set(badCtx)].join(", ")}`);

  // ---- Cross-regime leakage in the persisted findings ----
  const cites = await db.query(
    `SELECT f.* FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
       JOIN site s ON s.id=i."siteId" WHERE s.name=$1`,
    [siteName],
  );
  const blob = JSON.stringify(cites.rows);
  // 30 CFR = MSHA, 1926 = OSHA Construction. Neither belongs under General Industry.
  const mshaHits = (blob.match(/\b30\s*CFR\b/gi) || []).length;
  const constructionHits = (blob.match(/\b1926\.\d+/g) || []).length;
  if (mshaHits) problems.push(`MSHA (30 CFR) citation appears under ${REGIME}: ${mshaHits} occurrence(s)`);
  if (constructionHits) problems.push(`OSHA Construction (1926.x) citation appears under ${REGIME}: ${constructionHits}`);

  const result = {
    regime: REGIME, regimeLabel: REGIME_LABEL,
    selectValue: selected,
    persistedContext: persistedCtx,
    finalContext: counts.regctx,
    provenanceObserved: [...new Set(provenanceSeen)],
    provenanceSamples: provenanceSeen.length,
    contextValuesObserved: [...new Set(contextValuesSeen)],
    observations: counts.observations,
    activeFindings: counts.active_findings,
    supersededFindings: counts.superseded,
    finalizedFindings: counts.finalized,
    reports: counts.reports,
    findingTitlesAfterObservation1: afterObs1,
    findingTitlesAfterAll: afterAll,
    findingTitlesAfterReload: afterReload,
    mshaCitationHits: mshaHits,
    constructionCitationHits: constructionHits,
    passed: problems.length === 0,
    problems,
  };
  writeFileSync(`${outDir}/user-confirmed-result.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  problems.push(`fatal: ${String(error).slice(0, 400)}`);
  writeFileSync(`${outDir}/user-confirmed-result.json`, JSON.stringify({ passed: false, problems, siteName }, null, 2));
  console.error("FAILED:", error);
} finally {
  await browser.close();
  await db.end();
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(" -", p);
  process.exit(1);
}
console.log("\nUSER_CONFIRMED multi-observation E2E: PASS");
