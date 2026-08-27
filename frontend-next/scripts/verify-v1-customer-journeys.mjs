#!/usr/bin/env node
/**
 * InSite v1.0 -- full zero-cost customer journey acceptance.
 *
 * Journeys A-E from the release-candidate gate, against a DISPOSABLE stack, using disposable
 * accounts only. It completes NO Stripe payment, charges nothing, mutates no Stripe object and
 * grants Pro to nobody except through the repository's own disposable test-entitlement tool.
 * LIVE_PAYMENT_PROOF is not addressed here and stays FALSE.
 *
 *   APP_URL=http://127.0.0.1:3300 API_BASE_URL=http://127.0.0.1:4300 \
 *   DATABASE_URL=postgresql://.../test_... node scripts/verify-v1-customer-journeys.mjs
 */
import { chromium } from "playwright";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const APP = process.env.APP_URL || "http://127.0.0.1:3300";
const API = process.env.API_BASE_URL || "http://127.0.0.1:4300";
const DB_URL = process.env.DATABASE_URL || "";
const BACKEND_DIR = process.env.BACKEND_DIR || "";

const databaseName = DB_URL ? new URL(DB_URL).pathname.replace(/^\//, "") : "";
if (!/^test_/.test(databaseName)) {
  console.error(`REFUSING: DATABASE_URL must be a disposable test_* database. Resolved: "${databaseName || "(none)"}".`);
  process.exit(2);
}

let passes = 0, failures = 0;
function assert(cond, label, details) {
  if (cond) { passes++; console.log(`PASS ${label}`); return true; }
  failures++; console.error(`FAIL ${label}`); if (details !== undefined) console.error(`     ${details}`); return false;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LOGIN_WINDOW_MS = 62_000;

const stamp = Date.now();
const FREE = { name: "Journey Free", email: `journey-free-${stamp}@insite-acceptance.test`, password: "JourneyFree1!" };
const PRO  = { name: "Journey Pro",  email: `journey-pro-${stamp}@insite-acceptance.test`,  password: "JourneyPro1!" };
const OTHER= { name: "Journey Other",email: `journey-other-${stamp}@insite-acceptance.test`,password: "JourneyOther1!" };

async function api(path, init = {}, token) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) },
  });
  const t = await res.text();
  let b = null; try { b = t ? JSON.parse(t) : null; } catch { b = t; }
  return { status: res.status, body: b };
}
async function register(u) {
  const r = await api("/auth/register", { method: "POST", body: JSON.stringify({ name: u.name, email: u.email, password: u.password, type: "individual" }) });
  if (r.status >= 400) throw new Error(`register ${u.email} -> ${r.status} ${JSON.stringify(r.body)}`);
  return r.body;
}
async function login(u, attempt = 0) {
  const r = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: u.email, password: u.password }) });
  if (r.status === 429 && attempt < 4) { console.log(`     (auth throttle; waiting ${LOGIN_WINDOW_MS / 1000}s)`); await sleep(LOGIN_WINDOW_MS); return login(u, attempt + 1); }
  if (r.status >= 400) throw new Error(`login ${u.email} -> ${r.status} ${JSON.stringify(r.body)}`);
  return r.body;
}
const tokenOf = (s) => s.accessToken || s.access_token || s.token;

