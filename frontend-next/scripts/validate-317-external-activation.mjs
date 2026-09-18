// §317 — THE EXTERNAL-USER ACTIVATION GATE.
//
// ===================================================================================================
// WHAT THIS ANSWERS, AND WHY IT IS NOT THE PAGE-REVIEW INSTRUMENT.
//
// `review-317-external-activation.mjs` MEASURES surfaces: widths, themes, contrast, focus, overflow.
// This one ASSERTS behaviour, and every case is written so that it fails on the code that existed
// before §317 repaired it. A review says what a page looks like; this says whether a person who has
// never existed in the database can get from nothing to a finished report without anybody helping
// them, and whether the product tells them the truth on the way.
//
// EVERY RUN CREATES ITS OWN PARTICIPANT. Nothing here reuses an account, a site, an inspection or a
// grant, because an assertion that passes only against state a previous run left behind is an
// assertion about the operator, not about the product. The only thing the environment must supply is
// a database built by MIGRATIONS ALONE and a server started against it.
//
// ===================================================================================================
// THE TWO REGRESSIONS THAT ARE THE POINT OF THE FILE.
//
// EXP-2. Production carries EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE=1, so the second Expert request
// an external participant makes in a day is refused. §317 measured the refusal arriving correctly
// from the server -- 503, a sentence written for the inspector, `providerCallsMade: 0` -- and the
// interface showing NOTHING: the panel set the message and then immediately cleared it with the
// reconciling read. EXP-2 fails on that code.
//
// RP-1. `riskPolicy` was held only in the memory of the session that saved the review, so reopening
// a saved inspection and pressing Finish produced "The governed risk urgency policy was not returned
// by the server" and no report, forever. RP-1 reopens the inspection in a NEW BROWSER CONTEXT for
// exactly that reason -- running it in the session that saved the review would pass on the broken
// code and prove nothing.
//
// ===================================================================================================
// NO PROVIDER CALLS, AND THAT IS ENFORCED RATHER THAN INTENDED.
//
// The gate REFUSES TO RUN unless the server reports Expert execution disabled, which is checked
// before any Expert case. The kill switch is evaluated before the pre-spend claim (§268), so a
// refused request cannot reach a transport. Nothing here sets that variable: a run against a server
// where Expert execution is live is a run that could spend money, and it is stopped rather than
// adapted.
//
// Usage:
//   APP_URL=... API_URL=... OUT_DIR=<dir> [PROMO_CODE=...] \
//     node scripts/validate-317-external-activation.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP = process.env.APP_URL || "http://localhost:3000";
const API = process.env.API_URL || "http://localhost:4000";
const OUT = process.env.OUT_DIR || "/tmp/insite-317-gate";
const PROMO_CODE = process.env.PROMO_CODE || "";
mkdirSync(`${OUT}/screenshots`, { recursive: true });

const STAMP = `${Date.now()}`;
const PASSWORD = "Section317!Fresh";
const FREE_EMAIL = `s317.gate.free.${STAMP}@example.invalid`;
const PRO_EMAIL = `s317.gate.pro.${STAMP}@example.invalid`;

const cases = [];
const terseStates = [];
function record(id, title, passed, evidence) {
  cases.push({ id, title, passed, evidence });
  console.log(`${passed ? "PASS" : "FAIL"}  ${id}  ${title}`);
  if (!passed) console.log(`        ${JSON.stringify(evidence).slice(0, 700)}`);
}
function abort(reason) {
  console.error(`\nREFUSED TO RUN: ${reason}`);
  writeFileSync(`${OUT}/section-317-gate.json`, JSON.stringify(
    { refusedToRun: reason, measuredAt: new Date().toISOString(), cases }, null, 2));
  process.exit(2);
}

async function api(path, init = {}, token = null) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 400) }; }
  return { status: response.status, body };
}

// ---------------------------------------------------------------------------------------------
// PRECONDITION. See the header: this is a refusal, not a skip.
// ---------------------------------------------------------------------------------------------
const ready = await api("/health/ready");
if (ready.status >= 400) abort(`/health/ready answered ${ready.status}`);
const expertProbe = await api("/inspections/observations/00000000-0000-0000-0000-000000000000/expert-analyses",
  { method: "POST", body: JSON.stringify({ idempotencyKey: "s317-precondition" }) });
