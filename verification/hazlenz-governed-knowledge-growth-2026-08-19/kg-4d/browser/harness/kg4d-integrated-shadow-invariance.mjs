/**
 * KG-4D Phase 15 — real-Chromium proof that the INTEGRATED shadow path is customer-invisible.
 *
 * WHY THIS RE-RUN IS MANDATORY, WHERE KG-4C's WAS NOT. KG-4C added no code to the customer request
 * path, so it could reason about unchanged risk and skip the browser suites. KG-4D wires six safety
 * modules into the real classify path and changes how the customer payload is produced (the
 * pipeline now runs four times in SHADOW, on copies, returning the pristine run). A reasoned
 * assessment is no longer good enough: the rendered product has to be looked at.
 *
 * THE PROPERTY. With the server genuinely running `GOVERNED_CUTOVER_MODE=SHADOW` and exactly ONE
 * account allowlisted, a reader must not be able to tell the two accounts apart. A badge, a notice,
 * a different confidence label, a different citation, a different card count, a stray internal
 * word — any of those is a failure.
 *
 * It also covers the persistence loop: analysis → persisted → RELOAD → Standard Detail. A shadow
 * run must survive a reload without leaving a trace.
 *
 * Usage:
 *   API_BASE_URL=… APP_BASE_URL=… SHADOW_EMAIL=… LEGACY_EMAIL=… SHADOW_PASSWORD=… LEGACY_PASSWORD=… \
 *   SHADOW_INSPECTION_ID=… LEGACY_INSPECTION_ID=… SHOT_DIR=… node kg4d-integrated-shadow-invariance.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4350';
const APP = process.env.APP_BASE_URL || 'http://127.0.0.1:3350';
const OUT = process.env.SHOT_DIR || './shots';
fs.mkdirSync(OUT, { recursive: true });

/**
 * Internal vocabulary that must never reach a customer surface. KG-4B's list plus the KG-4D
 * orchestration's own names, because the new failure mode is a well-meaning status indicator.
 */
const FORBIDDEN = [
  'starter-unverified', 'reviewer_approved', 'recordChecksum', 'corpusBacked', 'backingStatus',
  'UNAPPROVED_CONTENT', 'CITATION_ONLY', 'APPROVED_GOVERNED_CONTENT', 'effectiveReviewState',
  'releaseId', 'mechanically_validated', 'approvalDigest',
  'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT', 'LEGACY_TEXT_UNVERIFIED', 'GOVERNED_VERIFIED_TEXT',
  'CITATION_ONLY_NO_TEXT', 'governedDeliveryState', 'governedFallbackReason', 'knowledgeReleaseId',
  'APPROVED_SECTION_ONLY', 'RESOLVER_UNAVAILABLE', 'federal-core-',
  'SHADOW', 'shadow mode', 'Shadow mode', 'mismatch', 'governed_shadow_comparison',
  'correlationId', 'eventKey', 'EXACT_MATCH', 'GOVERNED_MISSING', 'BLOCKING',
  // KG-4D additions
  'SHADOW_EXECUTED', 'SHADOW_SKIPPED', 'LEGACY_NO_CONTEXT', 'orchestrateShadowRequest',
  'outputInvariance', 'shadowProvenanceNull', 'CIRCUIT_BREAKER', 'KILL_SWITCH', 'kg4c.', 'kg4d',
];

const VIEWS = [
  { name: 'light', theme: 'light', width: 1440, height: 900, mobile: false },
  { name: 'dark', theme: 'dark', width: 1440, height: 900, mobile: false },
  { name: 'mobile', theme: 'light', width: 390, height: 844, mobile: true },
  { name: 'mobile-dark', theme: 'dark', width: 390, height: 844, mobile: true },
];

const ACCOUNTS = {
  shadow: {
    email: process.env.SHADOW_EMAIL,
    password: process.env.SHADOW_PASSWORD,
    inspectionId: process.env.SHADOW_INSPECTION_ID,
  },
  legacy: {
    email: process.env.LEGACY_EMAIL,
    password: process.env.LEGACY_PASSWORD,
    inspectionId: process.env.LEGACY_INSPECTION_ID,
  },
};