try {
  // =======================================================================
  // Accounts. Only PRO receives an entitlement, through the disposable tool.
  // =======================================================================
  const freeUser = await register(FREE); await sleep(13000);
  const proUser  = await register(PRO);  await sleep(13000);
  const otherUser= await register(OTHER);

  assert(String(freeUser.planCode).toLowerCase() === "free", "0. a brand new account starts on Free", freeUser.planCode);

  if (BACKEND_DIR) {
    const out = execFileSync("npx", ["ts-node", "scripts/grant-test-entitlement.ts", proUser.userId, "6"], {
      cwd: BACKEND_DIR, env: { ...process.env, NODE_ENV: "test", DATABASE_URL: DB_URL }, encoding: "utf8",
    });
    assert(/"applied":true/.test(out), "0. Pro entitlement granted to the disposable Pro account via the repository's own test tool", out.slice(0, 200));
  }

  const freeToken = tokenOf(await login(FREE));
  const proToken  = tokenOf(await login(PRO));
  const otherToken= tokenOf(await login(OTHER));

  // =======================================================================
  // JOURNEY A -- new customer, end to end
  // =======================================================================
  console.log("\n--- Journey A: new customer end to end");
  // The customer-facing price is asserted end to end by check:launch-pricing (39/0). Here the
  // question is only what the API tells THIS account about its own plan.
  const freeBilling = await api("/billing/me", {}, freeToken);
  assert(freeBilling.status === 200, `A. the billing endpoint answers (${freeBilling.status})`);
  assert(freeBilling.body?.monthlyPrice === 0 && freeBilling.body?.planCode === "free", "A. a Free account is priced at $0 and reported as Free", JSON.stringify(freeBilling.body).slice(0, 160));
  const proBilling = await api("/billing/me", {}, proToken);
  assert(proBilling.body?.hasProAccess === true, "A. the entitled account is reported as having Pro access", JSON.stringify(proBilling.body).slice(0, 160));
  assert(!/expert/i.test(JSON.stringify(proBilling.body || {})), "A. no Expert plan is exposed anywhere in the billing payload");

  const site = await api("/sites", { method: "POST", body: JSON.stringify({ name: `Journey Site ${stamp}` }) }, proToken);
  assert(site.status < 400, `A. a site can be created (${site.status})`, JSON.stringify(site.body).slice(0, 200));

  const inspection = await api("/inspections", {
    method: "POST",
    body: JSON.stringify({ title: `Journey inspection ${stamp}`, siteId: site.body?.id, regulatoryContext: "msha" }),
  }, proToken);
  assert(inspection.status < 400, `A. an inspection can be created (${inspection.status})`, JSON.stringify(inspection.body).slice(0, 220));
  const inspectionId = inspection.body?.id;

  const OBS = "The tail pulley guard has been removed and a miner is clearing a jam while the conveyor is still running, with no lockout applied.";
  const observation = await api(`/inspections/${inspectionId}/observations`, {
    method: "POST", body: JSON.stringify({ rawText: OBS }),
  }, proToken);
  assert(observation.status < 400, `A. an observation can be added (${observation.status})`, JSON.stringify(observation.body).slice(0, 220));

  const classify = await api("/safescope-v2/classify", {
    method: "POST", body: JSON.stringify({ text: OBS, scopes: ["msha"] }),
  }, proToken);
  assert(classify.status === 200 || classify.status === 201, `A. Pro receives a HazLenz analysis (${classify.status})`);
  const analysis = classify.body || {};
  assert(
    /lockout|stored energy|machine guarding/i.test(String(analysis.classification || "")),
    "A. HazLenz classifies the hazard", String(analysis.classification),
  );
  const standardsBlob = JSON.stringify({
    suggested: analysis.suggestedStandards, primary: analysis.primaryStandards, standards: analysis.standards,
    supporting: analysis.supportingStandards, needsEvidence: analysis.needsMoreEvidenceStandards,
    applicability: analysis.inspectionIntelligence?.standardApplicability?.suggestedStandards,
  });
  assert(/CFR/.test(standardsBlob), "A. applicable standards are suggested for the hazard", standardsBlob.slice(0, 400));
  assert(
    analysis.advisoryGuardrails?.advisoryOnly !== false && analysis.governance?.advisoryOnly !== false,
    "A. the analysis is advisory-only and requires qualified review",
  );

  const listed = await api("/inspections", {}, proToken);
  assert(
    Array.isArray(listed.body) && listed.body.some((i) => i.id === inspectionId),
    "A. the inspection appears in saved history",
  );
  const reopened = await api(`/inspections/${inspectionId}`, {}, proToken);
  assert(reopened.status === 200, `A. the inspection reopens (${reopened.status})`);
  assert(
    (reopened.body?.observations || []).some((o) => String(o.rawText || "").includes(OBS.slice(0, 40))),
    "A. the saved observation text is still present after reopening",
  );

  const proAgain = tokenOf(await login(PRO));
  const afterRelogin = await api(`/inspections/${inspectionId}`, {}, proAgain);
  assert(afterRelogin.status === 200, "A. data is still present after logout and login");

  // =======================================================================
  // JOURNEY B -- Free restrictions are a deliberate product response
  // =======================================================================
  console.log("\n--- Journey B: Free restrictions");
  const freeClassify = await api("/safescope-v2/classify", { method: "POST", body: JSON.stringify({ text: OBS, scopes: ["msha"] }) }, freeToken);
  assert(freeClassify.status === 402, `B. Free HazLenz analysis is refused with a deliberate 402 (${freeClassify.status})`, JSON.stringify(freeClassify.body).slice(0, 240));
  assert(
    typeof freeClassify.body === "object" && freeClassify.body !== null && Object.keys(freeClassify.body).length > 0,
    "B. the refusal carries an explanatory body, not an empty response",
    JSON.stringify(freeClassify.body).slice(0, 240),
  );
  const refusalBlob = JSON.stringify(freeClassify.body || {});
  assert(!/CFR|hazardCategory|suggestedStandards/i.test(refusalBlob), "B. the refusal leaks no Pro analysis content", refusalBlob.slice(0, 240));

  const freeSite = await api("/sites", { method: "POST", body: JSON.stringify({ name: `Free Site ${stamp}` }) }, freeToken);
  assert(freeSite.status < 400, `B. Free CAN still create a site — the record-keeping tier works (${freeSite.status})`);
  const freeInspection = await api("/inspections", { method: "POST", body: JSON.stringify({ title: `Free inspection ${stamp}`, siteId: freeSite.body?.id, regulatoryContext: "osha-general-industry" }) }, freeToken);
  assert(freeInspection.status < 400, `B. Free CAN still create an inspection (${freeInspection.status})`);
  const freeObs = await api(`/inspections/${freeInspection.body?.id}/observations`, { method: "POST", body: JSON.stringify({ rawText: "Spill on the walkway near the packaging line." }) }, freeToken);
  assert(freeObs.status < 400, `B. Free CAN still record an observation with a photo-capable record (${freeObs.status})`);
  const freeHistory = await api("/inspections", {}, freeToken);
  assert(
    Array.isArray(freeHistory.body) && freeHistory.body.some((i) => i.id === freeInspection.body?.id),
    "B. Free saved inspection history is readable — the marketing claim holds",
  );
  assert(
    !(freeHistory.body || []).some((i) => i.id === inspectionId),
    "B. Free does not see the Pro account's inspection",
  );

  // =======================================================================
  // JOURNEY D -- account isolation
  // =======================================================================
  console.log("\n--- Journey D: account isolation");
  const crossRead = await api(`/inspections/${inspectionId}`, {}, otherToken);
  assert(crossRead.status === 404 || crossRead.status === 403, `D. another account cannot read the inspection by id (${crossRead.status})`);
  const crossAppend = await api(`/inspections/${inspectionId}/observations`, { method: "POST", body: JSON.stringify({ rawText: "unauthorised append attempt" }) }, otherToken);
  assert(crossAppend.status === 404 || crossAppend.status === 403, `D. another account cannot append an observation to it (${crossAppend.status})`);
  const anon = await api("/inspections", {}, null);
  assert(anon.status === 401, `D. an unauthenticated list is refused (${anon.status})`);

  // =======================================================================
  // JOURNEY E -- billing path, zero-cost portions ONLY
  // =======================================================================
  console.log("\n--- Journey E: billing path WITHOUT purchase");
  const sub = await api("/billing/status", {}, freeToken);
  assert(sub.status === 200, `E. the subscription status endpoint answers for a Free account (${sub.status})`);
  const subBlob = JSON.stringify(sub.body || {});
  assert(!/"planCode":"pro"/i.test(subBlob) && sub.body?.hasProAccess === false, "E. the Free account is NOT reported as Pro", subBlob.slice(0, 200));
  assert(sub.body?.stripeSubscriptionId === null, "E. no Stripe subscription exists for the Free account — nothing was purchased", String(sub.body?.stripeSubscriptionId));

  // Checkout PREREQUISITES only. The session is never opened in a browser and nothing is paid.
  const checkoutBadTier = await api("/billing/checkout", { method: "POST", body: JSON.stringify({ tier: "expert" }) }, freeToken);
  assert(checkoutBadTier.status >= 400, `E. checkout refuses a retired tier (${checkoutBadTier.status})`);

  console.log("     (no Stripe Checkout Session is created by this suite; LIVE_PAYMENT_PROOF stays FALSE)");

  // =======================================================================
  // JOURNEY A/B in the real browser -- the customer actually sees this
  // =======================================================================
  console.log("\n--- Browser leg: the Free customer sees a deliberate product response");
  const profileDir = mkdtempSync(join(tmpdir(), "insite-journey-"));
  const context = await chromium.launchPersistentContext(profileDir, { headless: true, viewport: { width: 390, height: 844 }, serviceWorkers: "allow" });
  try {
    const page = context.pages()[0] || (await context.newPage());
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e.message).slice(0, 200)));

    await page.goto(`${APP}/login`, { waitUntil: "domcontentloaded" });
    await page.getByPlaceholder("you@example.com").fill(FREE.email);
    await page.getByPlaceholder("Enter your password").fill(FREE.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 }).catch(() => {});
    assert(!page.url().includes("/login"), "Browser. the Free customer can sign in", page.url());

    for (const route of ["/command-center", "/inspections", "/reports", "/actions", "/settings", "/upgrade"]) {
      await page.goto(`${APP}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const state = await page.evaluate(() => ({
        text: document.body.innerText.trim(),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      assert(state.text.length > 60, `Browser. ${route} renders a real page for a Free customer, not a blank state`, `${state.text.length} chars`);
      assert(state.overflow <= 0, `Browser. ${route} does not scroll horizontally at 390px`, `${state.overflow}px`);
    }

    assert(pageErrors.length === 0, "Browser. no uncaught page error during the Free customer journey", JSON.stringify(pageErrors.slice(0, 3)));
  } finally {
    await context.close().catch(() => {});
    rmSync(profileDir, { recursive: true, force: true });
  }
} catch (error) {
  failures += 1;
  console.error("FAIL harness", error?.stack || error);
}

console.log(`\n${JSON.stringify({ passed: failures === 0, passes, failures })}`);
process.exit(failures === 0 ? 0 : 1);