if (expertProbe.status !== 401) {
  abort(`an unauthenticated Expert request answered ${expertProbe.status}, expected 401 — the `
    + "server is not in the shape this gate was written against");
}

// ---------------------------------------------------------------------------------------------
// THE AGREEMENT, READ FROM THE SERVER'S OWN REGISTRY.
// Hard-coding the id and version here would make every registration case a test of this file's
// memory of the registry rather than of the registry.
// ---------------------------------------------------------------------------------------------
const agreements = await api("/agreements");
const required = (agreements.body?.agreements || [])
  .filter((a) => a.requiredAtRegistration !== false && a.agreementId)
  .map((a) => ({ agreementId: a.agreementId, agreementVersion: a.version || a.agreementVersion }));
if (required.length === 0) {
  abort("GET /agreements returned nothing required at registration. Registering without an "
    + "acceptance would then be legitimate and FU-1 would be vacuous, so the run stops rather "
    + "than reporting a pass it did not earn.");
}
console.log(`required agreements: ${required.map((a) => `${a.agreementId} v${a.agreementVersion}`).join(", ")}`);

// ---------------------------------------------------------------------------------------------
// FU — THE FRESH-USER HARD GATE.
// ---------------------------------------------------------------------------------------------
const noAgreement = await api("/auth/register", {
  method: "POST",
  body: JSON.stringify({
    name: "Refused Participant", email: `s317.gate.refused.${STAMP}@example.invalid`,
    password: PASSWORD, type: "individual",
  }),
});
record("FU-1", "registration is refused without agreement acceptance, and the refusal names the agreement",
  noAgreement.status === 400 && /Acceptance of/i.test(String(noAgreement.body?.message || "")),
  { status: noAgreement.status, message: noAgreement.body?.message });

const registered = await api("/auth/register", {
  method: "POST",
  body: JSON.stringify({
    name: "Gate Participant", email: FREE_EMAIL, password: PASSWORD,
    type: "individual", acceptedAgreements: required,
  }),
});
record("FU-2", "a participant who has never existed registers with no operator involvement",
  registered.status < 400, { status: registered.status, body: registered.body });
if (registered.status >= 400) abort("the fresh participant could not be created");

const loggedIn = await api("/auth/login", {
  method: "POST", body: JSON.stringify({ email: FREE_EMAIL, password: PASSWORD }),
});
const freeToken = loggedIn.body?.token || loggedIn.body?.accessToken || null;
record("FU-3", "the new participant can sign in immediately, with no activation step",
  Boolean(freeToken), { status: loggedIn.status });
if (!freeToken) abort("the fresh participant could not sign in");

const freeBilling = await api("/billing/status", {}, freeToken);
record("FU-4", "a new account starts with NO entitlement and NO subscription, and says so",
  freeBilling.body?.tier === "free"
  && freeBilling.body?.status === "none"
  && freeBilling.body?.hasProAccess === false
  && freeBilling.body?.entitlements?.quickCapture === true
  && freeBilling.body?.entitlements?.fullSafeScope === false,
  {
    tier: freeBilling.body?.tier, status: freeBilling.body?.status,
    tierSource: freeBilling.body?.tierSource, accessSource: freeBilling.body?.accessSource,
    hasProAccess: freeBilling.body?.hasProAccess,
    quickCapture: freeBilling.body?.entitlements?.quickCapture,
    fullSafeScope: freeBilling.body?.entitlements?.fullSafeScope,
  });

const site = await api("/sites", {
  method: "POST", body: JSON.stringify({ name: `S317 Gate Site ${STAMP}` }),
}, freeToken);
record("FU-5", "the participant creates their own first site; no site is pre-created for them",
  site.status < 400 && Boolean(site.body?.id), { status: site.status, body: site.body });

const inspection = site.body?.id ? await api("/inspections", {
  method: "POST",
  body: JSON.stringify({
    siteId: site.body.id, title: "Quick Capture",
    regulatoryContext: "osha-general-industry",
  }),
}, freeToken) : { status: 0, body: null };
record("FU-6", "the participant creates their own first inspection",
  inspection.status < 400 && Boolean(inspection.body?.id),
  { status: inspection.status, id: inspection.body?.id });