const checks = [];
const failures = [];
const check = (condition, message) => {
  if (condition) checks.push(message); else failures.push(message);
};

/**
 * Tokens are fetched ONCE per account and reused across all captures.
 *
 * The auth throttle is 5 requests / 60s and is NOT relaxed for this pass. Logging in per capture
 * would mean 16 logins and would spend most of the run waiting out a production control -- the same
 * temptation KG-4B refused when a throttled corpus run produced a vacuous pass. Reusing a token is
 * what a real browser session does anyway.
 */
const TOKEN_CACHE = new Map();
async function cachedToken(name) {
  if (!TOKEN_CACHE.has(name)) TOKEN_CACHE.set(name, await tokenFor(ACCOUNTS[name]));
  return TOKEN_CACHE.get(name);
}

async function tokenFor(account) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, password: account.password }),
    });
    if (response.ok) return (await response.json()).token;
    // The auth throttle is 5/60s and is NOT relaxed for this pass; wait it out.
    await new Promise((resolve) => setTimeout(resolve, 13_000));
  }
  throw new Error('could not log in ' + account.email);
}

/**
 * What a reader can actually see on the inspection surface, reduced to a comparable shape.
 * Deliberately structural — text content, counts and ordering — rather than a screenshot diff,
 * so a difference is reported as a named property rather than as "some pixels moved".
 */
async function readSurface(page) {
  return page.evaluate(() => {
    const text = document.body.innerText || '';
    const cards = [...document.querySelectorAll('[class*="standard" i], [data-standard], article, li')]
      .map((node) => (node.innerText || '').trim())
      .filter((entry) => /CFR|standard|citation/i.test(entry));
    const citations = [...text.matchAll(/\b(?:29|30)\s*CFR\s*[0-9.]+(?:\([a-z0-9]+\))*/gi)]
      .map((match) => match[0].replace(/\s+/g, ' ').trim());
    const badges = [...document.querySelectorAll('[class*="badge" i], [class*="chip" i], [class*="pill" i]')]
      .map((node) => (node.innerText || '').trim()).filter(Boolean);
    const confidences = [...text.matchAll(/Confidence[:\s]+([A-Za-z]+)/gi)].map((m) => m[1]);
    return {
      textLength: text.length,
      cardCount: cards.length,
      citations,
      badges,
      confidences,
      verifiedBadgePresent: /verified standard text/i.test(text),
      normalizedText: text.replace(/\s+/g, ' ').trim(),
    };
  });
}

async function capture(browser, account, view, label, reload) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    isMobile: view.mobile,
    hasTouch: view.mobile,
    colorScheme: view.theme,
  });
  const page = await context.newPage();

  const token = await cachedToken(account);
  await page.goto(APP, { waitUntil: 'domcontentloaded' });
  // The REAL storage keys the app reads (`frontend-next/lib/auth.ts`). The first version of this
  // harness guessed `token`/`authToken`/`accessToken`, the app ignored all three, and every capture
  // rendered the LOGIN screen -- at which point 80 "the two accounts are identical" assertions
  // passed because both accounts were shown the same empty page. The non-vacuity floor caught it;
  // the equality assertions never would have.
  // The workspace selects its inspection from `sentinel_selected_inspection_context`, not from the
  // URL (`app/inspection-workspace/page.tsx`). The first version navigated to `/inspections/<id>`,
  // which is not a route -- every capture rendered a 404, and the equality assertions passed
  // because both accounts got the same 404.
  await page.evaluate(([t, theme, email, inspectionId]) => {
    localStorage.setItem('sentinel_auth_token', t);
    localStorage.setItem('sentinel_auth_user', JSON.stringify({ email }));
    localStorage.setItem('sentinel_selected_inspection_context',
      JSON.stringify({ persistedInspectionId: inspectionId }));
    localStorage.setItem('theme', theme);
  }, [token, view.theme, ACCOUNTS[account].email, ACCOUNTS[account].inspectionId]);

  const target = APP + '/inspection-workspace';
  await page.goto(target, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  if (reload) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
  }

  const surface = await readSurface(page);
  await page.screenshot({
    path: path.join(OUT, account + '-' + view.name + (reload ? '-reload' : '') + '.png'),
    fullPage: true,
  });
  await context.close();
  return surface;
}