const observation = inspection.body?.id ? await api(`/inspections/${inspection.body.id}/observations`, {
  method: "POST",
  body: JSON.stringify({
    rawText: "Unguarded rotating shaft on the conveyor drive at the head pulley. No barrier "
      + "guard is fitted and the in-running nip point is reachable from the walkway.",
    evidenceSource: "direct_observation",
  }),
}, freeToken) : { status: 0, body: null };
record("FU-7", "the participant records an observation against that inspection",
  observation.status < 400 && Boolean(observation.body?.id),
  { status: observation.status, id: observation.body?.id });

// ---------------------------------------------------------------------------------------------
// EN — THE ENTITLEMENT BOUNDARY. What an operator can and cannot do without touching the database.
// ---------------------------------------------------------------------------------------------
const grantAttempt = await api("/admin/entitlement-grants", {
  method: "POST",
  body: JSON.stringify({
    userId: registered.body?.user?.id || registered.body?.id || "00000000-0000-0000-0000-000000000000",
    source: "pilot", tier: "pro", reason: "s317 gate probe",
    endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  }),
}, freeToken);
record("EN-1", "an ordinary participant cannot grant themselves an entitlement",
  grantAttempt.status === 403, { status: grantAttempt.status, message: grantAttempt.body?.message });

const revokeAttempt = await api("/admin/entitlement-grants/00000000-0000-0000-0000-000000000000", {
  method: "DELETE", body: JSON.stringify({ reason: "s317 gate probe" }),
}, freeToken);
record("EN-2", "an ordinary participant cannot revoke an entitlement either",
  revokeAttempt.status === 403, { status: revokeAttempt.status, message: revokeAttempt.body?.message });

let proToken = null;
if (PROMO_CODE) {
  const promoReg = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Comped Participant", email: PRO_EMAIL, password: PASSWORD,
      type: "individual", promoCode: PROMO_CODE, acceptedAgreements: required,
    }),
  });
  const promoLogin = await api("/auth/login", {
    method: "POST", body: JSON.stringify({ email: PRO_EMAIL, password: PASSWORD }),
  });
  proToken = promoLogin.body?.token || null;
  const promoBilling = proToken ? await api("/billing/status", {}, proToken) : { body: {} };
  const endsAt = promoBilling.body?.entitlementExpiresAt
    ? new Date(promoBilling.body.entitlementExpiresAt).getTime() : 0;
  const days = (endsAt - Date.now()) / 86400000;
  record("EN-3", "a configured promo code confers Pro through a BOUNDED grant, with no database change",
    promoReg.status < 400 && promoBilling.body?.tier === "pro"
    && promoBilling.body?.tierSource === "grant"
    && days > 0 && days <= 30,
    {
      registration: promoReg.status, tier: promoBilling.body?.tier,
      tierSource: promoBilling.body?.tierSource, accessSource: promoBilling.body?.accessSource,
      entitlementExpiresAt: promoBilling.body?.entitlementExpiresAt, days: Number(days.toFixed(2)),
    });
  record("EN-4", "the comped account carries NO subscription, so nothing may present it as a purchase",
    promoBilling.body?.status === "none" && promoBilling.body?.stripeSubscriptionId === null,
    { status: promoBilling.body?.status, stripeSubscriptionId: promoBilling.body?.stripeSubscriptionId });
} else {
  record("EN-3", "a configured promo code confers Pro through a BOUNDED grant, with no database change",
    false, "NOT EXERCISED: PROMO_CODE was not supplied, so the comped path was not reachable. "
      + "This is recorded as a failure rather than a skip, because an unexercised entitlement path "
      + "is exactly the thing a Beta activation decision must not be made on.");
}

// ---------------------------------------------------------------------------------------------
// BROWSER CASES.
// ---------------------------------------------------------------------------------------------
const browser = await chromium.launch();
async function session(email) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const http = [];
  page.on("response", (r) => { if (r.status() >= 400) http.push(`${r.request().method()} ${r.status()} ${r.url().replace(API, "API")}`); });
  await page.goto(`${APP}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 20000 });
  if (email) {
    await page.fill('input[autocomplete="email"]', email);
    await page.fill('input[autocomplete="current-password"]', PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 });
    await page.waitForTimeout(1500);
  }
  return { context, page, http };
}

// ---- CPF3-1. /login, O-14.
{
  const { context, page } = await session(null);
  const type = await page.getAttribute('input[autocomplete="email"]', "type");
  record("CPF3-1", "/login — the email field is type=email (O-14)", type === "email", { type });
  await context.close();
}

// ---- DN — direct navigation, signed out, to every authenticated route.
const AUTHED_ROUTES = [
  "/command-center", "/inspections", "/settings", "/profile", "/reports",
  "/safety-calendar", "/inspection-workspace", "/inspection-complete", "/upgrade",
  "/unlock", "/field-capture",
];
{
  const { context, page } = await session(null);
  const offenders = [];
  const withoutRecovery = [];
  for (const route of AUTHED_ROUTES) {
    await page.goto(`${APP}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    const m = await page.evaluate(() => {
      const t = (document.body.innerText || "").trim();
      return {
        length: t.length,
        stuck: /^(loading|please wait)\W*$/i.test(t),
        raw: ["Internal server error", "Application error", "Unhandled Runtime Error",
          "TypeError:", "ReferenceError:", "ECONNREFUSED"].filter((n) => t.includes(n)),
        /**
         * "ACCIDENTAL PRIVILEGED CONTENT", MEASURED AS THE AUTHENTICATED SHELL RENDERING.
         *
         * The first version of this matched prose -- including "corrective actions", which the
         * SIGN-IN page's own marketing sentence contains -- and reported every route as leaking
         * privileged content while every one of them had correctly redirected to /login. A phrase
         * search over customer copy cannot answer this question. The authenticated shell's primary
         * navigation can: it is rendered only inside the signed-in layout, so its presence on a
         * signed-out page is the actual failure being looked for.
         */
        privileged: (() => {
          const labels = Array.from(document.querySelectorAll("nav a, nav button"))
            .map((el) => (el.textContent || "").trim());
          const shell = ["Home", "Inspect", "Reports", "Calendar", "Settings"];
          return shell.filter((l) => labels.includes(l)).length >= 4;
        })(),
        // A route out. Not a §317 acceptance criterion, and recorded rather than failed.
        hasRecoveryAction: document.querySelectorAll("a[href], button").length > 0,
      };
    });
    const landed = new URL(page.url()).pathname;
    // "BLANK" MEANS BLANK. 40 characters is below anything this product renders -- the tersest
    // system state in it is longer -- and above an empty shell. The earlier 200-character
    // threshold was this file's invention and it failed a page that says one honest sentence.
    if (m.length < 40 || m.stuck || m.raw.length || m.privileged) {
      offenders.push({ route, landed, ...m });
    }
    if (!m.hasRecoveryAction) withoutRecovery.push({ route, landed });
  }
  record("DN-1", "signed out, every authenticated route renders something honest — no blank page, "
    + "no stuck loading state, no raw server error, no privileged content",
    offenders.length === 0, offenders);
  record("DN-1b", "and every one of them offers a way out",
    withoutRecovery.length === 0, withoutRecovery);
  await context.close();
}