async function main() {
  const browser = await chromium.launch();
  const results = {};

  for (const view of VIEWS) {
    for (const reload of [false, true]) {
      const key = view.name + (reload ? '-reload' : '');
      const shadow = await capture(browser, 'shadow', view, key, reload);
      const legacy = await capture(browser, 'legacy', view, key, reload);
      results[key] = { shadow, legacy };

      // --- the core indistinguishability property -----------------------------------------
      check(shadow.cardCount === legacy.cardCount,
        key + ': same number of standard cards (' + shadow.cardCount + ' vs ' + legacy.cardCount + ')');
      check(JSON.stringify(shadow.citations) === JSON.stringify(legacy.citations),
        key + ': identical citations AND ordering');
      check(JSON.stringify(shadow.confidences) === JSON.stringify(legacy.confidences),
        key + ': identical confidence labels');
      check(JSON.stringify(shadow.badges) === JSON.stringify(legacy.badges),
        key + ': identical badge set');
      check(shadow.verifiedBadgePresent === legacy.verifiedBadgePresent,
        key + ': neither account shows a verified-text badge (' + shadow.verifiedBadgePresent + ')');
      check(shadow.verifiedBadgePresent === false,
        key + ': SHADOW grants no verified-text badge');
      check(shadow.normalizedText === legacy.normalizedText,
        key + ': the whole visible surface is textually identical');

      // --- no internal vocabulary anywhere --------------------------------------------------
      for (const account of ['shadow', 'legacy']) {
        const text = results[key][account].normalizedText;
        const leaked = FORBIDDEN.filter((term) => text.includes(term));
        check(leaked.length === 0,
          key + '/' + account + ': no forbidden internal vocabulary (' +
          (leaked.join(', ') || 'none') + ')');
      }
    }
  }

  // Reload must not change what either account sees.
  for (const view of VIEWS) {
    for (const account of ['shadow', 'legacy']) {
      const before = results[view.name][account].normalizedText;
      const after = results[view.name + '-reload'][account].normalizedText;
      check(before === after,
        view.name + '/' + account + ': the surface is identical after a RELOAD (persistence → rehydration)');
    }
  }

  // Non-vacuity: the pass must actually have rendered standards, or it proves nothing.
  // The floor is per-capture, not "at least one": a single rendered view would let seven empty
  // ones pass as agreement.
  for (const [key, entry] of Object.entries(results)) {
    for (const account of ['shadow', 'legacy']) {
      check(entry[account].citations.length > 0,
        'NON-VACUITY ' + key + '/' + account + ': the view rendered regulatory citations (' +
        entry[account].citations.length + ')');
      check(!/Enter your email and password/i.test(entry[account].normalizedText),
        'NON-VACUITY ' + key + '/' + account + ': the view is NOT the login screen');
      check(!/could not be found/i.test(entry[account].normalizedText),
        'NON-VACUITY ' + key + '/' + account + ': the view is NOT a 404 page');
    }
  }

  await browser.close();

  const report = {
    generatedBy: 'kg4d-integrated-shadow-invariance.mjs',
    api: API, app: APP,
    views: VIEWS.map((v) => v.name),
    passed: checks.length, failed: failures.length,
    forbiddenTermCount: FORBIDDEN.length,
    results,
  };
  fs.writeFileSync(path.join(OUT, 'kg4d-browser-verification-results.json'),
    JSON.stringify(report, null, 2) + '\n');

  console.log('');
  console.log('kg4d-browser: ' + checks.length + ' passed, ' + failures.length + ' failed');
  if (failures.length) {
    for (const failure of failures) console.error('  FAIL  ' + failure);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