// ---- DN-2 — signed in, direct navigation AND a browser refresh on each route.
{
  const { context, page, http } = await session(FREE_EMAIL);
  const offenders = [];
  const terse = [];
  for (const route of AUTHED_ROUTES) {
    for (const mode of ["direct", "refresh"]) {
      await page.goto(`${APP}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2200);
      if (mode === "refresh") { await page.reload({ waitUntil: "domcontentloaded" }); await page.waitForTimeout(2200); }
      const m = await page.evaluate(() => {
        const t = (document.body.innerText || "").trim();
        return {
          length: t.length,
          stuck: /^(loading|please wait)\W*$/i.test(t),
          raw: ["Internal server error", "Application error", "Unhandled Runtime Error",
            "TypeError:", "ReferenceError:", "ECONNREFUSED"].filter((n) => t.includes(n)),
          head: t.slice(0, 160).replace(/\n+/g, " | "),
        };
      });
      if (m.length < 40 || m.stuck || m.raw.length) offenders.push({ route, mode, ...m });
      // Recorded, not failed. A route that renders one honest sentence passes §317's four
      // criteria and is still a place an external participant can arrive at and stall, so the
      // measurement is kept where a reader can see it rather than dropped because it passed.
      if (m.length < 200 && mode === "direct") terse.push({ route, length: m.length, text: m.head });
    }
  }
  const serverErrors = http.filter((line) => / 5\d\d /.test(line));
  record("DN-2", "signed in, every critical route survives direct navigation and a browser refresh",
    offenders.length === 0, offenders);
  record("DN-3", "and none of it produced a 5xx",
    serverErrors.length === 0, serverErrors);
  console.log(`        terse system states (recorded, not failed): ${JSON.stringify(terse)}`);
  terseStates.push(...terse);
  await context.close();
}

// ---- SE-1 — AN EXPIRED SESSION, AND THE THREE THINGS THAT MUST BE TRUE OF IT.
//
// The original version of this case asserted an immediate redirect, which is not what the product
// does and not the property that matters. What matters, on a safety product, is that an expired
// session never produces a VERIFIED ZERO: "0 overdue" because the server said so and "0 overdue"
// because the request was refused are the same characters and opposite facts, and D-041 exists to
// keep them apart. So the case asserts what the product actually owes: no unqualified figure, the
// dead session cleared rather than kept, and sign-in on the next navigation.
{
  const { context, page } = await session(FREE_EMAIL);
  await page.evaluate(() => {
    localStorage.setItem("sentinel_auth_token", "expired.invalid.token");
    localStorage.setItem("sentinel_auth_refresh_token", "expired.invalid.refresh");
  });
  await page.goto(`${APP}/command-center`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  const m = await page.evaluate(() => {
    const t = document.body.innerText || "";
    const tiles = ["INSPECTIONS", "FINDINGS", "OPEN ACTIONS", "OVERDUE ACTIONS"];
    return {
      // Every figure must carry a state caption. An uncaptioned zero is the D-041 defect.
      uncaptioned: tiles.filter((name) => {
        const index = t.indexOf(name);
        if (index < 0) return false;
        const after = t.slice(index, index + 120);
        return !/Last synced|Unavailable|Pending sync|Sync conflict|—/.test(after);
      }),
      raw: ["Internal server error", "Application error"].filter((n) => t.includes(n)),
      tokenCleared: localStorage.getItem("sentinel_auth_token") === null,
    };
  });
  record("SE-1", "an expired session never renders an unqualified zero — every stale figure says "
    + "what kind of figure it is",
    m.uncaptioned.length === 0 && m.raw.length === 0, m);
  record("SE-2", "and the dead session is cleared rather than kept",
    m.tokenCleared === true, { tokenCleared: m.tokenCleared });
  await page.goto(`${APP}/command-center`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const landed = new URL(page.url()).pathname;
  record("SE-3", "so the next navigation lands on sign-in", landed === "/login", { landed });
  await context.close();
}

// ---- RC — THE RECOVERY SURFACE, AGAINST WHAT THE SERVICE CAN ACTUALLY DO.
//
// §317: "Do not pretend password recovery is operational if email cannot be delivered." The two
// halves are asserted separately, because they pull in opposite directions and both must hold:
// the PAGE must stop promising a message it cannot send, and the API must go on answering every
// address identically, so that telling the truth about the service does not start telling the
// truth about which accounts exist.
{
  const capability = (ready.body?.passwordResetEmail?.state) || "UNKNOWN";
  const { context, page } = await session(null);
  await page.goto(`${APP}/forgot-password`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const m = await page.evaluate(() => {
    const notice = document.querySelector('[data-testid="recovery-unavailable"]');
    const submit = document.querySelector('form button[type="submit"]');
    return {
      noticeShown: Boolean(notice),
      noticeText: (notice?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 200),
      submitDisabled: submit ? submit.disabled === true : null,
      promisesSend: /will be sent|We.ll send reset instructions/i.test(document.body.innerText || ""),
    };
  });
  if (capability === "CONFIGURED") {
    record("RC-1", "password reset email IS configured, so the recovery form is offered",
      m.noticeShown === false && m.submitDisabled === false, { capability, ...m });
  } else {
    record("RC-1", "password reset email is NOT configured, so the page says so and does not offer "
      + "a form whose success message would be false",
      m.noticeShown === true && m.submitDisabled === true && m.promisesSend === false,
      { capability, ...m });
  }
  await page.screenshot({ path: `${OUT}/screenshots/recovery-surface.png`, fullPage: true });
  await context.close();

  // The generic response is a SECURITY property (§306) and must survive the change above.
  const known = await api("/auth/password-reset/request", {
    method: "POST", body: JSON.stringify({ email: FREE_EMAIL }),
  });
  const unknown = await api("/auth/password-reset/request", {
    method: "POST", body: JSON.stringify({ email: `nobody.${STAMP}@example.invalid` }),
  });
  const variant = await api("/auth/password-reset/request", {
    method: "POST", body: JSON.stringify({ email: FREE_EMAIL.toUpperCase() }),
  });
  record("RC-2", "and the API still answers a known, an unknown and a case-variant address "
    + "identically",
    known.status === unknown.status && known.status === variant.status
    && JSON.stringify(known.body) === JSON.stringify(unknown.body)
    && JSON.stringify(known.body) === JSON.stringify(variant.body),
    { known: known.status, unknown: unknown.status, variant: variant.status, body: known.body });
}

// ---- CPF3-2 — /inspections: O-4, O-5, O-6, O-7.
{
  const { context, page } = await session(FREE_EMAIL);
  await page.goto(`${APP}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const m = await page.evaluate(() => {
    const body = document.body.innerText || "";
    const clipped = Array.from(document.querySelectorAll("article.inspection-workflow-card p"))
      .filter((el) => el.scrollHeight > el.clientHeight + 1)
      .map((el) => el.innerText.slice(0, 60));
    // O-4: the heading and the first form control inside the START card, on one left edge.
    const heading = Array.from(document.querySelectorAll("h2"))
      .find((h) => /Choose inspection type/i.test(h.innerText || ""));
    const control = document.querySelector('select[aria-label="Saved site"]');
    return {
      clipped,
      headingLeft: heading ? Math.round(heading.getBoundingClientRect().left) : null,
      controlLeft: control ? Math.round(control.getBoundingClientRect().left) : null,
      persistedVocabulary: body.includes("persisted"),
      // O-6: the footnote must not say one context twice.
      contextRepeats: (body.match(/Regulatory context not established/g) || []).length,
    };
  });
  record("CPF3-2a", "/inspections — the START card's heading and its controls share one left edge (O-4)",
    m.headingLeft !== null && m.controlLeft !== null && Math.abs(m.headingLeft - m.controlLeft) <= 2,
    { headingLeft: m.headingLeft, controlLeft: m.controlLeft });
  record("CPF3-2b", "/inspections — no workflow description is clipped mid-sentence (O-5)",
    m.clipped.length === 0, m.clipped);
  record("CPF3-2c", "/inspections — no engineering vocabulary on the customer surface (O-7)",
    m.persistedVocabulary === false, { persistedVocabulary: m.persistedVocabulary });
  record("CPF3-2d", "/inspections — the regulatory footnote states one context once (O-6)",
    m.contextRepeats <= 1, { occurrences: m.contextRepeats });
  await page.screenshot({ path: `${OUT}/screenshots/cpf3-inspections.png`, fullPage: true });
  await context.close();
}

// ---- CPF3-3 — /settings: O-10, O-11.
{
  const { context, page } = await session(FREE_EMAIL);
  await page.goto(`${APP}/settings`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const body = await page.evaluate(() => document.body.innerText || "");
  const rawStatus = /\bnone\b/.test(body);
  const vendor = ["Stripe", "Resend", "Render", "Vercel", "Neon"].filter((v) => body.includes(v));
  record("CPF3-3a", "/settings — no raw subscription status code on the customer surface (O-10)",
    rawStatus === false, { bodyHasRawNone: rawStatus });
  record("CPF3-3b", "/settings — no internal vendor named to the customer (O-11)",
    vendor.length === 0, vendor);
  await page.screenshot({ path: `${OUT}/screenshots/cpf3-settings.png`, fullPage: true });
  await context.close();
}

// ---- EXP — the Expert boundary, and the refusal the customer must be able to SEE.
// ---- RP  — an inspection reopened in a NEW session can still be finished.
if (proToken) {
  const site2 = await api("/sites", {
    method: "POST", body: JSON.stringify({ name: `S317 Expert Site ${STAMP}` }),
  }, proToken);
  const insp2 = await api("/inspections", {
    method: "POST",
    body: JSON.stringify({
      siteId: site2.body.id, title: "Full Inspection", regulatoryContext: "osha-general-industry",
    }),
  }, proToken);
  const obs2 = await api(`/inspections/${insp2.body.id}/observations`, {
    method: "POST",
    body: JSON.stringify({
      rawText: "Unguarded rotating shaft on the conveyor drive at the head pulley. No barrier "
        + "guard is fitted and the in-running nip point is reachable from the walkway.",
      evidenceSource: "direct_observation",
    }),
  }, proToken);

  /**
   * THE KILL-SWITCH CHECK IS DONE ON THE API FIRST, AND IT IS A GATE ON THE BROWSER CASE.
   * If this server would actually RUN an Expert analysis, the browser case below would click a
   * control that spends money. So the refusal is established here, and the run aborts if it is
   * absent rather than proceeding with a weaker assertion.
   */
  const expert = await api(`/inspections/observations/${obs2.body.id}/expert-analyses`, {
    method: "POST", body: JSON.stringify({ idempotencyKey: `s317-gate-api-${STAMP}` }),
  }, proToken);
  record("EXP-1", "an Expert request that cannot run is refused BEFORE any provider is reached",
    expert.status === 503 && expert.body?.providerCallsMade === 0
    && typeof expert.body?.code === "string",
    { status: expert.status, code: expert.body?.code, providerCallsMade: expert.body?.providerCallsMade });
  if (expert.status !== 503) {
    abort("Expert execution is NOT refused on this server. The gate will not drive the Expert "
      + "control, because doing so could reach a provider and spend money.");
  }
  record("EXP-1b", "and the refusal is worded for the inspector, not for a log",
    /deterministic HazLenz|nothing was charged/i.test(String(expert.body?.message || "")),
    { message: expert.body?.message });

  // --------------------------------------------------------------------------------------
  // THE JOURNEY, IN A BROWSER, THROUGH THE REAL CONTROLS.
  // --------------------------------------------------------------------------------------
  const first = await session(PRO_EMAIL);
  const page = first.page;
  await page.goto(`${APP}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const selects = await page.locator("select").all();
  await selects[0].selectOption({ label: `S317 Expert Site ${STAMP}` });
  await selects[1].selectOption({ index: 1 });
  await page.locator("article.inspection-workflow-card", { hasText: "Full Inspection" })
    .locator("button").first().click();
  await page.waitForTimeout(1200);
  const start = page.getByRole("button", { name: /Start Full Inspection/i });
  record("RP-0", "a comped Pro participant is offered the Pro workflow rather than an upgrade wall",
    (await start.count()) > 0, { startControls: await start.count() });
  if (await start.count()) {
    await start.first().click();
    await page.waitForTimeout(5000);

    const areas = await page.locator("textarea").all();
    await areas[0].fill("Unguarded rotating shaft on the conveyor drive at the head pulley. No "
      + "barrier guard is fitted and the in-running nip point is reachable from the walkway at "
      + "waist height.");
    await page.getByRole("button", { name: /Review with HazLenz/i }).first().click();
    await page.waitForTimeout(20000);

    const expertButton = page.getByRole("button", { name: /Run Expert review/i });
    if (await expertButton.count()) {
      await expertButton.first().click();
      await page.waitForTimeout(7000);
      const shown = await page.locator('[data-testid="expert-run-error"]').first()
        .innerText().catch(() => "");
      record("EXP-2", "a refused Expert run is VISIBLE to the inspector, and survives the "
        + "reconciling read that follows it",
        shown.trim().length > 0 && /nothing was charged|unavailable|limit/i.test(shown),
        { shown: shown.slice(0, 220) });
      await page.screenshot({ path: `${OUT}/screenshots/expert-refusal-visible.png`, fullPage: true });
    } else {
      record("EXP-2", "a refused Expert run is VISIBLE to the inspector", false,
        "the Expert control was not present after the deterministic analysis");
    }

    // Finish the review so there is a finalized finding to reopen against.
    const yes = page.getByRole("button", { name: /^Yes$/ });
    if (await yes.count()) { await yes.first().click(); await page.waitForTimeout(3000); }
    for (const label of [/Continue to risk/i, /Continue to review/i]) {
      const control = page.getByRole("button", { name: label });
      if (await control.count()) { await control.first().click(); await page.waitForTimeout(3500); }
    }
    const save = page.getByRole("button", { name: /^Save finding$/i });
    const saved = await save.count() > 0;
    if (saved) { await save.first().click(); await page.waitForTimeout(7000); }
    record("RP-1a", "the reviewer can save a finding", saved, { saveControlPresent: saved });
  }
  await first.context.close();

  /**
   * RP-1. A NEW BROWSER CONTEXT, DELIBERATELY.
   *
   * The whole defect was that the governed risk urgency policy lived only in the memory of the
   * session that saved the review. Reusing that session here would pass on the broken code. This
   * signs in again from nothing, reopens the saved inspection the way `Saved history` does, and
   * presses Finish.
   */
  const second = await session(PRO_EMAIL);
  const page2 = second.page;
  await page2.goto(`${APP}/inspections`, { waitUntil: "domcontentloaded" });
  await page2.waitForTimeout(3000);
  const reopen = page2.getByRole("button", { name: /Continue inspection/i });
  if (await reopen.count()) {
    await reopen.first().click();
    await page2.waitForTimeout(7000);
    const dismiss = page2.getByRole("button", { name: /^Dismiss$/i });
    if (await dismiss.count()) { await dismiss.first().click(); await page2.waitForTimeout(1500); }
    for (let i = 0; i < 2; i++) {
      const finish = page2.getByRole("button", { name: /^Finish inspection$/i });
      if (await finish.count()) { await finish.last().click(); await page2.waitForTimeout(12000); }
    }
    const text = await page2.evaluate(() => document.body.innerText || "");
    const reports = await api("/inspections", {}, proToken);
    const rows = Array.isArray(reports.body) ? reports.body : [];
    const completed = rows.filter((r) => r.status === "completed").length;
    record("RP-1", "an inspection saved in one session can be FINISHED in another, and produces "
      + "its report",
      completed > 0 && !text.includes("governed risk urgency policy"),
      {
        completedInspections: completed,
        showsPolicyRefusal: text.includes("governed risk urgency policy"),
        head: text.slice(0, 200).replace(/\n+/g, " | "),
      });
    await page2.screenshot({ path: `${OUT}/screenshots/reopened-finish.png`, fullPage: true });
  } else {
    record("RP-1", "an inspection saved in one session can be FINISHED in another", false,
      "no saved inspection was offered for reopening");
  }
  await second.context.close();
} else {
  record("EXP-1", "an Expert request that cannot run is refused BEFORE any provider is reached",
    false, "NOT EXERCISED: no entitled account was available (PROMO_CODE absent).");
  record("EXP-2", "a refused Expert run is VISIBLE to the inspector",
    false, "NOT EXERCISED: no entitled account was available (PROMO_CODE absent).");
  record("RP-1", "an inspection saved in one session can be FINISHED in another",
    false, "NOT EXERCISED: no entitled account was available (PROMO_CODE absent).");
}

await browser.close();

const failed = cases.filter((c) => !c.passed);
writeFileSync(`${OUT}/section-317-gate.json`, JSON.stringify({
  gate: "§317 — external-user activation",
  measuredAt: new Date().toISOString(),
  appUrl: APP, apiUrl: API,
  participants: { free: FREE_EMAIL, comped: PROMO_CODE ? PRO_EMAIL : null },
  total: cases.length, passed: cases.length - failed.length, failed: failed.length,
  terseSystemStates: terseStates,
  cases,
}, null, 2));
console.log(`\n${cases.length - failed.length}/${cases.length} passed. evidence: ${OUT}`);
process.exit(failed.length === 0 ? 0 : 1);
